import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { requestAPI, matchAPI } from '../services/api';
import '../styles/RequestDetail.css';

export default function RequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const [requestRes, matchesRes] = await Promise.all([
        requestAPI.getRequest(id),
        matchAPI.getRequestMatches(id),
      ]);
      setRequest(requestRes.data.data);
      setMatches(matchesRes.data.data.matches);
    } catch (error) {
      console.error('Failed to fetch request details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      await matchAPI.acceptMatch(matchId);
      alert('Match accepted!');
      fetchRequestDetails();
    } catch (error) {
      console.error('Failed to accept match:', error);
      alert('Failed to accept match');
    }
  };

  if (loading) {
    return <div className="request-detail-container"><p>Loading...</p></div>;
  }

  if (!request) {
    return <div className="request-detail-container"><p>Request not found</p></div>;
  }

  return (
    <div className="request-detail-container">
      <h1>Request Details</h1>

      <div className="request-info">
        <div className="info-section">
          <h2>Request Specifications</h2>
          <div className="specs-grid">
            <div className="spec">
              <span className="label">GPU:</span>
              <span className="value">{request.gpu_count}x {request.gpu_type}</span>
            </div>
            <div className="spec">
              <span className="label">CPU:</span>
              <span className="value">{request.cpu_cores} cores</span>
            </div>
            <div className="spec">
              <span className="label">Memory:</span>
              <span className="value">{request.memory_gb} GB</span>
            </div>
            <div className="spec">
              <span className="label">Duration:</span>
              <span className="value">{request.duration_hours} hours</span>
            </div>
            <div className="spec">
              <span className="label">Max Price:</span>
              <span className="value">${request.max_price_per_hour?.toFixed(2)}/hr</span>
            </div>
            <div className="spec">
              <span className="label">Status:</span>
              <span className={`value status ${request.status}`}>{request.status}</span>
            </div>
          </div>

          {request.description && (
            <div className="description">
              <h3>Description</h3>
              <p>{request.description}</p>
            </div>
          )}

          <div className="metadata">
            <p>Created: {new Date(request.created_at).toLocaleString()}</p>
            <p>Request ID: {request.id}</p>
          </div>
        </div>
      </div>

      <div className="matches-section">
        <h2>Available Matches ({matches.length})</h2>

        {matches.length === 0 ? (
          <p className="no-matches">No matches found for this request yet.</p>
        ) : (
          <div className="matches-list">
            {matches.map((match) => (
              <div key={match.id} className="match-item">
                <div className="match-info">
                  <h3>Provider {match.provider_name}</h3>
                  <div className="match-details">
                    <div className="detail">
                      <span className="label">Price:</span>
                      <span className="value">${match.agreed_price_per_hour?.toFixed(2)}/hr</span>
                    </div>
                    <div className="detail">
                      <span className="label">Total Cost:</span>
                      <span className="value">
                        ${(match.agreed_price_per_hour * request.duration_hours)?.toFixed(2)}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="label">Reputation:</span>
                      <span className="value">⭐ {match.reputation_score?.toFixed(1)}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Status:</span>
                      <span className={`value status ${match.status}`}>{match.status}</span>
                    </div>
                  </div>
                </div>

                {match.status === 'proposed' && (
                  <button
                    className="btn btn-accept"
                    onClick={() => handleAcceptMatch(match.id)}
                  >
                    Accept Match
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
