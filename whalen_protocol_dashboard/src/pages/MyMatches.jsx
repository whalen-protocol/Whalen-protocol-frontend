import { useState, useEffect } from 'react';
import { matchAPI } from '../services/api';
import '../styles/MyMatches.css';

export default function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await matchAPI.getMyMatches();
      setMatches(response.data.data.matches);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      await matchAPI.acceptMatch(matchId);
      alert('Match accepted!');
      fetchMatches();
    } catch (error) {
      console.error('Failed to accept match:', error);
      alert('Failed to accept match');
    }
  };

  const handleCompleteMatch = async (matchId) => {
    try {
      await matchAPI.completeMatch(matchId);
      alert('Match completed!');
      fetchMatches();
    } catch (error) {
      console.error('Failed to complete match:', error);
      alert('Failed to complete match');
    }
  };

  const handleCancelMatch = async (matchId) => {
    if (window.confirm('Are you sure you want to cancel this match?')) {
      try {
        await matchAPI.cancelMatch(matchId);
        alert('Match cancelled');
        fetchMatches();
      } catch (error) {
        console.error('Failed to cancel match:', error);
        alert('Failed to cancel match');
      }
    }
  };

  if (loading) {
    return <div className="matches-container"><p>Loading...</p></div>;
  }

  return (
    <div className="matches-container">
      <h1>My Matches</h1>

      {matches.length === 0 ? (
        <p className="no-matches">No matches yet. Submit a request or register a capability!</p>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-header">
                <h3>Match {match.id.substring(0, 8)}</h3>
                <span className={`status ${match.status}`}>{match.status}</span>
              </div>

              <div className="match-details">
                <div className="detail">
                  <span className="label">Provider:</span>
                  <span className="value">{match.provider_name}</span>
                </div>
                <div className="detail">
                  <span className="label">Reputation:</span>
                  <span className="value">⭐ {match.reputation_score?.toFixed(1)}</span>
                </div>
                <div className="detail">
                  <span className="label">GPU:</span>
                  <span className="value">{match.gpu_count}x {match.gpu_type}</span>
                </div>
                <div className="detail">
                  <span className="label">Duration:</span>
                  <span className="value">{match.duration_hours} hours</span>
                </div>
                <div className="detail">
                  <span className="label">Agreed Price:</span>
                  <span className="value">${match.agreed_price_per_hour?.toFixed(2)}/hr</span>
                </div>
                <div className="detail">
                  <span className="label">Total Cost:</span>
                  <span className="value">
                    ${(match.agreed_price_per_hour * match.duration_hours)?.toFixed(2)}
                  </span>
                </div>
              </div>

              {match.start_time && (
                <div className="timing">
                  <span>Started: {new Date(match.start_time).toLocaleString()}</span>
                </div>
              )}

              <div className="match-actions">
                {match.status === 'proposed' && (
                  <button
                    className="btn btn-accept"
                    onClick={() => handleAcceptMatch(match.id)}
                  >
                    Accept
                  </button>
                )}
                {match.status === 'accepted' && (
                  <button
                    className="btn btn-complete"
                    onClick={() => handleCompleteMatch(match.id)}
                  >
                    Complete
                  </button>
                )}
                {['proposed', 'accepted'].includes(match.status) && (
                  <button
                    className="btn btn-cancel"
                    onClick={() => handleCancelMatch(match.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
