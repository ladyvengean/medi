// import React from 'react';
// import UploadTest from './upload';

// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <div className="min-h-screen bg-gray-100 py-8">
//         <UploadTest />
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import UploadTest from './upload';
import DonateBlood from './donateBlood';
import RequestAmbulance from './requestAmbulance';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('upload'); // 'upload', 'donate', or 'request'

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="bg-gray-800 p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentPage('upload')}
            className={`px-4 py-2 rounded ${
              currentPage === 'upload' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Upload Documents
          </button>
          <button
            onClick={() => setCurrentPage('donate')}
            className={`px-4 py-2 rounded ${
              currentPage === 'donate' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Donate Blood
          </button>
          <button
            onClick={() => setCurrentPage('request')}
            className={`px-4 py-2 rounded ${
              currentPage === 'request' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Request Ambulance
          </button>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'upload' ? (
        <div className="min-h-screen bg-gray-100 py-8">
          <UploadTest />
        </div>
      ) : currentPage === 'donate' ? (
        <DonateBlood />
      ) : (
        <RequestAmbulance />
      )}
    </div>
  );
}

export default App;