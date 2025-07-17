import React, { useState } from "react";

const Cart = ({ cart, setCart, setShowCart, showNotification, onCheckout, checkoutLoading }) => {
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: address, 2: payment, 3: processing
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upi, setUpi] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [orderStatus, setOrderStatus] = useState("idle"); // idle | loading | success | error

  const handleRemove = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showNotification && showNotification('Item removed from cart', 'info');
  };
  const handleQty = (id, delta) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };
  const formatRupee = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutClick = () => {
    setShowCheckout(true);
    setStep(1);
    setError("");
    setPaymentError("");
    setOrderStatus("idle");
  };

  const handleAddressNext = () => {
    setError("");
    if (!address.trim() || !phone.trim()) {
      setError("Please enter your shipping address and phone number.");
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setPaymentError("");
    if (paymentMethod === "card") {
      if (!card.number || !card.expiry || !card.cvv || !card.name) {
        setPaymentError("Please fill in all card details.");
        return;
      }
      // Fake card validation
      if (card.number.length < 12 || card.cvv.length < 3) {
        setPaymentError("Invalid card details.");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!upi.includes("@")) {
        setPaymentError("Enter a valid UPI ID.");
        return;
      }
    }
    setStep(3);
    setOrderStatus("loading");
    // Place order in step 3
    if (!checkoutLoading) {
      const result = await onCheckout && onCheckout({ address, phone, paymentMethod });
      setTimeout(() => {
        if (result === false) {
          setOrderStatus("error");
        } else {
          setOrderStatus("success");
          setAddress("");
          setPhone("");
          setCard({ number: "", expiry: "", cvv: "", name: "" });
          setUpi("");
          setStep(1);
          setTimeout(() => {
            setShowCheckout(false);
            setOrderStatus("idle");
          }, 1500);
        }
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Your Cart</h3>
            <button 
              onClick={() => setShowCart(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          {cart.length === 0 ? (
            <div className="text-center text-gray-500">Your cart is empty.</div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200 mb-4">
                {cart.map(item => (
                  <li key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-500">{formatRupee(item.price)}</div>
                        <div className="flex items-center mt-1">
                          <button onClick={() => handleQty(item.id, -1)} className="px-2">-</button>
                          <span className="px-2">{item.quantity}</span>
                          <button onClick={() => handleQty(item.id, 1)} className="px-2">+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center font-bold text-lg mb-4">
                <span>Total:</span>
                <span>{formatRupee(total)}</span>
              </div>
              <button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
                onClick={handleCheckoutClick}
                disabled={cart.length === 0 || loading}
              >
                Checkout
              </button>
            </>
          )}
        </div>
      </div>
      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {step === 1 && (
              <>
                <h3 className="text-xl font-bold mb-4">Shipping Details</h3>
                {error && <div className="mb-2 text-red-600">{error}</div>}
                <div className="mb-3">
                  <label className="block mb-1 font-semibold">Address</label>
                  <textarea className="w-full border rounded px-3 py-2" value={address} onChange={e => setAddress(e.target.value)} rows={3} />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-semibold">Phone</label>
                  <input className="w-full border rounded px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="mb-4">
                  <div className="font-bold mb-1">Order Summary</div>
                  <ul className="text-sm mb-2">
                    {cart.map(item => (
                      <li key={item.id}>{item.name} x {item.quantity} ({formatRupee(item.price)} each)</li>
                    ))}
                  </ul>
                  <div className="font-bold">Total: {formatRupee(total)}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition disabled:opacity-60"
                    onClick={handleAddressNext}
                    disabled={loading}
                  >
                    Next: Payment
                  </button>
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-semibold transition"
                    onClick={() => setShowCheckout(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h3 className="text-xl font-bold mb-4">Payment</h3>
                {paymentError && <div className="mb-2 text-red-600">{paymentError}</div>}
                <div className="mb-3">
                  <label className="block mb-1 font-semibold">Payment Method</label>
                  <select className="w-full border rounded px-3 py-2" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
                {paymentMethod === "card" && (
                  <>
                    <div className="mb-2">
                      <label className="block mb-1 font-semibold">Card Number</label>
                      <input className="w-full border rounded px-3 py-2" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} maxLength={19} placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="mb-2 flex gap-2">
                      <div className="flex-1">
                        <label className="block mb-1 font-semibold">Expiry</label>
                        <input className="w-full border rounded px-3 py-2" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="flex-1">
                        <label className="block mb-1 font-semibold">CVV</label>
                        <input className="w-full border rounded px-3 py-2" value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} maxLength={4} />
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="block mb-1 font-semibold">Name on Card</label>
                      <input className="w-full border rounded px-3 py-2" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
                    </div>
                  </>
                )}
                {paymentMethod === "upi" && (
                  <div className="mb-2">
                    <label className="block mb-1 font-semibold">UPI ID</label>
                    <input className="w-full border rounded px-3 py-2" value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi" />
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded font-semibold transition disabled:opacity-60"
                    onClick={handlePayment}
                    disabled={checkoutLoading}
                  >
                    {'Pay & Place Order'}
                  </button>
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-semibold transition"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    Back
                  </button>
                </div>
              </>
            )}
            {step === 3 && (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                {orderStatus === "loading" && <>
                  <div className="text-lg font-bold mb-2">Placing your order...</div>
                  <div className="loader border-4 border-teal-500 border-t-transparent rounded-full w-10 h-10 animate-spin"></div>
                </>}
                {orderStatus === "success" && <>
                  <div className="text-lg font-bold mb-2 text-green-600">Order placed successfully!</div>
                </>}
                {orderStatus === "error" && <>
                  <div className="text-lg font-bold mb-2 text-red-600">Failed to place order. Please try again.</div>
                </>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 