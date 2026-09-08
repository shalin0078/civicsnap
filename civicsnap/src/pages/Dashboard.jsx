import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Home, 
  FileText, 
  Settings, 
  LogOut, 
  MapPin, 
  Clock, 
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Check,
  ChevronRight,
  Shield,
  ArrowRight,
  X,
  Search,
  ThumbsUp,
  Maximize2,
  TrendingUp,
  Activity,
  SlidersHorizontal,
  Share2,
  Download,
  LayoutGrid,
  List,
  RotateCcw
} from 'lucide-react';
import CreateComplaint from '../components/CreateComplaint';
import CivicLogo from '../components/CivicLogo';
import { civicDataService } from '../lib/supabase';
import { useToast } from '../components/Toast';
import './Dashboard.css';

const STAGES = ['Reported', 'Under Review', 'In Progress', 'Resolved'];

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'my-reports', 'authority'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { showToast } = useToast();

  // Photo modal preview
  const [expandedImage, setExpandedImage] = useState(null);

  // Authority resolution modal state
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  // Upvotes local tracking
  const [userUpvotes, setUserUpvotes] = useState({});

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const isGuest = !userId;
  const isAuthorityUser = Boolean(userRole === 'authority' || (userId && userId.includes('admin')));

  // By default, everyone opens the standard Citizen Community Feed
  const [authorityMode, setAuthorityMode] = useState(false);

  useEffect(() => {
    loadComplaints();

    const unsubscribe = civicDataService.subscribeToComplaints(() => {
      civicDataService.getComplaints().then((data) => {
        if (data) setComplaints(data);
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await civicDataService.getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateComplaint = async (newComplaintData) => {
    const authorName = isGuest 
      ? (newComplaintData.guest_name || 'Guest Citizen')
      : (isAuthorityUser ? 'Municipal Admin' : 'John Citizen');

    const created = await civicDataService.createComplaint({
      ...newComplaintData,
      author_name: authorName,
      user_id: userId || null,
      upvotes: 1
    });

    if (created) {
      setComplaints((prev) => [created, ...prev]);
    }
  };

  const handleToggleUpvote = (id) => {
    const hasUpvoted = userUpvotes[id];
    const delta = hasUpvoted ? -1 : 1;

    setUserUpvotes((prev) => ({ ...prev, [id]: !hasUpvoted }));

    setComplaints((currentComplaints) =>
      currentComplaints.map((c) => {
        if (c.id === id) {
          const currentCount = c.upvotes || 1;
          return {
            ...c,
            upvotes: Math.max(1, currentCount + delta)
          };
        }
        return c;
      })
    );

    civicDataService.updateComplaintUpvotes(id, delta).catch((err) => {
      console.warn('Upvote sync notice:', err);
    });
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    if (newStatus === 'Resolved') {
      const target = complaints.find((c) => c.id === complaintId);
      setResolvingComplaint(target);
      setResolutionText('');
      return;
    }

    const updated = await civicDataService.updateComplaintStatus(complaintId, newStatus);
    if (updated) {
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
      showToast(`Report updated to status "${newStatus}".`, 'success', 'Status Updated');
    }
  };

  const submitResolution = async () => {
    if (!resolvingComplaint) return;
    const notes = resolutionText.trim() || 'Issue inspected, repaired, and certified resolved by municipal engineering squad.';
    const updated = await civicDataService.updateComplaintStatus(resolvingComplaint.id, 'Resolved', notes);
    
    if (updated) {
      setComplaints((prev) => prev.map((c) => (c.id === resolvingComplaint.id ? updated : c)));
      showToast(`Report CS-${resolvingComplaint.id.toString().slice(-4).toUpperCase()} certified and resolved.`, 'success', 'Resolution Certified');
    }
    setResolvingComplaint(null);
    setResolutionText('');
  };

  const handleCopyTracking = (complaint) => {
    const trackingCode = `CS-${complaint.id.toString().slice(-4).toUpperCase()}`;
    const text = `CivicSnap Ticket [${trackingCode}]: ${complaint.title} (${complaint.category}) at ${complaint.location} | Status: ${complaint.status}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Tracking record ${trackingCode} copied to clipboard.`, 'success', 'Ticket Copied');
      }).catch(() => {
        showToast(`Tracking ID: ${trackingCode}`, 'info', 'Ticket Record');
      });
    } else {
      showToast(`Tracking ID: ${trackingCode}`, 'info', 'Ticket Record');
    }
  };

  const handleExportCSV = () => {
    if (filteredComplaints.length === 0) {
      showToast('No civic reports available to export with current filters.', 'warning', 'Export Empty');
      return;
    }

    const headers = ['Tracking ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Reporter', 'Created At'];
    const rows = filteredComplaints.map((c) => [
      `CS-${c.id.toString().slice(-4).toUpperCase()}`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${(c.category || '').replace(/"/g, '""')}"`,
      c.priority || 'Medium',
      c.status || 'Reported',
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.author_name || 'Citizen').replace(/"/g, '""')}"`,
      c.created_at || new Date().toISOString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicSnap_Municipal_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredComplaints.length} municipal records as CSV.`, 'success', 'Export Downloaded');
  };

  const handleResetFilters = () => {
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
    showToast('Filters reset to default community feed.', 'info', 'Filters Reset');
  };

  const handleStatFilterClick = (filterType) => {
    if (filterType === 'all') {
      setStatusFilter('All');
      showToast('Showing all registered civic snaps.', 'info', 'Filter: All Reports');
    } else if (filterType === 'active') {
      const next = statusFilter === 'ActionRequired' ? 'All' : 'ActionRequired';
      setStatusFilter(next);
      showToast(next === 'All' ? 'Filters cleared.' : 'Filtering for active reports requiring action.', 'info', 'Filter: Action Required');
    } else if (filterType === 'resolved') {
      const next = statusFilter === 'Resolved' ? 'All' : 'Resolved';
      setStatusFilter(next);
      showToast(next === 'All' ? 'Filters cleared.' : 'Filtering for verified resolved reports.', 'info', 'Filter: Resolved');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'emergency': return 'priority-emergency';
      case 'high': return 'priority-high';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStageIndex = (status) => {
    const idx = STAGES.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  // Filter complaints
  let filteredComplaints = complaints;

  if (activeTab === 'my-reports') {
    filteredComplaints = filteredComplaints.filter((c) => c.user_id === userId || c.author_name === 'John Citizen');
  } else if (activeTab === 'authority') {
    filteredComplaints = [...filteredComplaints].sort((a, b) => {
      const pOrder = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
      return (pOrder[b.priority] || 1) - (pOrder[a.priority] || 1);
    });
  }

  // Search Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredComplaints = filteredComplaints.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    );
  }

  if (categoryFilter !== 'All') {
    filteredComplaints = filteredComplaints.filter((c) => c.category === categoryFilter);
  }

  if (priorityFilter !== 'All') {
    filteredComplaints = filteredComplaints.filter((c) => c.priority === priorityFilter);
  }

  if (statusFilter === 'ActionRequired') {
    filteredComplaints = filteredComplaints.filter((c) => c.status !== 'Resolved');
  } else if (statusFilter !== 'All') {
    filteredComplaints = filteredComplaints.filter((c) => c.status === statusFilter);
  }

  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const activeCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const resolutionRate = complaints.length > 0 ? Math.round((resolvedCount / complaints.length) * 100) : 0;

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <CivicLogo size={36} />
            <div className="sidebar-brand-text">
              <span className="sidebar-logo-text">CivicSnap</span>
              <span className="sidebar-logo-sub">Citizen Portal</span>
            </div>
          </Link>
        </div>

        {/* User / Guest Status Pill */}
        <div className="user-profile-badge">
          <div className="avatar-circle">
            {isGuest ? 'G' : (isAuthorityUser ? 'A' : 'U')}
          </div>
          <div className="profile-badge-text">
            <strong>{isGuest ? 'Guest Citizen' : (isAuthorityUser ? 'Municipal Officer' : 'John Citizen')}</strong>
            <span>{isGuest ? 'Guest Access' : (isAuthorityUser ? (authorityMode ? 'Authority Mode' : 'Authority Officer') : 'Verified Citizen')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            type="button"
            className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('feed');
              setAuthorityMode(false);
            }}
          >
            <Home size={18} />
            <span>Community Feed</span>
          </button>
          
          {!isGuest && (
            <button 
              type="button"
              className={`nav-item ${activeTab === 'my-reports' ? 'active' : ''}`} 
              onClick={() => setActiveTab('my-reports')}
            >
              <FileText size={18} />
              <span>My Reports</span>
            </button>
          )}

          {isAuthorityUser && (
            <button 
              type="button"
              className={`nav-item ${activeTab === 'authority' ? 'active authority-nav' : ''}`} 
              onClick={() => {
                setActiveTab('authority');
                setAuthorityMode(true);
              }}
            >
              <Shield size={18} />
              <span>Authority Portal</span>
            </button>
          )}

          <Link to="/" className="nav-item back-home-nav">
            <ChevronRight size={18} />
            <span>Return to Website</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          {isGuest ? (
            <Link to="/login" className="btn-sidebar-login">
              <span>Sign In / Register</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <button 
              type="button"
              className="nav-item logout" 
              onClick={() => {
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                navigate('/login');
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Command Header */}
        <header className="dashboard-header">
          <div className="header-search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="header-search-input"
              placeholder="Search reports by location, category, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="header-actions">
            {isAuthorityUser && (
              <button
                type="button"
                className={`authority-toggle-btn ${authorityMode ? 'active' : ''}`}
                onClick={() => setAuthorityMode(!authorityMode)}
              >
                <Shield size={16} />
                <span>{authorityMode ? 'Authority Mode Active' : 'Switch to Authority View'}</span>
              </button>
            )}

            <button type="button" className="create-btn interactive-hover" onClick={handleOpenCreateModal}>
              <Camera size={16} />
              <span>+ New Snap</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Key Metrics Row */}
          <div className="stats-strip">
            <div 
              className={`stat-widget interactive-stat ${statusFilter === 'All' ? 'stat-active' : ''}`}
              onClick={() => handleStatFilterClick('all')}
              role="button"
              tabIndex={0}
              title="Click to view all civic reports"
              onKeyDown={(e) => e.key === 'Enter' && handleStatFilterClick('all')}
            >
              <div className="stat-widget-icon purple">
                <Activity size={20} />
              </div>
              <div className="stat-widget-info">
                <span className="widget-label">Total Snaps Logged</span>
                <p className="widget-val">{complaints.length}</p>
                <span className="widget-sub">All registered civic reports (Click to show all)</span>
              </div>
            </div>

            <div 
              className={`stat-widget interactive-stat ${statusFilter === 'ActionRequired' ? 'stat-active' : ''}`}
              onClick={() => handleStatFilterClick('active')}
              role="button"
              tabIndex={0}
              title="Click to filter reports requiring municipal action"
              onKeyDown={(e) => e.key === 'Enter' && handleStatFilterClick('active')}
            >
              <div className="stat-widget-icon amber">
                <Clock size={20} />
              </div>
              <div className="stat-widget-info">
                <span className="widget-label">Under Municipal Action</span>
                <p className="widget-val text-warning">{activeCount}</p>
                <span className="widget-sub">Review &amp; in-progress triage</span>
              </div>
            </div>

            <div 
              className={`stat-widget interactive-stat ${statusFilter === 'Resolved' ? 'stat-active' : ''}`}
              onClick={() => handleStatFilterClick('resolved')}
              role="button"
              tabIndex={0}
              title="Click to view certified resolved reports"
              onKeyDown={(e) => e.key === 'Enter' && handleStatFilterClick('resolved')}
            >
              <div className="stat-widget-icon green">
                <CheckCircle2 size={20} />
              </div>
              <div className="stat-widget-info">
                <span className="widget-label">Successfully Resolved</span>
                <p className="widget-val text-success">{resolvedCount}</p>
                <span className="widget-sub">{resolutionRate}% resolution efficiency</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="feed-filter-bar">
            <div className="filter-chip-group">
              <span className="filter-title"><SlidersHorizontal size={14} /> Category:</span>
              <div className="filter-pills-row">
                {['All', 'Potholes', 'Garbage & Waste Dumps', 'Illegal Parking', 'Streetlight Problems', 'Water Supply & Pipeline Leakage', 'Road & Infrastructure Defects'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat === 'All' ? 'All Issues' : cat.split('&')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-controls-group">
              <div className="filter-dropdowns">
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="filter-dropdown"
                  aria-label="Filter by urgency"
                >
                  <option value="All">All Urgency</option>
                  <option value="Emergency">Emergency</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>

                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-dropdown"
                  aria-label="Filter by stage"
                >
                  <option value="All">All Stages</option>
                  <option value="ActionRequired">Action Required</option>
                  <option value="Reported">Reported</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* View Mode Switcher */}
              <div className="view-mode-toggle" role="group" aria-label="Layout view switcher">
                <button
                  type="button"
                  className={`btn-view-mode ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  aria-label="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  className={`btn-view-mode ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Compact List View"
                  aria-label="Compact list view"
                >
                  <List size={15} />
                </button>
              </div>

              {/* Authority Export Button */}
              {authorityMode && (
                <button
                  type="button"
                  className="btn-export-csv interactive-hover"
                  onClick={handleExportCSV}
                  title="Export filtered records to CSV"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              )}

              {/* Reset Filters Shortcut */}
              {(categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All' || searchQuery !== '') && (
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={handleResetFilters}
                  title="Clear all active search and filter constraints"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Complaints Feed List */}
          <div className="complaints-feed-container">
            {loading ? (
              <div className="feed-placeholder">
                <p>Retrieving community reports...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="feed-placeholder">
                <Camera size={44} className="placeholder-icon" />
                <h3>No Reports Found</h3>
                <p>No civic reports matching your search or filters.</p>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`complaints-cards-flow ${viewMode === 'list' ? 'list-layout' : 'grid-layout'}`}>
                {filteredComplaints.map((complaint) => {
                  const currentStageIdx = getStageIndex(complaint.status);
                  const isUpvoted = userUpvotes[complaint.id];
                  const trackingId = `CS-${complaint.id.toString().slice(-4).toUpperCase()}`;

                  return (
                    <article key={complaint.id} className="complaint-card-modern">
                      {/* Top Meta Bar */}
                      <div className="card-top-bar">
                        <div className="badge-cluster">
                          <span className="tracking-id-badge" title="Public Tracking ID">
                            {trackingId}
                          </span>
                          <span className="category-pill">
                            <AlertTriangle size={13} />
                            {complaint.category}
                          </span>
                          <span className={`severity-chip ${getPriorityClass(complaint.priority)}`}>
                            {complaint.priority || 'Medium'} Urgency
                          </span>
                        </div>
                        <div className="card-timestamp">
                          <Clock size={12} />
                          <span>{formatDate(complaint.created_at)}</span>
                        </div>
                      </div>

                      {/* Main Card Content */}
                      <div className="card-middle-grid">
                        <div className="card-text-block">
                          <h3 className="card-heading">{complaint.title}</h3>
                          <p className="card-description">{complaint.description}</p>
                          
                          <div className="card-landmark">
                            <MapPin size={14} className="landmark-icon" />
                            <span>{complaint.location}</span>
                          </div>

                          <div className="card-reporter-row">
                            <span>Logged by <strong>{complaint.author_name || 'Citizen'}</strong></span>
                            {complaint.is_guest && <span className="guest-badge">Guest Submission</span>}
                          </div>
                        </div>

                        {/* Evidence Photo */}
                        {complaint.photo_url && (
                          <div 
                            className="card-photo-wrapper"
                            onClick={() => setExpandedImage(complaint.photo_url)}
                            title="Click to view full photograph"
                          >
                            <img src={complaint.photo_url} alt="Civic hazard evidence" className="card-photo" />
                            <div className="photo-zoom-hint">
                              <Maximize2 size={14} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4-Stage Resolution Pipeline Tracker */}
                      <div className="stage-tracker-box">
                        <div className="tracker-top-label">
                          <span className="label-heading">Resolution Progress Pipeline</span>
                          <span className={`status-badge-val status-${complaint.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {complaint.status}
                          </span>
                        </div>

                        <div className="pipeline-steps-row">
                          {STAGES.map((stage, idx) => {
                            const isCompleted = idx < currentStageIdx;
                            const isCurrent = idx === currentStageIdx;

                            return (
                              <div 
                                key={stage} 
                                className={`pipeline-node-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                              >
                                <div className="node-circle">
                                  {isCompleted ? <Check size={12} /> : idx + 1}
                                </div>
                                <span className="node-text">{stage}</span>
                                {idx < STAGES.length - 1 && <div className="node-bar"></div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Official Municipal Resolution Panel */}
                      {complaint.status === 'Resolved' && complaint.resolution_notes && (
                        <div className="official-resolution-panel">
                          <div className="res-header">
                            <ShieldCheck size={16} />
                            <strong>Verified Municipal Resolution Report</strong>
                            {complaint.resolved_at && <span className="res-date">({formatDate(complaint.resolved_at)})</span>}
                          </div>
                          <p className="res-notes">{complaint.resolution_notes}</p>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="card-bottom-actions">
                        <div className="citizen-actions-group">
                          {/* Citizen Upvote Button */}
                          <button 
                            type="button" 
                            className={`btn-endorse ${isUpvoted ? 'endorsed' : ''}`}
                            onClick={() => handleToggleUpvote(complaint.id)}
                            title="Indicate that you also experience this issue"
                          >
                            <ThumbsUp size={14} />
                            <span>I also experience this ({complaint.upvotes || 1})</span>
                          </button>

                          {/* Share / Copy Tracking ID Button */}
                          <button
                            type="button"
                            className="btn-share-tracking"
                            onClick={() => handleCopyTracking(complaint)}
                            title="Copy ticket reference and details to clipboard"
                          >
                            <Share2 size={13} />
                            <span>Share Record</span>
                          </button>
                        </div>

                        {/* Authority Actions Toolbar */}
                        {authorityMode && (
                          <div className="authority-control-strip">
                            <span className="authority-strip-label"><Shield size={13} /> Authority:</span>
                            {complaint.status !== 'Under Review' && (
                              <button
                                type="button"
                                className="btn-authority-chip review"
                                onClick={() => handleStatusChange(complaint.id, 'Under Review')}
                              >
                                Under Review
                              </button>
                            )}
                            {complaint.status !== 'In Progress' && (
                              <button
                                type="button"
                                className="btn-authority-chip progress"
                                onClick={() => handleStatusChange(complaint.id, 'In Progress')}
                              >
                                Dispatch Crew
                              </button>
                            )}
                            {complaint.status !== 'Resolved' && (
                              <button
                                type="button"
                                className="btn-authority-chip resolve"
                                onClick={() => handleStatusChange(complaint.id, 'Resolved')}
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Zoom Lightbox */}
      {expandedImage && (
        <div className="image-lightbox-overlay" onClick={() => setExpandedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={expandedImage} alt="Full resolution evidence" className="lightbox-img" />
            <button type="button" className="btn-close-lightbox" onClick={() => setExpandedImage(null)}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Resolution Notes Modal */}
      {resolvingComplaint && (
        <div className="modal-overlay" onClick={() => setResolvingComplaint(null)}>
          <div className="modal-content resolution-modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="mobile-header">
              <div className="header-top">
                <button type="button" className="icon-btn" onClick={() => setResolvingComplaint(null)}>
                  <X size={20} />
                </button>
                <h3 className="header-title">Certify Issue Resolution</h3>
              </div>
              <p className="header-subtitle">{resolvingComplaint.title}</p>
            </header>

            <div className="resolution-modal-body">
              <label htmlFor="resolutionText" className="form-label">
                Official Resolution Remarks &amp; Department Actions:
              </label>
              <textarea
                id="resolutionText"
                rows={4}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="E.g., Road maintenance squad #4 resurfaced asphalt and sealed joint cracks on Sept 8. Inspected and approved by municipal supervisor."
                className="resolution-textarea"
              />
              
              <div className="resolution-modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setResolvingComplaint(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-submit" 
                  onClick={submitResolution}
                >
                  Certify &amp; Close Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Create Complaint Modal */}
      {isCreateModalOpen && (
        <CreateComplaint
          isGuestMode={isGuest}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateComplaint}
        />
      )}
    </div>
  );
};

export default Dashboard;
