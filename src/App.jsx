import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import CustomRequestModal from "./components/CustomRequestModal";
import Notification from "./components/Notification";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import Loader from "./components/Loader";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import Wishlist from "./components/Wishlist";
import Orders from "./components/Orders";
import AdminPanel from "./components/AdminPanel";
import { Navigate } from "react-router-dom";
import emailjs from 'emailjs-com';
import { apiFetch } from "./api";
import ResetPassword from "./components/ResetPassword";

// ProductsPage component
const ProductsPage = ({ products }) => (
  <ProductList currentPage="products" products={products} />
);

const App = () => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCustomRequest, setShowCustomRequest] = useState(false);
  const [notification, setNotification] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const notificationTimeout = React.useRef(null);
  const [userLoading, setUserLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    apiFetch("/products")
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  // Load user from token/localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiFetch("/auth/me")
        .then(res => setUser(res.user))
        .catch(() => {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setUserLoading(false));
    } else {
      const saved = localStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
      setUserLoading(false);
    }
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);
  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Checkout handler
  const handleCheckout = async ({ address, phone, paymentMethod }) => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    if (!user) {
      showNotification("Please login to place an order.", "error");
      setCheckoutLoading(false);
      return;
    }
    if (cart.length === 0) {
      showNotification("Your cart is empty.", "error");
      setCheckoutLoading(false);
      return;
    }
    try {
      const items = cart.map(item => ({
        product: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({ items, total, address, phone, paymentMethod })
      });
      setCart([]);
      showNotification("Order placed successfully!", "success");
    } catch (err) {
      showNotification(err.message || "Failed to place order.", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Auth handlers
  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem("user", JSON.stringify(userObj));
    setShowProfile(false);
    // If admin, set admin_logged_in
    if (userObj.isAdmin) {
      localStorage.setItem("admin_logged_in", "true");
    } else {
      localStorage.removeItem("admin_logged_in");
    }
  };
  const handleSignUp = (userObj) => {
    setUser(userObj);
    localStorage.setItem("user", JSON.stringify(userObj));
    setShowProfile(false);
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setShowProfile(false);
    localStorage.removeItem("admin_logged_in"); // Remove admin session on logout
    window.location.replace("/login"); // Force redirect to login and clear history
  };

  // Add to Cart handler
  const addToCart = (product) => {
    const productKey = product._id || product.id;
    setCart(prev => {
      const existing = prev.find(item => (item._id || item.id) === productKey);
      if (existing) {
        return prev.map(item =>
          (item._id || item.id) === productKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    showNotification(`${product.name} added to cart!`, 'success');
  };

  // Profile dropdown close on outside click
  React.useEffect(() => {
    if (!showProfile) return;
    const handleClick = (e) => {
      if (!e.target.closest('.profile-dropdown') && !e.target.closest('.profile-btn')) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfile]);

  useEffect(() => {
    window.showAppLoader = () => setLoading(true);
    window.hideAppLoader = () => setLoading(false);
    return () => {
      window.showAppLoader = undefined;
      window.hideAppLoader = undefined;
    };
  }, []);

  // Show loader before page refresh/unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      setLoading(true);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Notification helper
  const showNotification = (message, type) => {
    setNotification({ message, type });
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
    notificationTimeout.current = setTimeout(() => {
      setNotification(null);
      notificationTimeout.current = null;
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Show mesh background only on admin panel */}
      {location.pathname.startsWith('/admin') && (
        <div className="pointer-events-none fixed inset-0 -z-10 animate-mesh bg-mesh-gradient opacity-80" />
      )}
      {loading && <Loader />}
      <Navbar
        user={user}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        cart={cart}
        setShowCart={setShowCart}
        showCart={showCart}
        wishlist={wishlist}
        setShowCustomRequest={setShowCustomRequest}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <HomePage
              onRequestCustom={() => setShowCustomRequest(true)}
              products={products}
              addToCart={addToCart}
            />
          } />
          <Route path="/products" element={
            <ProductList products={products} addToCart={addToCart} currentPage="products" />
          } />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
          <Route path="/profile" element={userLoading ? null : (user ? <Profile user={user} /> : <Navigate to="/login" replace />)} />
          <Route path="/wishlist" element={userLoading ? null : (user ? <Wishlist /> : <Navigate to="/login" replace />)} />
          <Route path="/orders" element={userLoading ? null : (user ? <Orders user={user} /> : <Navigate to="/login" replace />)} />
          <Route path="/admin" element={userLoading ? null : (user && user.isAdmin ? <AdminPanel /> : <Navigate to="/login" replace />)} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </main>
      <Footer />
      {showCart && (
        <Cart
          cart={cart}
          setCart={setCart}
          setShowCart={setShowCart}
          showNotification={showNotification}
          onCheckout={handleCheckout}
          checkoutLoading={checkoutLoading}
        />
      )}
      {showCustomRequest && (
        <CustomRequestModal
          setShowCustomRequest={setShowCustomRequest}
          showNotification={showNotification}
        />
      )}
      {notification && <Notification notification={notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default App; 