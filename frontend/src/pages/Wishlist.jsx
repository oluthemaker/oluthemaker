import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import useProductStore from "../store/useProductStore";
import useWishlistStore from "../store/useWishlistStore";
import useCartStore from "../store/useCartStore";
import useSEO from "../hooks/useSEO";
import { atelierToast } from "../utils/Toaster";
import { getWishlistAvailability } from "../utils/wishlist";

const formatNGN = (amount) => `₦${Number(amount || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const Wishlist = () => {
  const { products, fetchProducts, loading } = useProductStore();
  const items = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    // Refresh the catalogue so saved items reflect current publication and stock status.
    fetchProducts({ force: true });
  }, [fetchProducts]);

  useSEO({
    title: "Your Wishlist",
    description: "Your saved pieces from the Olú The Maker collection.",
    noIndex: true,
  });

  const wishlistProducts = useMemo(() => {
    const catalogue = new Map(products.map((product) => [String(product._id || product.id), product]));
    return items.map((saved) => ({
      saved,
      product: catalogue.get(saved.productId) || null,
      display: catalogue.get(saved.productId) || saved,
    }));
  }, [items, products]);

  const handleAddToCart = (product) => {
    const availability = getWishlistAvailability(product);
    if (!availability.available) {
      atelierToast(availability.message, "error");
      return;
    }
    const variants = Array.isArray(product.variants) ? product.variants.filter((variant) => variant.isActive !== false) : [];
    const hasLegacySizes = (product.shoeDetails?.sizes || []).length > 0;
    if (variants.length || hasLegacySizes) {
      atelierToast("Choose your size or colour on the product page first.");
      return;
    }
    const isDigitalMagazine = product.category === "Magazine" && product.magazineDetails?.isDigital;
    const isPreOrder = product.status === "Pre-Order";
    try {
      addToCart({
        _id: product._id,
        id: product._id,
        productId: product._id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: Number(product.price || 0),
        image: product.images?.[0] || product.magazineDetails?.coverImage || "",
        availableStock: isPreOrder || isDigitalMagazine ? null : Number(product.stock || 0),
        stockTracked: !isPreOrder && !isDigitalMagazine,
      }, 1);
      atelierToast("Added to your selection.");
    } catch (error) {
      atelierToast(error.message || "Unable to add this item.", "error");
    }
  };

  return (
    <main className="bg-atelier-paper text-atelier-ink min-h-screen pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        <header className="mb-12 border-b border-atelier-ink/10 pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <span className="text-[10px] tracking-[0.5em] uppercase font-bold opacity-40 block mb-2">Your private selection</span>
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tight">Wishlist</h1>
            <p className="text-xs opacity-50 mt-3">{items.length} {items.length === 1 ? "piece" : "pieces"} saved</p>
          </div>
          <Link to="/store" className="inline-flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase font-bold hover:text-atelier-tan transition-colors">
            Continue exploring <ArrowRight size={14} />
          </Link>
        </header>

        {loading && products.length === 0 && items.length > 0 && (
          <p className="py-10 text-center text-sm italic opacity-60">Refreshing your saved pieces...</p>
        )}

        {items.length === 0 ? (
          <div className="py-24 text-center border border-atelier-ink/10">
            <Heart size={28} strokeWidth={1.2} className="mx-auto mb-5 opacity-40" />
            <h2 className="text-2xl md:text-3xl font-serif italic">Your wishlist is waiting.</h2>
            <p className="text-sm opacity-60 mt-3 mb-8">Save the pieces you would like to come back to.</p>
            <Link to="/store" className="inline-flex items-center gap-3 bg-atelier-ink text-white px-7 py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-atelier-tan transition-colors">Explore the store <ArrowRight size={14} /></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {wishlistProducts.map(({ saved, product, display }) => {
              const availability = getWishlistAvailability(product);
              const image = product?.images?.[0] || product?.magazineDetails?.coverImage || display.image;
              const name = product?.name || display.name;
              const price = product ? product.price : display.price;
              const slug = product?.slug || display.slug;
              const productPath = `/${product?.category === "Magazine" || display.category === "Magazine" ? "magazine" : "product"}/${slug}`;
              const needsOptions = product && ((product.variants || []).some((variant) => variant.isActive !== false) || (product.shoeDetails?.sizes || []).length > 0);
              return (
                <article key={saved.productId} className="border border-atelier-ink/10 bg-white/20 flex flex-col">
                  <div className="relative aspect-[4/5] bg-atelier-ink/5 overflow-hidden">
                    {image ? <img src={image} alt={name} loading="lazy" className={`w-full h-full object-cover ${!availability.available ? "grayscale opacity-60" : ""}`} /> : <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-widest opacity-30">Image unavailable</div>}
                    <button type="button" onClick={() => removeFromWishlist(saved.productId)} aria-label={`Remove ${name} from wishlist`} className="absolute top-3 right-3 w-10 h-10 bg-atelier-paper/90 border border-atelier-ink/10 flex items-center justify-center hover:bg-atelier-ink hover:text-white transition-colors">
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                    {!availability.available && <span className="absolute bottom-3 left-3 bg-atelier-paper/90 px-3 py-2 text-[9px] tracking-[0.2em] uppercase font-bold">Unavailable</span>}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[9px] tracking-[0.3em] uppercase opacity-40">{product?.subCategory || product?.category || display.category}</span>
                    <h2 className="font-serif italic text-2xl mt-2">{name}</h2>
                    <p className="font-serif text-sm mt-2">{formatNGN(price)}</p>
                    <p className="text-[10px] leading-relaxed opacity-50 mt-3">{availability.message}</p>
                    <div className="mt-auto pt-5">
                      {availability.available && product && (needsOptions || !product._id) ? (
                        <Link to={productPath} className="w-full flex items-center justify-center gap-2 border border-atelier-ink px-4 py-3 text-[9px] tracking-[0.25em] uppercase font-bold hover:bg-atelier-ink hover:text-white transition-colors">Choose options <ArrowRight size={13} /></Link>
                      ) : availability.available && product ? (
                        <button type="button" onClick={() => handleAddToCart(product)} className="w-full flex items-center justify-center gap-2 bg-atelier-ink text-white px-4 py-3 text-[9px] tracking-[0.25em] uppercase font-bold hover:bg-atelier-tan transition-colors"><ShoppingBag size={14} /> Add to cart</button>
                      ) : (
                        <button type="button" disabled className="w-full border border-atelier-ink/10 px-4 py-3 text-[9px] tracking-[0.25em] uppercase font-bold opacity-40 cursor-not-allowed">Unavailable</button>
                      )}
                      {slug && <Link to={productPath} className="block text-center text-[9px] tracking-[0.2em] uppercase underline underline-offset-4 mt-4 opacity-50 hover:opacity-100">View piece</Link>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Wishlist;
