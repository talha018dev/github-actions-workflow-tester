import Database from 'better-sqlite3';

// Extend global type for dev mode persistence
declare global {
  // eslint-disable-next-line no-var
  var datingDb: Database.Database | undefined;
}

// Create or reuse in-memory database (persists across hot reloads in dev)
function getDatabase(): Database.Database {
  if (global.datingDb) {
    return global.datingDb;
  }

  // Create in-memory database (like H2's mem mode)
  const db = new Database(':memory:', { verbose: console.log });
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  
  // Initialize schema
  initializeSchema(db);
  
  // Store in global for dev mode persistence
  global.datingDb = db;
  
  console.log('🗄️ In-memory SQLite database initialized');
  
  return db;
}

function initializeSchema(db: Database.Database) {
  // Users/Profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      bio TEXT,
      avatar TEXT,
      interests TEXT, -- JSON array
      lookingFor TEXT, -- JSON array
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events table (host_id is optional, no foreign key to allow system-created events)
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      host_id TEXT,
      max_participants INTEGER DEFAULT 40,
      round_duration INTEGER DEFAULT 300,
      status TEXT DEFAULT 'upcoming', -- upcoming, active, completed
      current_round INTEGER DEFAULT 0,
      scheduled_start DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Event participants (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_participants (
      event_id TEXT,
      user_id TEXT,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Rooms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      channel_name TEXT,
      round_number INTEGER,
      status TEXT DEFAULT 'waiting', -- waiting, active, completed
      started_at DATETIME,
      ended_at DATETIME,
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);

  // Room participants
  db.exec(`
    CREATE TABLE IF NOT EXISTS room_participants (
      room_id TEXT,
      user_id TEXT,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Matches table
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      room_id TEXT,
      user1_id TEXT,
      user2_id TEXT,
      compatibility_score INTEGER,
      user1_action TEXT, -- like, pass, null
      user2_action TEXT,
      status TEXT DEFAULT 'pending', -- pending, mutual, rejected
      transcript TEXT,
      ai_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user1_id) REFERENCES users(id),
      FOREIGN KEY (user2_id) REFERENCES users(id)
    )
  `);

  // Waitlist table
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      event_id TEXT,
      user_id TEXT,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (event_id, user_id),
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Previous matches (to avoid repeat pairings)
  db.exec(`
    CREATE TABLE IF NOT EXISTS previous_matches (
      event_id TEXT,
      user1_id TEXT,
      user2_id TEXT,
      round_number INTEGER,
      PRIMARY KEY (event_id, user1_id, user2_id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);

  console.log('📋 Database schema initialized');
}

// Export the database instance
export const db = getDatabase();

// Helper to reset database (useful for testing)
export function resetDatabase() {
  const tables = ['previous_matches', 'waitlist', 'matches', 'room_participants', 
                  'rooms', 'event_participants', 'events', 'users'];
  
  for (const table of tables) {
    db.exec(`DELETE FROM ${table}`);
  }
  console.log('🗑️ Database reset');
}

// Export typed query helpers
export const queries = {
  // User queries
  users: {
    insert: db.prepare(`
      INSERT OR REPLACE INTO users (id, name, age, gender, bio, avatar, interests, lookingFor, location)
      VALUES (@id, @name, @age, @gender, @bio, @avatar, @interests, @lookingFor, @location)
    `),
    getById: db.prepare('SELECT * FROM users WHERE id = ?'),
    getAll: db.prepare('SELECT * FROM users'),
    delete: db.prepare('DELETE FROM users WHERE id = ?'),
  },

  // Event queries
  events: {
    insert: db.prepare(`
      INSERT INTO events (id, name, description, host_id, max_participants, round_duration, status, scheduled_start)
      VALUES (@id, @name, @description, @hostId, @maxParticipants, @roundDuration, @status, @scheduledStart)
    `),
    getById: db.prepare('SELECT * FROM events WHERE id = ?'),
    getAll: db.prepare('SELECT * FROM events ORDER BY created_at DESC'),
    updateStatus: db.prepare('UPDATE events SET status = ?, current_round = ? WHERE id = ?'),
    delete: db.prepare('DELETE FROM events WHERE id = ?'),
  },

  // Event participants
  participants: {
    add: db.prepare('INSERT OR IGNORE INTO event_participants (event_id, user_id) VALUES (?, ?)'),
    remove: db.prepare('DELETE FROM event_participants WHERE event_id = ? AND user_id = ?'),
    getByEvent: db.prepare('SELECT user_id FROM event_participants WHERE event_id = ?'),
    count: db.prepare('SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?'),
  },

  // Rooms
  rooms: {
    insert: db.prepare(`
      INSERT INTO rooms (id, event_id, channel_name, round_number, status)
      VALUES (@id, @eventId, @channelName, @roundNumber, @status)
    `),
    getById: db.prepare('SELECT * FROM rooms WHERE id = ?'),
    getByEvent: db.prepare('SELECT * FROM rooms WHERE event_id = ?'),
    getActiveByEvent: db.prepare("SELECT * FROM rooms WHERE event_id = ? AND status != 'completed'"),
    updateStatus: db.prepare('UPDATE rooms SET status = ? WHERE id = ?'),
    addParticipant: db.prepare('INSERT OR IGNORE INTO room_participants (room_id, user_id) VALUES (?, ?)'),
    getParticipants: db.prepare('SELECT user_id FROM room_participants WHERE room_id = ?'),
    getRoomForUser: db.prepare("SELECT r.* FROM rooms r JOIN room_participants rp ON r.id = rp.room_id WHERE r.event_id = ? AND rp.user_id = ? AND r.status != 'completed' ORDER BY r.round_number DESC LIMIT 1"),
  },

  // Matches
  matches: {
    insert: db.prepare(`
      INSERT INTO matches (id, event_id, room_id, user1_id, user2_id, compatibility_score, status)
      VALUES (@id, @eventId, @roomId, @user1Id, @user2Id, @compatibilityScore, @status)
    `),
    getAll: db.prepare('SELECT * FROM matches'),
    getByEvent: db.prepare('SELECT * FROM matches WHERE event_id = ?'),
    getByUser: db.prepare('SELECT * FROM matches WHERE event_id = ? AND (user1_id = ? OR user2_id = ?)'),
    updateAction: db.prepare(`
      UPDATE matches 
      SET user1_action = CASE WHEN user1_id = ?2 THEN ?3 ELSE user1_action END,
          user2_action = CASE WHEN user2_id = ?2 THEN ?3 ELSE user2_action END,
          status = CASE 
            WHEN (user1_action = 'like' OR (?2 = user1_id AND ?3 = 'like')) 
             AND (user2_action = 'like' OR (?2 = user2_id AND ?3 = 'like')) 
            THEN 'mutual'
            WHEN user1_action = 'pass' OR user2_action = 'pass' 
              OR (?2 = user1_id AND ?3 = 'pass') OR (?2 = user2_id AND ?3 = 'pass')
            THEN 'rejected'
            ELSE status
          END
      WHERE id = ?1
    `),
    updateTranscript: db.prepare('UPDATE matches SET transcript = ?, ai_summary = ? WHERE id = ?'),
  },

  // Previous matches (to prevent repeat pairings)
  previousMatches: {
    add: db.prepare('INSERT OR IGNORE INTO previous_matches (event_id, user1_id, user2_id, round_number) VALUES (?, ?, ?, ?)'),
    exists: db.prepare(`
      SELECT 1 FROM previous_matches 
      WHERE event_id = ? AND 
        ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))
    `),
    getByEvent: db.prepare('SELECT * FROM previous_matches WHERE event_id = ?'),
  },

  // Waitlist
  waitlist: {
    add: db.prepare('INSERT OR IGNORE INTO waitlist (event_id, user_id) VALUES (?, ?)'),
    remove: db.prepare('DELETE FROM waitlist WHERE event_id = ? AND user_id = ?'),
    getByEvent: db.prepare('SELECT user_id FROM waitlist WHERE event_id = ? ORDER BY joined_at'),
  },
};

