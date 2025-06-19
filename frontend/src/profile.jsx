import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        // If token is missing, show error
        if (!token) {
            setError("No access token found. Please login again.");
            setLoading(false);
            return;
        }

        // FOR NOW: Use dummy data to simulate a successful API response
        const dummyUser = {
            name: "Shruti Pathak",
            age: 22,
            phone: "+91-9876543210",
            documentsProcessed: 5,
            medicalSummary: {
                currentConditions: ["Diabetes", "Hypertension"],
                medications: ["Metformin", "Lisinopril"],
                allergies: ["Penicillin"]
            },
            riskAssessment: {
                score: 7.5,
                level: "Moderate",
                factors: ["Age", "Blood Pressure"]
            }
        };

        // Simulate network delay
        setTimeout(() => {
            setUser(dummyUser);
            setLoading(false);
        }, 1000);
    }, []);


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-300">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Profile</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/auth')}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <div className="container mx-auto px-6 py-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                        USER PROFILE
                    </h1>
                    <p className="text-xl text-gray-300">Your personal health information</p>
                </div>

                {/* Profile Information */}
                <div className="max-w-4xl mx-auto">
                    {/* Basic Info Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800 p-6 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2 text-red-400">Name</h3>
                            <p className="text-2xl font-bold text-white">
                                {user?.name || user?.username || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2 text-red-400">Age</h3>
                            <p className="text-2xl font-bold text-white">
                                {user?.age || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2 text-red-400">Phone</h3>
                            <p className="text-2xl font-bold text-white">
                                {user?.phone || user?.phoneNumber || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Patient Persona */}
                    <div className="bg-gray-800 p-8 rounded-lg mb-8">
                        <h2 className="text-3xl font-bold mb-6 text-red-400 text-center">Patient Persona</h2>

                        {user?.medicalSummary ? (
                            <div className="prose prose-invert max-w-none space-y-4">
                                <div className="bg-gray-700 p-6 rounded-lg text-lg text-gray-300">
                                    <p><strong>🩺 Conditions:</strong> {user.medicalSummary.currentConditions.join(", ")}</p>
                                    <p><strong>💊 Medications:</strong> {user.medicalSummary.medications.join(", ")}</p>
                                    <p><strong>⚠️ Allergies:</strong> {user.medicalSummary.allergies.join(", ")}</p>
                                </div>

                                <div className="bg-gray-700 p-6 rounded-lg text-lg text-gray-300">
                                    <p><strong>📉 Risk Score:</strong> {user.riskAssessment?.score || "N/A"} ({user.riskAssessment?.level})</p>
                                    <p><strong>📋 Risk Factors:</strong> {user.riskAssessment?.factors?.join(", ") || "None"}</p>
                                </div>

                                <div className="text-gray-400 text-sm text-center italic mt-2">
                                    Documents processed: {user.documentsProcessed}
                                </div>
                            </div>
                        ) : (


                            <div className="text-center py-8">
                                <div className="text-gray-500 text-4xl mb-4">📋</div>
                                <p className="text-gray-400 text-lg">No patient persona available</p>
                                <p className="text-gray-500 text-sm mt-2">Upload medical documents to generate your persona</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/nav')}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Back to Services
                        </button>
                        <button
                            onClick={() => navigate('/upload')}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Update Documents
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Profile;