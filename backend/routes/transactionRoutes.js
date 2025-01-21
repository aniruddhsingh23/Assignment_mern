const express = require('express');
const {
  initializeDatabase,
  listTransactions,
  getCombinedData,
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/initialize', initializeDatabase);
router.get('/transactions', listTransactions);
router.get('/combined', getCombinedData);

module.exports = router;
