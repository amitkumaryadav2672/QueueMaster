import React from 'react';
import { Phone, Clock, Play, CheckCircle, Trash2 } from 'lucide-react';

export default function CustomerCard({ customer, onUpdateStatus, onRemove, isNextInLine }) {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getWaitTime = () => {
    const start = new Date(customer.joinedAt);
    const end = customer.servedAt ? new Date(customer.servedAt) : new Date();
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  };

  const getServiceTime = () => {
    if (!customer.servedAt || !customer.completedAt) return null;
    const start = new Date(customer.servedAt);
    const end = new Date(customer.completedAt);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  };

  return (
    <div className="customer-card">
      <div className="customer-header">
        <div className="customer-name">
          {customer.name}
          {customer.status === 'Waiting' && isNextInLine && (
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              padding: '2px 6px',
              fontSize: '0.65rem',
              marginLeft: '8px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Next</span>
          )}
        </div>
        <span className="customer-service-tag">{customer.serviceType}</span>
      </div>

      {customer.phone && (
        <div className="customer-phone">
          <Phone size={13} />
          {customer.phone}
        </div>
      )}

      <div className="customer-meta">
        <div>
          <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Joined: {formatTime(customer.joinedAt)}
        </div>
        {customer.status === 'Waiting' && (
          <div>Waiting: {getWaitTime()}</div>
        )}
        {customer.status === 'Being Served' && (
          <>
            <div>Started: {formatTime(customer.servedAt)}</div>
            <div>Waited: {getWaitTime()}</div>
          </>
        )}
        {customer.status === 'Completed' && (
          <>
            <div>Served: {formatTime(customer.servedAt)}</div>
            <div>Completed: {formatTime(customer.completedAt)}</div>
            {getServiceTime() && <div>Service duration: {getServiceTime()}</div>}
          </>
        )}
      </div>

      <div className="customer-actions">
        {customer.status === 'Waiting' && (
          <>
            <button
              onClick={() => onUpdateStatus(customer._id, 'Being Served')}
              className="btn-action btn-serve"
              title={isNextInLine ? "Serve Customer" : "Must serve next-in-line customer first"}
              disabled={!isNextInLine}
              style={!isNextInLine ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              <Play size={12} />
              Serve
            </button>
            <button
              onClick={() => onRemove(customer._id)}
              className="btn-action btn-remove"
              title="Remove Customer"
            >
              <Trash2 size={12} />
              Remove
            </button>
          </>
        )}

        {customer.status === 'Being Served' && (
          <>
            <button
              onClick={() => onUpdateStatus(customer._id, 'Completed')}
              className="btn-action btn-complete"
              title="Complete Session"
            >
              <CheckCircle size={12} />
              Complete
            </button>
            <button
              onClick={() => onRemove(customer._id)}
              className="btn-action btn-remove"
              title="Remove Customer"
            >
              <Trash2 size={12} />
              Cancel
            </button>
          </>
        )}

        {customer.status === 'Completed' && (
          <button
            onClick={() => onRemove(customer._id)}
            className="btn-action btn-remove"
            title="Delete Record"
            style={{ marginLeft: 'auto' }}
          >
            <Trash2 size={12} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
