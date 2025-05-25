import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { Modal, Button, Form, Table, Spinner, Badge } from "react-bootstrap";
import Cookies from "js-cookie";

const Products = () => {
  const token = Cookies.get("adminToken");
  const config = {
    headers: {
      "X-AUTH": token,
    },
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState();

  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/admin/products`,
        "",
        config
      );
      if (response.data.success) {
        setProducts(response.data.products || []);
      } else {
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      // Convert FileList to an array and store it
      setCurrentProduct((prev) => ({
        ...prev,
        image: files ? Array.from(files) : [], // Store multiple files as an array
      }));
    } else {
      setCurrentProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Append all product fields except images
      Object.keys(currentProduct).forEach((key) => {
        if (key !== "image") {
          formData.append(key, currentProduct[key]);
        }
      });

      // Append multiple images
      if (currentProduct.image && Array.isArray(currentProduct.image)) {
        currentProduct.image.forEach((img) => {
          formData.append("images", img);
        });
      }

      let response;
      if (isEditing) {
        response = await axios.post(
          `${process.env.REACT_APP_API}/admin/product/${currentProduct._id}`,
          formData,
          config
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API}/admin/product/new`,
          formData,
          config
        );
      }

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Product ${isEditing ? "updated" : "created"} successfully`
        );
        fetchProducts();
        handleCloseModal();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  // Handle Delete Product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API}/admin/product/delete/${id}`,
          "",
          config
        );
        if (response.data.success) {
          toast.success(
            response.data.message || "Product deleted successfully"
          );
          fetchProducts();
        } else {
          toast.error(response.data.message || "Failed to delete product");
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete product");
      }
    }
  };

  // Reset and Close Modal
  const handleCloseModal = () => {
    setCurrentProduct({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      image: null,
    });
    setIsEditing(false);
    setShowModal(false);
  };

  // Filtered Products List
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function MyVerticallyCenteredModal2(props) {
    const [currentProduct, setCurrentProduct] = useState({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      image: null,
      newImage: null,
    });

    useEffect(() => {
      if (id) {
        const filteredProducts = products.filter((val) => val._id === id);
        setCurrentProduct({
          name: filteredProducts[0].name,
          price: filteredProducts[0].price,
          stock: filteredProducts[0].stock,
          category: filteredProducts[0].category,
          description: filteredProducts[0].description,
          image: filteredProducts[0].image,
          newImage: null,
          trending: filteredProducts[0].trending === "Y" ? "Y" : "N",
        });
      }
    }, [id, products]);

    const handleInputChange = (e) => {
      const { name, value, files } = e.target;
      if (name === "newImage") {
        setCurrentProduct((prev) => ({
          ...prev,
          newImage: files ? Array.from(files) : [],
        }));
      } else if (name === "trending") {
        setCurrentProduct((prev) => ({ ...prev, trending: value }));
      } else {
        setCurrentProduct((prev) => ({ ...prev, [name]: value }));
      }
    };

    const handleEdit = async (e) => {
      e.preventDefault();
      try {
        const formData = new FormData();
        formData.append("trending", currentProduct.trending);

        // Append product details
        formData.append("name", currentProduct.name);
        formData.append("category", currentProduct.category);
        formData.append("price", currentProduct.price);
        formData.append("stock", currentProduct.stock);
        formData.append("description", currentProduct.description);

        if (currentProduct.newImage) {
          currentProduct.newImage.forEach((img) => {
            formData.append("images", img);
          });
        }

        // Make the API request to update the product
        const response = await axios.post(
          `${process.env.REACT_APP_API}/admin/product/${id}`,
          formData,
          config
        );

        if (response.data.success) {
          toast.success("Product updated successfully");
          setShowModal2(false);
          fetchProducts();
        } else {
          toast.error(response.data.message || "Failed to update product");
        }
      } catch (error) {
        toast.error(error.message || "Error updating product");
      }
    };

    return (
      <Modal {...props} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentProduct.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={currentProduct.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={currentProduct.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={currentProduct.stock}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentProduct.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <Form.Control
                type="file"
                name="newImage"
                onChange={handleInputChange}
                multiple
                accept="image/*"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Trending"
                name="trending"
                checked={currentProduct.trending === "Y"}
                onChange={(e) =>
                  handleInputChange({
                    target: {
                      name: "trending",
                      value: e.target.checked ? "Y" : "N",
                    },
                  })
                }
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Update Product
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <div className="py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Add New Product
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "60vh" }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover bordered>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.images[0]?.url || "/placeholder.png"}
                      alt={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                      className="rounded"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <Badge
                      bg={
                        product.stock > 10
                          ? "success"
                          : product.stock > 0
                          ? "warning"
                          : "danger"
                      }
                    >
                      {product.stock}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setShowModal2(true);
                        setId(product._id);
                      }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentProduct.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={currentProduct.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={currentProduct.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={currentProduct.stock}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={currentProduct.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleInputChange}
                multiple
                accept="image/*"
                required={!isEditing}
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              {isEditing ? "Update Product" : "Add Product"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <MyVerticallyCenteredModal2
        show={showModal2}
        onHide={() => setShowModal2(false)}
      />
    </div>
  );
};

export default Products;
