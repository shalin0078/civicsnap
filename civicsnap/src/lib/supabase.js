// Unified Civic Data Layer (Live Render Backend API + Resilient Offline Local Store)
// Zero external database dependencies required. Multi-device synchronized via Render backend.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://civicsnap-backend-cbsd.onrender.com';
const STORAGE_KEY = 'civicsnap_local_complaints';

// Initial realistic municipal seed records for resilient offline fallback
const defaultComplaints = [
  {
    id: 'c1',
    _id: 'c1',
    title: 'Overflowing Garbage Bin',
    category: 'Garbage & Waste Dumps',
    description: 'The garbage bin near the central park entrance has been overflowing for 3 days. It causes an unbearable odor and attracts stray animals.',
    location: 'Central Park East Gate',
    latitude: 28.6139,
    longitude: 77.2090,
    priority: 'High',
    status: 'Reported',
    photo_url: '/images/garbage-dump.jpg',
    author_name: 'John Citizen',
    is_guest: false,
    upvotes: 14,
    resolution_notes: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'c2',
    _id: 'c2',
    title: 'Hazardous Pothole on Arterial Road',
    category: 'Potholes',
    description: 'A deep pothole has formed after the monsoon rains. Two vehicles sustained wheel damage this morning.',
    location: 'Green Avenue cross section near Metro Pillar 42',
    latitude: 28.6250,
    longitude: 77.2180,
    priority: 'Emergency',
    status: 'In Progress',
    photo_url: '/images/road-pothole.jpg',
    author_name: 'Commuter Daily',
    is_guest: false,
    upvotes: 27,
    resolution_notes: 'Road maintenance crew dispatched; cold patch asphalt applied temporarily.',
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    id: 'c3',
    _id: 'c3',
    title: 'Faulty Streetlight Pole',
    category: 'Streetlight Problems',
    description: 'Streetlight pole #14 has been dark at night for the past week, creating an unsafe stretch for pedestrians.',
    location: 'Sector 9 North Promenade',
    latitude: 28.6320,
    longitude: 77.2100,
    priority: 'Medium',
    status: 'Under Review',
    photo_url: '/images/faulty-streetlight.jpg',
    author_name: 'Neighborhood Watch',
    is_guest: false,
    upvotes: 8,
    resolution_notes: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'c4',
    _id: 'c4',
    title: 'Burst Water Supply Pipe',
    category: 'Water Supply & Pipeline Leakage',
    description: 'Clean drinking water is leaking in high volume onto the public roadway.',
    location: '4th Cross Road, Industrial Suburb',
    latitude: 28.6180,
    longitude: 77.2250,
    priority: 'High',
    status: 'Resolved',
    photo_url: '/images/water-leak.jpg',
    author_name: 'Priya Sharma',
    is_guest: false,
    upvotes: 19,
    resolution_notes: 'Municipal water board repaired main joint valve on Sept 7, 2026. Water flow restored.',
    resolved_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

const getLocalComplaints = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultComplaints));
      return defaultComplaints;
    }
    return JSON.parse(raw);
  } catch {
    return defaultComplaints;
  }
};

const saveLocalComplaints = (complaints) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

export const civicDataService = {
  /**
   * Fetch all complaints from Render Backend (or local store if offline)
   */
  async getComplaints() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((item) => ({
            ...item,
            id: item._id || item.id,
            created_at: item.created_at || item.date || new Date().toISOString()
          }));
          saveLocalComplaints(normalized);
          return normalized;
        }
      }
    } catch (apiErr) {
      console.warn('Live backend unavailable, serving cached data:', apiErr);
    }

    return getLocalComplaints();
  },

  /**
   * Submit new civic complaint to Render Backend
   */
  async createComplaint(complaintData) {
    const newRecord = {
      ...complaintData,
      status: 'Reported',
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      if (res.ok) {
        const created = await res.json();
        const normalized = {
          ...created,
          id: created._id || created.id || 'c_' + Date.now(),
          created_at: created.created_at || created.date || new Date().toISOString()
        };
        const localList = getLocalComplaints();
        saveLocalComplaints([normalized, ...localList]);
        return normalized;
      }
    } catch (apiErr) {
      console.warn('Backend insert failed, caching locally:', apiErr);
    }

    // Local fallback
    const localList = getLocalComplaints();
    const created = {
      ...newRecord,
      id: 'c_' + Date.now()
    };
    saveLocalComplaints([created, ...localList]);
    return created;
  },

  /**
   * Update complaint status and official resolution notes
   */
  async updateComplaintStatus(id, newStatus, resolutionNotes = null) {
    const payload = {
      status: newStatus,
      resolution_notes: resolutionNotes
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE_URL}/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const updated = await res.json();
        const normalized = {
          ...updated,
          id: updated._id || updated.id || id
        };
        const localList = getLocalComplaints();
        const nextList = localList.map((c) => (String(c.id) === String(id) || String(c._id) === String(id) ? normalized : c));
        saveLocalComplaints(nextList);
        return normalized;
      }
    } catch (apiErr) {
      console.warn('Backend status update notice, updating locally:', apiErr);
    }

    // Resilient local fallback
    const localList = getLocalComplaints();
    const updated = localList.map((item) => {
      if (String(item.id) === String(id) || String(item._id) === String(id)) {
        return {
          ...item,
          status: newStatus,
          resolution_notes: resolutionNotes,
          resolved_at: newStatus === 'Resolved' ? new Date().toISOString() : null
        };
      }
      return item;
    });
    saveLocalComplaints(updated);
    return updated.find((c) => String(c.id) === String(id) || String(c._id) === String(id));
  },

  /**
   * Upvote a complaint across all devices
   */
  async updateComplaintUpvotes(id, delta = 1) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/${id}/upvote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      if (res.ok) {
        const updated = await res.json();
        const normalized = {
          ...updated,
          id: updated._id || updated.id || id
        };
        const localList = getLocalComplaints();
        saveLocalComplaints(localList.map((c) => (c.id === id || c._id === id ? normalized : c)));
        return normalized;
      }
    } catch (apiErr) {
      console.warn('Backend upvote sync failed, updating local count:', apiErr);
    }

    // Local fallback
    const localList = getLocalComplaints();
    const updated = localList.map((item) => {
      if (item.id === id || item._id === id) {
        const count = item.upvotes || 1;
        return { ...item, upvotes: Math.max(1, count + delta) };
      }
      return item;
    });
    saveLocalComplaints(updated);
    return updated.find((c) => c.id === id || c._id === id);
  },

  /**
   * Multi-Device Live Sync: Polls backend every 4 seconds so actions taken on 
   * a mobile phone appear automatically on laptops/other devices.
   */
  subscribeToComplaints(onUpdate) {
    if (typeof onUpdate !== 'function') return () => {};

    // Initial check
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/complaints`, {
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const normalized = data.map((item) => ({
              ...item,
              id: item._id || item.id,
              created_at: item.created_at || item.date || new Date().toISOString()
            }));
            saveLocalComplaints(normalized);
            onUpdate(normalized);
          }
        }
      } catch {
        // Silent catch during network jitter
      }
    }, 4000);

    return () => {
      clearInterval(intervalId);
    };
  }
};
