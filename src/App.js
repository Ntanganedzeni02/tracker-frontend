import React, { useState, useEffect } from 'react';
import { 
  LogOut, User, Building2, DollarSign, Users, GraduationCap,
  BarChart3, Menu, X, CheckCircle, XCircle, Clock, Plus, Search, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// API Base URL
const API_URL = process.env.API_URL;

// API Helper Functions
const api = {
  // Auth
  register: (data) => fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  login: (data) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Authenticated requests
  request: (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    }).then(async r => {
      const data = await r.json();
      console.log(`API Response from ${endpoint}:`, data); // Debug log
      return data;
    }).catch(err => {
      console.error(`API Error from ${endpoint}:`, err);
      return { error: err.message };
    });
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setCurrentPage(JSON.parse(savedUser).role === 'admin' ? 'admin-dashboard' : 'entrepreneur-dashboard');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPages 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setIsAuthenticated={setIsAuthenticated}
        setUser={setUser}
      />
    );
  }

  return (
    <Dashboard 
      user={user}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      handleLogout={handleLogout}
    />
  );
}

// Authentication Pages Component
function AuthPages({ currentPage, setCurrentPage, setIsAuthenticated, setUser }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check terms for registration
    if (currentPage === 'register' && !acceptedTerms) {
      setError('You must accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (currentPage === 'login') {
        response = await api.login(formData);
      } else {
        response = await api.register(formData);
      }

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      // Save token and user
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/logo.png" 
              alt="Silulo Logo" 
              className="h-20 w-20 object-contain mb-4"
              onError={(e) => e.target.style.display = 'none'}
            />
            <h1 className="text-2xl font-bold text-gray-800">Empower township entreprenuers</h1>
          </div>
          <p className="text-gray-600 mb-6 text-center">Login to your account</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentPage('register')}
              className="text-blue-600 hover:underline"
            >
              Don't have an account? Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
        <p className="text-gray-600 mb-6">Register as an entrepreneur</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Surname *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, surname: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">ID Number *</label>
            <input
              type="text"
              required
              maxLength="13"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Hub *</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, hub: e.target.value})}
            >
              <option value="">Select Hub</option>
              <option value="Dunoon">Dunoon</option>
              <option value="Khayelitsha">Khayelitsha</option>
              <option value="Bellville">Bellville</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="mb-6">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-600">
                I accept the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentPage('login')}
            className="text-blue-600 hover:underline"
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
function Dashboard({ user, currentPage, setCurrentPage, handleLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdmin = user.role === 'admin';

  const menuItems = isAdmin ? [
    { id: 'admin-dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'admin-users', label: 'Entrepreneurs', icon: Users },
    { id: 'admin-payments', label: 'Payments', icon: DollarSign },
    { id: 'admin-bootcamp', label: 'Bootcamp', icon: GraduationCap },
  ] : [
    { id: 'entrepreneur-dashboard', label: 'Dashboard', icon: User },
    { id: 'add-business', label: 'Add Business', icon: Building2 },
    { id: 'add-payment', label: 'Add Payment', icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8">
            <img 
              src="/logo.png" 
              alt="Silulo Logo" 
              className="h-12 w-30 object-contain"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            
          </div>
          
          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  currentPage === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-700 mt-8"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-800"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name} {user.surname}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.name[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isAdmin ? (
            <AdminPages currentPage={currentPage} />
          ) : (
            <EntrepreneurPages currentPage={currentPage} user={user} />
          )}
        </main>
      </div>
    </div>
  );
}

// Entrepreneur Pages
function EntrepreneurPages({ currentPage, user }) {
  if (currentPage === 'entrepreneur-dashboard') {
    return <EntrepreneurDashboard user={user} />;
  }
  if (currentPage === 'add-business') {
    return <AddBusinessForm user={user} />;
  }
  if (currentPage === 'add-payment') {
    return <AddPaymentForm user={user} />;
  }
  return null;
}

// Entrepreneur Dashboard
function EntrepreneurDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.request('/entrepreneur/dashboard');
      setData(response);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Calculate payment summary
  const totalMonths = data.payments.length;
  const paidCount = data.payments.filter(p => p.status === 'paid').length;
  const unpaidCount = data.payments.filter(p => p.status === 'unpaid').length;
  const overdueCount = data.payments.filter(p => p.status === 'overdue').length;
  const outstanding = unpaidCount + overdueCount;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Months</p>
          <p className="text-2xl font-bold text-gray-800">{totalMonths}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-2xl font-bold text-red-600">{outstanding}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Payment Status</p>
          <p className="text-xl font-bold text-gray-800">
            {totalMonths > 0 ? Math.round((paidCount / totalMonths) * 100) : 0}% Paid
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{data.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{data.user.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hub</p>
            <p className="font-medium">{data.user.hub || 'N/A'}</p>
          </div>
          {data.bootcamp && (
            <div>
              <p className="text-sm text-gray-600">Bootcamp Cohort</p>
              <p className="font-medium">{data.bootcamp.cohort}</p>
            </div>
          )}
        </div>
      </div>

      {/* Businesses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Businesses</h2>
        {data.businesses.length === 0 ? (
          <p className="text-gray-600">No businesses added yet.</p>
        ) : (
          <div className="space-y-4">
            {data.businesses.map(business => (
              <div key={business.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{business.name}</h3>
                <p className="text-sm text-gray-600">{business.industry} • {business.type}</p>
                <p className="text-sm text-gray-600 mt-2">{business.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        {data.payments.length === 0 ? (
          <p className="text-gray-600">No payment records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Business</th>
                  <th className="text-left py-2">Month/Year</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map(payment => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-2">{payment.business_name}</td>
                    <td className="py-2">{payment.month}/{payment.year}</td>
                    <td className="py-2">
                      <PaymentStatus status={payment.status} />
                    </td>
                    <td className="py-2 text-sm text-gray-600">{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Business Form
function AddBusinessForm({ user }) {
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.request('/businesses', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Business added successfully!');
        setFormData({});
        e.target.reset();
      }
    } catch (err) {
      setError('Failed to add business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Business</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Business Name *</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Registration Number *</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Business Type</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="">Select Type</option>
            <option value="PTY LTD">PTY LTD</option>
            <option value="CC">CC</option>
            <option value="Sole Proprietor">Sole Proprietor</option>
            <option value="Partnership">Partnership</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Industry</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, industry: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Location</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Years Operating</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, yearsOperating: parseInt(e.target.value)})}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Turnover Range</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, turnover_range: e.target.value})}
          >
            <option value="">Select Range</option>
            <option value="R0-R50k">R0 - R50k</option>
            <option value="R50k-R100k">R50k - R100k</option>
            <option value="R100k-R500k">R100k - R500k</option>
            <option value="R500k-R1M">R500k - R1M</option>
            <option value="R1M+">R1M+</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Adding Business...' : 'Add Business'}
        </button>
      </form>
    </div>
  );
}

// Add Payment Form (Entrepreneur)
function AddPaymentForm({ user }) {
  const [businesses, setBusinesses] = useState([]);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const response = await api.request(`/businesses/${user.id}`);
      setBusinesses(response.businesses);
    } catch (err) {
      console.error('Failed to load businesses:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.request('/entrepreneur/payment', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Payment record created successfully! Admin will review it.');
        setFormData({});
        e.target.reset();
      }
    } catch (err) {
      setError('Failed to create payment record');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 3}, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Payment Record</h1>

      {businesses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          You need to add a business first before creating payment records.
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {businesses.length > 0 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Business *</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, businessId: parseInt(e.target.value)})}
            >
              <option value="">Choose a business...</option>
              {businesses.map(business => (
                <option key={business.id} value={business.id}>
                  {business.name} - {business.registration_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Month *</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
            >
              <option value="">Select month...</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Year *</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
            >
              <option value="">Select year...</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="text-sm">
              This will create a payment record with "Pending" status. The admin will review and update it.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Payment Record'}
          </button>
        </form>
      )}
    </div>
  );
}

// Admin Pages
function AdminPages({ currentPage }) {
  if (currentPage === 'admin-dashboard') return <AdminDashboard />;
  if (currentPage === 'admin-users') return <AdminUsers />;
  if (currentPage === 'admin-payments') return <AdminPayments />;
  if (currentPage === 'admin-bootcamp') return <AdminBootcamp />;
  return null;
}

// Admin Dashboard
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.request('/admin/reports');
      console.log('Dashboard stats:', response);
      
      if (response && !response.error) {
        setStats(response);
      } else {
        console.error('Error loading stats:', response.error);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl text-red-600">Failed to load dashboard data. Please refresh.</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Entrepreneurs', value: stats.totalEntrepreneurs || 0, icon: Users, color: 'blue' },
    { label: 'Total Businesses', value: stats.totalBusinesses || 0, icon: Building2, color: 'green' },
    { label: 'Paid Payments', value: stats.paidPayments || 0, icon: CheckCircle, color: 'green' },
    { label: 'Overdue Payments', value: stats.overduePayments || 0, icon: AlertCircle, color: 'red' },
  ];

  // Prepare chart data with safety checks
  const paymentChartData = [
    { name: 'Paid', value: stats.paidPayments || 0, color: '#10b981' },
    { name: 'Unpaid', value: stats.unpaidPayments || 0, color: '#ef4444' },
    { name: 'Pending', value: stats.pendingPayments || 0, color: '#f59e0b' },
    { name: 'Overdue', value: stats.overduePayments || 0, color: '#f97316' },
  ];

  const hubChartData = (stats.hubPerformance || []).map(hub => ({
    name: hub.hub,
    entrepreneurs: parseInt(hub.total_entrepreneurs) || 0,
    businesses: parseInt(hub.total_businesses) || 0,
    paymentRate: hub.total_payments > 0 
      ? Math.round((hub.paid_payments / hub.total_payments) * 100) 
      : 0
  }));

  const hasChartData = hubChartData.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <stat.icon className="text-gray-600" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasChartData ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Status Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Hub Performance Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Hub Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hubChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="entrepreneurs" fill="#3b82f6" name="Entrepreneurs" />
                  <Bar dataKey="businesses" fill="#10b981" name="Businesses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Rate by Hub Line Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Rate by Hub (%)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hubChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="paymentRate" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Payment Rate (%)"
                  dot={{ fill: '#8b5cf6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No hub data available for charts. Add entrepreneurs to hubs to see visualizations.
        </div>
      )}

      {/* Hub Performance Table */}
      {hasChartData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Hub Performance Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Hub</th>
                  <th className="text-left py-2">Entrepreneurs</th>
                  <th className="text-left py-2">Active</th>
                  <th className="text-left py-2">Businesses</th>
                  <th className="text-left py-2">Total Payments</th>
                  <th className="text-left py-2">Paid</th>
                  <th className="text-left py-2">Payment Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.hubPerformance && stats.hubPerformance.map((hub, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 font-medium">{hub.hub}</td>
                    <td className="py-2">{hub.total_entrepreneurs}</td>
                    <td className="py-2">{hub.active_entrepreneurs}</td>
                    <td className="py-2">{hub.total_businesses}</td>
                    <td className="py-2">{hub.total_payments}</td>
                    <td className="py-2 text-green-600">{hub.paid_payments}</td>
                    <td className="py-2">
                      <span className="font-semibold">
                        {hub.total_payments > 0 
                          ? Math.round((hub.paid_payments / hub.total_payments) * 100) 
                          : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Recent Registrations (30 days)</span>
            <span className="font-semibold">{stats.recentRegistrations || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bootcamp Assignments</span>
            <span className="font-semibold">{stats.bootcampAssignments || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pending Payments</span>
            <span className="font-semibold text-yellow-600">{stats.pendingPayments || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Unpaid Payments</span>
            <span className="font-semibold text-red-600">{stats.unpaidPayments || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Users
function AdminUsers() {
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hubFilter, setHubFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      loadEntrepreneurs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, hubFilter, statusFilter]);

  const loadEntrepreneurs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm && searchTerm.trim()) params.append('search', searchTerm.trim());
      if (hubFilter && hubFilter.trim()) params.append('hub', hubFilter.trim());
      if (statusFilter && statusFilter.trim()) params.append('status', statusFilter.trim());

      const queryString = params.toString();
      const url = queryString ? `/admin/entrepreneurs?${queryString}` : '/admin/entrepreneurs';
      
      const response = await api.request(url);
      
      // Handle response properly
      if (response && response.entrepreneurs) {
        setEntrepreneurs(response.entrepreneurs);
      } else if (response && response.error) {
        console.error('Error from server:', response.error);
        setEntrepreneurs([]);
      } else {
        console.error('Unexpected response:', response);
        setEntrepreneurs([]);
      }
    } catch (err) {
      console.error('Failed to load entrepreneurs:', err);
      setEntrepreneurs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.request(`/admin/entrepreneurs/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadEntrepreneurs();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-8"><div className="text-xl">Loading...</div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manage Entrepreneurs</h1>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
          >
            <option value="">All Hubs</option>
            <option value="Dunoon">Dunoon</option>
            <option value="Khayelitsha">Khayelitsha</option>
            <option value="Bellville">Bellville</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {entrepreneurs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No entrepreneurs found. Try adjusting your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hub</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Businesses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entrepreneurs.map(entrepreneur => (
                  <tr key={entrepreneur.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entrepreneur.name} {entrepreneur.surname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{entrepreneur.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entrepreneur.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entrepreneur.hub || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entrepreneur.business_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        entrepreneur.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entrepreneur.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(entrepreneur.id, entrepreneur.status || 'active')}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Payments
function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayments();
    loadBusinesses();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await api.request('/admin/payments');
      setPayments(response.payments);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async () => {
    try {
      const response = await api.request('/admin/businesses/all');
      setBusinesses(response.businesses);
    } catch (err) {
      console.error('Failed to load businesses:', err);
    }
  };

  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await api.request(`/admin/payments/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadPayments();
    } catch (err) {
      console.error('Failed to update payment:', err);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.request('/admin/payments', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess('Payment record created successfully!');
        setShowForm(false);
        setFormData({});
        loadPayments();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to create payment record');
    }
  };

  if (loading) return <div>Loading...</div>;

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 3}, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Manage Payments</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Payment</span>
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create Payment Record</h2>
          <form onSubmit={handleCreatePayment} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Business *</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, businessId: parseInt(e.target.value)})}
              >
                <option value="">Choose a business...</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name} - {business.owner_name} {business.owner_surname} ({business.owner_email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Month *</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
              >
                <option value="">Select month...</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Year *</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              >
                <option value="">Select year...</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Status *</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Notes</label>
              <textarea
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Payment
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrepreneur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month/Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.user_name} {payment.user_surname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.business_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.month}/{payment.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatus status={payment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={payment.status}
                      onChange={(e) => updatePaymentStatus(payment.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Admin Bootcamp
function AdminBootcamp() {
  const [assignments, setAssignments] = useState([]);
  const [overview, setOverview] = useState([]);
  const [details, setDetails] = useState([]);
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState('');
  
  // Filters
  const [cohortYearFilter, setCohortYearFilter] = useState('');
  const [hubFilter, setHubFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Selected for details view
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedHub, setSelectedHub] = useState('');

  useEffect(() => {
    // Debounce for filter changes
    const timer = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(timer);
  }, [cohortYearFilter, hubFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cohortYearFilter && cohortYearFilter.trim()) params.append('cohortYear', cohortYearFilter.trim());
      if (hubFilter && hubFilter.trim()) params.append('hub', hubFilter.trim());
      if (statusFilter && statusFilter.trim()) params.append('status', statusFilter.trim());

      const queryString = params.toString();
      const assignmentsUrl = queryString ? `/admin/bootcamp/cohorts?${queryString}` : '/admin/bootcamp/cohorts';

      const [assignmentsRes, entrepreneursRes, overviewRes] = await Promise.all([
        api.request(assignmentsUrl),
        api.request('/admin/entrepreneurs'),
        api.request('/admin/bootcamp/overview')
      ]);
      
      if (assignmentsRes && assignmentsRes.assignments) {
        setAssignments(assignmentsRes.assignments);
      } else {
        setAssignments([]);
      }

      if (entrepreneursRes && entrepreneursRes.entrepreneurs) {
        setEntrepreneurs(entrepreneursRes.entrepreneurs);
      } else {
        setEntrepreneurs([]);
      }

      if (overviewRes && overviewRes.overview) {
        // Filter overview based on filters
        let filteredOverview = overviewRes.overview;
        
        if (cohortYearFilter && cohortYearFilter.trim()) {
          filteredOverview = filteredOverview.filter(
            item => item.cohort_year === parseInt(cohortYearFilter)
          );
        }
        
        if (hubFilter && hubFilter.trim()) {
          filteredOverview = filteredOverview.filter(
            item => item.hub === hubFilter.trim()
          );
        }
        
        setOverview(filteredOverview);
      } else {
        setOverview([]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setAssignments([]);
      setOverview([]);
      setEntrepreneurs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (year, hub) => {
    try {
      const response = await api.request(`/admin/bootcamp/details?cohortYear=${year}&hub=${hub}`);
      setDetails(response.details);
      setSelectedYear(year);
      setSelectedHub(hub);
    } catch (err) {
      console.error('Failed to load details:', err);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.request('/admin/bootcamp/assign', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess('Bootcamp assigned successfully!');
      setShowForm(false);
      setFormData({});
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to assign bootcamp:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-8"><div className="text-xl">Loading...</div></div>;

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Bootcamp Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Assign Bootcamp</span>
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assign Entrepreneur to Bootcamp</h2>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Entrepreneur</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, userId: parseInt(e.target.value)})}
              >
                <option value="">Choose entrepreneur...</option>
                {entrepreneurs.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} {e.surname} ({e.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Cohort Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Cohort 2025-Q1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, cohort: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Cohort Year</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, cohortYear: parseInt(e.target.value)})}
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Assign
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-3">Filter Cohorts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={cohortYearFilter}
            onChange={(e) => setCohortYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
          >
            <option value="">All Hubs</option>
            <option value="Dunoon">Dunoon</option>
            <option value="Khayelitsha">Khayelitsha</option>
            <option value="Bellville">Bellville</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Bootcamp Cohort Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Cohort Overview by Hub</h2>
        {overview.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No cohort data available. Try adjusting your filters or assign entrepreneurs to bootcamps.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hub</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {overview.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{item.cohort_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.hub}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_members}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600">{item.active_members}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600">{item.completed_members}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => loadDetails(item.cohort_year, item.hub)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cohort Details View */}
      {details.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Cohort Details: {selectedHub} - {selectedYear}
            </h2>
            <button
              onClick={() => setDetails([])}
              className="text-gray-600 hover:text-gray-800"
            >
              <X size={20} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrepreneur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {details.map((detail, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {detail.name} {detail.surname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{detail.business_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {detail.attendance || 0}/{detail.total_sessions || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {detail.paid_payments}/{detail.total_payments} paid
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        detail.bootcamp_status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : detail.bootcamp_status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {detail.bootcamp_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Assignments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">All Assignments</h2>
        </div>
        {assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No assignments found. Try adjusting your filters or create new assignments.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrepreneur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hub</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.map(assignment => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.name} {assignment.surname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{assignment.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{assignment.hub}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {assignment.cohort}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{assignment.cohort_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        assignment.bootcamp_status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : assignment.bootcamp_status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.bootcamp_status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(assignment.assigned_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Payment Status Badge Component
function PaymentStatus({ status }) {
  const styles = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-orange-100 text-orange-800'
  };

  const icons = {
    paid: CheckCircle,
    unpaid: XCircle,
    pending: Clock,
    overdue: AlertCircle
  };

  const Icon = icons[status] || Clock;

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending}`}>
      <Icon size={16} />
      <span className="capitalize">{status}</span>
    </span>
  );
}

export default App;