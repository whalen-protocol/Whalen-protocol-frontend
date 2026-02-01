import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { discoveryAPI, requestAPI, matchAPI } from '../services/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await discoveryAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p className="subtitle">You are a <strong>{user?.type}</strong></p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p className="stat-value">{stats?.requests?.total_requests || 0}</p>
          <p className="stat-label">Active compute requests</p>
        </div>

        <div className="stat-card">
          <h3>Completed Requests</h3>
          <p className="stat-value">{stats?.requests?.completed || 0}</p>
          <p className="stat-label">Successfully completed</p>
        </div>

        <div className="stat-card">
          <h3>Total Matches</h3>
          <p className="stat-value">{stats?.matches?.total_matches || 0}</p>
          <p className="stat-label">Request-provider pairs</p>
        </div>

        <div className="stat-card">
          <h3>Avg Price</h3>
          <p className="stat-value">${stats?.matches?.avg_price?.toFixed(2) || '0.00'}</p>
          <p className="stat-label">Per hour</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {user?.type !== 'provider' && (
            <div className="action-card">
              <h3>📝 Submit Request</h3>
              <p>Create a new compute request</p>
              <a href="/my-requests" className="action-link">Go to Requests →</a>
            </div>
          )}

          {user?.type !== 'requester' && (
            <div className="action-card">
              <h3>🖥️ Register Capability</h3>
              <p>Add your compute resources</p>
              <a href="/discovery" className="action-link">Go to Discovery →</a>
            </div>
          )}

          <div className="action-card">
            <h3>🔍 Find Providers</h3>
            <p>Search for compute resources</p>
            <a href="/discovery" className="action-link">Browse Providers →</a>
          </div>

          <div className="action-card">
            <h3>⚙️ Manage Matches</h3>
            <p>View and manage your matches</p>
            <a href="/my-matches" className="action-link">View Matches →</a>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h2>About Whalen Protocol</h2>
        <p>
          Whalen Protocol is a neutral coordination layer for machine commerce. It enables agents to
          discover, match, and transact for compute resources in a transparent and efficient manner.
        </p>
        <div className="features">
          <div className="feature">
            <strong>Neutral Matching:</strong> Algorithm-based matching without bias
          </div>
          <div className="feature">
            <strong>Transparent Pricing:</strong> All prices visible to all participants
          </div>
          <div className="feature">
            <strong>Secure Settlement:</strong> Escrow-based payment verification
          </div>
          <div className="feature">
            <strong>Reputation System:</strong> Build trust through verified transactions
          </div>
        </div>
      </div>
    </div>
  );
}
