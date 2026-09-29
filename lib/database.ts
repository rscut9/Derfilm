import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = join(process.cwd(), "data", "derfilm.sqlite");

function createDatabase() {
  mkdirSync(dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      image_path TEXT NOT NULL,
      link TEXT,
      watched_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS actors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      image_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS directors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      image_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      image_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movie_actors (
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      actor_id INTEGER NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
      PRIMARY KEY (movie_id, actor_id)
    );

    CREATE TABLE IF NOT EXISTS movie_directors (
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      director_id INTEGER NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
      PRIMARY KEY (movie_id, director_id)
    );

    CREATE TABLE IF NOT EXISTS movie_categories (
      movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (movie_id, category_id)
    );
  `);

  seedExampleData(database);

  return database;
}

function seedExampleData(database: DatabaseSync) {
  database.exec("BEGIN;");

  try {
    database
      .prepare(
        "INSERT OR IGNORE INTO movies (name, image_path) VALUES (?, ?)",
      )
      .run("Transporter", "/uploads/transporter.jpg");

    database
      .prepare(
        "INSERT OR IGNORE INTO actors (name, image_path) VALUES (?, ?)",
      )
      .run("Jason Statham", "/uploads/jason-statham.webp");

    const movie = database
      .prepare("SELECT id FROM movies WHERE name = ?")
      .get("Transporter") as { id: number };
    const actor = database
      .prepare("SELECT id FROM actors WHERE name = ?")
      .get("Jason Statham") as { id: number };

    database
      .prepare(
        "INSERT OR IGNORE INTO movie_actors (movie_id, actor_id) VALUES (?, ?)",
      )
      .run(movie.id, actor.id);

    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

const databaseGlobal = globalThis as typeof globalThis & {
  derfilmDatabase?: DatabaseSync;
};

export const database = databaseGlobal.derfilmDatabase ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  databaseGlobal.derfilmDatabase = database;
}
