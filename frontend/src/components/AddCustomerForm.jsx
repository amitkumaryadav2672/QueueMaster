import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function AddCustomerForm({ onAddCustomer, loading }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState('General');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCustomer({
      name: name.trim(),
      phone: phone.trim() || undefined,
      serviceType: serviceType.trim()
    });

    // Reset Form
    setName('');
    setPhone('');
    setServiceType('General');
  };

  return (
    <div className="glass-card">
      <h2 className="form-title">
        <UserPlus size={20} className="logo-icon" />
        Add to Queue
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customer-name">Customer Name *</label>
          <input
            id="customer-name"
            type="text"
            className="input-field"
            placeholder="Enter customer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer-phone">Phone Number (Optional)</label>
          <input
            id="customer-phone"
            type="tel"
            className="input-field"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="service-type">Service Type</label>
          <select
            id="service-type"
            className="input-field"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            disabled={loading}
          >
            <option value="General">General Service</option>
            <option value="Consultation">Consultation</option>
            <option value="Premium">Premium Service</option>
            <option value="Support">Quick Support</option>
            <option value="Express">Express Check-in</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
          {loading ? 'Adding...' : 'Add Customer'}
        </button>
      </form>
    </div>
  );
}
