import React, { useState } from "react";

const formatRupee = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const ProductCard = ({ product, addToCart }) => {
  const [added, setAdded] = useState(false);
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
          <span className="text-lg font-bold text-teal-600">{formatRupee(product.price)}</span>
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

const ProductList = ({ currentPage, products, addToCart }) => {
  // Sort and filter logic
  const latest = [...products].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 3);
  const mostSold = [...products].sort((a, b) => b.sales - a.sales).slice(0, 3);
  const recommended = products.filter(p => p.recommended).slice(0, 3);

  if (currentPage === 'products') {
    return (
      <section className="py-16 bg-white fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">All Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Browse our entire collection of handcrafted resin art.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
          </div>
        </div>
      </section>
    );
  }

  // Home page: show latest, most sold, recommended
  return (
    <section className="py-16 bg-white fade-in">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Discover Our Resin Art</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Latest, most popular, and recommended pieces just for you.</p>
        </div>
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-teal-700 mb-4">Latest Arrivals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {latest.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
          </div>
        </div>
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-indigo-700 mb-4">Most Sold</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mostSold.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
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
  );
};

export default ProductList; 