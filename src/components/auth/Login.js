import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

const Login = ({ setIsAuthenticated }) => {
  const token = Cookies.get("adminToken");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const formData = {
        userName,
        password,
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_API}/admin/login`,
        formData
      );

      if (data.success && data.token) {
        // Save token in cookies
        Cookies.set("adminToken", data.token, { expires: 7, path: "/" });

        toast.success("Welcome to Admin Panel!");
        setIsAuthenticated(true);

        navigate("/dashboard");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <h2 className="text-center mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="mb-3">
            <label htmlFor="userName" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter admin username"
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
