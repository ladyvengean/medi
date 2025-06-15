import React, { useState } from 'react';

const DonateBlood = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    address: '',
    preferredDate: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Appointment booked:', formData);
    alert('Appointment request submitted successfully!');
    setShowForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      bloodGroup: '',
      address: '',
      preferredDate: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {!showForm ? (
        <div className="container mx-auto px-6 py-20">
          {/* Main Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              DONATE BLOOD
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Your donation can save up to 3 lives. Be a hero in someone's story today.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-3 text-red-400">Save Lives</h3>
              <p className="text-gray-300">One donation helps multiple patients</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-3 text-red-400">Quick Process</h3>
              <p className="text-gray-300">Takes only 10-15 minutes</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-3 text-red-400">Health Benefits</h3>
              <p className="text-gray-300">Good for your health too</p>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-red-500 mb-2">Every 2 seconds</div>
                <div className="text-gray-300">Someone needs blood</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500 mb-2">1 in 7</div>
                <div className="text-gray-300">Hospital patients need blood</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500 mb-2">Only 3%</div>
                <div className="text-gray-300">Of people donate annually</div>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </div>
      ) : (
        /* Form Section */
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-lg mx-auto bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-6 text-center">Book Your Appointment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Your address"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Preferred Date</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateBlood;
