import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import feather from "../assets/feather.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faLocationDot } from "@fortawesome/free-solid-svg-icons";

const ProductCard = ({ product, addToCart }) => {
  const [added, setAdded] = React.useState(false);
  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  return (
    <div className="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
      <div className="relative overflow-hidden h-64">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image w-full h-full object-cover"
        />
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
          <span className="text-lg font-bold text-teal-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}</span>
        </div>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">{product.category}</span>
          <button
            disabled={!product.inStock || added}
            onClick={handleAdd}
            className={`px-4 py-2 rounded-full ${product.inStock ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} transition flex items-center`}
          >
            {added ? <span className="mr-1">✔</span> : null}
            {product.inStock ? (added ? 'Added!' : 'Add to Cart') : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ onRequestCustom, products = [], addToCart }) => {
  const navigate = useNavigate();
  // Prepare product highlights
  const latest = [...products].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 3);
  const mostBought = [...products].sort((a, b) => b.sales - a.sales).slice(0, 3);
  const recommended = products.filter(p => p.recommended).slice(0, 3);
  useEffect(() => {
   
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 to-blue-600 text-white pt-20 pb-36">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="mb-6 flex items-center space-x-4">
              <img src={feather} alt="Peacock Feather Logo" className="h-12 w-12 rounded-full" />
              <span className="text-3xl md:text-4xl font-bold">Mani Mohana</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Unique Handcrafted Resin Art</h1>
            <p className="text-xl mb-6">Each piece is a one-of-a-kind creation, infused with creativity and passion.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/products')}
                className="bg-teal-500 hover:bg-teal-600 px-6 py-3 rounded-full font-medium transition"
              >
                Shop Now
              </button>
              <button 
                onClick={onRequestCustom}
                className="bg-white hover:bg-gray-100 text-teal-700 px-6 py-3 rounded-full font-medium transition"
              >
                Request Custom Design
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img 
                src={logo}
                alt="Mani Mohana Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="custom-shape-divider-bottom-1681643108 absolute left-0 w-full overflow-hidden line-height-0 rotate-180" style={{bottom: -1}}>
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* Product Highlights Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-teal-700 mb-4">Latest Release</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {latest.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
            </div>
          </div>
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-indigo-700 mb-4">Most Viewed</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {mostBought.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-pink-600 mb-4">Recommended For You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommended.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">About Our Resin Art</h2>
              <p className="text-gray-600 mb-4">
                Every piece in our collection is handcrafted with the utmost care and attention to detail. 
                We use high-quality, non-toxic resin combined with various pigments, dyes, and inclusions to 
                create stunning, durable art pieces that will last a lifetime.
              </p>
              <p className="text-gray-600 mb-6">
                Our process involves carefully measuring and mixing resin components, adding colors and effects, 
                pouring into molds or onto surfaces, and allowing proper curing time. Each piece is then sanded, 
                polished, and finished to perfection.
              </p>
              <div className="flex space-x-4">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <i className="fas fa-award text-3xl text-indigo-600 mb-2"></i>
                  <h4 className="font-bold">Premium Quality</h4>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <i className="fas fa-hand-holding-heart text-3xl text-pink-500 mb-2"></i>
                  <h4 className="font-bold">Handcrafted</h4>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <i className="fas fa-leaf text-3xl text-green-500 mb-2"></i>
                  <h4 className="font-bold">Eco-Friendly</h4>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80" 
                  alt="Resin Art Process" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1620231109648-2e0f0a4a9e7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80" 
                  alt="Resin Art Materials" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
                  alt="Resin Art Workshop" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden h-48">
                <img 
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80" 
                  alt="Finished Resin Art" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gradient-to-r from-teal-700 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Get In Touch</h2>
            <p className="text-indigo-200 max-w-2xl mx-auto">Have questions about our products or process? Reach out to us!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-teal-800 p-6 rounded-lg text-center">
              <div className="bg-teal-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faEnvelope} size="2x" color="white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-indigo-200">22manimohana@gmail.com</p>
            </div>
            <div className="bg-indigo-800 p-6 rounded-lg text-center">
              <div className="bg-indigo-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faPhone} size="2x" color="white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-indigo-200">+91 62643 43243</p>
            </div>
            <div className="bg-indigo-800 p-6 rounded-lg text-center">
              <div className="bg-indigo-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faLocationDot} size="2x" color="white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-indigo-200">Bilaspur, Chhattisgarh, India</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage; 