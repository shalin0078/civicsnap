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
  RotateCcw,
  Menu,
  Trash2,
  ImageOff,
  ShieldAlert
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase();
  
  // Only the unique admin ID and password can unlock the Admin Dashboard
  const isAuthorityUser = Boolean(userRole === 'authority' && userEmail === 'admin@civicsnap.com');
  const authorityMode = isAuthorityUser;
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const getComplaintId = (c) => String(c?.id || c?._id || '');
  const isMatch = (c, id) => String(c?.id || c?._id) === String(id);

  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true });
      return;
    }

    loadComplaints();

    const unsubscribe = civicDataService.subscribeToComplaints(() => {
      civicDataService.getComplaints().then((data) => {
        if (data) setComplaints(data);
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [userId, navigate]);

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
    const authorName = isAuthorityUser 
      ? 'Municipal Admin' 
      : (localStorage.getItem('userName') || localStorage.getItem('userEmail')?.split('@')[0] || 'John Citizen');

    const created = await civicDataService.createComplaint({
      ...newComplaintData,
      author_name: authorName,
      user_id: userId,
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
    if (!complaintId) return;

    if (newStatus === 'Resolved') {
      const target = complaints.find((c) => isMatch(c, complaintId));
      if (target) {
        setResolvingComplaint(target);
        setResolutionText(target.resolution_notes || '');
      }
      return;
    }

    const cIdStr = String(complaintId);
    setUpdatingStatusId(cIdStr);

    // 1. Instant Optimistic State Update (0ms latency for seamless responsiveness)
    setComplaints((prev) =>
      prev.map((c) => {
        if (isMatch(c, complaintId)) {
          return {
            ...c,
            status: newStatus,
            resolution_notes: null,
            resolved_at: null
          };
        }
        return c;
      })
    );

    showToast(`Status updated to "${newStatus}".`, 'success', 'Status Updated');

    try {
      const updated = await civicDataService.updateComplaintStatus(complaintId, newStatus, null);
      if (updated) {
        setComplaints((prev) =>
          prev.map((c) => (isMatch(c, complaintId) ? { ...c, ...updated, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.error('Status sync error:', err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const submitResolution = async () => {
    if (!resolvingComplaint) return;
    const complaintId = getComplaintId(resolvingComplaint);
    const notes = resolutionText.trim() || 'Issue inspected, repaired, and certified resolved by municipal engineering squad.';
    const nowIso = new Date().toISOString();

    // 1. Instant Optimistic Resolution
    setComplaints((prev) =>
      prev.map((c) => {
        if (isMatch(c, complaintId)) {
          return {
            ...c,
            status: 'Resolved',
            resolution_notes: notes,
            resolved_at: nowIso
          };
        }
        return c;
      })
    );

    const targetCode = `CS-${complaintId.slice(-4).toUpperCase()}`;
    showToast(`Report ${targetCode} certified and resolved.`, 'success', 'Resolution Certified');
    setResolvingComplaint(null);
    setResolutionText('');

    try {
      const updated = await civicDataService.updateComplaintStatus(complaintId, 'Resolved', notes);
      if (updated) {
        setComplaints((prev) =>
          prev.map((c) => (isMatch(c, complaintId) ? { ...c, ...updated, status: 'Resolved', resolution_notes: notes } : c))
        );
      }
    } catch (err) {
      console.warn('Resolution server sync notice:', err);
    }
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

  const handleRemoveSpamPhoto = async (complaintId) => {
    if (!complaintId) return;
    const confirmed = window.confirm('Are you sure you want to remove this photo as spam or inappropriate content?');
    if (!confirmed) return;

    setComplaints((prev) =>
      prev.map((c) => (isMatch(c, complaintId) ? { ...c, photo_url: '', photo_removed: true } : c))
    );

    showToast('Spam photo removed by authority.', 'info', 'Photo Removed');

    try {
      await civicDataService.removeComplaintPhoto(complaintId);
    } catch {
      // Local fallback handled
    }
  };

  const handleDeleteSpamComplaint = async (complaintId) => {
    if (!complaintId) return;
    const confirmed = window.confirm('Are you sure you want to permanently remove this report from the civic registry as spam or false submission?');
    if (!confirmed) return;

    setComplaints((prev) => prev.filter((c) => !isMatch(c, complaintId)));

    showToast('Report removed from civic registry.', 'info', 'Report Deleted');

    try {
      await civicDataService.deleteComplaint(complaintId);
    } catch {
      // Local fallback handled
    }
  };

  const cleanLocation = (loc) => {
    if (!loc) return 'Location Pinpoint';
    const cleaned = loc
      .replace(/\(?GPS:\s*[\d.-]+,\s*[\d.-]+(\s*\([^)]*\))?\)?/gi, '')
      .trim();
    return cleaned || 'GPS-Verified Location';
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
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={() => setMobileSidebarOpen(false)}>
            <CivicLogo size={36} />
            <div className="sidebar-brand-text">
              <span className="sidebar-logo-text">CivicSnap</span>
              <span className="sidebar-logo-sub">Citizen Portal</span>
            </div>
          </Link>
          <button 
            type="button" 
            className="mobile-sidebar-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Badge */}
        <div className="user-profile-badge">
          <div className="avatar-circle">
            {isAuthorityUser ? 'A' : 'U'}
          </div>
          <div className="profile-badge-text">
            <strong>{isAuthorityUser ? 'Municipal Officer' : (localStorage.getItem('userName') || 'Verified Citizen')}</strong>
            <span>{isAuthorityUser ? (authorityMode ? 'Authority Mode' : 'Authority Officer') : (localStorage.getItem('userEmail') || 'Citizen Account')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            type="button"
            className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('feed');
              setAuthorityMode(false);
              setMobileSidebarOpen(false);
            }}
          >
            <Home size={18} />
            <span>Community Feed</span>
          </button>
          
          <button 
            type="button"
            className={`nav-item ${activeTab === 'my-reports' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('my-reports');
              setMobileSidebarOpen(false);
            }}
          >
            <FileText size={18} />
            <span>My Reports</span>
          </button>

          {isAuthorityUser && (
            <button 
              type="button"
              className={`nav-item ${activeTab === 'authority' ? 'active authority-nav' : ''}`} 
              onClick={() => {
                setActiveTab('authority');
                setAuthorityMode(true);
                setMobileSidebarOpen(false);
              }}
            >
              <Shield size={18} />
              <span>Authority Portal</span>
            </button>
          )}

          <Link to="/" className="nav-item back-home-nav" onClick={() => setMobileSidebarOpen(false)}>
            <ChevronRight size={18} />
            <span>Return to Website</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button 
            type="button" 
            className="nav-item logout" 
            onClick={() => {
              setMobileSidebarOpen(false);
              localStorage.removeItem('userId');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userRole');
              localStorage.removeItem('userName');
              navigate('/login');
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Mobile Header Bar (Only visible on small screens) */}
        <div className="mobile-header-bar">
          <button 
            type="button" 
            className="mobile-hamburger-btn" 
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="mobile-header-brand">
            <CivicLogo size={26} />
            <span className="mobile-header-title">CivicSnap</span>
          </Link>
          <button 
            type="button" 
            className="mobile-header-snap-btn"
            onClick={handleOpenCreateModal}
            aria-label="New Report"
          >
            <Camera size={15} />
            <span>Snap</span>
          </button>
        </div>

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
              <div className="admin-status-badge">
                <Shield size={16} />
                <span>Admin Dashboard</span>
              </div>
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
                  const cId = getComplaintId(complaint);
                  const currentStageIdx = getStageIndex(complaint.status);
                  const isUpvoted = userUpvotes[cId];

                  return (
                    <article key={cId} className="complaint-card-modern">
                      {/* Top Meta Bar - Clean Minimalist */}
                      <div className="card-top-bar clean-meta-bar">
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
                            <span>{cleanLocation(complaint.location)}</span>
                          </div>

                          <div className="card-reporter-row">
                            <span>Logged by <strong>{complaint.author_name || 'Verified Citizen'}</strong></span>
                          </div>
                        </div>

                        {/* Evidence Photo */}
                        {complaint.photo_url ? (
                          <div 
                            className="card-photo-wrapper"
                            onClick={() => setExpandedImage(complaint.photo_url)}
                            title="Click to view full photograph"
                          >
                            <img src={complaint.photo_url} alt="Civic hazard evidence" className="card-photo" />
                            {(authorityMode || isAuthorityUser) && (
                              <button
                                type="button"
                                className="btn-photo-moderation-badge"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSpamPhoto(cId);
                                }}
                                title="Admin: Remove spam photo"
                              >
                                <ImageOff size={11} />
                                <span>Spam Photo</span>
                              </button>
                            )}
                            <div className="photo-zoom-hint">
                              <Maximize2 size={14} />
                            </div>
                          </div>
                        ) : complaint.photo_removed ? (
                          <div className="photo-moderated-notice">
                            <ShieldAlert size={14} />
                            <span>Photo removed by admin (spam/inappropriate)</span>
                          </div>
                        ) : null}
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
                            onClick={() => handleToggleUpvote(cId)}
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
                        {(authorityMode || isAuthorityUser) && (
                          <div className="authority-control-strip">
                            <div className="authority-strip-header">
                              <span className="authority-strip-label">
                                <Shield size={14} /> Authority Actions:
                              </span>
                              <span className="authority-current-status">
                                Current: <strong>{complaint.status}</strong>
                              </span>
                            </div>

                            <div className="authority-buttons-cluster">
                              {/* 1. Reset / Reported */}
                              <button
                                type="button"
                                className={`btn-authority-chip reset ${complaint.status === 'Reported' ? 'current-active' : ''}`}
                                onClick={() => handleStatusChange(cId, 'Reported')}
                                disabled={updatingStatusId === cId}
                                title="Set status back to Reported / Re-open"
                              >
                                <RotateCcw size={13} />
                                <span>Reported {complaint.status === 'Reported' && '✓'}</span>
                              </button>

                              {/* 2. Under Review / Re-review */}
                              <button
                                type="button"
                                className={`btn-authority-chip review ${complaint.status === 'Under Review' ? 'current-active' : ''}`}
                                onClick={() => handleStatusChange(cId, 'Under Review')}
                                disabled={updatingStatusId === cId}
                                title="Place under active municipal review / Re-review"
                              >
                                <Clock size={13} />
                                <span>Under Review {complaint.status === 'Under Review' && '✓'}</span>
                              </button>

                              {/* 3. In Progress */}
                              <button
                                type="button"
                                className={`btn-authority-chip progress ${complaint.status === 'In Progress' ? 'current-active' : ''}`}
                                onClick={() => handleStatusChange(cId, 'In Progress')}
                                disabled={updatingStatusId === cId}
                                title="Dispatch municipal repair crew"
                              >
                                <AlertTriangle size={13} />
                                <span>In Progress {complaint.status === 'In Progress' && '✓'}</span>
                              </button>

                              {/* 4. Resolved / Edit Resolution */}
                              <button
                                type="button"
                                className={`btn-authority-chip resolve ${complaint.status === 'Resolved' ? 'current-active' : ''}`}
                                onClick={() => handleStatusChange(cId, 'Resolved')}
                                disabled={updatingStatusId === cId}
                                title={complaint.status === 'Resolved' ? 'Edit official resolution report' : 'Certify and close issue'}
                              >
                                <CheckCircle2 size={13} />
                                <span>{complaint.status === 'Resolved' ? 'Edit Resolution ✓' : 'Mark Resolved'}</span>
                              </button>

                              {/* 5. Remove Spam Photo (if photo exists) */}
                              {complaint.photo_url && (
                                <button
                                  type="button"
                                  className="btn-authority-chip remove-photo"
                                  onClick={() => handleRemoveSpamPhoto(cId)}
                                  title="Remove spam or inappropriate photo"
                                >
                                  <ImageOff size={13} />
                                  <span>Remove Photo</span>
                                </button>
                              )}

                              {/* 6. Delete Spam / False Report */}
                              <button
                                type="button"
                                className="btn-authority-chip delete-report"
                                onClick={() => handleDeleteSpamComplaint(cId)}
                                title="Delete spam or false report"
                              >
                                <Trash2 size={13} />
                                <span>Delete Report</span>
                              </button>
                            </div>
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

        {/* Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
          <button 
            type="button" 
            className={`mobile-tab-item ${activeTab === 'feed' && !authorityMode ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('feed');
              setAuthorityMode(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Home size={19} />
            <span>Feed</span>
          </button>

          <button 
            type="button" 
            className={`mobile-tab-item ${activeTab === 'my-reports' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('my-reports');
              setAuthorityMode(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <FileText size={19} />
            <span>My Snaps</span>
          </button>

          {/* Central Raised Camera Snap Button */}
          <button 
            type="button" 
            className="mobile-center-fab"
            onClick={handleOpenCreateModal}
            aria-label="Report Issue with Live Camera"
          >
            <div className="fab-glow-circle">
              <Camera size={22} />
            </div>
            <span className="fab-title">Snap</span>
          </button>

          {isAuthorityUser ? (
            <button 
              type="button" 
              className={`mobile-tab-item ${authorityMode ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('authority');
                setAuthorityMode(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <Shield size={19} />
              <span>Authority</span>
            </button>
          ) : (
            <button 
              type="button" 
              className={`mobile-tab-item ${statusFilter === 'Resolved' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(statusFilter === 'Resolved' ? 'All' : 'Resolved');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <CheckCircle2 size={19} />
              <span>Resolved</span>
            </button>
          )}

          <button 
            type="button" 
            className="mobile-tab-item"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="More navigation options"
          >
            <Menu size={19} />
            <span>Menu</span>
          </button>
        </nav>
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
                <h3 className="header-title">
                  {resolvingComplaint.status === 'Resolved' ? 'Edit Resolution Certificate' : 'Certify Issue Resolution'}
                </h3>
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
                  {resolvingComplaint.status === 'Resolved' ? 'Update & Save Remarks' : 'Certify & Close Issue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Create Complaint Modal */}
      {isCreateModalOpen && (
        <CreateComplaint
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateComplaint}
        />
      )}
    </div>
  );
};

export default Dashboard;
