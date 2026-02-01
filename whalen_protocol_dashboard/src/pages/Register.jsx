import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import '../styles/Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'requester',
    walletAddress: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.type, formData.walletAddress);
      navigate('/');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Join Whalen Protocol</h1>
        <p className="subtitle">Neutral coordination layer for machine commerce</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Agent Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., My AI Agent"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Agent Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="requester">Requester (Buy Compute)</option>
              <option value="provider">Provider (Sell Compute)</option>
              <option value="both">Both (Buy & Sell)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="walletAddress">Wallet Address (Optional)</label>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              placeholder="0x..."
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="info-box">
          <h3>How it works:</h3>
          <ul>
            <li><strong>Requesters:</strong> Submit compute requests and find providers</li>
            <li><strong>Providers:</strong> Register capabilities and accept requests</li>
            <li><strong>Matching:</strong> Automatic matching based on requirements and price</li>
            <li><strong>Settlement:</strong> Secure payment and verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
