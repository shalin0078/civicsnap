const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Realistic municipal seed complaints with complete civic details
const initialData = {
  users: [
    {
      _id: 'demo-admin-id',
      username: 'Municipal Admin',
      email: 'admin@civicsnap.com',
      password: 'admin123',
      role: 'authority'
    },
    {
      _id: 'demo-user-id',
      username: 'John Citizen',
      email: 'user@civicsnap.com',
      password: 'password123',
      role: 'citizen'
    }
  ],
  complaints: [
    {
      _id: 'c1',
      id: 'c1',
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
      date: new Date(Date.now() - 3600000 * 18).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      _id: 'c2',
      id: 'c2',
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
      date: new Date(Date.now() - 3600000 * 36).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 36).toISOString()
    },
    {
      _id: 'c3',
      id: 'c3',
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
      date: new Date(Date.now() - 3600000 * 48).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      _id: 'c4',
      id: 'c4',
      title: 'Burst Water Supply Pipe',
      category: 'Water Supply & Pipeline Leakage',
      description: 'Clean drinking water is leaking in high volume onto the public roadway.',
      location: '4th Cross Road, Industrial Suburb',
      latitude: 28.6180,
      longitude: 77.2250,
      priority: 'High',
      status: 'Resolved',
      photo_url: '/images/water-leak.jpg',
      author_name: 'Local Resident',
      is_guest: true,
      guest_name: 'Priya Sharma',
      upvotes: 19,
      resolution_notes: 'Municipal water board repaired main joint valve on Sept 7, 2026. Water flow restored.',
      resolved_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      date: new Date(Date.now() - 3600000 * 72).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 72).toISOString()
    }
  ]
};

let memoryDb = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      // In-memory fallback if filesystem restricted
    }
  }
}

function loadDb() {
  if (memoryDb) return memoryDb;
  ensureDataDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      memoryDb = JSON.parse(raw);
      if (!memoryDb.complaints) memoryDb.complaints = initialData.complaints;
      if (!memoryDb.users) memoryDb.users = initialData.users;
      return memoryDb;
    }
  } catch (err) {
    console.warn('Notice: Using memory store:', err.message);
  }
  memoryDb = JSON.parse(JSON.stringify(initialData));
  saveDb();
  return memoryDb;
}

function saveDb() {
  if (!memoryDb) return;
  ensureDataDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    // Graceful fallback to memory
  }
}

module.exports = {
  getComplaints() {
    return loadDb().complaints;
  },
  addComplaint(complaint) {
    const db = loadDb();
    db.complaints.unshift(complaint);
    saveDb();
    return complaint;
  },
  updateComplaint(id, updates) {
    const db = loadDb();
    const index = db.complaints.findIndex(c => String(c._id) === String(id) || String(c.id) === String(id));
    if (index === -1) return null;
    db.complaints[index] = { ...db.complaints[index], ...updates };
    saveDb();
    return db.complaints[index];
  },
  getUsers() {
    return loadDb().users;
  },
  addUser(user) {
    const db = loadDb();
    db.users.push(user);
    saveDb();
    return user;
  }
};
