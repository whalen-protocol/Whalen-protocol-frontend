import { useState, useEffect } from 'react';
import { verificationAPI, matchAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import '../styles/Verification.css';

export default function Verification() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [completedVerifications, setCompletedVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofData, setProofData] = useState({
    jobId: '',
    completionTime: '',
    outputHash: '',
    logsUrl: '',
    notes: '',
  });

  useEffect(() => {
    fetchVerifications();
  }, [activeTab]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);

      if (activeTab === 'pending') {
        const response = await verificationAPI.getPendingVerifications();
        setPendingVerifications(response.data.data.verifications);
      } else {
        const response = await verificationAPI.getStats();
        setCompletedVerifications(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProofChange = (e) => {
    const { name, value } = e.target;
    setProofData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    setSubmittingProof(true);

    try {
      // In a real implementation, this would submit proof from provider
      console.log('Submitting proof:', proofData);
      alert('Proof submitted successfully! Waiting for verification...');
      setProofData({
        jobId: '',
        completionTime: '',
        outputHash: '',
        logsUrl: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to submit proof:', error);
      alert('Failed to submit proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleApproveVerification = async (verificationId) => {
    try {
      await verificationAPI.verifyWork(verificationId, {
        approved: true,
        notes: verificationNotes,
      });
      alert('Work approved! Payment released to provider.');
      setSelectedVerification(null);
      setVerificationNotes('');
      fetchVerifications();
    } catch (error) {
      console.error('Failed to approve verification:', error);
      alert('Failed to approve verification');
    }
  };

  const handleRejectVerification = async (verificationId) => {
    try {
      await verificationAPI.verifyWork(verificationId, {
        approved: false,
        notes: verificationNotes,
      });
      alert('Work rejected. Payment refunded to requester.');
      setSelectedVerification(null);
      setVerificationNotes('');
      fetchVerifications();
    } catch (error) {
      console.error('Failed to reject verification:', error);
      alert('Failed to reject verification');
    }
  };

  const handleCreateDispute = async (transactionId) => {
    const reason = prompt('Please describe the issue:');
    if (!reason) return;

    try {
      await verificationAPI.createDispute({
        transactionId,
        reason,
      });
      alert('Dispute created. Our team will review and resolve.');
      fetchVerifications();
    } catch (error) {
      console.error('Failed to create dispute:', error);
      alert('Failed to create dispute');
    }
  };

  if (loading) {
    return <div className="verification-container"><p>Loading...</p></div>;
  }

  return (
    <div className="verification-container">
      <h1>Work Verification & Disputes</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Verifications
        </button>
        <button
          className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Proof
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="pending-section">
          <h2>Pending Verifications ({pendingVerifications.length})</h2>

          {pendingVerifications.length === 0 ? (
            <p className="no-items">No pending verifications</p>
          ) : (
            <div className="verifications-grid">
              {pendingVerifications.map((verification) => (
                <div key={verification.id} className="verification-card">
                  <div className="card-header">
                    <h3>Match {verification.id.substring(0, 8)}</h3>
                    <span className="status pending">Pending Review</span>
                  </div>

                  <div className="card-details">
                    <div className="detail">
                      <span className="label">Provider:</span>
                      <span className="value">{verification.provider_name}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Amount:</span>
                      <span className="value">${verification.amount?.toFixed(2)}</span>
                    </div>
                    <div className="detail">
                      <span className="label">GPU:</span>
                      <span className="value">{verification.gpu_count}x {verification.gpu_type}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Duration:</span>
                      <span className="value">{verification.duration_hours} hours</span>
                    </div>
                  </div>

                  <button
                    className="review-btn"
                    onClick={() => setSelectedVerification(verification)}
                  >
                    Review & Verify
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedVerification && (
            <div className="verification-modal">
              <div className="modal-content">
                <h2>Verify Work Completion</h2>

                <div className="proof-details">
                  <h3>Proof Details</h3>
                  <p>
                    <strong>Provider:</strong> {selectedVerification.provider_name}
                  </p>
                  <p>
                    <strong>Amount:</strong> ${selectedVerification.amount?.toFixed(2)}
                  </p>
                  <p>
                    <strong>Proof Hash:</strong>{' '}
                    <code>{selectedVerification.proof_hash?.substring(0, 32)}...</code>
                  </p>
                </div>

                <div className="form-group">
                  <label>Verification Notes</label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add any notes about your verification decision..."
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-approve"
                    onClick={() =>
                      handleApproveVerification(selectedVerification.id)
                    }
                  >
                    ✓ Approve & Release Payment
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() =>
                      handleRejectVerification(selectedVerification.id)
                    }
                  >
                    ✗ Reject & Refund
                  </button>
                  <button
                    className="btn btn-dispute"
                    onClick={() =>
                      handleCreateDispute(selectedVerification.transaction_id)
                    }
                  >
                    ⚠️ Create Dispute
                  </button>
                  <button
                    className="btn btn-cancel"
                    onClick={() => setSelectedVerification(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'submit' && (
        <div className="submit-section">
          <h2>Submit Work Completion Proof</h2>

          <form onSubmit={handleSubmitProof} className="proof-form">
            <div className="form-group">
              <label>Job ID</label>
              <input
                type="text"
                name="jobId"
                value={proofData.jobId}
                onChange={handleProofChange}
                placeholder="Enter the job/task ID"
                required
              />
            </div>

            <div className="form-group">
              <label>Completion Time (ISO 8601)</label>
              <input
                type="datetime-local"
                name="completionTime"
                value={proofData.completionTime}
                onChange={handleProofChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Output Hash (SHA-256)</label>
              <input
                type="text"
                name="outputHash"
                value={proofData.outputHash}
                onChange={handleProofChange}
                placeholder="Hash of the computation output"
                required
              />
            </div>

            <div className="form-group">
              <label>Logs URL</label>
              <input
                type="url"
                name="logsUrl"
                value={proofData.logsUrl}
                onChange={handleProofChange}
                placeholder="https://logs.example.com/job-123"
              />
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                name="notes"
                value={proofData.notes}
                onChange={handleProofChange}
                placeholder="Any additional information about the work completed..."
                rows="4"
              />
            </div>

            <button
              type="submit"
              disabled={submittingProof}
              className="submit-btn"
            >
              {submittingProof ? 'Submitting...' : 'Submit Proof'}
            </button>
          </form>

          <div className="proof-guidelines">
            <h3>Proof Guidelines</h3>
            <ul>
              <li>Provide accurate job ID and completion time</li>
              <li>Include SHA-256 hash of computation output</li>
              <li>Provide logs URL for transparency</li>
              <li>Be detailed in your notes for faster verification</li>
              <li>Proof must be submitted within 24 hours of completion</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="stats-section">
          <h2>Verification Statistics</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Verifications</h3>
              <p className="stat-value">
                {completedVerifications.total_verifications || 0}
              </p>
            </div>

            <div className="stat-card">
              <h3>Approved</h3>
              <p className="stat-value">
                {completedVerifications.approved_verifications || 0}
              </p>
            </div>

            <div className="stat-card">
              <h3>Pending</h3>
              <p className="stat-value">
                {completedVerifications.pending_verifications || 0}
              </p>
            </div>

            <div className="stat-card">
              <h3>Unique Transactions</h3>
              <p className="stat-value">
                {completedVerifications.unique_transactions || 0}
              </p>
            </div>
          </div>

          <div className="verification-info">
            <h3>How Verification Works</h3>
            <ol>
              <li>Provider completes work and submits proof</li>
              <li>Requester reviews proof and verifies completion</li>
              <li>If approved, payment is released to provider</li>
              <li>If rejected, payment is refunded to requester</li>
              <li>Disputes can be escalated for manual review</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
