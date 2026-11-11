import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";

//Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import ScrollToTop from "./components/ScrollToTop";
const MagazineDetail = lazy(() => import("./pages/MagazineDetail"));
const MagazineArchive = lazy(() => import("./pages/MagazineArchive"));
const ProductDetail = lazy(() => import("./components/ProductDetail"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));
const SingleBlogPost = lazy(() => import("./components/blogComponents/SingleBlogPost"));
const CreateBlog = lazy(() => import("./components/blogComponents/CreateBlog"));
const DraftsList = lazy(() => import("./components/blogComponents/DraftsList"));

//Pages
const Home = lazy(() => import("./pages/Home"));
const Store = lazy(() => import("./pages/Store"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const ProductCatalogue = lazy(() => import("./pages/ProductCatalogue"));
const Blog = lazy(() => import("./pages/Blog"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Payment = lazy(() => import("./pages/Payment"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const RecoverCart = lazy(() => import("./pages/RecoverCart"));
const UnsubscribeCart = lazy(() => import("./pages/UnsubscribeCart"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const OrderLookup = lazy(() => import("./pages/OrderLookup"));
const Commission = lazy(() => import("./pages/Commission"));
const Qr = lazy(() => import("./pages/Qr"));
const Footwear = lazy(() => import("./pages/Footwear"));
const Merchandise = lazy(() => import("./pages/Merchandise"));
const Auctions = lazy(() => import("./pages/Auctions"));
const LeatherGoods = lazy(() => import("./pages/LeatherGoods"));

//Footer Pages
const About = lazy(() => import("./pages/footerpages/About"));
const FAQ = lazy(() => import("./pages/footerpages/FAQ"));
const Contact = lazy(() => import("./pages/footerpages/Contact"));
const Shipping = lazy(() => import("./pages/footerpages/Shipping"));
const Terms = lazy(() => import("./pages/footerpages/Terms"));
const Privacy = lazy(() => import("./pages/footerpages/Privacy"));
import CookieBanner from "./components/CookieBanner";
const CookieSettingsPage = lazy(() => import("./pages/footerpages/Cookies"));
const GlossaryList = lazy(() => import("./pages/footerpages/GlossaryList"));
const GlossaryDetail = lazy(() => import("./components/GlossaryDetail"));

//Styling
import "./App.css";

const PRIVATE_ROUTE_PATTERNS = [
  /^\/admin(?:\/|$)/, /^\/auth(?:\/|$)/, /^\/profile(?:\/|$)/,
  /^\/checkout(?:\/|$)/, /^\/payment(?:\/|$)/, /^\/order(?:\/|$)/,
  /^\/order-lookup(?:\/|$)/, /^\/wishlist(?:\/|$)/, /^\/cart(?:\/|$)/,
  /^\/reset-password(?:\/|$)/, /^\/forgot-password(?:\/|$)/,
  /^\/journal\/(?:write|drafts|edit)(?:\/|$)/,
];

function RouteSEO() {
  const { pathname } = useLocation();
  useEffect(() => {
    const isPrivate = PRIVATE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", isPrivate ? "noindex, nofollow" : "index, follow");

    const ensureMeta = (selector, attributes, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };
    const ensureCanonical = () => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", `https://oluthemaker.com${pathname}`);
    };
    document.title = "Olú The Maker — Considered Craft and Modern Heritage";
    ensureMeta('meta[name="description"]', { name: "description" }, "Discover considered footwear, leather goods, menswear and editorial stories from Olú The Maker.");
    ensureMeta('meta[property="og:title"]', { property: "og:title" }, document.title);
    ensureMeta('meta[property="og:description"]', { property: "og:description" }, "Discover considered footwear, leather goods, menswear and editorial stories from Olú The Maker.");
    ensureMeta('meta[property="og:url"]', { property: "og:url" }, `https://oluthemaker.com${pathname}`);
    ensureMeta('meta[property="og:image"]', { property: "og:image" }, "https://res.cloudinary.com/ds78nckog/image/upload/v1785146735/IMG_0688_ny0nlp.png");
    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" }, document.title);
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description" }, "Discover considered footwear, leather goods, menswear and editorial stories from Olú The Maker.");
    ensureMeta('meta[name="twitter:image"]', { name: "twitter:image" }, "https://res.cloudinary.com/ds78nckog/image/upload/v1785146735/IMG_0688_ny0nlp.png");
    ensureCanonical();
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <Router>
        <RouteSEO />
        <ScrollToTop />
        <Navbar />
        <main className="min-h-screen">
          <BackToTop />
          <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center bg-atelier-paper text-atelier-ink/60"><span className="text-[10px] tracking-[0.4em] uppercase">Opening the atelier</span></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auction" element={<Auctions />} />
            <Route path="/store" element={<Store />} />
            <Route path="/shop/products" element={<ProductCatalogue />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/footwear" element={<Footwear />} />
            <Route path="/leather-goods" element={<LeatherGoods />} />
            <Route path="/merchandise" element={<Merchandise />} />
            <Route path="/commission" element={<Commission />} />
            <Route path="/magazine" element={<MagazineArchive />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/qr" element={<Qr />} />
            <Route path="/magazine/:slug" element={<MagazineDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart/recover/:token" element={<RecoverCart />} />
            <Route path="/cart/unsubscribe/:token" element={<UnsubscribeCart />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order/:id/success" element={<OrderSuccess />} />
            <Route path="/order-lookup" element={<OrderLookup />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            {/* Add more routes as we build */}
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/cookies" element={<CookieSettingsPage />} />
            {/* <Route path="/our-lasts" element={<OurLasts />} /> */}
            <Route path="/glossary" element={<GlossaryList />} />
            <Route path="/glossary/:term" element={<GlossaryDetail />} />
            //Protected Routes
            {/* --- PROTECTED ROUTES (Clients Only) --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              {/* Add checkout or order history routes here */}
            </Route>
            {/* --- ADMIN ONLY ROUTES (The Maker Only) --- */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              {/* Add admin analytics or user management routes here */}
            </Route>
            {/* Blog Routes*/}
            <Route path="/journal">
              <Route index element={<Blog />} />

              {/* 1. Admin Routes First (Specific matches) */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="write" element={<CreateBlog />} />
                <Route path="drafts" element={<DraftsList />} />
                <Route path="edit/:slug" element={<CreateBlog />} />
              </Route>

              {/* 2. Dynamic Route Last (Catch-all for slugs) */}
              <Route path=":slug" element={<SingleBlogPost />} />
            </Route>
          </Routes>
          </Suspense>
        </main>
        <Footer />
      </Router>
      <CookieBanner />
    </>
  );
}

export default App;
