import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { discoveryAPI, agentAPI } from '../services/api';
import '../styles/ProviderProfile.css';

export default function ProviderProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderDetails();
  }, [id]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      const [capRes, statsRes] = await Promise.all([
        discoveryAPI.getProviderDetails(id),
        agentAPI.getStats(id),
      ]);
      setCapabilities(capRes.data.data.capabilities);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch provider details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="provider-profile-container"><p>Loading...</p></div>;
  }

  if (capabilities.length === 0) {
    return <div className="provider-profile-container"><p>Provider not found</p></div>;
  }

  const firstCapability = capabilities[0];

  return (
    <div className="provider-profile-container">
      <h1>Provider Profile</h1>

      <div className="provider-header">
        <div className="provider-info">
          <h2>Provider {id.substring(0, 8)}</h2>
          <div className="reputation">
            <span className="stars">⭐ {firstCapability.reputation_score?.toFixed(1)}</span>
            <span className="uptime">📊 {firstCapability.uptime_percentage?.toFixed(1)}% uptime</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Provider Statistics</h2>
        <div className="stats-grid">
          <div className="stat">
            <span className="label">Total Transactions</span>
            <span className="value">{stats?.total_transactions || 0}</span>
          </div>
          <div className="stat">
            <span className="label">Total Settled</span>
            <span className="value">${stats?.total_settled?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="stat">
            <span className="label">Avg Reputation</span>
            <span className="value">{stats?.avg_reputation?.toFixed(2) || '5.0'}</span>
          </div>
        </div>
      </div>

      <div className="capabilities-section">
        <h2>Available Capabilities</h2>
        <div className="capabilities-grid">
          {capabilities.map((capability) => (
            <div key={capability.id} className="capability-card">
              <div className="capability-header">
                <h3>{capability.gpu_count}x {capability.gpu_type}</h3>
                <span className={`status ${capability.availability_status}`}>
                  {capability.availability_status}
                </span>
              </div>

              <div className="capability-specs">
                <div className="spec">
                  <span className="label">GPU:</span>
                  <span className="value">{capability.gpu_count}x {capability.gpu_type}</span>
                </div>
                <div className="spec">
                  <span className="label">CPU:</span>
                  <span className="value">{capability.cpu_cores} cores</span>
                </div>
                <div className="spec">
                  <span className="label">Memory:</span>
                  <span className="value">{capability.memory_gb} GB</span>
                </div>
                <div className="spec">
                  <span className="label">Price:</span>
                  <span className="value">${capability.price_per_hour?.toFixed(2)}/hr</span>
                </div>
                <div className="spec">
                  <span className="label">Region:</span>
                  <span className="value">{capability.region}</span>
                </div>
                <div className="spec">
                  <span className="label">Available Hours:</span>
                  <span className="value">{capability.available_hours} hrs</span>
                </div>
              </div>

              <div className="capability-footer">
                <p>Added: {new Date(capability.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-box">
        <h3>About This Provider</h3>
        <p>
          This provider has completed {stats?.total_transactions || 0} transactions with a
          reputation score of {firstCapability.reputation_score?.toFixed(1)}/5.0. They maintain
          an uptime of {firstCapability.uptime_percentage?.toFixed(1)}%.
        </p>
      </div>
    </div>
  );
}
