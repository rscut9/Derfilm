"use client";

import { useActionState, useState, type FormEvent } from "react";
import type { CatalogCard } from "@/lib/catalog";
import { addMovie, type CatalogFormState } from "./actions";

type MovieFormProps = {
  actors: CatalogCard[];
  directors: CatalogCard[];
  categories: CatalogCard[];
};

const initialState: CatalogFormState = { status: "idle", message: "" };
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function SelectionField({
  id,
  label,
  options,
}: {
  id: "actorIds" | "directorIds" | "categoryIds";
  label: string;
  options: CatalogCard[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-white">
        {label}
      </label>
      <select
        id={id}
        name={id}
        multiple
        className="mt-2 min-h-32 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-zinc-500">
        {options.length === 0
          ? `Todavía no hay ${label.toLowerCase()}.`
          : "Mantén Ctrl (o Cmd) para seleccionar varios."}
      </p>
    </div>
  );
}

export function MovieForm({ actors, directors, categories }: MovieFormProps) {
  const [state, formAction, pending] = useActionState(addMovie, initialState);
  const [clientError, setClientError] = useState("");

  function validateImageSize(event: FormEvent<HTMLFormElement>) {
    const imageInput = event.currentTarget.elements.namedItem(
      "image",
    ) as HTMLInputElement | null;
    const image = imageInput?.files?.[0];

    if (image && image.size > MAX_IMAGE_SIZE) {
      event.preventDefault();
      setClientError("El cartel no puede superar 5 MB.");
      return;
    }

    setClientError("");
  }

  return (
    <form
      action={formAction}
      onSubmit={validateImageSize}
      className="mt-5 grid gap-6 rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl lg:grid-cols-2"
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="movie-name" className="block text-sm font-semibold text-white">
            Título
          </label>
          <input
            id="movie-name"
            name="name"
            type="text"
            required
            maxLength={150}
            autoComplete="off"
            placeholder="Por ejemplo, Transporter"
            className="mt-2 w-full rounded-lg border border-white/15 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div>
          <label htmlFor="movie-link" className="block text-sm font-semibold text-white">
            Enlace <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <input
            id="movie-link"
            name="link"
            type="url"
            inputMode="url"
            placeholder="https://..."
            className="mt-2 w-full rounded-lg border border-white/15 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div>
          <label htmlFor="movie-image" className="block text-sm font-semibold text-white">
            Cartel
          </label>
          <input
            id="movie-image"
            name="image"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full rounded-lg border border-dashed border-white/20 bg-zinc-950 px-4 py-4 text-sm text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-red-500"
          />
          <p className="mt-2 text-xs text-zinc-500">JPG, PNG o WebP. Máximo 5 MB.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
        <SelectionField id="directorIds" label="Directores" options={directors} />
        <SelectionField id="actorIds" label="Actores" options={actors} />
        <SelectionField id="categoryIds" label="Categorías" options={categories} />
      </div>

      <div className="lg:col-span-2">
        {clientError || state.message ? (
          <p
            aria-live="polite"
            className={
              !clientError && state.status === "success"
                ? "text-green-400"
                : "text-red-400"
            }
          >
            {clientError || state.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-5 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar película"}
        </button>
      </div>
    </form>
  );
}
