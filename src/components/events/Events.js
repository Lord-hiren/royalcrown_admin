import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

const Events = () => {
  const token = Cookies.get("adminToken");
  const config = {
    headers: {
      "X-AUTH": token,
    },
  };
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    discount: "",
    image: null,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/admin/events`,
        "",
        config
      );
      if (response.data.success) {
        setEvents(response.data.events || []);
      } else {
        toast.error(response.data.message || "Failed to fetch events");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.length > 0) {
      setCurrentEvent((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setCurrentEvent((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(currentEvent).forEach((key) => {
        if (key === "image" && currentEvent[key]) {
          formData.append("images", currentEvent[key]); // Backend expects "images"
        } else {
          formData.append(key, currentEvent[key]);
        }
      });

      let response;
      if (isEditing) {
        response = await axios.put(
          `${process.env.REACT_APP_API}/admin/event/${currentEvent._id}`,
          formData
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API}/admin/event/new`,
          formData,
          config
        );
      }

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Event ${isEditing ? "updated" : "created"} successfully`
        );
        fetchEvents();
        resetForm();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = async (event) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/admin/event/${event._id}`
      );
      if (response.data.success) {
        setCurrentEvent({
          ...response.data.event,
          image: null, // Reset image since we don't want to show the old one in input
        });
        setIsEditing(true);
        setShowForm(true);
      } else {
        toast.error(response.data.message || "Failed to load event details");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load event details");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API}/admin/event/${id}`
        );
        if (response.data.success) {
          toast.success(response.data.message || "Event deleted successfully");
          fetchEvents();
        } else {
          toast.error(response.data.message || "Failed to delete event");
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete event");
      }
    }
  };

  const resetForm = () => {
    setCurrentEvent({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      discount: "",
      image: null,
    });
    setIsEditing(false);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Events Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus className="me-2" />
          Add New Event
        </button>
      </div>

      {/* Event Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={currentEvent.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    className="form-control"
                    value={currentEvent.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    className="form-control"
                    value={currentEvent.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    className="form-control"
                    value={currentEvent.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={currentEvent.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Event Image</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleInputChange}
                    accept="image/*"
                    required={!isEditing}
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {isEditing ? "Update Event" : "Create Event"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="row g-4">
        {events.map((event) => (
          <div key={event._id} className="col-md-6 col-lg-4">
            <div className="event-card hover-effect">
              <img
                src={event.images[0]?.url || "/placeholder.png"}
                alt={event.title}
                className="event-image w-100"
              />
              <div className="event-details">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-2">{event.title}</h5>
                    <p className="event-date mb-2">
                      {new Date(event.startDate).toLocaleDateString()} -{" "}
                      {new Date(event.endDate).toLocaleDateString()}
                    </p>
                    <p className="mb-0">
                      <span className="badge bg-primary">
                        {event.discount}% OFF
                      </span>
                    </p>
                  </div>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(event)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(event._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <span
                    className={`badge ${
                      event.active ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {event.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
