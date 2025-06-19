import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-20">
        {/* Main Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            HEALTHCARE HUB
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Access essential healthcare services in one place. Your health, our priority.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors">
            <h3 className="text-2xl font-semibold mb-4 text-red-400">Upload Docs</h3>
            <p className="text-gray-300 mb-6">Upload medical documents and receive personalized patient insights</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Upload Documents
            </button>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors">
            <h3 className="text-2xl font-semibold mb-4 text-red-400">Request Ambulance</h3>
            <p className="text-gray-300 mb-6">Quick emergency ambulance service request and receive help instantly</p>
            <button
              onClick={() => navigate('/ambulance')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Request Ambulance
            </button>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors">
            <h3 className="text-2xl font-semibold mb-4 text-red-400">Donate Blood</h3>
            <p className="text-gray-300 mb-6">Be a hero and save lives through blood donation</p>
            <button
              onClick={() => navigate('/blood')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Donate Blood
            </button>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg text-center hover:bg-gray-700 transition-colors">
            <h3 className="text-2xl font-semibold mb-4 text-red-400">Profile</h3>
            <p className="text-gray-300 mb-6">Go to profile</p>
            <button
              onClick={() => navigate('/profile')}
              className="bg-red-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Profile
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="text-center mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">24/7</div>
              <div className="text-gray-300">Emergency Services</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">1000+</div>
              <div className="text-gray-300">Lives Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500 mb-2">Fast</div>
              <div className="text-gray-300">Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavPage;
