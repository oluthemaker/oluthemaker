import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const NotFound = () => {
  useEffect(() => {
    document.title = "Page Not Found — Olú The Maker";

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }

    // A missing URL should not be indexed as a valid storefront page.
    robots.setAttribute("content", "noindex, nofollow");
  }, []);

  return (
    <section className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden bg-atelier-paper px-6 py-24 md:min-h-[80vh]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span className="select-none font-serif text-[clamp(13rem,38vw,36rem)] leading-none tracking-[-0.12em] text-atelier-ink/[0.035]">
          404
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.45em] text-atelier-tan md:text-xs">
          Olú The Maker
        </p>

        <div className="mx-auto mb-8 h-px w-12 bg-atelier-tan/70" />

        <h1 className="mb-5 font-serif text-4xl italic leading-tight text-atelier-ink sm:text-5xl md:text-7xl">
          This page is out of reach.
        </h1>

        <p className="mx-auto mb-10 max-w-md text-sm leading-7 text-atelier-ink/65 md:text-base">
          The page you’re looking for may have moved, or the address may not be
          quite right. Let’s get you back to something worth discovering.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-3 bg-atelier-ink px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-atelier-tan sm:w-auto"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <Link
            to="/shop/products"
            className="group inline-flex min-h-12 w-full items-center justify-center gap-3 border border-atelier-ink/25 px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-atelier-ink transition-colors duration-300 hover:border-atelier-ink hover:bg-atelier-ink hover:text-white sm:w-auto"
          >
            Explore the Store
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>


      </div>
    </section>
  );
};

export default NotFound;
