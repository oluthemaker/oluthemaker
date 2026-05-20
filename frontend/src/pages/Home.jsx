import { useEffect } from "react";
import { Link } from "react-router-dom";
import FeaturedBlogCard from "../components/FeaturedBlogCard";
import useBlogStore from "../store/useBlogStore";
import useSEO from "../hooks/useSEO";

const Home = () => {
  const featuredPost = {
    title: "The Anatomy of a Hand-Welted Sole",
    excerpt:
      "Behind the scenes of our signature construction method, where 200 steps define a single pair.",
    image:
      "https://images.unsplash.com/photo-1603191659812-ee978eeeef76?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    slug: "anatomy-of-hand-welting",
  };

  useSEO({
    title: "Home",
    description: "The home of Africa's number one Bespoke and Menswear hub ",
  });

  const { featuredBlog, fetchBlogs, loading } = useBlogStore();
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-atelier-paper">
        <span className="text-[10px] tracking-[0.5em] uppercase animate-pulse text-atelier-ink">
          Opening Archive
        </span>
      </div>
    );

  return (
    <div className="bg-atelier-paper text-atelier-ink">
      {/* HERO SECTION: THE LEAD STORY */}
      <section className="h-screen lg:min-h-[900px] xl:min-h-[1100px] relative overflow-hidden flex items-center">
        {" "}
        <img
          src={featuredBlog?.headerImage}
          alt="Hero"
          className="absolute inset-0 w-full h-full lg:h-[200vh] object-cover object-[50%_30%] lg:object-[50%_20%]"
          style={{ objectPosition: "50% 20%" }}
        />
        <div className="absolute inset-0 bg-atelier-ink/40" />
        <div className="relative z-10 px-6 md:px-12 w-full max-w-5xl">
          <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-atelier-paper/80 block mb-6">
            Current Feature
          </span>
          <h1 className="text-4xl md:text-7xl font-serif italic text-white leading-[1.1] tracking-tighter max-w-3xl">
            {featuredBlog?.title.split(":")[0]}:
            <br />
            <span className="not-italic">
              {" "}
              {featuredBlog?.title.split(":")[1]}
            </span>
          </h1>

          <p className="mt-8 text-lg text-atelier-paper/90 font-serif italic max-w-lg leading-relaxed">
            {featuredBlog?.description}
          </p>

          <Link
            to={`/journal/${featuredBlog?.slug}`}
            className="inline-block mt-10 px-10 py-4 border border-white text-white text-[10px] tracking-[0.3em] font-sans font-bold hover:bg-white hover:text-atelier-ink transition-all duration-500 uppercase"
          >
            DISCOVER
          </Link>
        </div>
      </section>

      {/* SECONDARY FEATURE: THE COLLECTION */}
      <section className="relative h-[85vh] w-full group overflow-hidden bg-atelier-ink">
        <Link to="/store">
          <img
            src="https://images.unsplash.com/photo-1616406432452-07bc5938759d"
            alt="Featured Collection"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-atelier-ink/20 group-hover:bg-transparent transition-colors duration-700" />

          <div className="absolute inset-0 p-12 flex flex-col justify-between border-[1px] border-white/10 m-6 pointer-events-none">
            <div className="flex justify-between items-start">
              <h2 className="text-white text-[10px] tracking-[0.5em] uppercase font-sans font-bold">
                Curation 01
              </h2>
              <span className="text-white/40 font-serif italic">Est. 2026</span>
            </div>

            <div className="flex flex-col items-start gap-6 pointer-events-auto">
              <h3 className="text-white text-4xl md:text-6xl font-serif italic tracking-tighter">
                Ready-to-Wear
              </h3>
              <button className="px-8 py-3 bg-white text-atelier-ink text-[10px] tracking-[0.3em] font-sans font-bold hover:bg-atelier-tan transition-colors uppercase">
                Discover More
              </button>
            </div>
          </div>
        </Link>
      </section>

      {/* 3. FEATURED BLOG CARD */}
      <FeaturedBlogCard post={featuredPost} />

      {/* 4. THE BESPOKE EXPERIENCE */}
      <section className="relative py-32 bg-atelier-ink text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Left: Image Box */}
          <div className="relative aspect-[4/3] w-full group">
            <img
              src="https://res.cloudinary.com/ds78nckog/image/upload/v1778754634/moreimages_yhut1e.jpg"
              alt="Bespoke Shoemaking"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 border border-white/10 m-4 pointer-events-none" />
          </div>

          {/* Right: Text Content */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] tracking-[0.4em] uppercase font-sans font-bold text-atelier-tan">
                Bespoke
              </span>
              <div className="h-[1px] w-12 bg-atelier-tan/30" />
            </div>

            <h2 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[1.1]">
              The Bespoke <br />
              <span className="not-italic text-white/90">Commission</span>
            </h2>

            <p className="text-lg font-serif italic opacity-70 leading-relaxed max-w-md">
              A personal dialogue between maker and wearer. We sculpt the last
              to your exact measurements, ensuring an uncompromised fit and a
              truly singular design.
            </p>

            <div className="pt-6">
              <Link
                to="/bespoke"
                className="inline-block px-10 py-4 border border-white text-white text-[10px] tracking-[0.3em] font-sans font-bold hover:bg-white hover:text-atelier-ink transition-all duration-500 uppercase"
              >
                Discover More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MISSION: THE PHILOSOPHY */}
      <section className="bg-atelier-paper py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-12">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-atelier-ink opacity-30"
            >
              <path d="M2 16c1.5 0 4-1 6-2.5 2.5-2 3-5.5 3-7" />
              <path d="M11 6c2.5 3 6 5 9 5v5c-6 0-10 2-18 2v-2" />
            </svg>
          </div>

          <h2 className="text-[10px] tracking-[0.6em] uppercase font-sans font-bold mb-8 opacity-40">
            The Philosophy
          </h2>

          <p className="text-2xl md:text-4xl font-serif italic text-atelier-ink leading-[1.4] tracking-tight">
            "A balance of tradition and{" "}
            <span className="not-italic">modern expression</span>, built for
            those who value detail, patience, and legacy."
          </p>

          <div className="mt-12 w-12 h-[1px] bg-atelier-tan mx-auto" />

          <p className="mt-12 text-[10px] tracking-[0.3em] uppercase font-sans font-bold opacity-60">
            Olú the Maker • Lagos & London
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
