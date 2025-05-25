import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import "./App.scss";
import reportWebVitals from "./reportWebVitals";

// Clear the existing HTML content
document.getElementById("root").innerHTML = "";

// Create root
const root = createRoot(document.getElementById("root"));

// Initial render
root.render(<App />);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
