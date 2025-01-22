import fetch from 'node-fetch';
import Transaction from '../models/Transaction.js';

// Initialize Database
export const initializeDatabase = async (req, res) => {
  try {
    const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = await response.json();

    await Transaction.deleteMany(); // Clear existing data
    await Transaction.insertMany(data);

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize database', details: error.message });
  }
};

// Get Transactions (with search and pagination)
export const getTransactions = async (req, res) => {
  const { month, page = 1, perPage = 10, search } = req.query;
  const skip = (page - 1) * perPage;

  try {
    const query = { dateOfSale: new RegExp(`-${month}-`, 'i') };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } },
      ];
    }

    const transactions = await Transaction.find(query).skip(skip).limit(Number(perPage));
    const total = await Transaction.countDocuments(query);

    res.status(200).json({ total, transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
  }
};

// Get Statistics
export const getStatistics = async (req, res) => {
  const { month } = req.query;

  try {
    const query = { dateOfSale: new RegExp(`-${month}-`, 'i') };
    const totalSaleAmount = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
    const totalSoldItems = await Transaction.countDocuments({ ...query, sold: true });
    const totalNotSoldItems = await Transaction.countDocuments({ ...query, sold: false });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
};

// Get Bar Chart Data
export const getBarChart = async (req, res) => {
  const { month } = req.query;

  try {
    const query = { dateOfSale: new RegExp(`-${month}-`, 'i') };
    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity },
    ];

    const barChartData = await Promise.all(
      priceRanges.map(async ({ range, min, max }) => ({
        range,
        count: await Transaction.countDocuments({
          ...query,
          price: { $gte: min, $lt: max === Infinity ? Number.MAX_VALUE : max },
        }),
      }))
    );

    res.status(200).json(barChartData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bar chart data', details: error.message });
  }
};

// Get Pie Chart Data
export const getPieChart = async (req, res) => {
  const { month } = req.query;

  try {
    const query = { dateOfSale: new RegExp(`-${month}-`, 'i') };
    const pieChartData = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).json(pieChartData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pie chart data', details: error.message });
  }
};

// Get Combined Data
export const getCombinedData = async (req, res) => {
  try {
    const statistics = await getStatistics(req, res);
    const barChart = await getBarChart(req, res);
    const pieChart = await getPieChart(req, res);

    res.status(200).json({ statistics, barChart, pieChart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch combined data', details: error.message });
  }
};
