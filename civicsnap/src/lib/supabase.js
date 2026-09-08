import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial fallback mock data stored in local storage for offline / pre-configured development
const STORAGE_KEY = 'civicsnap_local_complaints';

const defaultComplaints = [
  {
    id: 'c1',
    title: 'Overflowing Garbage Bin',
    category: 'Garbage & Waste Dumps',
    description: 'The garbage bin near the central park entrance has been overflowing for 3 days. It causes an unbearable odor and attracts stray animals.',
    location: 'Central Park East Gate',
    latitude: 28.6139,
    longitude: 77.2090,
    priority: 'High',
    status: 'Reported',
    photo_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    author_name: 'John Citizen',
    is_guest: false,
    resolution_notes: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'c2',
    title: 'Hazardous Pothole on Arterial Road',
    category: 'Potholes',
    description: 'A deep pothole has formed after the monsoon rains. Two vehicles sustained wheel damage this morning.',
    location: 'Green Avenue cross section near Metro Pillar 42',
    latitude: 28.6250,
    longitude: 77.2180,
    priority: 'Emergency',
    status: 'In Progress',
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    author_name: 'Commuter Daily',
    is_guest: false,
    resolution_notes: 'Road maintenance crew dispatched; cold patch asphalt applied temporarily.',
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    id: 'c3',
    title: 'Faulty Streetlight Pole',
    category: 'Streetlight Problems',
    description: 'Streetlight pole #14 has been dark at night for the past week, creating an unsafe stretch for pedestrians.',
    location: 'Sector 9 North Promenade',
    latitude: 28.6320,
    longitude: 77.2100,
    priority: 'Medium',
    status: 'Under Review',
    photo_url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    author_name: 'Neighborhood Watch',
    is_guest: false,
    resolution_notes: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'c4',
    title: 'Burst Water Supply Pipe',
    category: 'Water Supply & Pipeline Leakage',
    description: 'Clean drinking water is leaking in high volume onto the public roadway.',
    location: '4th Cross Road, Industrial Suburb',
    latitude: 28.6180,
    longitude: 77.2250,
    priority: 'High',
    status: 'Resolved',
    photo_url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
    author_name: 'Local Resident',
    is_guest: true,
    guest_name: 'Priya Sharma',
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://civicsnap-backend-cbsd.onrender.com';

// Unified Data Access Layer (Render Express API + Supabase + Resilient Local Store)
export const civicDataService = {
  async getComplaints() {
    // 1. Try Live Express Backend API
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
      console.warn('Backend API fetch unavailable, checking alternate stores:', apiErr);
    }

    // 2. Try Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }

    // 3. Resilient Local Offline Store
    return getLocalComplaints();
  },

  async createComplaint(complaintData) {
    const newRecord = {
      ...complaintData,
      status: 'Reported',
      created_at: new Date().toISOString()
    };

    // 1. Try Live Express Backend API
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
      console.warn('Backend API insert failed, trying alternate stores:', apiErr);
    }

    // 2. Try Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .insert([newRecord])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase insert failed, falling back to local store:', err);
      }
    }

    // 3. Resilient Local Offline Store
    const localList = getLocalComplaints();
    const created = {
      ...newRecord,
      id: 'c_' + Date.now()
    };
    const updated = [created, ...localList];
    saveLocalComplaints(updated);
    return created;
  },

  async updateComplaintStatus(id, newStatus, resolutionNotes = null) {
    const payload = {
      status: newStatus,
      resolution_notes: resolutionNotes,
      resolved_at: newStatus === 'Resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    // 1. Try Live Express Backend API
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        const normalized = {
          ...updated,
          id: updated._id || updated.id || id
        };
        const localList = getLocalComplaints();
        const nextList = localList.map((c) => (c.id === id || c._id === id ? normalized : c));
        saveLocalComplaints(nextList);
        return normalized;
      }
    } catch (apiErr) {
      console.warn('Backend API status update failed, trying alternate stores:', apiErr);
    }

    // 2. Try Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase update failed, falling back to local store:', err);
      }
    }

    // 3. Resilient Local Offline Store
    const localList = getLocalComplaints();
    const updated = localList.map((item) => {
      if (item.id === id || item._id === id) {
        return {
          ...item,
          ...payload
        };
      }
      return item;
    });
    saveLocalComplaints(updated);
    return updated.find((c) => c.id === id || c._id === id);
  }
};
