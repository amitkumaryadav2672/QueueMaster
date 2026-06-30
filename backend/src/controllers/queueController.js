const Customer = require('../models/Customer');

// In-memory fallback database
const memoryQueue = [];

// Helper to generate a unique ID for in-memory records
const generateMemoryId = () => `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// @desc    Get all queue customers
// @route   GET /api/queue
// @access  Public
exports.getQueue = async (req, res) => {
  try {
    if (global.useInMemory) {
      // Sort by joinedAt (first in first out)
      const sortedQueue = [...memoryQueue].sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
      return res.status(200).json({ success: true, data: sortedQueue });
    }

    // Sort by joinedAt (first in first out)
    const queue = await Customer.find().sort({ joinedAt: 1 });
    res.status(200).json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a customer to the queue
// @route   POST /api/queue
// @access  Public
exports.addCustomer = async (req, res) => {
  try {
    const { name, phone, serviceType, priority } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    if (global.useInMemory) {
      const customer = {
        _id: generateMemoryId(),
        name,
        phone,
        serviceType: serviceType || 'General',
        status: 'Waiting',
        priority: priority || 'Normal',
        joinedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryQueue.push(customer);
      return res.status(201).json({ success: true, data: customer });
    }

    const customer = await Customer.create({
      name,
      phone,
      serviceType: serviceType || 'General',
      status: 'Waiting',
      priority: priority || 'Normal'
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a customer's status
// @route   PATCH /api/queue/:id/status
// @access  Public
exports.updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Waiting', 'Being Served', 'Completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    if (global.useInMemory) {
      const customer = memoryQueue.find(c => c._id === req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }
      
      customer.status = status;
      customer.updatedAt = new Date().toISOString();
      
      if (status === 'Being Served') {
        customer.servedAt = new Date().toISOString();
      } else if (status === 'Completed') {
        customer.completedAt = new Date().toISOString();
      }
      
      return res.status(200).json({ success: true, data: customer });
    }

    const updateFields = { status };
    if (status === 'Being Served') {
      updateFields.servedAt = Date.now();
    } else if (status === 'Completed') {
      updateFields.completedAt = Date.now();
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Remove a customer from the queue
// @route   DELETE /api/queue/:id
// @access  Public
exports.removeCustomer = async (req, res) => {
  try {
    if (global.useInMemory) {
      const index = memoryQueue.findIndex(c => c._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }
      memoryQueue.splice(index, 1);
      return res.status(200).json({ success: true, data: {} });
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
