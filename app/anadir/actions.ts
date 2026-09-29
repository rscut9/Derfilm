"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { actorExists, createActor } from "@/lib/catalog";

export type ActorFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const acceptedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

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

export async function addActor(
  _previousState: ActorFormState,
  formData: FormData,
): Promise<ActorFormState> {
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

  if (actorExists(name)) {
    return { status: "error", message: "Ese actor ya está registrado." };
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer());

  if (!isAcceptedImage(imageBuffer, image.type)) {
    return { status: "error", message: "El archivo no es una imagen válida." };
  }

  const uploadsDirectory = join(process.cwd(), "public", "uploads", "actors");
  const filename = `${randomUUID()}.${extension}`;
  const destination = join(uploadsDirectory, filename);
  const imagePath = `/uploads/actors/${filename}`;

  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(destination, imageBuffer);

  try {
    createActor({ name, imageSrc: imagePath });
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
      message: "No se ha podido guardar el actor. Inténtalo de nuevo.",
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    message: `${name} se ha guardado correctamente.`,
  };
}
