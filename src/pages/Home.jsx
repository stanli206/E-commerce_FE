import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    axios
      .get("https://ecommerce-698h.onrender.com/api/products")
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => console.log("Product Error:", err));

    if (user) {
      if (user.role === "Admin") {
        navigate("/admin");
        return;
      }

      axios
        .get("https://ecommerce-698h.onrender.com/api/cart/view", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => setCartItems(res.data.data.items || []))
        .catch((err) => console.log("Cart Fetch Error:", err));
    }
  }, [user, navigate]);

  const addToCart = (productId) => {
    if (!user) {
      alert("Please login to add items to cart!");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    axios
      .post(
        "https://ecommerce-698h.onrender.com/api/cart/add",
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then(() => {
        setCartItems([...cartItems, { product: { _id: productId } }]);
      })
      .catch(() => alert("Error adding to cart!"));
  };

  const removeFromCart = (productId) => {
    axios
      .delete(`https://ecommerce-698h.onrender.com/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then(() => {
        setCartItems(
          cartItems.filter((item) => item.product._id !== productId)
        );
      })
      .catch(() => alert("Error removing from cart!"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-10">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Explore Our <span className="text-blue-600">Products</span>
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-600">No products available.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const inCart = cartItems.some(
              (item) => item.product._id === product._id
            );
            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col justify-between hover:shadow-xl transition duration-300"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-contain bg-white p-2"
                />

                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {product.name}
                  </h2>
                  <p className="text-blue-600 font-bold text-md">
                    ${product.price}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 flex-1">
                    {product.description?.slice(0, 80)}...
                  </p>

                  {inCart ? (
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition duration-200"
                    >
                      Remove from Cart
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(product._id)}
                      className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition duration-200"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
