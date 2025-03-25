import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Order = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    if (!user || !user.token) {
      navigate("/login");
      return;
    }

    axios
      .get("https://fsd-backend-demo-b17.onrender.com/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        const fetchedOrders = res.data.data || [];
        setOrders(fetchedOrders);
        setLoading(false);

        let combinedItems = [];
        let total = 0;
        fetchedOrders.forEach((order) => {
          combinedItems = [...combinedItems, ...order.products];
          total += order.totalPrice;
        });

        setAllItems(combinedItems);
        setTotalAmount(total);
      })
      .catch(() => {
        console.log(err);
        setLoading(false);
      });

  }, [user, navigate]);
  
  const proceedToPayment = () => {
    if (!user || !user.token) {
      navigate("/login");
      return;
    }

    axios
      .post(
        "https://fsd-backend-demo-b17.onrender.com/api/payments/checkout",
        { items: allItems, amount: totalAmount },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        window.location.href = res.data.url;
      })
      .catch(() => alert("Failed to proceed to payment"));
  };

  return (
    <div>
      <h1>My Orders</h1>

      {loading ? (
        <p>Loading Orders.....</p>
      ) : orders.length === 0 ? (
        <p>No Orders placed yet.</p>
      ) : (
        <div>
          {orders.map((order) => (
              <div key={order._id}>
                <h2>Order ID: {order._id}</h2>
                <p><strong>Status:</strong>{order.status}</p>
                <p><strong>Total Price:</strong>{order.totalPrice}</p>

                <h3>Items</h3>
                {order.products ?.map((item, idx) => (
                  <div key={idx}>
                    <p><strong>Product Name:</strong>{item?.product?.name || "Product Not Found"}</p>
                    <p><strong>Quantity:</strong>{item.quantity}</p>
                    <p><strong>Price:</strong>{item?.product?.price || 0} x {item.quantity}</p>
                  </div>
                ))}
              </div>
            ))}
          {orders.some((order) => order.status === "Pending") && (
            <button onClick={proceedToPayment}>Proceed Payment</button>
          )}
              
        </div>
      )}
    </div>
  );
};

export default Order;