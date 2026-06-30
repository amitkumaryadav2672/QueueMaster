import React, { useState, useEffect } from 'react';
import { Users, Clock, Play, CheckCircle, RefreshCw } from 'lucide-react';
import { queueService } from './services/api';
import AddCustomerForm from './components/AddCustomerForm';
import QueueColumn from './components/QueueColumn';

export default function App() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Waiting');

  const getWorkspaceClass = () => {
    if (activeTab === 'Waiting') return 'queue-workspace show-waiting';
    if (activeTab === 'Being Served') return 'queue-workspace show-serving';
    return 'queue-workspace show-completed';
  };

  const fetchQueue = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await queueService.getQueue();
      setQueue(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching queue');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(true);

    // Auto-refresh every 10 seconds for real-time dashboard updates
    const interval = setInterval(() => {
      fetchQueue(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleAddCustomer = async (customerData) => {
    setActionLoading(true);
    try {
      await queueService.addCustomer(customerData);
      await fetchQueue(false);
    } catch (err) {
      setError(err.message || 'Error adding customer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await queueService.updateStatus(id, status);
      await fetchQueue(false);
    } catch (err) {
      setError(err.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this customer from the queue?')) {
      return;
    }
    setActionLoading(true);
    try {
      await queueService.removeCustomer(id);
      await fetchQueue(false);
    } catch (err) {
      setError(err.message || 'Error removing customer');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter queue into categories
  const waitingCustomers = queue
    .filter(c => c.status === 'Waiting')
    .sort((a, b) => {
      // VIPs bubble to the top
      if (a.priority === 'VIP' && b.priority !== 'VIP') return -1;
      if (a.priority !== 'VIP' && b.priority === 'VIP') return 1;
      // Preserve FIFO (oldest first)
      return new Date(a.joinedAt) - new Date(b.joinedAt);
    });

  const servingCustomers = queue.filter(c => c.status === 'Being Served');
  const completedCustomers = queue
    .filter(c => c.status === 'Completed')
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  // Compute average service duration in minutes dynamically
  const completedWithDuration = completedCustomers.filter(c => c.servedAt && c.completedAt);
  let avgServiceMins = 5; // Default fallback: 5 mins
  if (completedWithDuration.length > 0) {
    const totalDuration = completedWithDuration.reduce((acc, c) => {
      const duration = new Date(c.completedAt) - new Date(c.servedAt);
      return acc + duration;
    }, 0);
    avgServiceMins = Math.max(1, Math.round((totalDuration / completedWithDuration.length) / 60000));
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <Clock size={32} className="logo-icon" />
          <div>
            <h1>QueueMaster</h1>
            <span>Smart waiting line management</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-badge-overall">
            Total Active: <strong>{waitingCustomers.length + servingCustomers.length}</strong>
          </div>
          <button 
            onClick={() => fetchQueue(true)} 
            className="btn-action btn-serve"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={loading}
            title="Refresh Queue"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#F87171',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      <div className="dashboard-grid">
        <aside>
          <AddCustomerForm onAddCustomer={handleAddCustomer} loading={actionLoading} />
        </aside>

        <div className="workspace-container">
          <div className="mobile-tabs-navigation">
            <button 
              className={`tab-navigation-btn ${activeTab === 'Waiting' ? 'active-tab waiting-border' : ''}`}
              onClick={() => setActiveTab('Waiting')}
            >
              Waiting ({waitingCustomers.length})
            </button>
            <button 
              className={`tab-navigation-btn ${activeTab === 'Being Served' ? 'active-tab serving-border' : ''}`}
              onClick={() => setActiveTab('Being Served')}
            >
              Serving ({servingCustomers.length})
            </button>
            <button 
              className={`tab-navigation-btn ${activeTab === 'Completed' ? 'active-tab completed-border' : ''}`}
              onClick={() => setActiveTab('Completed')}
            >
              Completed ({completedCustomers.length})
            </button>
          </div>

          <main className={getWorkspaceClass()}>
            {loading && queue.length === 0 ? (
              <div className="loading-state" style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem',
                color: 'var(--text-muted)'
              }}>
                <RefreshCw size={40} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                <p>Loading queue data...</p>
              </div>
            ) : (
              <>
                <QueueColumn
                  title="Waiting"
                  titleColorClass="waiting-color"
                  badgeColorClass="waiting-bg"
                  icon={<Clock size={18} />}
                  customers={waitingCustomers}
                  onUpdateStatus={handleUpdateStatus}
                  onRemove={handleRemove}
                  avgServiceMins={avgServiceMins}
                  activeServingCount={servingCustomers.length}
                />
                <QueueColumn
                  title="Being Served"
                  titleColorClass="serving-color"
                  badgeColorClass="serving-bg"
                  icon={<Play size={18} />}
                  customers={servingCustomers}
                  onUpdateStatus={handleUpdateStatus}
                  onRemove={handleRemove}
                />
                <QueueColumn
                  title="Completed"
                  titleColorClass="completed-color"
                  badgeColorClass="completed-bg"
                  icon={<CheckCircle size={18} />}
                  customers={completedCustomers}
                  onUpdateStatus={handleUpdateStatus}
                  onRemove={handleRemove}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
