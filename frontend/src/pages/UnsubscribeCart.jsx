import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios.js";

const UnsubscribeCart = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Updating your email preferences…");
  useEffect(() => {
    let active = true;
    API.get(`/abandoned-carts/unsubscribe/${encodeURIComponent(token)}`, { skipAuth: true })
      .then(({ data }) => { if (active) setMessage(data.message); })
      .catch((error) => { if (active) setMessage(error.response?.data?.message || "We could not update your email preferences."); });
    return () => { active = false; };
  }, [token]);
  return (
    <main className="min-h-screen bg-atelier-paper text-atelier-ink pt-40 px-6 text-center">
      <h1 className="font-serif italic text-4xl mb-5">Email preferences</h1>
      <p className="max-w-xl mx-auto text-sm opacity-70 leading-relaxed">{message}</p>
      <Link to="/store" className="inline-block mt-8 underline text-xs tracking-widest uppercase">Return to the store</Link>
    </main>
  );
};
export default UnsubscribeCart;
