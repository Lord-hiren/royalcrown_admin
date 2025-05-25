import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

const Users = () => {
  const token = Cookies.get("adminToken");
  const config = {
    headers: {
      "X-AUTH": token,
    },
  };
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/admin/users`,
        "",
        config
      );
      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        toast.error(response.data.message || "Failed to fetch users");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API}/admin/user/${id}`,
          "",
          config
        );
        if (response.data.success) {
          toast.success(response.data.message || "User deleted successfully");
          fetchUsers();
        } else {
          toast.error(response.data.message || "Failed to delete user");
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete user");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="py-4 fade-in">
      <h2 className="mb-4">User Management</h2>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <div className="d-flex align-items-center">
                  {user.avatar && (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="rounded-circle me-2"
                      style={{ width: "30px", height: "30px" }}
                    />
                  )}
                  {user.name}
                </div>
              </td>
              <td>{user.email}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(user._id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Users;
