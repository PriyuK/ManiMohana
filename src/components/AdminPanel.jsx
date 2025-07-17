import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faEdit, faClipboardList, faChartLine, faPlus, faSearch, faCheck, faTrash, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
// Add icons (using emoji for simplicity, can swap for SVGs or a library)

const ADMIN_EMAIL = "22manimohana@gmail.com";
const ADMIN_PASSWORD = "admin123";

const formatRupee = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold">&times;</button>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">{title}</h3>
        {children}
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", image: "", category: "", inStock: true });
  const [uploadMsg, setUploadMsg] = useState("");
  // Product edit state
  const [editingId, setEditingId] = useState(null);
  const [editProduct, setEditProduct] = useState({});
  // Product edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [modal, setModal] = useState(null); // 'add' | 'manage' | 'orders' | 'extra' | null
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null); // 'add' | 'manage' | 'orders' | 'extra' | null
  // Analytics state
  const [analyticsRange, setAnalyticsRange] = useState('day'); // 'day' | 'month' | 'year'

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditProduct({ ...product });
    setShowEditModal(true);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditProduct({});
    setShowEditModal(false);
  };
  const saveEdit = async () => {
    try {
      const updated = await apiFetch(`/products/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(editProduct),
      });
      setProducts(products.map(p => p._id === editingId ? updated : p));
      setEditingId(null);
      setEditProduct({});
      setShowEditModal(false);
    } catch {
      alert("Failed to update product.");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      setProducts(products.filter(p => p._id !== id));
    } catch {
      alert("Failed to delete product.");
    }
  };
  const toggleInStock = async (product) => {
    try {
      const updated = await apiFetch(`/products/${product._id}`, {
        method: "PUT",
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      setProducts(products.map(p => p._id === product._id ? updated : p));
    } catch {
      alert("Failed to update stock status.");
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.isAdmin) {
      navigate("/login", { replace: true });
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("admin_logged_in") === "true") setAdmin(true);
    if (admin) {
      apiFetch("/products").then(setProducts);
      apiFetch("/orders/all").then(setOrders);
    }
  }, [admin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      setAdmin(true);
      localStorage.setItem("admin_logged_in", "true");
      setLoginError("");
    } catch (err) {
      setLoginError("Invalid admin credentials.");
    }
  };

  const handleProductChange = e => {
    const { name, value, type, checked } = e.target;
    setNewProduct(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleProductUpload = async e => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image || !newProduct.category) {
      setUploadMsg("Please fill all required fields.");
      return;
    }
    try {
      const product = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
      });
      setProducts([product, ...products]);
      setNewProduct({ name: "", price: "", description: "", image: "", category: "", inStock: true });
      setUploadMsg("Product uploaded!");
    } catch {
      setUploadMsg("Failed to upload product.");
    }
  };

  const handleFulfill = async (orderId) => {
    try {
      await apiFetch(`/orders/${orderId}/fulfill`, { method: "PUT" });
      setOrders(orders.map(o => o._id === orderId ? { ...o, fulfilled: true } : o));
    } catch {}
  };

  // Filter and sort products for management section
  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  const productsToShow = search ? filteredProducts : filteredProducts.slice(0, 5);

  // Prepare analytics data for scatter/line chart (x: orderCount, y: orderValue)
  const getScatterData = () => {
    if (!orders.length) return [];
    const now = new Date();
    let units = [];
    if (analyticsRange === 'day') {
      // Last 24 hours, by hour
      units = Array.from({ length: 24 }, (_, i) => ({ orderCount: 0, orderValue: 0, label: `${i}:00` }));
      orders.forEach(order => {
        const d = new Date(order.date);
        if (d.toDateString() === now.toDateString()) {
          const hour = d.getHours();
          units[hour].orderCount++;
          units[hour].orderValue += order.total;
        }
      });
    } else if (analyticsRange === 'month') {
      // This month, by day
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      units = Array.from({ length: daysInMonth }, (_, i) => ({ orderCount: 0, orderValue: 0, label: `${i + 1}` }));
      orders.forEach(order => {
        const d = new Date(order.date);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const day = d.getDate() - 1;
          units[day].orderCount++;
          units[day].orderValue += order.total;
        }
      });
    } else {
      // Yearly, by month
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      units = monthLabels.map(label => ({ orderCount: 0, orderValue: 0, label }));
      orders.forEach(order => {
        const d = new Date(order.date);
        if (d.getFullYear() === now.getFullYear()) {
          const month = d.getMonth();
          units[month].orderCount++;
          units[month].orderValue += order.total;
        }
      });
    }
    // Only include points with at least one order
    return units.filter(u => u.orderCount > 0).map(u => ({ x: u.orderCount, y: u.orderValue, label: u.label }));
  };
  const scatterData = getScatterData();
  // Gradient fill for the chart (in chartData)
  const chartRef = React.useRef();
  const getGradient = (ctx, area) => {
    if (!area) return 'rgba(168,85,247,0.1)';
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.08)'); // purple-400, transparent
    gradient.addColorStop(0.7, 'rgba(168, 85, 247, 0.18)');
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.32)');
    return gradient;
  };
  const chartData = React.useMemo(() => ({
    datasets: [
      {
        label: 'Orders vs Value',
        data: scatterData,
        borderColor: 'rgba(168, 85, 247, 1)', // purple-500
        backgroundColor: ctx => ctx.chart ? getGradient(ctx.chart.ctx, ctx.chart.chartArea) : 'rgba(168,85,247,0.1)',
        pointBackgroundColor: 'rgba(139, 92, 246, 1)', // purple-400
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        showLine: true,
        tension: 0.45,
        fill: true,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowBlur: 8,
        shadowColor: 'rgba(168,85,247,0.15)',
        parsing: false,
      },
    ],
  }), [scatterData]);
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#7c3aed', // purple-600
          font: { size: 16, weight: 'bold' },
          boxWidth: 18,
          boxHeight: 18,
          borderRadius: 6,
          padding: 20,
        },
      },
      title: { display: true, text: 'Orders (X) vs Value (Y)', color: '#7c3aed', font: { size: 22, weight: 'bold' } },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#7c3aed',
        bodyColor: '#333',
        borderColor: '#a78bfa',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: ctx => {
            const d = ctx.raw;
            return ` Orders: ${d.x}\n Value: ₹${d.y.toLocaleString('en-IN')}${d.label ? ` (${d.label})` : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Number of Orders', color: '#7c3aed', font: { size: 16, weight: 'bold' } },
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#7c3aed', font: { size: 14 } },
        grid: { color: 'rgba(168,85,247,0.08)' },
      },
      y: {
        type: 'linear',
        title: { display: true, text: 'Order Value (₹)', color: '#7c3aed', font: { size: 16, weight: 'bold' } },
        beginAtZero: true,
        ticks: { color: '#7c3aed', font: { size: 14 } },
        grid: { color: 'rgba(168,85,247,0.08)' },
      },
    },
    elements: {
      line: {
        borderWidth: 4,
        borderJoinStyle: 'round',
      },
      point: {
        borderWidth: 3,
        radius: 8,
        hoverRadius: 12,
      },
    },
  };

  // Helper for section classes
  const sectionClass = (accent = 'teal') =>
    `bg-gradient-to-br from-white via-${accent}-50 to-gray-100 rounded-2xl shadow-lg p-6 flex flex-col min-h-[260px] relative transition-all duration-300 border-t-4 border-${accent}-400 hover:shadow-2xl hover:scale-[1.02]`;

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-600 to-blue-600">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Admin Login</h2>
          {loginError && <div className="mb-4 text-red-600">{loginError}</div>}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start py-8 px-2 md:px-0 overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 animate-mesh bg-mesh-gradient opacity-80" />
      <div className="max-w-7xl w-full mx-auto p-2 md:p-6 rounded-3xl shadow-2xl border border-gray-200">
        <h2 className="text-4xl font-extrabold mb-2 text-teal-700 text-center flex items-center justify-center gap-3">
          <FontAwesomeIcon icon={faBoxOpen} className="text-3xl text-teal-500" /> Admin Panel
        </h2>
        <p className="text-center text-gray-500 mb-8 text-lg">Manage products, orders, and view analytics at a glance.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4 md:gap-6">
          {/* Product Addition (Top Left) */}
          <div className={sectionClass('teal')}>
            <span className="absolute -top-6 left-6 bg-teal-500 text-white rounded-full p-2 shadow-lg"><FontAwesomeIcon icon={faPlus} /></span>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-teal-600 text-lg font-bold px-2 py-1 rounded transition"
              onClick={() => setExpanded('add')}
              title="Expand"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faBoxOpen} className="text-teal-400" /> Add New Product
            </h3>
            <form onSubmit={handleProductUpload} className="grid grid-cols-1 gap-3">
              <input name="name" value={newProduct.name} onChange={handleProductChange} placeholder="Name*" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
              <input name="price" value={newProduct.price} onChange={handleProductChange} placeholder="Price*" type="number" min="0" step="0.01" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
              <input name="image" value={newProduct.image} onChange={handleProductChange} placeholder="Image URL*" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
              <input name="category" value={newProduct.category} onChange={handleProductChange} placeholder="Category*" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
              <textarea name="description" value={newProduct.description} onChange={handleProductChange} placeholder="Description" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
              <label className="flex items-center gap-2"><input type="checkbox" name="inStock" checked={newProduct.inStock} onChange={handleProductChange} /> In Stock</label>
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition shadow-md">Upload Product</button>
              {uploadMsg && <div className="text-green-600">{uploadMsg}</div>}
            </form>
          </div>
          {/* Product Management (Top Right) */}
          <div className={sectionClass('blue')}>
            <span className="absolute -top-6 left-6 bg-blue-500 text-white rounded-full p-2 shadow-lg"><FontAwesomeIcon icon={faEdit} /></span>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-lg font-bold px-2 py-1 rounded transition"
              onClick={() => setExpanded('manage')}
              title="Expand"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faEdit} className="text-blue-400" /> Edit Products
            </h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
              <div className="relative w-full md:w-72">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border rounded px-8 py-2 w-full focus:ring-2 focus:ring-blue-200 bg-blue-50"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Image</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-center">In Stock</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsToShow.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-gray-500">No products found.</td></tr>
                  ) : productsToShow.map(product => (
                    <tr key={product._id} className="border-b hover:bg-blue-50 transition">
                      <td className="p-2"><img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded shadow" /></td>
                      <td className="p-2 font-semibold">{product.name}</td>
                      <td className="p-2">{product.category}</td>
                      <td className="p-2">{formatRupee(product.price)}</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        <input type="checkbox" checked={product.inStock} onChange={() => toggleInStock(product)} className="ml-2" />
                      </td>
                      <td className="p-2 text-center flex gap-2 justify-center">
                        <button title="Edit" onClick={() => startEdit(product)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded shadow"><FontAwesomeIcon icon={faEdit} /></button>
                        <button title="Delete" onClick={() => handleDelete(product._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow"><FontAwesomeIcon icon={faTrash} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Edit Product Modal (nested) */}
            {showEditModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                  <h3 className="text-xl font-bold mb-4">Edit Product</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <input name="name" value={editProduct.name} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))} className="border rounded px-2 py-1" />
                    <input name="price" value={editProduct.price} onChange={e => setEditProduct(p => ({ ...p, price: e.target.value }))} className="border rounded px-2 py-1" type="number" min="0" step="0.01" />
                    <input name="image" value={editProduct.image} onChange={e => setEditProduct(p => ({ ...p, image: e.target.value }))} className="border rounded px-2 py-1" />
                    <input name="category" value={editProduct.category} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))} className="border rounded px-2 py-1" />
                    <textarea name="description" value={editProduct.description} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))} className="border rounded px-2 py-1" />
                    <div className="flex items-center gap-2">
                      <label>In Stock</label>
                      <input type="checkbox" checked={editProduct.inStock} onChange={e => setEditProduct(p => ({ ...p, inStock: e.target.checked }))} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Save</button>
                      <button onClick={cancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Order Management (Bottom Left) */}
          <div className={sectionClass('yellow')}>
            <span className="absolute -top-6 left-6 bg-yellow-400 text-white rounded-full p-2 shadow-lg"><FontAwesomeIcon icon={faClipboardList} /></span>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-yellow-600 text-lg font-bold px-2 py-1 rounded transition"
              onClick={() => setExpanded('orders')}
              title="Expand"
            >
              <FontAwesomeIcon icon={faClipboardList} />
            </button>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faClipboardList} className="text-yellow-400" /> Order Management
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">User</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Items</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{order.user?.email || order.user}</td>
                      <td className="p-2">{new Date(order.date).toLocaleString()}</td>
                      <td className="p-2">{formatRupee(order.total)}</td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${order.fulfilled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.fulfilled ? 'Fulfilled' : 'Pending'}</span>
                      </td>
                      <td className="p-2">
                        <ul className="list-disc ml-4">
                          {order.items.map(item => (
                            <li key={item.product || item._id}>{item.name} x {item.quantity} ({formatRupee(item.price)} each)</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-2 text-center">
                        {!order.fulfilled && (
                          <button onClick={() => handleFulfill(order._id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" title="Mark as Fulfilled">✔️ Fulfill</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Analytics/Graph Section (Bottom Right) */}
          <div className={sectionClass('purple') + ' items-center justify-center'}>
            <span className="absolute -top-6 left-6 bg-purple-500 text-white rounded-full p-2 shadow-lg"><FontAwesomeIcon icon={faChartLine} /></span>
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-purple-600 text-lg font-bold px-2 py-1 rounded transition"
              onClick={() => setExpanded('extra')}
              title="Expand"
            >
              <FontAwesomeIcon icon={faChartLine} />
            </button>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-purple-400" /> Orders & Revenue Analytics
            </h3>
            <div className="flex gap-2 mb-4 justify-center">
              <button onClick={() => setAnalyticsRange('day')} className={`px-3 py-1 rounded ${analyticsRange === 'day' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>1 Day</button>
              <button onClick={() => setAnalyticsRange('month')} className={`px-3 py-1 rounded ${analyticsRange === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Monthly</button>
              <button onClick={() => setAnalyticsRange('year')} className={`px-3 py-1 rounded ${analyticsRange === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Yearly</button>
            </div>
            <div className="w-full h-72">
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
      {/* Modals for expanded sections */}
      <Modal open={expanded === 'add'} onClose={() => setExpanded(null)} title={<span className="flex items-center gap-2 text-teal-600"><FontAwesomeIcon icon={faBoxOpen} /> Add New Product</span>}>
        <form onSubmit={handleProductUpload} className="grid grid-cols-1 gap-3 bg-gradient-to-br from-white via-teal-50 to-gray-100 rounded-2xl shadow-lg p-6 border-t-4 border-teal-400">
          <input name="name" value={newProduct.name} onChange={handleProductChange} placeholder="Name*" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
          <input name="price" value={newProduct.price} onChange={handleProductChange} placeholder="Price*" type="number" min="0" step="0.01" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
          <input name="image" value={newProduct.image} onChange={handleProductChange} placeholder="Image URL*" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
          <input name="category" value={newProduct.category} onChange={handleProductChange} placeholder="Category*" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
          <textarea name="description" value={newProduct.description} onChange={handleProductChange} placeholder="Description" className="border rounded px-3 py-2 focus:ring-2 focus:ring-teal-200 bg-teal-50" />
          <label className="flex items-center gap-2"><input type="checkbox" name="inStock" checked={newProduct.inStock} onChange={handleProductChange} /> In Stock</label>
          <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition shadow-md">Upload Product</button>
          {uploadMsg && <div className="text-green-600">{uploadMsg}</div>}
        </form>
      </Modal>
      <Modal open={expanded === 'manage'} onClose={() => setExpanded(null)} title={<span className="flex items-center gap-2 text-blue-600"><FontAwesomeIcon icon={faEdit} /> Edit Products</span>}>
        <div className="bg-gradient-to-br from-white via-blue-50 to-gray-100 rounded-2xl shadow-lg p-6 border-t-4 border-blue-400">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
            <div className="relative w-full md:w-72">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border rounded px-8 py-2 w-full focus:ring-2 focus:ring-blue-200 bg-blue-50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Image</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-center">In Stock</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsToShow.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-gray-500">No products found.</td></tr>
                ) : productsToShow.map(product => (
                  <tr key={product._id} className="border-b hover:bg-blue-50 transition">
                    <td className="p-2"><img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded shadow" /></td>
                    <td className="p-2 font-semibold">{product.name}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2">{formatRupee(product.price)}</td>
                    <td className="p-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      <input type="checkbox" checked={product.inStock} onChange={() => toggleInStock(product)} className="ml-2" />
                    </td>
                    <td className="p-2 text-center flex gap-2 justify-center">
                      <button title="Edit" onClick={() => startEdit(product)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded shadow"><FontAwesomeIcon icon={faEdit} /></button>
                      <button title="Delete" onClick={() => handleDelete(product._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow"><FontAwesomeIcon icon={faTrash} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Edit Product Modal (nested) */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold mb-4">Edit Product</h3>
              <div className="grid grid-cols-1 gap-3">
                <input name="name" value={editProduct.name} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))} className="border rounded px-2 py-1" />
                <input name="price" value={editProduct.price} onChange={e => setEditProduct(p => ({ ...p, price: e.target.value }))} className="border rounded px-2 py-1" type="number" min="0" step="0.01" />
                <input name="image" value={editProduct.image} onChange={e => setEditProduct(p => ({ ...p, image: e.target.value }))} className="border rounded px-2 py-1" />
                <input name="category" value={editProduct.category} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))} className="border rounded px-2 py-1" />
                <textarea name="description" value={editProduct.description} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))} className="border rounded px-2 py-1" />
                <div className="flex items-center gap-2">
                  <label>In Stock</label>
                  <input type="checkbox" checked={editProduct.inStock} onChange={e => setEditProduct(p => ({ ...p, inStock: e.target.checked }))} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Save</button>
                  <button onClick={cancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal open={expanded === 'orders'} onClose={() => setExpanded(null)} title={<span className="flex items-center gap-2 text-yellow-600"><FontAwesomeIcon icon={faClipboardList} /> Order Management</span>}>
        <div className="bg-gradient-to-br from-white via-yellow-50 to-gray-100 rounded-2xl shadow-lg p-6 border-t-4 border-yellow-400">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Items</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b hover:bg-yellow-50 transition">
                    <td className="p-2">{order.user?.email || order.user}</td>
                    <td className="p-2">{new Date(order.date).toLocaleString()}</td>
                    <td className="p-2">{formatRupee(order.total)}</td>
                    <td className="p-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${order.fulfilled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.fulfilled ? 'Fulfilled' : 'Pending'}</span>
                    </td>
                    <td className="p-2">
                      <ul className="list-disc ml-4">
                        {order.items.map(item => (
                          <li key={item.product || item._id}>{item.name} x {item.quantity} ({formatRupee(item.price)} each)</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-2 text-center">
                      {!order.fulfilled && (
                        <button onClick={() => handleFulfill(order._id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow" title="Mark as Fulfilled"><FontAwesomeIcon icon={faCheck} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
      <Modal open={expanded === 'extra'} onClose={() => setExpanded(null)} title={<span className="flex items-center gap-2 text-purple-600"><FontAwesomeIcon icon={faChartLine} /> Orders & Revenue Analytics</span>}>
        <div className="bg-gradient-to-br from-white via-purple-50 to-gray-100 rounded-2xl shadow-lg p-6 border-t-4 border-purple-400">
          <div className="flex gap-2 mb-4 justify-center">
            <button onClick={() => setAnalyticsRange('day')} className={`px-3 py-1 rounded ${analyticsRange === 'day' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>1 Day</button>
            <button onClick={() => setAnalyticsRange('month')} className={`px-3 py-1 rounded ${analyticsRange === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Monthly</button>
            <button onClick={() => setAnalyticsRange('year')} className={`px-3 py-1 rounded ${analyticsRange === 'year' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Yearly</button>
          </div>
          <div className="w-full h-[400px] md:h-[500px]">
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPanel; 