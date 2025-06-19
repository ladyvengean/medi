import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login ka validation
        if (!formData.phone || !formData.password) {
          alert('Please fill in all fields');
          setLoading(false);
          return;
        }
        
        // making login api cll
        const response = await fetch('https://medi-2.onrender.com/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: formData.phone,
            password: formData.password
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store token if it returns 
          if (data.token) {
            localStorage.setItem('accessToken', data.token);
          }
          console.log('Login successful:', data);
          navigate('/nav');
        } else {
          alert(data.message || 'Login failed');
        }
        
      } else {
        // Registration validation
        if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
          alert('Please fill in all fields');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          setLoading(false);
          return;
        }
        
        // register api call
        const response = await fetch('https://medi-2.onrender.com/api/v1/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            password: formData.password
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert('Registration successful! You can now login.');
          setIsLogin(true); // Switch to mogin
          setFormData({
            name: '',
            phone: formData.phone, 
            password: '',
            confirmPassword: '',
          });
        } else {
          alert(data.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // clear form when switching modes
    setFormData({
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                disabled={loading}
              />
            </div>
          )}
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="phone"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your phone"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-md transition duration-300"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={toggleAuthMode}
            disabled={loading}
            className="text-blue-500 hover:text-blue-700 disabled:text-blue-300 font-medium"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;