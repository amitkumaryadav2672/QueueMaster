const express = require('express');
const router = express.Router();
const {
  getQueue,
  addCustomer,
  updateCustomerStatus,
  removeCustomer
} = require('../controllers/queueController');

router.route('/')
  .get(getQueue)
  .post(addCustomer);

router.route('/:id/status')
  .patch(updateCustomerStatus);

router.route('/:id')
  .delete(removeCustomer);

module.exports = router;
