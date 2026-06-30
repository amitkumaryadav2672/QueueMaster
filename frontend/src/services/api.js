const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const queueService = {
  getQueue: async () => {
    const response = await fetch(`${API_URL}/queue`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch queue');
    }
    return response.json();
  },

  addCustomer: async (customerData) => {
    const response = await fetch(`${API_URL}/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add customer');
    }
    return response.json();
  },

  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/queue/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update status');
    }
    return response.json();
  },

  removeCustomer: async (id) => {
    const response = await fetch(`${API_URL}/queue/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove customer');
    }
    return response.json();
  },
};
