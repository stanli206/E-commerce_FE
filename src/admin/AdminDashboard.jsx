import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      alert("Access denied! Redirecting...");
      navigate("/");
      return;
    }

    Promise.all([
      axios.get("https://ecommerce-698h.onrender.com/api/products", {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
      axios.get("https://ecommerce-698h.onrender.com/api/orders", {
        headers: { Authorization: `Bearer ${user.token}` },
      }),
    ])
      .then(([productsRes, ordersRes]) => {
        setProducts(productsRes.data.data || []);
        setOrders(ordersRes.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleAddProduct = () => {
    axios
      .post(
        "https://ecommerce-698h.onrender.com/api/products/create",
        newProduct,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        setProducts([...products, res.data]);
        setNewProduct({ name: "", price: "", description: "", stock: "" });
        alert("Product Added Successfully!");
      })
      .catch(() => alert("Error adding product!"));
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
    });
  };

  const handleUpdateProduct = () => {
    axios
      .put(
        `https://ecommerce-698h.onrender.com/api/products/update/${editId}`,
        newProduct,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        const updated = products.map((p) =>
          p._id === editId ? res.data.data : p
        );
        setProducts(updated);
        setEditId(null);
        setNewProduct({ name: "", price: "", description: "", stock: "" });
        alert("Product Updated!");
      })
      .catch(() => alert("Failed to update product"));
  };

  const handleDeleteProduct = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(
          `https://ecommerce-698h.onrender.com/api/products/delete/${id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        )
        .then(() => {
          const filtered = products.filter((p) => p._id !== id);
          setProducts(filtered);
          alert("Product Deleted!");
        })
        .catch(() => alert("Failed to delete product"));
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    axios
      .put(
        `https://ecommerce-698h.onrender.com/api/orders/update/${orderId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        const updatedOrders = orders.map((o) =>
          o._id === orderId ? res.data.data : o
        );
        setOrders(updatedOrders);
        alert("Order status updated!");
      })
      .catch(() => alert("Failed to update order status"));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🔧 Admin Dashboard
      </h1>

      {loading ? (
        <p className="text-center">Loading data...</p>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Add Product Form */}
          <div className="bg-white shadow-md rounded p-5 mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {editId ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="border p-2 rounded col-span-2"
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
                className="border p-2 rounded"
              />
            </div>

            {editId ? (
              <div className="mt-4">
                <button
                  onClick={handleUpdateProduct}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditId(null);
                    setNewProduct({
                      name: "",
                      price: "",
                      description: "",
                      stock: "",
                    });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddProduct}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Add Product
              </button>
            )}
          </div>

          {/* Product List */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Products
          </h2>
          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white p-4 shadow rounded border"
              >
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-blue-600 font-bold">${product.price}</p>
                <p className="text-gray-700">{product.description}</p>
                <p className="text-gray-700">Stock: {product.stock}</p>
                <div className="mt-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Orders */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Orders
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-4 shadow rounded border"
              >
                <h3 className="text-lg font-bold text-gray-800">
                  Order ID: <span className="text-sm">{order._id}</span>
                </h3>
                <p className="text-gray-700">Status: {order.status}</p>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                  className="border p-2 mt-2 rounded w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
