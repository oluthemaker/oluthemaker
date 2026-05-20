import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import ScrollToTop from "./components/ScrollToTop";
import MagazineDetail from "./pages/MagazineDetail";
import MagazineArchive from "./pages/MagazineArchive";
import ProductDetail from "./components/ProductDetail";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import SingleBlogPost from "./components/blogComponents/SingleBlogPost";
import CreateBlog from "./components/blogComponents/CreateBlog";

//Pages
import Home from "./pages/Home";
import Store from "./pages/Store";
import Blog from "./pages/Blog";
import Bespoke from "./pages/Bespoke";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Payment from "./pages/Payment";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import ResetPassword from "./pages/ResetPassword";
import PaymentPage from "./pages/PaymentPage";

//Footer Pages
import About from "./pages/footerpages/About";
import FAQ from "./pages/footerpages/FAQ";
import Contact from "./pages/footerpages/Contact";
import Shipping from "./pages/footerpages/Shipping";
import Terms from "./pages/footerpages/Terms";
import Privacy from "./pages/footerpages/Privacy";
import CookieBanner from "./components/CookieBanner";
import CookieSettingsPage from "./pages/footerpages/Cookies";
import OurLasts from "./pages/footerpages/OurLasts";
import GlossaryList from "./pages/footerpages/GlossaryList";
import GlossaryDetail from "./components/GlossaryDetail";

//Styling
import "./App.css";

function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Navbar />
        <main className="min-h-screen">
          <BackToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<Store />} />
            <Route path="/store/:slug" element={<ProductDetail />} />
            <Route path="/bespoke" element={<Bespoke />} />
            <Route path="/magazine" element={<MagazineArchive />} />
            <Route path="/magazine/:slug" element={<MagazineDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
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
            <Route path="/our-lasts" element={<OurLasts />} />
            <Route path="/glossary" element={<GlossaryList />} />
            <Route path="/glossary/:term" element={<GlossaryDetail />} />
            //Protected Routes
            {/* --- PROTECTED ROUTES (Clients Only) --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order/:id/success" element={<OrderSuccess />} />
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
                <Route path="edit/:slug" element={<CreateBlog />} />
              </Route>

              {/* 2. Dynamic Route Last (Catch-all for slugs) */}
              <Route path=":slug" element={<SingleBlogPost />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </Router>
      <CookieBanner />
    </>
  );
}

export default App;
