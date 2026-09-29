"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import {
  catalogItemExists,
  catalogIdsExist,
  createCatalogItem,
  createMovie,
  movieExists,
  type CatalogItemType,
} from "@/lib/catalog";

export type CatalogFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const acceptedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const itemConfiguration: Record<
  CatalogItemType,
  { label: string; uploadsDirectory: string }
> = {
  actor: { label: "actor", uploadsDirectory: "actors" },
  director: { label: "director", uploadsDirectory: "directors" },
  category: { label: "categoría", uploadsDirectory: "categories" },
};

function isAcceptedImage(buffer: Buffer, type: string) {
  if (type === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (type === "image/png") {
    return buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  }

  if (type === "image/webp") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
}

async function addCatalogItem(
  itemType: CatalogItemType,
  _previousState: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const configuration = itemConfiguration[itemType];
  const rawName = formData.get("name");
  const image = formData.get("image");
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (name.length < 2 || name.length > 100) {
    return {
      status: "error",
      message: "El nombre debe tener entre 2 y 100 caracteres.",
    };
  }

  if (!(image instanceof File) || image.size === 0) {
    return { status: "error", message: "Selecciona una imagen." };
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return { status: "error", message: "La imagen no puede superar 5 MB." };
  }

  const extension = acceptedImageTypes[
    image.type as keyof typeof acceptedImageTypes
  ];

  if (!extension) {
    return {
      status: "error",
      message: "La imagen debe ser JPG, PNG o WebP.",
    };
  }

  if (catalogItemExists(itemType, name)) {
    return {
      status: "error",
      message: `Ese ${configuration.label} ya está registrado.`,
    };
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer());

  if (!isAcceptedImage(imageBuffer, image.type)) {
    return { status: "error", message: "El archivo no es una imagen válida." };
  }

  const uploadsDirectory = join(
    process.cwd(),
    "public",
    "uploads",
    configuration.uploadsDirectory,
  );
  const filename = `${randomUUID()}.${extension}`;
  const destination = join(uploadsDirectory, filename);
  const imagePath = `/uploads/${configuration.uploadsDirectory}/${filename}`;

  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(destination, imageBuffer);

  try {
    createCatalogItem({ itemType, name, imageSrc: imagePath });
  } catch (error) {
    await unlink(destination).catch(() => undefined);

    if (error instanceof Error && error.message.includes("database is locked")) {
      return {
        status: "error",
        message:
          "La base de datos está bloqueada. Guarda o descarta los cambios en DB Browser y ciérralo antes de volver a intentarlo.",
      };
    }

    return {
      status: "error",
      message: `No se ha podido guardar el ${configuration.label}. Inténtalo de nuevo.`,
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    message: `${name} se ha guardado correctamente.`,
  };
}

export async function addActor(
  previousState: CatalogFormState,
  formData: FormData,
) {
  return addCatalogItem("actor", previousState, formData);
}

export async function addDirector(
  previousState: CatalogFormState,
  formData: FormData,
) {
  return addCatalogItem("director", previousState, formData);
}

export async function addCategory(
  previousState: CatalogFormState,
  formData: FormData,
) {
  return addCatalogItem("category", previousState, formData);
}

function parseSelectedIds(formData: FormData, field: string) {
  const ids = formData.getAll(field).map((value) => Number(value));

  if (ids.some((id) => !Number.isSafeInteger(id) || id < 1)) {
    return null;
  }

  return [...new Set(ids)];
}

export async function addMovie(
  _previousState: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  const rawName = formData.get("name");
  const rawLink = formData.get("link");
  const image = formData.get("image");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const link = typeof rawLink === "string" ? rawLink.trim() : "";

  if (name.length < 1 || name.length > 150) {
    return {
      status: "error",
      message: "El título debe tener entre 1 y 150 caracteres.",
    };
  }

  if (link) {
    try {
      const url = new URL(link);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Invalid protocol");
      }
    } catch {
      return {
        status: "error",
        message: "El enlace debe empezar por http:// o https://.",
      };
    }
  }

  if (!(image instanceof File) || image.size === 0) {
    return { status: "error", message: "Selecciona un cartel." };
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return { status: "error", message: "El cartel no puede superar 5 MB." };
  }

  const extension = acceptedImageTypes[
    image.type as keyof typeof acceptedImageTypes
  ];

  if (!extension) {
    return {
      status: "error",
      message: "El cartel debe ser JPG, PNG o WebP.",
    };
  }

  if (movieExists(name)) {
    return { status: "error", message: "Esa película ya está registrada." };
  }

  const actorIds = parseSelectedIds(formData, "actorIds");
  const directorIds = parseSelectedIds(formData, "directorIds");
  const categoryIds = parseSelectedIds(formData, "categoryIds");

  if (!actorIds || !directorIds || !categoryIds) {
    return { status: "error", message: "Una de las selecciones no es válida." };
  }

  if (
    !catalogIdsExist("actor", actorIds) ||
    !catalogIdsExist("director", directorIds) ||
    !catalogIdsExist("category", categoryIds)
  ) {
    return {
      status: "error",
      message: "Una de las selecciones ya no existe. Recarga la página.",
    };
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer());

  if (!isAcceptedImage(imageBuffer, image.type)) {
    return { status: "error", message: "El cartel no es una imagen válida." };
  }

  const uploadsDirectory = join(process.cwd(), "public", "uploads", "movies");
  const filename = `${randomUUID()}.${extension}`;
  const destination = join(uploadsDirectory, filename);
  const imagePath = `/uploads/movies/${filename}`;

  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(destination, imageBuffer);

  try {
    createMovie({
      name,
      imageSrc: imagePath,
      link: link || null,
      actorIds,
      directorIds,
      categoryIds,
    });
  } catch (error) {
    await unlink(destination).catch(() => undefined);

    if (error instanceof Error && error.message.includes("database is locked")) {
      return {
        status: "error",
        message:
          "La base de datos está bloqueada. Guarda o descarta los cambios en DB Browser y ciérralo antes de volver a intentarlo.",
      };
    }

    return {
      status: "error",
      message: "No se ha podido guardar la película. Inténtalo de nuevo.",
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    message: `${name} se ha guardado correctamente.`,
  };
}
