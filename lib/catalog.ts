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

export function getMovies(): CatalogCard[] {
  return database
    .prepare(
      `SELECT id, name, image_path AS imageSrc
       FROM movies
       ORDER BY created_at DESC, name ASC`,
    )
    .all() as CatalogRow[];
}

export function getActors(): CatalogCard[] {
  return database
    .prepare(
      `SELECT id, name, image_path AS imageSrc
       FROM actors
       ORDER BY created_at DESC, name ASC`,
    )
    .all() as CatalogRow[];
}
