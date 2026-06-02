import React from "react";
import { motion } from "framer-motion";
import useSEO from "../../hooks/useSEO";

const sections = [
  {
    title: "Introduction",
    content: `
At Olu The Maker, we respect your privacy and are committed to protecting
your personal information. This Privacy Policy explains how we collect,
use, and safeguard your data when you visit our website or purchase our products.
    `,
  },
  {
    title: "Information We Collect",
    content: `
We may collect the following types of information:
- Personal information you provide (name, email, shipping address, payment details)
- Usage data (pages visited, clicks, device and browser type)
- Cookies and tracking technologies to improve user experience
    `,
  },
  {
    title: "How We Use Your Information",
    content: `
Your information is used to:
- Process orders and payments
- Communicate order updates and promotional offers
- Improve website functionality and content
- Ensure security and prevent fraud
    `,
  },
  {
    title: "Sharing Information",
    content: `
We do not sell your personal data. We may share information with:
- Shipping and fulfillment partners
- Payment processors
- Legal authorities if required by law
    `,
  },
  {
    title: "Cookies & Tracking",
    content: `
Our website uses cookies and similar tracking technologies to enhance your
experience, analyze traffic, and personalize content. You can manage cookie
preferences in your browser settings.
    `,
  },
  {
    title: "Third-Party Services",
    content: `
We may integrate with third-party services such as analytics or payment
processors. These services have their own privacy policies, and we encourage
you to review them.
    `,
  },
  {
    title: "Your Rights",
    content: `
Depending on your location, you may have rights to:
- Access, correct, or delete your personal information
- Object to or restrict processing
- Withdraw consent
Contact us at info@oluthemaker.com for assistance.
    `,
  },
  {
    title: "Data Security",
    content: `
We implement reasonable technical and organizational measures to protect
your personal information against unauthorized access, loss, or misuse.
    `,
  },
  {
    title: "Children's Privacy",
    content: `
Our website is not intended for children under 13. We do not knowingly
collect personal information from children.
    `,
  },
  {
    title: "Changes to This Policy",
    content: `
We may update this Privacy Policy from time to time. Any changes will
be posted on this page with the effective date.
    `,
  },
  {
    title: "Contact Us",
    content: `
If you have questions about this Privacy Policy, please contact us at
info@oluthemaker.com.
    `,
  },
];

const Privacy = () => {
  useSEO({
    title: "Privacy Policy",
    description: "Learn about our privacy practices and data protection.",
  });

  return (
    <>
      <main className="bg-atelier-paper text-atelier-ink min-h-screen">
        {/* HEADER SECTION */}
        <section className="max-w-4xl mx-auto px-6 pt-32 pb-20">
          <span className="text-[10px] tracking-[0.4em] uppercase opacity-50 font-sans block mb-6">
            Data Governance
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-serif italic tracking-tighter mb-8"
          >
            Privacy <span className="not-italic">&</span> Data
          </motion.h1>

          <p className="font-serif text-xl text-atelier-ink/70 max-w-2xl leading-relaxed italic">
            At the Atelier, we hold your personal data in the same high regard
            as our craftsmanship.
          </p>

          <div className="h-[1px] w-full bg-atelier-ink/10 mt-16" />
        </section>

        {/* CONTENT SECTION */}
        <section className="max-w-4xl mx-auto px-6 pb-32">
          <div className="space-y-20">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-8"
              >
                {/* Indexing column */}
                <div className="md:col-span-1">
                  <span className="text-[10px] tracking-[0.3em] uppercase font-sans font-bold opacity-30 block">
                    Article {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content column */}
                <div className="md:col-span-3">
                  <h2 className="text-2xl font-serif text-atelier-ink mb-4 tracking-tight">
                    {section.title}
                  </h2>
                  <div className="font-serif text-lg leading-relaxed text-atelier-ink/80 whitespace-pre-line">
                    {section.content.trim()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FINAL FOOTER */}
          <div className="mt-32 pt-12 border-t border-atelier-ink/10 text-center">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase opacity-40">
              Revision 2.0 • Lagos & London Studios
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Privacy;
