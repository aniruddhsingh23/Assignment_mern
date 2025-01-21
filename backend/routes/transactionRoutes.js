const express = require('express');
const {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChartData,
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/initialize', initializeDatabase);
router.get('/transactions', listTransactions);
router.get('/statistics', getStatistics);
router.get('/bar-chart', getBarChartData);

module.exports = router;
