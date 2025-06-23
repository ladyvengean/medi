
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
import React, { useState } from 'react';

// const UploadTest = () => {
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);
//   const [patientData, setPatientData] = useState(null);
  

//   const [userId, setUserId] = useState(() => {

//     return localStorage.getItem('userId') || null;
//   });


//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       // Check file type
//       const isValidType = selectedFile.type === 'application/pdf' || 
//                          selectedFile.type.startsWith('image/');
      
//       if (!isValidType) {
//         setError('Please select a PDF or image file');
//         return;
//       }
      
//       // Check file size (10MB limit)
//       if (selectedFile.size > 10 * 1024 * 1024) {
//         setError('File size should be less than 10MB');
//         return;
//       }
      
//       setFile(selectedFile);
//       setError(null);
//     }
//   };

//   // const handleUpload = async () => {
//   //   if (!file) {
//   //     setError('Please select a file first');
//   //     return;
//   //   }

//   //   setUploading(true);
//   //   setError(null);
//   //   setResponse(null);

//   //   const formData = new FormData();
//   //   formData.append('document', file);

//   //   try {
//   //     const res = await fetch('https://medi-2.onrender.com/api/v1/upload/upload', {
//   //       method: 'POST',
//   //       body: formData,
//   //     });

//   //     const data = await res.json();

//   //     if (!res.ok) {
//   //       throw new Error(data.message || 'Upload failed');
//   //     }

//   //     setResponse(data);
//   //     console.log('Upload successful:', data);
//   //   } catch (err) {
//   //     console.error('Upload error:', err);
//   //     setError(err.message || 'Upload failed');
//   //   } finally {
//   //     setUploading(false);
//   //   }
//   // };
//   const handleUpload = async () => {
//   if (!file) {
//     setError('Please select a file first');
//     return;
//   }

//   setUploading(true);
//   setError(null);
//   setResponse(null);

//   const formData = new FormData();
//   formData.append('document', file);

//   try {
//     const res = await fetch('https://medi-2.onrender.com/api/v1/upload/upload', {
//       method: 'POST',
//       body: formData,
//     });



//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || 'Upload failed');
//     }

//     setResponse(data);
//     console.log('Upload successful:', data);

//     const extractedUserId = data?.data?.userId;

//     if (!extractedUserId) {
//       throw new Error('User ID not returned from upload response');
//     }

//     setUserId(extractedUserId); // Store dynamic userId for fetching patient data
//     console.log('Stored userId:', extractedUserId);

//     // Optional: auto-fetch patient data after upload
//     await fetchPatientData(extractedUserId);

//   } catch (err) {
//     console.error('Upload error:', err);
//     setError(err.message || 'Upload failed');
//   } finally {
//     setUploading(false);
//   }
// };


//   // const fetchPatientData = async () => {
//   //   const userId = 'user_1749479242059_muxdyhh8w';
//   //   try {
//   //     const res = await fetch(`https://medi-2.onrender.com/api/v1/upload/patient?userId=${userId}`);
//   //     const data = await res.json();

//   //     if (!res.ok) {
//   //       throw new Error(data.message || 'Failed to fetch patient data');
//   //     }

//   //     setPatientData(data);
//   //     console.log('Patient data:', data);
//   //   } catch (err) {
//   //     console.error('Fetch error:', err);
//   //     setError(err.message || 'Failed to fetch patient data');
//   //   }
//   // };
//   const fetchPatientData = async (id = userId) => {
//   if (!id) {
//     setError('User ID not available. Please upload a document first.');
//     return;
//   }

//   try {
//     const res = await fetch(`https://medi-2.onrender.com/api/v1/upload/patient?userId=${id}`);
//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || 'Failed to fetch patient data');
//     }

//     setPatientData(data);
//     console.log('Patient data:', data);
//   } catch (err) {
//     console.error('Fetch error:', err);
//     setError(err.message || 'Failed to fetch patient data');
//   }
// };


//   const renderPatientInfo = (data) => {
//     if (!data || !data.data) return null;

//     const patient = data.data;
    
