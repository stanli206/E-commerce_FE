import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Success = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Mark order as paid in backend
    axios
      .post(
        "https://fsd-backend-demo-b17.onrender.com/api/orders/success",
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then(() => {
        setTimeout(() => {
          navigate("/order"); // Redirect to orders page after 3 seconds
        }, 3000);
      })
      .catch((err) => console.log(err));
  }, [user, navigate]);

  return (
    <div className="p-5 text-center">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful! 🎉
      </h1>
      <p className="mt-2">Your order has been placed successfully.</p>
      <p className="mt-2">Redirecting to your orders...</p>
    </div>
  );
};

export default Success;
