import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, Badge } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

const Orders = () => {
  const token = Cookies.get("adminToken");
  const config = {
    headers: {
      "X-AUTH": token,
    },
  };
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/admin/orders`,
        "",
        config
      );
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (order) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/admin/get/order/${order._id}`,
        "",
        config
      );
      if (response.data.success) {
        setCurrentOrder(response.data.order);
        setShowDetailsModal(true);
      } else {
        toast.error(response.data.message || "Failed to load order details");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load order details");
    }
  };

  const handleEdit = async (order) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/admin/get/order/${order._id}`,
        "",
        config
      );
      if (response.data.success) {
        setCurrentOrder(response.data.order);
        setShowModal(true);
      } else {
        toast.error(response.data.message || "Failed to load order details");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load order details");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/admin/update/order/${currentOrder._id}`,
        currentOrder,
        config
      );
      if (response.data.success) {
        toast.success(response.data.message || "Order updated successfully");
        setShowModal(false);
        fetchOrders();
      } else {
        toast.error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API}/admin/order/${id}`
        );
        if (response.data.success) {
          toast.success(response.data.message || "Order deleted successfully");
          fetchOrders();
        } else {
          toast.error(response.data.message || "Failed to delete order");
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete order");
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Processing: "warning",
      Shipped: "info",
      Delivered: "success",
      Cancelled: "danger",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
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
      <h2 className="mb-4">Order Management</h2>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user?.name || "Guest"}</td>
              <td>{order.orderItems?.length || 0} items</td>
              <td>${order.totalPrice?.toFixed(2)}</td>
              <td>{getStatusBadge(order.orderStatus)}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <Button
                  variant="outline-info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleView(order)}
                >
                  <FaEye />
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(order)}
                >
                  <FaEdit />
                </Button>
                {/* <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(order._id)}
                >
                  <FaTrash />
                </Button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Order Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <div>
              <div className="mb-4">
                <h5>Customer Information</h5>
                {/* <p className="mb-1">
                  <strong>Name:</strong> {currentOrder.user?.name}
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> {currentOrder.user?.email}
                </p> */}
                <p className="mb-1">
                  <strong>Phone:</strong> {currentOrder.shippingInfo?.phoneNo}
                </p>
              </div>

              <div className="mb-4">
                <h5>Shipping Address</h5>
                <p className="mb-1">
                  {currentOrder.shippingInfo?.address}
                  <br />
                  {currentOrder.shippingInfo?.city},{" "}
                  {currentOrder.shippingInfo?.state}{" "}
                  {currentOrder.shippingInfo?.pinCode}
                  <br />
                  {currentOrder.shippingInfo?.country}
                </p>
              </div>

              <div className="mb-4">
                <h5>Order Items</h5>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrder.orderItems?.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  marginRight: "10px",
                                }}
                              />
                            )}
                            {item.name}
                          </div>
                        </td>
                        <td>${item.price?.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Subtotal:</strong>
                      </td>
                      <td>${currentOrder.itemsPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Tax:</strong>
                      </td>
                      <td>+ ${currentOrder.taxPrice?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Discount:</strong>
                      </td>
                      <td>- ${currentOrder.discount?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Shipping:</strong>
                      </td>
                      <td>${currentOrder.shippingPrice?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>Total:</strong>
                      </td>
                      <td>
                        <strong>
                          ${currentOrder.totalPrice?.toFixed(2)}/-
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Order Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <Form onSubmit={handleUpdate}>
              <Form.Group className="mb-3">
                <Form.Label>Order Status</Form.Label>
                <Form.Select
                  value={currentOrder.orderStatus}
                  onChange={(e) =>
                    setCurrentOrder({
                      ...currentOrder,
                      orderStatus: e.target.value,
                    })
                  }
                >
                  <option value="Processing">Processing</option>
                  <option value="Packed">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Status
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Orders;
