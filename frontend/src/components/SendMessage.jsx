import { motion } from "framer-motion";
import MessageForm from "../forms/ContactMessageForm";

const SendMessage = () => {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 bg-atelier-paper">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="pt-4">
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-sans block mb-6">
              Concierge
            </span>
            <h2 className="text-3xl md:text-5xl font-serif italic text-atelier-ink mb-8 tracking-tight">
              A Direct Dialogue <br />
              <span className="not-italic text-2xl md:text-3xl">
                with our London & Lagos studios.
              </span>
            </h2>
            <p className="text-atelier-ink opacity-80 leading-relaxed font-serif text-lg mb-12">
              Our dedicated team monitors every inquiry with care. Whether it is
              a question about an existing order or a specific bespoke request,
              we aim to respond within 24 hours.
            </p>

            <div className="space-y-4 text-sm font-sans tracking-widest uppercase opacity-60">
              <p>Email: info@oluthemaker.com</p>
              <p>Hours: Mon—Fri, 9am—6pm</p>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 shadow-[20px_20px_60px_#e5e3de,-20px_-20px_60px_#ffffff] border border-atelier-ink/5">
            <MessageForm />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SendMessage;
