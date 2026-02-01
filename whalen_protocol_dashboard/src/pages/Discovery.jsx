import { useState } from 'react';
import { discoveryAPI, providerAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import '../styles/Discovery.css';

export default function Discovery() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useState({
    gpu_count: 8,
    gpu_type: 'H100',
    max_price: 50,
    region: 'us-east-1',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCapabilityForm, setShowCapabilityForm] = useState(false);
  const [capabilityData, setCapabilityData] = useState({
    gpu_count: 8,
    gpu_type: 'H100',
    cpu_cores: 64,
    memory_gb: 256,
    price_per_hour: 45.50,
    region: 'us-east-1',
  });

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: name === 'gpu_count' || name === 'max_price' ? parseFloat(value) : value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await discoveryAPI.search(searchParams);
      setResults(response.data.data.results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search providers');
    } finally {
      setLoading(false);
    }
  };

  const handleCapabilityChange = (e) => {
    const { name, value } = e.target;
    setCapabilityData((prev) => ({
      ...prev,
      [name]: ['gpu_count', 'cpu_cores', 'memory_gb'].includes(name)
        ? parseInt(value)
        : name === 'price_per_hour'
        ? parseFloat(value)
        : value,
    }));
  };

  const handleRegisterCapability = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await providerAPI.registerCapability(capabilityData);
      alert('Capability registered successfully!');
      setShowCapabilityForm(false);
      setCapabilityData({
        gpu_count: 8,
        gpu_type: 'H100',
        cpu_cores: 64,
        memory_gb: 256,
        price_per_hour: 45.50,
        region: 'us-east-1',
      });
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register capability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discovery-container">
      <h1>Discovery & Marketplace</h1>

      {user?.type !== 'requester' && (
        <div className="provider-section">
          <h2>Provider Tools</h2>
          <button
            className="toggle-btn"
            onClick={() => setShowCapabilityForm(!showCapabilityForm)}
          >
            {showCapabilityForm ? 'Hide Form' : '+ Register Capability'}
          </button>

          {showCapabilityForm && (
            <form className="capability-form" onSubmit={handleRegisterCapability}>
              <h3>Register Your Compute Capability</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>GPU Count</label>
                  <input
                    type="number"
                    name="gpu_count"
                    value={capabilityData.gpu_count}
                    onChange={handleCapabilityChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>GPU Type</label>
                  <select
                    name="gpu_type"
                    value={capabilityData.gpu_type}
                    onChange={handleCapabilityChange}
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
                  <label>CPU Cores</label>
                  <input
                    type="number"
                    name="cpu_cores"
                    value={capabilityData.cpu_cores}
                    onChange={handleCapabilityChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Memory (GB)</label>
                  <input
                    type="number"
                    name="memory_gb"
                    value={capabilityData.memory_gb}
                    onChange={handleCapabilityChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price per Hour ($)</label>
                  <input
                    type="number"
                    name="price_per_hour"
                    value={capabilityData.price_per_hour}
                    onChange={handleCapabilityChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <select
                    name="region"
                    value={capabilityData.region}
                    onChange={handleCapabilityChange}
                  >
                    <option>us-east-1</option>
                    <option>us-west-2</option>
                    <option>eu-west-1</option>
                    <option>ap-southeast-1</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Registering...' : 'Register Capability'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="search-section">
        <h2>Search Providers</h2>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label>GPU Count</label>
              <input
                type="number"
                name="gpu_count"
                value={searchParams.gpu_count}
                onChange={handleSearchChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>GPU Type</label>
              <select
                name="gpu_type"
                value={searchParams.gpu_type}
                onChange={handleSearchChange}
              >
                <option>H100</option>
                <option>A100</option>
                <option>L40S</option>
                <option>RTX4090</option>
              </select>
            </div>
            <div className="form-group">
              <label>Max Price ($/hr)</label>
              <input
                type="number"
                name="max_price"
                value={searchParams.max_price}
                onChange={handleSearchChange}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Region</label>
              <select
                name="region"
                value={searchParams.region}
                onChange={handleSearchChange}
              >
                <option>us-east-1</option>
                <option>us-west-2</option>
                <option>eu-west-1</option>
                <option>ap-southeast-1</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="results-section">
        <h2>Results ({results.length})</h2>
        {results.length === 0 ? (
          <p className="no-results">No providers found. Try adjusting your search criteria.</p>
        ) : (
          <div className="results-grid">
            {results.map((provider) => (
              <div key={provider.id} className="provider-card">
                <div className="provider-header">
                  <h3>Provider {provider.provider_id.substring(0, 8)}</h3>
                  <span className="reputation">⭐ {provider.reputation_score?.toFixed(1)}</span>
                </div>
                <div className="provider-specs">
                  <div className="spec">
                    <span className="label">GPU:</span>
                    <span className="value">{provider.gpu_count}x {provider.gpu_type}</span>
                  </div>
                  <div className="spec">
                    <span className="label">CPU:</span>
                    <span className="value">{provider.cpu_cores} cores</span>
                  </div>
                  <div className="spec">
                    <span className="label">Memory:</span>
                    <span className="value">{provider.memory_gb} GB</span>
                  </div>
                  <div className="spec">
                    <span className="label">Price:</span>
                    <span className="value">${provider.price_per_hour?.toFixed(2)}/hr</span>
                  </div>
                  <div className="spec">
                    <span className="label">Uptime:</span>
                    <span className="value">{provider.uptime_percentage?.toFixed(1)}%</span>
                  </div>
                </div>
                <a href={`/provider/${provider.provider_id}`} className="view-btn">
                  View Details →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
