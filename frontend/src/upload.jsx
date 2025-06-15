import React, { useState } from 'react';

const UploadTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const isValidType = selectedFile.type === 'application/pdf' || 
                         selectedFile.type.startsWith('image/');
      
      if (!isValidType) {
        setError('Please select a PDF or image file');
        return;
      }
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch('http://localhost:8000/api/v1/upload/upload', {
        method: 'POST',
        body: formData,
      });

      //res is the Response object returned by our backend.
      // It has things like:
      // res.status (e.g. 200, 400)
      // res.ok (true or false)
      // res.body (the actual data — in stream form)
      // and methods like res.json(), res.text(), etc.



      const data = await res.json();

      // It reads the response from the backend and converts it into a JavaScript object (assuming that response is JSON).

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setResponse(data);
      console.log('Upload successful:', data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  

  const fetchPatientData = async () => {
  const userId = 'user_1749479242059_muxdyhh8w'; // Replace with dynamic value later if needed
  try {
    const res = await fetch(`http://localhost:8000/api/v1/upload/patient?userId=${userId}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch patient data');
    }

    setResponse(data);
    console.log('Patient data:', data);
  } catch (err) {
    console.error('Fetch error:', err);
    setError(err.message || 'Failed to fetch patient data');
  }
};


  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Medical Document Upload Test
      </h1>
      
      {/* File Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Medical Document (PDF or Image)
        </label>
        
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        {file && (
          <div className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 px-4 rounded-lg font-medium ${
            !file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Document...
            </div>
          ) : (
            'Upload & Process Document'
          )}
        </button>
      </div>

      {/* Fetch Patient Data Button */}
      <div className="mb-6">
        <button
          onClick={fetchPatientData}
          className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
        >
          Get Patient Data
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-medium">Error:</div>
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800 font-medium mb-2">Response:</div>
          <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-auto max-h-96">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Select a PDF or image file (medical document/prescription)</li>
          <li>• File size limit: 10MB</li>
          <li>• Click "Upload & Process" to extract medical data</li>
          <li>• Use "Get Patient Data" to view stored patient information</li>
          <li>• Check browser console for detailed logs</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadTest;