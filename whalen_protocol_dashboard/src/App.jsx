import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Discovery from './pages/Discovery';
import MyRequests from './pages/MyRequests';
import MyMatches from './pages/MyMatches';
import RequestDetail from './pages/RequestDetail';
import ProviderProfile from './pages/ProviderProfile';
import Payment from './pages/Payment';
import Verification from './pages/Verification';
import './App.css';

function PrivateRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/register" />;
}

function App() {
  const { token, getProfile } = useAuthStore();

  useEffect(() => {
    if (token) {
      getProfile().catch(() => {
        // Profile fetch failed, user might need to re-register
      });
    }
  }, [token, getProfile]);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/discovery" element={<Discovery />} />
                  <Route path="/my-requests" element={<MyRequests />} />
                  <Route path="/my-matches" element={<MyMatches />} />
                  <Route path="/request/:id" element={<RequestDetail />} />
                  <Route path="/provider/:id" element={<ProviderProfile />} />
                  <Route path="/payment/:matchId" element={<Payment />} />
                  <Route path="/verification" element={<Verification />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
