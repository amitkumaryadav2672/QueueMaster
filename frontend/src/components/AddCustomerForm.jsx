import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function AddCustomerForm({ onAddCustomer, loading }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [serviceType, setServiceType] = useState('General');
  const [vip, setVip] = useState(false);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Keep only digits
    if (value.length <= 10) {
      setPhone(value);
      setPhoneError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (phone.trim() && phone.trim().length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    onAddCustomer({
      name: name.trim(),
      phone: phone.trim() || undefined,
      serviceType: serviceType.trim(),
      priority: vip ? 'VIP' : 'Normal'
    });

    // Reset Form
    setName('');
    setPhone('');
    setPhoneError('');
    setServiceType('General');
    setVip(false);
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
            placeholder="Enter 10-digit phone number"
            value={phone}
            onChange={handlePhoneChange}
            disabled={loading}
          />
          {phoneError && (
            <span style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              {phoneError}
            </span>
          )}
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

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0' }}>
          <input
            id="vip-customer"
            type="checkbox"
            checked={vip}
            onChange={(e) => setVip(e.target.checked)}
            disabled={loading}
            style={{ width: 'auto', cursor: 'pointer', transform: 'scale(1.2)' }}
          />
          <label htmlFor="vip-customer" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: '600', color: '#FBBF24' }}>
            👑 Mark as VIP Customer
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
          {loading ? 'Adding...' : 'Add Customer'}
        </button>
      </form>
    </div>
  );
}
