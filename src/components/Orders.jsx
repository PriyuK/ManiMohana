import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    apiFetch("/orders/my")
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);
  if (!user) return null;
  return (
    <div className="max-w-2xl mx-auto mt-16 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map(order => (
            <li key={order.id} className="border rounded p-4">
              <div className="mb-2 text-sm text-gray-500">{new Date(order.date).toLocaleString()}</div>
              <div className="font-bold mb-2">Total: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.total)}</div>
              {order.address && (
                <div className="mb-1 text-sm"><strong>Address:</strong> {order.address}</div>
              )}
              {order.phone && (
                <div className="mb-2 text-sm"><strong>Phone:</strong> {order.phone}</div>
              )}
              <ul className="ml-4 list-disc">
                {order.items.map(item => (
                  <li key={item.id}>
                    {item.name} x {item.quantity} ({new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)} each)
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders; 