//     return (
//       <div className="space-y-6">
//         {/* Basic Patient Information */}
//         <div className="bg-blue-50 p-4 rounded-lg">
//           <h3 className="font-semibold text-blue-800 mb-3">Patient Information</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//             <div><span className="font-medium">Name:</span> {patient.name || 'Not specified'}</div>
//             <div><span className="font-medium">Age:</span> {patient.age || 'Not specified'}</div>
//             <div><span className="font-medium">Gender:</span> {patient.gender || 'Not specified'}</div>
//             <div><span className="font-medium">Phone:</span> {patient.phone || 'Not specified'}</div>
//             <div className="md:col-span-2"><span className="font-medium">Address:</span> {patient.address || 'Not specified'}</div>
//           </div>
//         </div>

//         {/* Medical History */}
//         <div className="bg-red-50 p-4 rounded-lg">
//           <h3 className="font-semibold text-red-800 mb-3">Medical History</h3>
//           <div className="space-y-3 text-sm">
//             <div>
//               <span className="font-medium">Current Conditions:</span>
//               <ul className="list-disc list-inside ml-4 mt-1">
//                 {patient.currentConditions && patient.currentConditions.length > 0 
//                   ? patient.currentConditions.map((condition, idx) => (
//                       <li key={idx}>{condition}</li>
//                     ))
//                   : <li>None recorded</li>
//                 }
//               </ul>
//             </div>
            
//             <div>
//               <span className="font-medium">Medications:</span>
//               <ul className="list-disc list-inside ml-4 mt-1">
//                 {patient.medications && patient.medications.length > 0 
//                   ? patient.medications.map((med, idx) => (
//                       <li key={idx}>{med}</li>
//                     ))
//                   : <li>None recorded</li>
//                 }
//               </ul>
//             </div>
            
//             <div>
//               <span className="font-medium">Allergies:</span>
//               <ul className="list-disc list-inside ml-4 mt-1">
//                 {patient.allergies && patient.allergies.length > 0 
//                   ? patient.allergies.map((allergy, idx) => (
//                       <li key={idx}>{allergy}</li>
//                     ))
//                   : <li>None recorded</li>
//                 }
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Vitals */}
//         {patient.vitals && (
//           <div className="bg-green-50 p-4 rounded-lg">
//             <h3 className="font-semibold text-green-800 mb-3">Vital Signs</h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
//               <div><span className="font-medium">Blood Pressure:</span> {patient.vitals.bloodPressure}</div>
//               <div><span className="font-medium">Heart Rate:</span> {patient.vitals.heartRate}</div>
//               <div><span className="font-medium">Temperature:</span> {patient.vitals.temperature}</div>
//               <div><span className="font-medium">Weight:</span> {patient.vitals.weight}</div>
//               <div><span className="font-medium">Height:</span> {patient.vitals.height}</div>
//               <div><span className="font-medium">BMI:</span> {patient.vitals.bmi}</div>
//             </div>
//           </div>
//         )}

//         {/* Diagnosis */}
//         {patient.diagnosis && (
//           <div className="bg-purple-50 p-4 rounded-lg">
//             <h3 className="font-semibold text-purple-800 mb-3">Diagnosis</h3>
//             <div className="space-y-2 text-sm">
//               <div><span className="font-medium">Primary:</span> {patient.diagnosis.primaryDiagnosis}</div>
//               {patient.diagnosis.secondaryDiagnosis && patient.diagnosis.secondaryDiagnosis.length > 0 && (
//                 <div>
//                   <span className="font-medium">Secondary:</span>
//                   <ul className="list-disc list-inside ml-4 mt-1">
//                     {patient.diagnosis.secondaryDiagnosis.map((diag, idx) => (
//                       <li key={idx}>{diag}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Visit Information */}
//         {patient.visitInfo && (
//           <div className="bg-yellow-50 p-4 rounded-lg">
//             <h3 className="font-semibold text-yellow-800 mb-3">Visit Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//               <div><span className="font-medium">Date:</span> {patient.visitInfo.visitDate}</div>
//               <div><span className="font-medium">Doctor:</span> {patient.visitInfo.doctorName}</div>
//               <div><span className="font-medium">Hospital/Clinic:</span> {patient.visitInfo.hospitalClinic}</div>
//               <div><span className="font-medium">Visit Type:</span> {patient.visitInfo.visitType}</div>
//               <div className="md:col-span-2"><span className="font-medium">Chief Complaint:</span> {patient.visitInfo.chiefComplaint}</div>
//             </div>
//           </div>
//         )}

