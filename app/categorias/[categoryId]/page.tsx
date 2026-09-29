import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaCard } from "@/app/_components/media-card";
import { SiteHeader } from "@/app/_components/site-header";
import { getCategoryById, getMoviesForCategory } from "@/lib/catalog";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const id = Number(categoryId);

  if (!Number.isSafeInteger(id) || id < 1) {
    notFound();
  }

  const category = getCategoryById(id);

  if (!category) {
    notFound();
  }

  const movies = getMoviesForCategory(id);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/categorias"
          className="text-sm font-semibold text-zinc-400 transition hover:text-white"
        >
          ← Todas las categorías
        </Link>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start">
          <MediaCard name={category.name} imageSrc={category.imageSrc} eager />
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
              Categoría
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="mt-3 text-zinc-400">
              {movies.length === 1
                ? "1 película guardada"
                : `${movies.length} películas guardadas`}
            </p>
          </div>
        </div>

        <section aria-labelledby="movies-heading" className="mt-12">
          <h2 id="movies-heading" className="text-2xl font-bold">
            Películas
          </h2>

          {movies.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-white/15 bg-zinc-900 px-5 py-8 text-zinc-400">
              Aún no hay películas asociadas a esta categoría.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {movies.map((movie, index) => (
                <MediaCard
                  key={movie.id}
                  name={movie.name}
                  imageSrc={movie.imageSrc}
                  eager={index < 2}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
