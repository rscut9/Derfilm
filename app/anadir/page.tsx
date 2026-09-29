import { SiteHeader } from "@/app/_components/site-header";
import { CatalogItemForm } from "./catalog-item-form";
import { MovieForm } from "./movie-form";
import { addActor, addCategory, addDirector } from "./actions";
import { getActors, getCategories, getDirectors } from "@/lib/catalog";

export default function AddPage() {
  const actors = getActors();
  const directors = getDirectors();
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
          Añadir
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Añadir al catálogo
        </h1>
        <p className="mt-3 text-zinc-400">
          Guarda el nombre y una imagen para crear las tarjetas del catálogo.
        </p>

        <section aria-labelledby="movie-heading" className="mt-8">
          <h2 id="movie-heading" className="text-xl font-bold">
            Nueva película
          </h2>
          <MovieForm
            actors={actors}
            directors={directors}
            categories={categories}
          />
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <section aria-labelledby="actor-heading">
            <h2 id="actor-heading" className="text-xl font-bold">
              Nuevo actor
            </h2>
            <CatalogItemForm
              entity="Actor"
              placeholder="Por ejemplo, Jason Statham"
              action={addActor}
            />
          </section>

          <section aria-labelledby="director-heading">
            <h2 id="director-heading" className="text-xl font-bold">
              Nuevo director
            </h2>
            <CatalogItemForm
              entity="Director"
              placeholder="Por ejemplo, Louis Leterrier"
              action={addDirector}
            />
          </section>

          <section aria-labelledby="category-heading">
            <h2 id="category-heading" className="text-xl font-bold">
              Nueva categoría
            </h2>
            <CatalogItemForm
              entity="Categoría"
              placeholder="Por ejemplo, Acción"
              action={addCategory}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
