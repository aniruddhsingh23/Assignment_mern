const axios = require('axios');
const Transaction = require('../models/Transaction');

const DATABASE_URL = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

// Initialize database
const initializeDatabase = async (req, res) => {
  try {
    // Fetch data from the external URL
    const { data } = await axios.get(DATABASE_URL);

    // Validate the fetched data
    if (!Array.isArray(data)) {
      throw new Error('Fetched data is not in the expected format (array).');
    }

    // Clear the existing database collection
    await Transaction.deleteMany();

    // Insert the new data
    await Transaction.insertMany(data);

    // Respond with success
    res.status(200).json({ message: 'Database initialized successfully!' });
  } catch (err) {
    console.error('Error initializing database:', err.stack);
    res.status(500).json({ error: 'Failed to initialize the database. ' + err.message });
  }
};

// List transactions
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
    console.error('Error listing transactions:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Statistics data
const getStatistics = async (req, res) => {
  const { month } = req.query;
  const currentYear = new Date().getFullYear();
  const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: new Date(currentYear, monthIndex, 1), $lt: new Date(currentYear, monthIndex + 1, 1) },
    });

    const totalSale = transactions.reduce((sum, t) => sum + (t.sold ? t.price : 0), 0);
    const soldItems = transactions.filter((t) => t.sold).length;
    const notSoldItems = transactions.filter((t) => !t.sold).length;

    res.status(200).json({ totalSale, soldItems, notSoldItems });
  } catch (err) {
    console.error('Error fetching statistics:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Bar chart data
const getBarChartData = async (req, res) => {
  const { month } = req.query;
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

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: new Date(currentYear, monthIndex, 1), $lt: new Date(currentYear, monthIndex + 1, 1) },
    });

    const barChartData = ranges.map(([min, max]) => ({
      range: `${min}-${max}`,
      count: transactions.filter((t) => t.price >= min && t.price <= max).length,
    }));

    res.status(200).json(barChartData);
  } catch (err) {
    console.error('Error fetching bar chart data:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChartData,
};
