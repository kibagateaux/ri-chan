import { Database } from 'sqlite3';
import { promises as fs } from 'fs';
import path from 'path';

const sqlite3 = require('sqlite3').verbose();

// Initialize database
// Create database connection
// const db = new (sqlite3.verbose()).Database(':memory:');
const db = new sqlite3.Database('./app.db', (err: any) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

interface Migration {
  id: number;
  name: string;
  sql: string;
}


// Promisify database operations
const dbRun = (sql: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Initialize migrations table
const initMigrations = async (): Promise<void> => {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

// Enable foreign key support
db.run('PRAGMA foreign_keys = ON');

// Run migrations in serialized order
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      farcaster_id TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      is_in_jp INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Credentials table
  db.run(`
    CREATE TABLE IF NOT EXISTS credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      credential_id TEXT UNIQUE NOT NULL,
      public_key TEXT,
      counter INTEGER NOT NULL DEFAULT 0,
      hashed_value TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      last_used_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      expires_at TEXT NOT NULL,
      is_valid INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Trips table
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      prompt TEXT NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      admin INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (admin) REFERENCES users(id) ON DELETE RESTRICT
    );
  `);

  // Squads table
  db.run(`
    CREATE TABLE IF NOT EXISTS squads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      subsquad TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      UNIQUE (trip_id, subsquad)
    );
  `);

  // Bookings table for trains + hotels
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_details TEXT NOT NULL,
      checkin DATE NOT NULL,
      checkout DATE NOT NULL,
      total_cost INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      booking_reference TEXT NOT NULL,
      booking_status TEXT NOT NULL,
      booking_partner TEXT,
      booking_confirmation_number TEXT,
      booking_confirmation_url TEXT,
      

      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),

      trip_id INTEGER NOT NULL,
      squad_id INTEGER NOT NULL,
      location_id INTEGER NOT NULL,

      FOREIGN KEY (squad_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
      UNIQUE (trip_id, subsquad)
    );
  `);

  // UserSquads table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_squads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      squad_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT,
      invited_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE (squad_id, user_id)
    );
  `);

  // ItineraryItems table
  db.run(`
    CREATE TABLE IF NOT EXISTS itinerary_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      trip_id INTEGER NOT NULL,
      squad_id INTEGER,
      location_id INTEGER NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      cost_per_person INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE SET NULL,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT
    );
  `);

  // Locations table
  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      region TEXT,
      city TEXT,
      hood TEXT,
      type TEXT,
      subtype TEXT,
      google_maps_url TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      UNIQUE (name, hood)
    );
  `);

  // Tags table
  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
    );
  `);

  // LocationTags table
  db.run(`
    CREATE TABLE IF NOT EXISTS location_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
      UNIQUE (location_id, tag_id)
    );
  `);

  // Reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      location_id INTEGER NOT NULL,
      date_submitted TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      date_visited TEXT,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
      UNIQUE (user_id, location_id)
    );
  `);

  // ReviewTags table
  db.run(`
    CREATE TABLE IF NOT EXISTS review_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
      UNIQUE (review_id, tag_id)
    );
  `);

  // Quests table
  db.run(`
    CREATE TABLE IF NOT EXISTS quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      qualification TEXT NOT NULL,
      type TEXT NOT NULL,
      subtype TEXT,
      amount INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
    );
  `);

  // PointsEarned table
  db.run(`
    CREATE TABLE IF NOT EXISTS points_earned (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quest_id INTEGER NOT NULL,
      squad_id INTEGER NOT NULL,
      nonce TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
      FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE,
      UNIQUE (quest_id, squad_id, nonce)
    );
  `);

  // Indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_trips_admin ON trips(admin);');
  db.run('CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id);');
  db.run('CREATE INDEX IF NOT EXISTS idx_squads_trip_id ON squads(trip_id);');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_squads_squad_id ON user_squads(squad_id);');
  db.run('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);');
  db.run('CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);');
  
  // Handle updated_at via trigger (SQLite doesn’t support ON UPDATE natively)
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_users_timestamp
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
    END;
  `);
  
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_trips_timestamp
    AFTER UPDATE ON trips
    FOR EACH ROW
    BEGIN
      UPDATE trips SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
    END;
  `);
  
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_itinerary_items_timestamp
    AFTER UPDATE ON itinerary_items
    FOR EACH ROW
    BEGIN
      UPDATE itinerary_items SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
    END;
  `);
  
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_locations_timestamp
    AFTER UPDATE ON locations
    FOR EACH ROW
    BEGIN
      UPDATE locations SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
    END;
  `);
  
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_reviews_timestamp
    AFTER UPDATE ON reviews
    FOR EACH ROW
    BEGIN
      UPDATE reviews SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
    END;
  `);
  
  db.run(`
    CREATE TRIGGER IF NOT EXISTS update_quests_timestamp
    AFTER UPDATE ON quests
    FOR EACH ROW
    BEGIN
      UPDATE quests SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
    END;
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_points_earned_squad_id ON points_earned(squad_id);');

});
}


// Initialize database
const initDb = async (): Promise<void> => {
  try {
    await initMigrations();
    // await runMigrations();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
};

// Run initialization
initDb();

export default db;