//         {/* Risk Assessment */}
//         {patient.riskAssessment && (
//           <div className="bg-orange-50 p-4 rounded-lg">
//             <h3 className="font-semibold text-orange-800 mb-3">Risk Assessment</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex items-center gap-4">
//                 <span><span className="font-medium">Risk Level:</span> 
//                   <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
//                     patient.riskAssessment.riskLevel === 'High' ? 'bg-red-200 text-red-800' :
//                     patient.riskAssessment.riskLevel === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
//                     'bg-green-200 text-green-800'
//                   }`}>
//                     {patient.riskAssessment.riskLevel}
//                   </span>
//                 </span>
//                 <span><span className="font-medium">Score:</span> {patient.riskAssessment.score}/10</span>
//               </div>
//               {patient.riskAssessment.riskFactors && patient.riskAssessment.riskFactors.length > 0 && (
//                 <div>
//                   <span className="font-medium">Risk Factors:</span>
//                   <ul className="list-disc list-inside ml-4 mt-1">
//                     {patient.riskAssessment.riskFactors.map((factor, idx) => (
//                       <li key={idx}>{factor}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Treatment Plan */}
//         {patient.treatmentPlan && (
//           <div className="bg-indigo-50 p-4 rounded-lg">
//             <h3 className="font-semibold text-indigo-800 mb-3">Treatment Plan</h3>
//             <div className="space-y-3 text-sm">
//               {patient.treatmentPlan.prescriptions && patient.treatmentPlan.prescriptions.length > 0 && (
//                 <div>
//                   <span className="font-medium">Prescriptions:</span>
//                   <ul className="list-disc list-inside ml-4 mt-1">
//                     {patient.treatmentPlan.prescriptions.map((prescription, idx) => (
//                       <li key={idx}>{prescription}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
              
//               {patient.treatmentPlan.recommendations && patient.treatmentPlan.recommendations.length > 0 && (
//                 <div>
//                   <span className="font-medium">Recommendations:</span>
//                   <ul className="list-disc list-inside ml-4 mt-1">
//                     {patient.treatmentPlan.recommendations.map((rec, idx) => (
//                       <li key={idx}>{rec}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
              
//               <div><span className="font-medium">Follow-up:</span> {patient.treatmentPlan.followUp}</div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//       <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
//         Medical Document Upload Test
//       </h1>
      
//       {/* File Upload section */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Select Medical Document (PDF or Image)
//         </label>
        
//         <input
//           type="file"
//           accept=".pdf,image/*"
//           onChange={handleFileChange}
//           className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//         />
        
//         {file && (
//           <div className="mt-2 text-sm text-gray-600">
//             Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
//           </div>
//         )}
//       </div>

//       {/* Buttons */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <button
//           onClick={handleUpload}
//           disabled={!file || uploading}
//           className={`py-3 px-4 rounded-lg font-medium ${
//             !file || uploading
//               ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//               : 'bg-red-600 text-white hover:bg-red-700'
//           }`}
//         >
//           {uploading ? (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//               Processing Document...
//             </div>
//           ) : (
//             'Upload & Process Document'
//           )}
//         </button>

//         <button
//           onClick={fetchPatientData}
//           className="py-3 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
//         >
//           Get Patient Data
//         </button>
//       </div>

//       {/* Error display */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <div className="text-red-800 font-medium">Error:</div>
//           <div className="text-red-600">{error}</div>
//         </div>
//       )}

//       {/* Upload Response */}
//       {response && (
//         <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//           <div className="text-green-800 font-medium mb-2">Upload Response:</div>
//           <div className="text-sm text-green-700">
//             <p><strong>Status:</strong> {response.success ? 'Success' : 'Failed'}</p>
//             <p><strong>Message:</strong> {response.message}</p>
//             {response.data && (
//               <p><strong>Documents Processed:</strong> {response.data.documentsProcessed || 'N/A'}</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Patient Data Display */}
//       {patientData && (
//         <div className="mb-6">
//           <h2 className="text-xl font-bold mb-4 text-gray-800">Patient Medical Record</h2>
//           {renderPatientInfo(patientData)}
//         </div>
//       )}

