import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    axios
      .get("https://ecommerce-698h.onrender.com/api/cart/view", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setCart(res.data.data.items || []);
        calculateTotal(res.data.data.items || []);
      })
      .catch((err) => console.log(err));
  }, [user, navigate]);

  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  const updateQuantity = (productId, change) => {
    if (
      cart.find((item) => item.product._id === productId)?.quantity + change <
      1
    )
      return;

    axios
      .put(
        `https://ecommerce-698h.onrender.com/api/cart/update/${productId}`,
        { change },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then(() => {
        const updatedCart = cart.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity + change }
            : item
        );
        setCart(updatedCart);
        calculateTotal(updatedCart);
      })
      .catch(() => alert("Error updating quantity!"));
  };

  const removeFromCart = (productId) => {
    axios
      .delete(
        `https://ecommerce-698h.onrender.com/api/cart/remove/${productId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then(() => {
        const updatedCart = cart.filter(
          (item) => item.product._id !== productId
        );
        setCart(updatedCart);
        calculateTotal(updatedCart);
      })
      .catch(() => alert("Error removing from cart!"));
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    axios
      .post(
        "https://ecommerce-698h.onrender.com/api/orders/create",
        { cartItems: cart },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then(() => {
        alert("Order placed successfully!");
        setCart([]);
        navigate("/order");
      })
      .catch(() => alert("Error placing order!"));
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🛒 Your Cart
      </h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600">Cart is empty</p>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cart.map((item) => (
              <div
                key={item.product._id}
                className="bg-white shadow-md rounded-lg p-4"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  {item.product.name}
                </h2>
                <p className="text-blue-600 font-bold">${item.product.price}</p>
                <div className="flex items-center mt-3">
                  <button
                    onClick={() => updateQuantity(item.product._id, -1)}
                    className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded-l"
                  >
                    -
                  </button>
                  <span className="px-4">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, 1)}
                    className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded-r"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Total: ${totalPrice}
            </h2>
            <button
              onClick={placeOrder}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded text-lg shadow"
            >
               Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
