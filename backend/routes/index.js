import express from 'express';
import {
  initializeDatabase,
  getTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData,
} from '../controllers/transactionController.js';

const router = express.Router();

router.post('/initialize', initializeDatabase);
router.get('/transactions', getTransactions);
router.get('/statistics', getStatistics);
router.get('/barchart', getBarChart);
router.get('/piechart', getPieChart);
router.get('/combined', getCombinedData);

export default router;