//       {/* Raw JSON for debugging */}
//       {(response || patientData) && (
//         <details className="mb-4">
//           <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
//             Show Raw JSON Response (for debugging)
//           </summary>
//           <div className="mt-2 p-4 bg-gray-50 border rounded-lg">
//             <pre className="text-xs text-gray-700 overflow-auto max-h-96">
//               {JSON.stringify(patientData || response, null, 2)}
//             </pre>
//           </div>
//         </details>
//       )}

//       {/* Instructions */}
//       <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
//         <ul className="text-sm text-blue-700 space-y-1">
//           <li>• Select a PDF or image file (medical document/prescription)</li>
//           <li>• File size limit: 10MB</li>
//           <li>• Click "Upload & Process" to extract medical data</li>
//           <li>• Use "Get Patient Data" to view stored patient information</li>
//           <li>• Check browser console for detailed logs</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default UploadTest;







const UploadTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const isValidType = selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/');
    if (!isValidType) {
      setError('Please select a PDF or image file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
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
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('https://medi-2.onrender.com/api/v1/upload/upload', {
        method: 'POST',
        body: formData,
        headers,
      });

      const data = await res.json();
      console.log(" Full upload response object:", data);
      

      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setResponse(data);

      const extractedUserId = data?.data?.userId;
      console.log('Extracted userId:', extractedUserId); // 🧠 DEBUG THIS TOO

      if (extractedUserId) {
        setUserId(extractedUserId);
        localStorage.setItem('userId', extractedUserId);
        await fetchPatientData(extractedUserId);
       } //else {
      //   throw new Error('User ID not returned from upload response');
      // }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const fetchPatientData = async (id = userId) => {
    if (!id) {
      setError('User ID not available. Please upload a document first.');
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`https://medi-2.onrender.com/api/v1/upload/patient?userId=${id}`, { headers });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch patient data');

      setPatientData(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch patient data');
    }
  };

  const renderPatientInfo = (data) => {
    if (!data?.data) return null;
    const patient = data.data;

    return (
      <div className="space-y-6">
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Age:</strong> {patient.age}</p>
        <p><strong>Conditions:</strong> {patient.currentConditions.join(', ')}</p>
        <p><strong>Medications:</strong> {patient.medications.join(', ')}</p>
        <p><strong>Allergies:</strong> {patient.allergies.join(', ')}</p>
        <p><strong>Risk Score:</strong> {patient.riskAssessment?.score} ({patient.riskAssessment?.riskLevel})</p>
        <p><strong>Risk Factors:</strong> {patient.riskAssessment?.riskFactors.join(', ')}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Medical Document Upload Test
      </h1>

      {userId && (
        <div className="mb-4 p-3 bg-gray-50 border rounded-lg text-sm text-gray-600">
          <strong>Current User ID:</strong> {userId}
        </div>
      )}

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`py-3 px-4 rounded-lg font-medium ${
            !file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
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

        <button
          onClick={() => fetchPatientData()}
          className="py-3 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
        >
          Get Patient Data
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800 font-medium mb-2">Upload Response:</div>
          <div className="text-sm text-green-700">
            <p><strong>Status:</strong> {response.success ? 'Success' : 'Failed'}</p>
            <p><strong>Message:</strong> {response.message}</p>
            {response.data && (
              <>
                <p><strong>User ID:</strong> {response.data.userId}</p>
                <p><strong>Documents Processed:</strong> {response.data.documentsProcessed || 'N/A'}</p>
              </>
            )}
          </div>
        </div>
      )}

      {patientData && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Patient Medical Record</h2>
          {renderPatientInfo(patientData)}
        </div>
      )}

      {(response || patientData) && (
        <details className="mb-4">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
            Show Raw JSON Response (for debugging)
          </summary>
          <div className="mt-2 p-4 bg-gray-50 border rounded-lg">
            <pre className="text-xs text-gray-700 overflow-auto max-h-96">
              {JSON.stringify(patientData || response, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default UploadTest;
