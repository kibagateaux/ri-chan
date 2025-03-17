-- PRAGMA foreign_keys = ON;

-- CREATE TABLE IF NOT EXISTS users (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   farcaster_id TEXT UNIQUE,
--   email TEXT UNIQUE NOT NULL,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   is_in_jp INTEGER NOT NULL DEFAULT 0
-- );

-- -- Credentials table
-- CREATE TABLE IF NOT EXISTS credentials (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   user_id INTEGER NOT NULL,
--   type TEXT NOT NULL,
--   credential_id TEXT UNIQUE NOT NULL,
--   public_key TEXT,
--   counter INTEGER NOT NULL DEFAULT 0,
--   hashed_value TEXT,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   last_used_at TEXT,
--   is_active INTEGER NOT NULL DEFAULT 1,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- Sessions table
-- CREATE TABLE IF NOT EXISTS sessions (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   user_id INTEGER NOT NULL,
--   token TEXT UNIQUE NOT NULL,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   expires_at TEXT NOT NULL,
--   is_valid INTEGER NOT NULL DEFAULT 1,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- Trips table
-- CREATE TABLE IF NOT EXISTS trips (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   prompt TEXT NOT NULL,
--   start TEXT NOT NULL,
--   end TEXT NOT NULL,
--   admin INTEGER NOT NULL,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   FOREIGN KEY (admin) REFERENCES users(id) ON DELETE RESTRICT
-- );

-- -- Squads table
-- CREATE TABLE IF NOT EXISTS squads (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   trip_id INTEGER NOT NULL,
--   subsquad TEXT,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
--   UNIQUE (trip_id, subsquad)
-- );

-- -- UserSquads table
-- CREATE TABLE IF NOT EXISTS user_squads (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   squad_id INTEGER NOT NULL,
--   user_id INTEGER NOT NULL,
--   role TEXT,
--   invited_by INTEGER,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
--   UNIQUE (squad_id, user_id)
-- );

-- -- ItineraryItems table
-- CREATE TABLE IF NOT EXISTS itinerary_items (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   description TEXT,
--   trip_id INTEGER NOT NULL,
--   squad_id INTEGER,
--   location_id INTEGER NOT NULL,
--   start TEXT NOT NULL,
--   end TEXT NOT NULL,
--   cost_per_person INTEGER NOT NULL DEFAULT 0,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
--   FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE SET NULL,
--   FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT
-- );

-- -- Locations table
-- CREATE TABLE IF NOT EXISTS locations (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   description TEXT,
--   region TEXT,
--   city TEXT,
--   hood TEXT,
--   type TEXT,
--   subtype TEXT,
--   google_maps_url TEXT,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   UNIQUE (name, hood)
-- );

-- -- Tags table
-- CREATE TABLE IF NOT EXISTS tags (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL UNIQUE,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
-- );

-- -- LocationTags table
-- CREATE TABLE IF NOT EXISTS location_tags (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   location_id INTEGER NOT NULL,
--   tag_id INTEGER NOT NULL,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
--   FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
--   UNIQUE (location_id, tag_id)
-- );

-- -- Reviews table
-- CREATE TABLE IF NOT EXISTS reviews (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   user_id INTEGER NOT NULL,
--   location_id INTEGER NOT NULL,
--   date_submitted TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   date_visited TEXT,
--   content TEXT NOT NULL,
--   rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
--   UNIQUE (user_id, location_id)
-- );

-- -- ReviewTags table
-- CREATE TABLE IF NOT EXISTS review_tags (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   review_id INTEGER NOT NULL,
--   tag_id INTEGER NOT NULL,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
--   FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
--   UNIQUE (review_id, tag_id)
-- );

-- -- Quests table
-- CREATE TABLE IF NOT EXISTS quests (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   description TEXT NOT NULL,
--   qualification TEXT NOT NULL,
--   type TEXT NOT NULL,
--   subtype TEXT,
--   amount INTEGER NOT NULL DEFAULT 0,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
-- );

-- -- PointsEarned table
-- CREATE TABLE IF NOT EXISTS points_earned (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   quest_id INTEGER NOT NULL,
--   squad_id INTEGER NOT NULL,
--   nonce TEXT NOT NULL,
--   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
--   FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
--   FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE,
--   UNIQUE (quest_id, squad_id, nonce)
-- );

-- -- Indexes
-- CREATE INDEX IF NOT EXISTS idx_trips_admin ON trips(admin);
-- CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id);
-- CREATE INDEX IF NOT EXISTS idx_squads_trip_id ON squads(trip_id);
-- CREATE INDEX IF NOT EXISTS idx_user_squads_squad_id ON user_squads(squad_id);
-- CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
-- CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
-- CREATE INDEX IF NOT EXISTS idx_points_earned_squad_id ON points_earned(squad_id);
-- -- Handle updated_at via trigger (SQLite doesn’t support ON UPDATE natively)

-- CREATE TRIGGER IF NOT EXISTS update_users_timestamp
-- AFTER UPDATE ON users
-- FOR EACH ROW
-- BEGIN
--   UPDATE users SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
-- END;



-- CREATE TRIGGER IF NOT EXISTS update_trips_timestamp
-- AFTER UPDATE ON trips
-- FOR EACH ROW
-- BEGIN
--   UPDATE trips SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
-- END;



-- CREATE TRIGGER IF NOT EXISTS update_itinerary_items_timestamp
-- AFTER UPDATE ON itinerary_items
-- FOR EACH ROW
-- BEGIN
--   UPDATE itinerary_items SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
-- END;



-- CREATE TRIGGER IF NOT EXISTS update_locations_timestamp
-- AFTER UPDATE ON locations
-- FOR EACH ROW
-- BEGIN
--   UPDATE locations SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
-- END;



-- CREATE TRIGGER IF NOT EXISTS update_reviews_timestamp
-- AFTER UPDATE ON reviews
-- FOR EACH ROW
-- BEGIN
--   UPDATE reviews SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
-- END;



-- CREATE TRIGGER IF NOT EXISTS update_quests_timestamp
-- AFTER UPDATE ON quests
-- FOR EACH ROW
-- BEGIN
--   UPDATE quests SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = OLD.id;
-- END;
