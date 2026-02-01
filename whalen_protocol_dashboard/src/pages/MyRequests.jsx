import { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';
import '../styles/MyRequests.css';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    gpu_count: 8,
    gpu_type: 'H100',
    duration_hours: 2,
    max_price_per_hour: 50,
    cpu_cores: 64,
    memory_gb: 256,
    description: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getMyRequests();
      setRequests(response.data.data.requests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['gpu_count', 'duration_hours', 'cpu_cores', 'memory_gb'].includes(name)
        ? parseInt(value)
        : name === 'max_price_per_hour'
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await requestAPI.submit(formData);
      alert('Request submitted successfully!');
      setShowForm(false);
      setFormData({
        gpu_count: 8,
        gpu_type: 'H100',
        duration_hours: 2,
        max_price_per_hour: 50,
        cpu_cores: 64,
        memory_gb: 256,
        description: '',
      });
      fetchRequests();
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (loading && requests.length === 0) {
    return <div className="requests-container"><p>Loading...</p></div>;
  }

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h1>My Compute Requests</h1>
        <button
          className="new-request-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <form className="request-form" onSubmit={handleSubmitRequest}>
          <h2>Submit New Compute Request</h2>

          <div className="form-row">
            <div className="form-group">
              <label>GPU Count</label>
              <input
                type="number"
                name="gpu_count"
                value={formData.gpu_count}
                onChange={handleFormChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>GPU Type</label>
              <select
                name="gpu_type"
                value={formData.gpu_type}
                onChange={handleFormChange}
                required
              >
                <option>H100</option>
                <option>A100</option>
                <option>L40S</option>
                <option>RTX4090</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (hours)</label>
              <input
                type="number"
                name="duration_hours"
                value={formData.duration_hours}
                onChange={handleFormChange}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Max Price ($/hr)</label>
              <input
                type="number"
                name="max_price_per_hour"
                value={formData.max_price_per_hour}
                onChange={handleFormChange}
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CPU Cores</label>
              <input
                type="number"
                name="cpu_cores"
                value={formData.cpu_cores}
                onChange={handleFormChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Memory (GB)</label>
              <input
                type="number"
                name="memory_gb"
                value={formData.memory_gb}
                onChange={handleFormChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Describe your compute job..."
              rows="3"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      )}

      <div className="requests-list">
        {requests.length === 0 ? (
          <p className="no-requests">No requests yet. Create one to get started!</p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.gpu_count}x {request.gpu_type}</h3>
                <span className={`status ${request.status}`}>{request.status}</span>
              </div>
              <div className="request-details">
                <div className="detail">
                  <span className="label">Duration:</span>
                  <span className="value">{request.duration_hours} hours</span>
                </div>
                <div className="detail">
                  <span className="label">Max Price:</span>
                  <span className="value">${request.max_price_per_hour?.toFixed(2)}/hr</span>
                </div>
                <div className="detail">
                  <span className="label">CPU:</span>
                  <span className="value">{request.cpu_cores} cores</span>
                </div>
                <div className="detail">
                  <span className="label">Memory:</span>
                  <span className="value">{request.memory_gb} GB</span>
                </div>
              </div>
              {request.description && (
                <p className="description">{request.description}</p>
              )}
              <a href={`/request/${request.id}`} className="view-btn">
                View Details →
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
