import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faUser, faShoppingCart, faBars } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faInstagram, faPinterest, faEtsy } from "@fortawesome/free-brands-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import DelayedLink from "./DelayedLink";

const Navbar = ({ user, showProfile, setShowProfile, cart, setShowCart, showCart, wishlist, setShowCustomRequest, onLogout }) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  return (
    <nav className="bg-gradient-to-r from-teal-700 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer">
          <Logo className="h-8 w-8" />
          <DelayedLink to="/" className="text-xl font-bold">Mani Mohana</DelayedLink>
        </div>
        <div className="hidden md:flex space-x-1 gap-x-6">
          <DelayedLink to="/" className="hover:text-pink-300 transition">Home</DelayedLink>
          <DelayedLink to="/products" className="hover:text-pink-300 transition">Products</DelayedLink>
          <a href="#about" className="hover:text-pink-300 transition">About</a>
          <a href="#contact" className="hover:text-pink-300 transition">Contact</a>
        </div>
        <div className="flex items-center space-x-4">
          {user && user.isAdmin && (
            <DelayedLink to="/admin" className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-full text-sm font-semibold text-white transition">Admin Dashboard</DelayedLink>
          )}
          <button 
            onClick={() => setShowCustomRequest(true)}
            className="hidden md:block bg-pink-500 hover:bg-pink-600 px-3 py-1 rounded-full text-sm transition"
          >
            Request Custom
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="relative p-2 hover:bg-indigo-800 rounded-full transition"
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
            {showProfile && (
              <div className="profile-dropdown absolute right-0 top-full mt-2 z-50 bg-white shadow-lg rounded-lg w-48 py-2 text-gray-800">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b font-semibold">{user.name}</div>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfile(false); navigate('/profile'); }}>Profile</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfile(false); navigate('/wishlist'); }}>Wishlist</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfile(false); navigate('/orders'); }}>Orders</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={() => { setShowProfile(false); onLogout && onLogout(); navigate('/'); }}>Logout</button>
                  </>
                ) : (
                  <>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowProfile(false); navigate('/login'); }}>Sign Up / Login</button>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 hover:bg-indigo-800 rounded-full transition"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          <button className="md:hidden p-2">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 