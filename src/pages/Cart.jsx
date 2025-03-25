import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      .get("https://fsd-backend-demo-b17.onrender.com/api/cart/view", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setCart(res.data.data.items || []);
        calculateTotal(res.data.data.items || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user, navigate]);
  
  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    setTotalPrice(total);
  }

  const updateQuantity = (productId, change) => {
    if (
      cart.find((item) => item.product._id === productId)?.quantity + change < 1
    )
      return;
    
    axios
      .put(
        `https://fsd-backend-demo-b17.onrender.com/api/cart/update/${productId}`,
        { change },
        { headers: { Authorization: `Bearer ${user.token}` } }
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
      .catch(() => alert("Failed to update quantity"));
    
  } 

  const removeFromCart = (productId) => {
    axios
      .delete(
        `https://fsd-backend-demo-b17.onrender.com/api/cart/remove/${productId}`,
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
      .catch((err) => {
        alert("Failed to remove item from cart");
      });
  }
  
  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    axios
      .post(
        "https://fsd-backend-demo-b17.onrender.com/api/orders/create",
        { cartItems: cart },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      .then(() => {
        alert("Order placed successfully");
        setCart([]);
        navigate("/order");
      })
      .catch(() => alert("Failed to place order"));
  }


  return (
    <div>
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
          <div>
            <div>
              {cart.map((item) => (
                <div key={item.product._id}>
                  <h2>{item.product.name}</h2>
                  <p>Price: ${item.product.price}</p>
                  <div>
                    <button onClick={() => updateQuantity(item.product._id, -1)}>-</button>
                    <span>{ item.quantity}</span>
                    <button onClick={()=> updateQuantity(item.product._id, 1)}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product._id)}>Remove</button>
                </div>
              ))}
            </div>

            <div>
              <h2>Total: ${totalPrice}</h2>
              <button onClick={placeOrder}>Place Order</button>
            </div>
          </div>
      )}
    </div>
  )
}

export default Cart