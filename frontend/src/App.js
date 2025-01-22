import React, { useState, useEffect } from "react";
import TransactionsTable from "./components/TransactionsTable";
import StatisticsBox from "./components/StatisticsBox";
import BarChart from "./components/BarChart";
import axios from "axios";
import "./styles.css";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);


const BASE_URL = "http://localhost:5000/api";

const App = () => {
  const [month, setMonth] = useState("March");
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
  }, [month, page, search]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/transactions`, {
        params: { search, page, perPage: 10 },
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/statistics`, { params: { month } });
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error.response?.data || error.message);
    }
  };

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/bar-chart`, { params: { month } });
      setBarChartData(response.data);
    } catch (error) {
      console.error("Error fetching bar chart data:", error.response?.data || error.message);
    }
  };

  return (
    <div className="app-container">
      <h1>Transactions Dashboard</h1>
      <div className="controls">
        <select
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setPage(1);
          }}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <StatisticsBox statistics={statistics} />
      <TransactionsTable
        transactions={transactions}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
      />
      <BarChart data={barChartData} />
    </div>
  );
};

export default App;
