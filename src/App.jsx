import { useContext, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Order from './pages/Order';
import { AuthContext } from './context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import Success from './pages/Success';

function App() {

  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("User data from AuthContext", user);
  },[user]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/order' element={<Order />} />
        <Route path='/admin' element={
          user && user.role?.toLowerCase() === "admin" ? (
          <AdminDashboard />
        ) : (
            <Navigate to="/" />
        )
        } />
        <Route path='/success' element={<Success/>}/>
      </Routes>
    </>
  );
}

export default App
