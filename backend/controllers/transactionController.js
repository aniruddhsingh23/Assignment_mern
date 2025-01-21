const axios = require('axios');
const Transaction = require('../models/Transaction');

// Fetch and seed database
const initializeDatabase = async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://s3.amazonaws.com/roxiler.com/product_transaction.json'
    );
    await Transaction.deleteMany(); // Clear existing data
    await Transaction.insertMany(data); // Insert new data
    res.status(200).json({ message: 'Database initialized successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List transactions with search and pagination
const listTransactions = async (req, res) => {
  const { search = '', page = 1, perPage = 10 } = req.query;
  const query = {
    $or: [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      ...(isNaN(search) ? [] : [{ price: Number(search) }]),
    ],
  };

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    const total = await Transaction.countDocuments(query);
    res.status(200).json({ total, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get statistics for a month
const getStatisticsData = async (month) => {
  const currentYear = new Date().getFullYear();
  const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();

  const transactions = await Transaction.find({
    dateOfSale: { $gte: new Date(currentYear, monthIndex, 1), $lt: new Date(currentYear, monthIndex + 1, 1) },
  });
  const totalSale = transactions.reduce((sum, t) => sum + (t.sold ? t.price : 0), 0);
  const soldItems = transactions.filter((t) => t.sold).length;
  const notSoldItems = transactions.filter((t) => !t.sold).length;

  return { totalSale, soldItems, notSoldItems };
};

// Bar chart data
const getBarChartData = async (month) => {
  const currentYear = new Date().getFullYear();
  const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();
  const ranges = [
    [0, 100],
    [101, 200],
    [201, 300],
    [301, 400],
    [401, 500],
    [501, 600],
    [601, 700],
    [701, 800],
    [801, 900],
    [901, Infinity],
  ];

  const transactions = await Transaction.find({
    dateOfSale: { $gte: new Date(currentYear, monthIndex, 1), $lt: new Date(currentYear, monthIndex + 1, 1) },
  });

  return ranges.map(([min, max]) => ({
    range: `${min}-${max}`,
    count: transactions.filter((t) => t.price >= min && t.price <= max).length,
  }));
};

// Pie chart data
const getPieChartData = async (month) => {
  const currentYear = new Date().getFullYear();
  const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();

  const transactions = await Transaction.find({
    dateOfSale: { $gte: new Date(currentYear, monthIndex, 1), $lt: new Date(currentYear, monthIndex + 1, 1) },
  });

  return transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
};

// Combined API
const getCombinedData = async (req, res) => {
  const { month } = req.query;
  try {
    const [statistics, barChartData, pieChartData] = await Promise.all([
      getStatisticsData(month),
      getBarChartData(month),
      getPieChartData(month),
    ]);
    res.status(200).json({ statistics, barChartData, pieChartData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  initializeDatabase,
  listTransactions,
  getStatisticsData,
  getBarChartData,
  getPieChartData,
  getCombinedData,
};
