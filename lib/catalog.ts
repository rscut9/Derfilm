import { database } from "./database";

export type CatalogCard = {
  id: number;
  name: string;
  imageSrc: string;
};

type CatalogRow = {
  id: number;
  name: string;
  imageSrc: string;
};

export type CatalogItemType = "actor" | "director" | "category";

const tableByItemType: Record<CatalogItemType, string> = {
  actor: "actors",
  director: "directors",
  category: "categories",
};

export function getMovies(): CatalogCard[] {
  return database
    .prepare(
      `SELECT id, name, image_path AS imageSrc
       FROM movies
       ORDER BY created_at DESC, name ASC`,
    )
    .all()
    .map(toCatalogCard);
}

export function getActors(): CatalogCard[] {
  return getCatalogItems("actor");
}

export function getActorById(id: number): CatalogCard | null {
  const row = database
    .prepare(
      `SELECT id, name, image_path AS imageSrc
       FROM actors
       WHERE id = ?`,
    )
    .get(id);

  return row ? toCatalogCard(row) : null;
}

export function getMoviesForActor(actorId: number): CatalogCard[] {
  return database
    .prepare(
      `SELECT movies.id, movies.name, movies.image_path AS imageSrc
       FROM movies
       INNER JOIN movie_actors ON movie_actors.movie_id = movies.id
       WHERE movie_actors.actor_id = ?
       ORDER BY movies.created_at DESC, movies.name ASC`,
    )
    .all(actorId)
    .map(toCatalogCard);
}

export function getDirectors(): CatalogCard[] {
  return getCatalogItems("director");
}

export function getDirectorById(id: number): CatalogCard | null {
  const row = database
    .prepare(
      `SELECT id, name, image_path AS imageSrc
       FROM directors
       WHERE id = ?`,
    )
    .get(id);

  return row ? toCatalogCard(row) : null;
}

export function getMoviesForDirector(directorId: number): CatalogCard[] {
  return database
    .prepare(
      `SELECT movies.id, movies.name, movies.image_path AS imageSrc
       FROM movies
       INNER JOIN movie_directors ON movie_directors.movie_id = movies.id
       WHERE movie_directors.director_id = ?
       ORDER BY movies.created_at DESC, movies.name ASC`,
    )
    .all(directorId)
    .map(toCatalogCard);
}

export function getCategories(): CatalogCard[] {
  return getCatalogItems("category");
}

function getCatalogItems(itemType: CatalogItemType): CatalogCard[] {
  const table = tableByItemType[itemType];

  return database
    .prepare(
      `SELECT id, name, image_path AS imageSrc
       FROM ${table}
       ORDER BY name ASC`,
    )
    .all()
    .map(toCatalogCard);
}

function toCatalogCard(row: unknown): CatalogCard {
  const { id, name, imageSrc } = row as CatalogRow;

  return {
    id: Number(id),
    name: String(name),
    imageSrc: String(imageSrc),
  };
}

export function catalogItemExists(
  itemType: CatalogItemType,
  name: string,
): boolean {
  const table = tableByItemType[itemType];

  return Boolean(
    database.prepare(`SELECT id FROM ${table} WHERE name = ?`).get(name),
  );
}

export function createCatalogItem({
  itemType,
  name,
  imageSrc,
}: {
  itemType: CatalogItemType;
  name: string;
  imageSrc: string;
}) {
  const table = tableByItemType[itemType];

  database
    .prepare(`INSERT INTO ${table} (name, image_path) VALUES (?, ?)`)
    .run(name, imageSrc);
}

export function movieExists(name: string): boolean {
  return Boolean(
    database.prepare("SELECT id FROM movies WHERE name = ?").get(name),
  );
}

export function catalogIdsExist(itemType: CatalogItemType, ids: number[]): boolean {
  if (ids.length === 0) {
    return true;
  }

  const table = tableByItemType[itemType];
  const placeholders = ids.map(() => "?").join(", ");
  const rows = database
    .prepare(`SELECT id FROM ${table} WHERE id IN (${placeholders})`)
    .all(...ids) as Array<{ id: number }>;

  return rows.length === new Set(ids).size;
}

export function createMovie({
  name,
  imageSrc,
  link,
  actorIds,
  directorIds,
  categoryIds,
}: {
  name: string;
  imageSrc: string;
  link: string | null;
  actorIds: number[];
  directorIds: number[];
  categoryIds: number[];
}) {
  database.exec("BEGIN;");

  try {
    const result = database
      .prepare("INSERT INTO movies (name, image_path, link) VALUES (?, ?, ?)")
      .run(name, imageSrc, link);
    const movieId = Number(result.lastInsertRowid);

    addMovieRelations("movie_actors", "actor_id", movieId, actorIds);
    addMovieRelations("movie_directors", "director_id", movieId, directorIds);
    addMovieRelations("movie_categories", "category_id", movieId, categoryIds);

    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

function addMovieRelations(
  table: "movie_actors" | "movie_directors" | "movie_categories",
  relatedColumn: "actor_id" | "director_id" | "category_id",
  movieId: number,
  relatedIds: number[],
) {
  const statement = database.prepare(
    `INSERT INTO ${table} (movie_id, ${relatedColumn}) VALUES (?, ?)`,
  );

  for (const relatedId of relatedIds) {
    statement.run(movieId, relatedId);
  }
}
