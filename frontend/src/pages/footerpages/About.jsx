import React from "react";
import PageTransition from "../../components/PageTransition";
import useSEO from "../../hooks/useSEO";

const teamMembers = [
  {
    name: "Olu Fadairo",
    position: "Placeholder",
    bio: "Placeholder",
    image:
      "https://res.cloudinary.com/ds78nckog/image/upload/v1779142910/olufadairo_tq05gt.jpg", // Placeholder: replace with 4:3 shot
  },
  {
    name: "Chibueze Osuoji",
    position: "Placeholder",
    bio: "Placeholder",
    image: "",
  },
];

const About = () => {
  useSEO({
    title: "About Us",
    description: "Learn about our story and mission.",
  });

  return (
    <>
      <PageTransition>
        <section className="bg-atelier-paper min-h-screen py-24 px-6 md:px-12 text-atelier-ink">
          <div className="max-w-4xl mx-auto">
            <span className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-8 block font-sans">
              Our Heritage
            </span>

            <h1 className="text-4xl md:text-6xl font-serif italic mb-12 tracking-tighter">
              Crafting Purpose <br />
              <span className="not-italic">at the Bench.</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start mb-32">
              <div className="md:col-span-3">
                <p className="text-xl md:text-2xl leading-relaxed font-serif text-atelier-ink/90 italic">
                  At Olú the Maker, we believe shoes are more than just
                  footwear—they are a physical manifestation of identity and
                  tradition.
                </p>

                <div className="mt-12 space-y-8 font-serif text-lg leading-relaxed text-atelier-ink/80">
                  <p>
                    Founded with a focus on the "bespoke" spirit, every pair we
                    create is an intersection of Nigerian artisanry and global
                    luxury standards.
                  </p>
                  <p>
                    From our workshops in Lagos to our creative inspirations in
                    London, we bridge two worlds to provide a contemporary
                    aesthetic for the modern individual.
                  </p>
                </div>
              </div>

              {/* Sidebar decorative detail */}
              <div className="md:col-span-2 border-l border-atelier-ink/10 pl-8 pt-4">
                <h3 className="font-sans text-[10px] tracking-widest uppercase mb-4 opacity-50 font-bold">
                  The Pillars
                </h3>
                <ul className="space-y-4 font-serif italic text-lg">
                  <li>Hand-selected Leathers</li>
                  <li>Bespoke Last-making</li>
                  <li>Ethical Production</li>
                  <li>Timeless Silhouettes</li>
                </ul>
              </div>
            </div>

            {/* --- TEAM SECTION --- */}
            <div className="border-t border-atelier-ink/10 pt-24">
              <span className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-12 block font-sans">
                The Hands Behind the Craft
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                {teamMembers.map((member) => (
                  <div key={member.name} className="space-y-6">
                    {/* Portrait Image with 4:3 ratio to match your other pages */}
                    <div className="aspect-[4/6] bg-atelier-ink/5 overflow-hidden  transition-all duration-700">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-2xl font-serif italic tracking-tight">
                        {member.name}
                      </h4>
                      <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-atelier-tan">
                        {member.position}
                      </p>
                    </div>

                    <p className="font-serif italic text-lg opacity-70 leading-relaxed max-w-sm">
                      {member.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </PageTransition>
    </>
  );
};

export default About;
