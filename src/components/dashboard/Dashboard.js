import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

const Dashboard = () => {
  const token = Cookies.get("adminToken");
  const config = {
    headers: {
      "X-AUTH": token,
    },
  };
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    salesGrowth: 0,
    orderGrowth: 0,
  });
  const [salesData, setSalesData] = useState({ months: [], values: [] });
  const [ordersData, setOrdersData] = useState({ months: [], values: [] });
  const [stockStatus, setStockStatus] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, salesRes, ordersRes, stockRes] = await Promise.all([
        axios.post(
          `${process.env.REACT_APP_API}/admin/dashboard/stats`,
          "",
          config
        ),
        axios.post(
          `${process.env.REACT_APP_API}/admin/dashboard/sales-chart`,
          "",
          config
        ),
        axios.post(
          `${process.env.REACT_APP_API}/admin/dashboard/orders-chart`,
          "",
          config
        ),
        axios.post(
          `${process.env.REACT_APP_API}/admin/dashboard/stock-status`,
          "",
          config
        ),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      } else {
        toast.error(statsRes.data.message || "Failed to fetch stats");
      }

      if (salesRes.data.success) {
        setSalesData(salesRes.data.data);
      } else {
        toast.error(salesRes.data.message || "Failed to fetch sales data");
      }

      if (ordersRes.data.success) {
        setOrdersData(ordersRes.data.data);
      } else {
        toast.error(ordersRes.data.message || "Failed to fetch orders data");
      }

      if (stockRes.data.success) {
        setStockStatus(stockRes.data.data);
      } else {
        toast.error(stockRes.data.message || "Failed to fetch stock data");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const salesChartOptions = {
    title: {
      text: "Monthly Sales",
    },
    xAxis: {
      categories: salesData.months,
    },
    yAxis: {
      title: {
        text: "Amount ($)",
      },
    },
    series: [
      {
        name: "Sales",
        data: salesData.values,
        color: "#bb5d3c",
      },
    ],
    chart: {
      type: "area",
      style: {
        fontFamily: "Poppins, sans-serif",
      },
    },
    credits: {
      enabled: false,
    },
  };

  const ordersChartOptions = {
    title: {
      text: "Monthly Orders",
    },
    xAxis: {
      categories: ordersData.months,
    },
    yAxis: {
      title: {
        text: "Number of Orders",
      },
    },
    series: [
      {
        name: "Orders",
        data: ordersData.values,
        color: "#222",
      },
    ],
    chart: {
      type: "column",
      style: {
        fontFamily: "Poppins, sans-serif",
      },
    },
    credits: {
      enabled: false,
    },
  };

  const stockChartOptions = {
    chart: {
      type: "pie",
      style: {
        fontFamily: "Poppins, sans-serif",
      },
    },
    title: {
      text: "Product Stock Status",
    },
    series: [
      {
        name: "Products",
        data: stockStatus,
        colors: ["#28a745", "#ffc107", "#dc3545"],
      },
    ],
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.percentage:.1f}%",
        },
      },
    },
    credits: {
      enabled: false,
    },
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
    <div className="row g-4 py-4 fade-in">
      {/* Stats Cards */}
      <div className="col-md-3">
        <div className="dashboard-card">
          <h6 className="card-label">Total Sales</h6>
          <div className="card-value">₹{stats.totalSales.toLocaleString()}</div>
          <div
            className={`text-${
              stats.salesGrowth >= 0 ? "success" : "danger"
            } mt-2`}
          >
            <small>
              {stats.salesGrowth >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(stats.salesGrowth).toFixed(1)}% from last month
            </small>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="dashboard-card">
          <h6 className="card-label">Total Orders</h6>
          <div className="card-value">{stats.totalOrders.toLocaleString()}</div>
          <div
            className={`text-${
              stats.orderGrowth >= 0 ? "success" : "danger"
            } mt-2`}
          >
            <small>
              {stats.orderGrowth >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(stats.orderGrowth).toFixed(1)}% from last month
            </small>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="dashboard-card">
          <h6 className="card-label">Total Products</h6>
          <div className="card-value">
            {stats.totalProducts.toLocaleString()}
          </div>
          <div className="text-danger mt-2">
            <small>{stats.outOfStock} out of stock</small>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="dashboard-card">
          <h6 className="card-label">Total Users</h6>
          <div className="card-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-info mt-2">
            <small>Active users</small>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="col-md-8">
        <div className="chart-container">
          <HighchartsReact
            highcharts={Highcharts}
            options={salesChartOptions}
          />
        </div>
      </div>
      <div className="col-md-4">
        <div className="chart-container">
          <HighchartsReact
            highcharts={Highcharts}
            options={stockChartOptions}
          />
        </div>
      </div>
      <div className="col-12">
        <div className="chart-container">
          <HighchartsReact
            highcharts={Highcharts}
            options={ordersChartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
