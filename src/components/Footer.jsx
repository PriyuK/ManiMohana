import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Logo className="h-8 w-8 mr-2" />
              Mani Mohana
            </h3>
            <p className="text-gray-400">Creating unique, handcrafted resin art pieces that bring beauty to everyday life.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            </div>
            <div className="mt-6">
              <div className="flex items-center mb-2 text-gray-400">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                <span>22manimohana@gmail.com</span>
              </div>
              <div className="flex items-center mb-2 text-gray-400">
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                <span>+91 62643 43243</span>
              </div>
              <div className="flex items-center text-gray-400">
                <FontAwesomeIcon icon={faLocationDot} className="mr-2" />
                <span>Bilaspur, Chhattisgarh, India</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">All Products</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">New Arrivals</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Best Sellers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Gift Cards</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Information</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Return Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to get updates on new products and special offers!</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 rounded-l-lg focus:outline-none text-gray-800 w-full"
              />
              <button className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-r-lg transition">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Mani Mohana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 