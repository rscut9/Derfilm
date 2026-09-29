import Link from "next/link";
import { MediaCard } from "@/app/_components/media-card";
import { SiteHeader } from "@/app/_components/site-header";
import { getDirectors } from "@/lib/catalog";

export default function DirectorsPage() {
  const directors = getDirectors();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
          Catálogo
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Directores</h1>
        <p className="mt-3 text-zinc-400">
          Todos los directores guardados, ordenados alfabéticamente.
        </p>

        {directors.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-white/15 bg-zinc-900 px-5 py-8 text-zinc-400">
            Todavía no has añadido ningún director.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {directors.map((director, index) => (
              <Link
                key={director.id}
                href={`/directores/${director.id}`}
                className="block w-full max-w-48 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <MediaCard
                  name={director.name}
                  imageSrc={director.imageSrc}
                  eager={index < 2}
                />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
