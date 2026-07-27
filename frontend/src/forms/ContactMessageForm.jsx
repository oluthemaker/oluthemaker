import { motion } from "framer-motion";
import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import ElegantButton from "../buttons/ElegantButtons";

const MessageForm = () => {
  const [state, handleSubmit] = useForm("mvzweqla");

  if (state.succeeded) {
    return (
      <div className="py-20 text-center animate-fade-in">
        <h3 className="font-serif italic text-2xl text-atelier-ink">
          Thank you.
        </h3>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase opacity-60 mt-2">
          Your message has been received.
        </p>
      </div>
    );
  }

  return (
    <motion.form
      className="space-y-6"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      method="POST"
    >
      {/* Inquiry Select */}
      <div>
        <label
          htmlFor="inquiry"
          className="block text-[10px] tracking-widest uppercase font-sans font-bold text-atelier-ink/60 mb-2"
        >
          Nature of Inquiry
        </label>
        <div className="relative border-b border-atelier-ink/20 focus-within:border-atelier-tan transition-colors">
          <select
            id="inquiry"
            name="inquiry"
            className="w-full py-3 bg-transparent text-atelier-ink font-serif text-lg focus:outline-none appearance-none cursor-pointer"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Please select...
            </option>
            <option value="commission">Commissions</option>
            <option value="orders">Online Orders & Logistics</option>
            <option value="marketing">Press & Editorial</option>
            <option value="general">General Inquiries</option>
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-b border-atelier-ink/20 focus-within:border-atelier-tan transition-colors">
          <label
            htmlFor="name"
            className="block text-[10px] tracking-widest uppercase font-sans font-bold text-atelier-ink/60 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full py-2 bg-transparent text-atelier-ink font-serif text-lg focus:outline-none"
            required
          />
        </div>
        <div className="border-b border-atelier-ink/20 focus-within:border-atelier-tan transition-colors">
          <label
            htmlFor="email"
            className="block text-[10px] tracking-widest uppercase font-sans font-bold text-atelier-ink/60 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="w-full py-2 bg-transparent text-atelier-ink font-serif text-lg focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="border-b border-atelier-ink/20 focus-within:border-atelier-tan transition-colors">
        <label
          htmlFor="subject"
          className="block text-[10px] tracking-widest uppercase font-sans font-bold text-atelier-ink/60 mb-1"
        >
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          className="w-full py-2 bg-transparent text-atelier-ink font-serif text-lg focus:outline-none"
          required
        />
      </div>

      <div className="border-b border-atelier-ink/20 focus-within:border-atelier-tan transition-colors">
        <label
          htmlFor="message"
          className="block text-[10px] tracking-widest uppercase font-sans font-bold text-atelier-ink/60 mb-1"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full py-2 bg-transparent text-atelier-ink font-serif text-lg focus:outline-none resize-none"
          required
        ></textarea>
      </div>

      <div className="pt-4">
        <ElegantButton
          label={state.submitting ? "Transmitting..." : "Send Message"}
          state={state.submitting}
        />
      </div>
    </motion.form>
  );
};

export default MessageForm;
