import React from 'react';
import CustomerCard from './CustomerCard';
import { Inbox } from 'lucide-react';

export default function QueueColumn({ 
  title, 
  badgeColorClass, 
  titleColorClass, 
  icon, 
  customers = [], 
  onUpdateStatus, 
  onRemove,
  avgServiceMins,
  activeServingCount,
  isAdmin
}) {
  return (
    <div className="queue-column">
      <div className="column-header">
        <div className={`column-title ${titleColorClass}`}>
          {icon}
          {title}
        </div>
        <span className={`column-badge ${badgeColorClass}`}>
          {customers.length}
        </span>
      </div>

      <div className="card-list">
        {customers.length === 0 ? (
          <div className="empty-state">
            <Inbox className="empty-state-icon" size={32} />
            <p>No customers in queue.</p>
          </div>
        ) : (
          customers.map((customer, index) => (
            <CustomerCard
              key={customer._id}
              customer={customer}
              onUpdateStatus={onUpdateStatus}
              onRemove={onRemove}
              isNextInLine={title === 'Waiting' ? index === 0 : true}
              index={index}
              avgServiceMins={avgServiceMins}
              activeServingCount={activeServingCount}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </div>
  );
}
