"use client";

import { useActionState, useState, type FormEvent } from "react";
import { addActor, type ActorFormState } from "./actions";

const initialState: ActorFormState = {
  status: "idle",
  message: "",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function ActorForm() {
  const [state, formAction, pending] = useActionState(addActor, initialState);
  const [clientError, setClientError] = useState("");

  function validateImageSize(event: FormEvent<HTMLFormElement>) {
    const imageInput = event.currentTarget.elements.namedItem(
      "image",
    ) as HTMLInputElement | null;
    const image = imageInput?.files?.[0];

    if (image && image.size > MAX_IMAGE_SIZE) {
      event.preventDefault();
      setClientError("La imagen no puede superar 5 MB.");
      return;
    }

    setClientError("");
  }

  return (
    <form
      action={formAction}
      onSubmit={validateImageSize}
      className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-white">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          autoComplete="off"
          className="mt-2 w-full rounded-lg border border-white/15 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          placeholder="Por ejemplo, Jason Statham"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-semibold text-white">
          Imagen
        </label>
        <input
          id="image"
          name="image"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 block w-full rounded-lg border border-dashed border-white/20 bg-zinc-950 px-4 py-4 text-sm text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-red-500"
        />
        <p className="mt-2 text-xs text-zinc-500">JPG, PNG o WebP. Máximo 5 MB.</p>
      </div>

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
        className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar actor"}
      </button>
    </form>
  );
}
