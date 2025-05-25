import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./components/auth/Login";
import AdminLayout from "./components/layout/AdminLayout";
import "./App.scss";
import Dashboard from "./components/dashboard/Dashboard";
import Products from "./components/products/Products";
import Users from "./components/users/Users";
import Orders from "./components/orders/Orders";
import Events from "./components/events/Events";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <Router>
      <React.Suspense
        fallback={
          <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
      >
        <Routes>
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* Protected Routes */}
          <Route
            element={<AdminLayout setIsAuthenticated={setIsAuthenticated} />}
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/users" element={<Users />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/events" element={<Events />} />

            {/* Redirect root to dashboard if authenticated */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </React.Suspense>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
};

export default App;
