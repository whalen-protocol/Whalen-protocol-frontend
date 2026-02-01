import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchAPI, paymentAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import '../styles/Payment.css';

export default function Payment() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    name: '',
  });

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const response = await matchAPI.getMatch(matchId);
      setMatch(response.data.data);
    } catch (err) {
      console.error('Failed to fetch match:', err);
      setError('Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    if (!match) return 0;
    return (match.agreed_price_per_hour * match.duration_hours).toFixed(2);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentProcessing(true);
    setError(null);

    try {
      const totalCost = calculateTotalCost();

      // Step 1: Create payment intent
      const intentResponse = await paymentAPI.createPaymentIntent({
        matchId,
        amount: parseFloat(totalCost),
      });

      const { transactionId, clientSecret } = intentResponse.data.data;

      // Step 2: Confirm payment (in real implementation, use Stripe.js)
      const confirmResponse = await paymentAPI.confirmPayment({
        paymentIntentId: clientSecret,
        transactionId,
      });

      setPaymentStatus({
        success: true,
        transactionId,
        message: 'Payment successful! Funds are now in escrow.',
      });

      // Redirect to match details after 2 seconds
      setTimeout(() => {
        navigate(`/my-matches`);
      }, 2000);
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.response?.data?.error || 'Payment processing failed');
      setPaymentStatus({
        success: false,
        message: 'Payment failed. Please try again.',
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return <div className="payment-container"><p>Loading match details...</p></div>;
  }

  if (!match) {
    return <div className="payment-container"><p>Match not found</p></div>;
  }

  const totalCost = calculateTotalCost();

  return (
    <div className="payment-container">
      <h1>Complete Payment</h1>

      <div className="payment-layout">
        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-details">
            <div className="summary-row">
              <span className="label">Provider:</span>
              <span className="value">{match.provider_name}</span>
            </div>
            <div className="summary-row">
              <span className="label">GPU:</span>
              <span className="value">{match.gpu_count}x {match.gpu_type}</span>
            </div>
            <div className="summary-row">
              <span className="label">Duration:</span>
              <span className="value">{match.duration_hours} hours</span>
            </div>
            <div className="summary-row">
              <span className="label">Price per Hour:</span>
              <span className="value">${match.agreed_price_per_hour?.toFixed(2)}</span>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span className="label">Total Amount:</span>
            <span className="value">${totalCost}</span>
          </div>

          <div className="payment-info">
            <h3>Payment Information</h3>
            <ul>
              <li>✓ Funds held in escrow until work is verified</li>
              <li>✓ Secure Stripe payment processing</li>
              <li>✓ Full refund available if work not completed</li>
              <li>✓ Dispute resolution available</li>
            </ul>
          </div>
        </div>

        {/* Payment Form */}
        <div className="payment-form-section">
          {paymentStatus && (
            <div className={`payment-status ${paymentStatus.success ? 'success' : 'error'}`}>
              {paymentStatus.success ? '✓' : '✗'} {paymentStatus.message}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handlePayment} className="payment-form">
            <h2>Payment Method</h2>

            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                name="name"
                value={cardDetails.name}
                onChange={handleCardChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleCardChange}
                placeholder="4242 4242 4242 4242"
                maxLength="19"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={handleCardChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>CVC</label>
                <input
                  type="text"
                  name="cvc"
                  value={cardDetails.cvc}
                  onChange={handleCardChange}
                  placeholder="123"
                  maxLength="4"
                  required
                />
              </div>
            </div>

            <div className="terms">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the payment terms and conditions
              </label>
            </div>

            <button
              type="submit"
              disabled={paymentProcessing}
              className="pay-button"
            >
              {paymentProcessing ? 'Processing...' : `Pay $${totalCost}`}
            </button>

            <p className="security-notice">
              🔒 Your payment information is secure and encrypted
            </p>
          </form>

          <div className="provider-reputation">
            <h3>Provider Details</h3>
            <div className="reputation-info">
              <div className="info-row">
                <span>Reputation:</span>
                <span className="rating">⭐ {match.reputation_score?.toFixed(1)}/5.0</span>
              </div>
              <div className="info-row">
                <span>Completed Matches:</span>
                <span>{match.completed_matches || 0}</span>
              </div>
              <div className="info-row">
                <span>Uptime:</span>
                <span>{match.uptime_percentage?.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
