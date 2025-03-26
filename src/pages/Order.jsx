import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
      .catch((err) => {
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
      .catch(() => alert("Error processing payment!"));
  };

  return (
    <div className="p-5 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Your Orders
      </h1>

      {loading ? (
        <p className="text-center">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders placed yet.</p>
      ) : (
        <div className="max-w-4xl mx-auto">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-md rounded p-5 mb-6"
            >
              <h2 className="text-xl font-semibold mb-2">
                Order ID: <span className="text-blue-500">{order._id}</span>
              </h2>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-yellow-600">{order.status}</span>
              </p>
              <p>
                <strong>Total Price:</strong>{" "}
                <span className="text-green-600">${order.totalPrice}</span>
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">🛍️ Items:</h3>
              {order.products?.map((item, idx) => (
                <div
                  key={idx}
                  className="border rounded p-2 mb-2 flex justify-between items-center"
                >
                  <span>
                    {item?.product?.name || "Product Not Found"} - $
                    {item?.product?.price || 0} x {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {orders.some((order) => order.status === "Pending") && (
            <button
              onClick={proceedToPayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded shadow mt-4"
            >
              💳 Proceed to Payment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Order;
