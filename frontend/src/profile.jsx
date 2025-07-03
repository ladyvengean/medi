import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserData = async () => {
			const token =
				localStorage.getItem('accessToken') ||
				localStorage.getItem('authToken') ||
				localStorage.getItem('token');
			const userId = localStorage.getItem('userId');

			if (!token) {
				setError('No access token found. Please login again.');
				setLoading(false);
				return;
			}

			if (!userId) {
				setError('No user ID found. Please login again.');
				setLoading(false);
				return;
			}

			try {
				// First try to get user data from the upload endpoint (which has persona data)
				const response = await fetch(
					`http://localhost:8000/api/v1/upload/user/${userId}`
				);
				const data = await response.json();

				if (response.ok && data.data) {
					setUser(data.data);
				} else {
					// Fallback to auth endpoint if upload endpoint fails
					const authResponse = await fetch(
						'http://localhost:8000/api/v1/auth/current',
						{
							headers: {
								Authorization: `Bearer ${token}`
							}
						}
					);
					const authData = await authResponse.json();

					if (authResponse.ok && authData.user) {
						setUser({
							name: authData.user.name,
							phone: authData.user.phone,
							diseases: ['No medical data uploaded yet'],
							medications: ['No medical data uploaded yet'],
							allergies: ['No medical data uploaded yet']
						});
					} else {
						throw new Error(authData.message || 'Failed to fetch user data');
					}
				}
			} catch (err) {
				console.error('Profile fetch error:', err);
				setError(err.message || 'Failed to load profile data');
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, []);

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4'></div>
					<p className='text-xl text-gray-300'>Loading your profile...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-red-500 text-6xl mb-4'>⚠️</div>
					<h2 className='text-2xl font-bold mb-4 text-red-400'>
						Error Loading Profile
					</h2>
					<p className='text-gray-300 mb-6'>{error}</p>
					<button
						onClick={() => navigate('/auth')}
						className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'>
			<div className='container mx-auto px-6 py-20'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent'>
						USER PROFILE
					</h1>
					<p className='text-xl text-gray-300'>
						Your personal health information
					</p>
				</div>

				{/* Profile Information */}
				<div className='max-w-4xl mx-auto'>
					{/* Basic Info Cards */}
					<div className='grid md:grid-cols-3 gap-6 mb-8'>
						<div className='bg-gray-800 p-6 rounded-lg text-center'>
							<h3 className='text-lg font-semibold mb-2 text-red-400'>Name</h3>
							<p className='text-2xl font-bold text-white'>
								{user?.name || 'N/A'}
							</p>
						</div>
						<div className='bg-gray-800 p-6 rounded-lg text-center'>
							<h3 className='text-lg font-semibold mb-2 text-red-400'>Age</h3>
							<p className='text-2xl font-bold text-white'>
								{user?.age || 'N/A'}
							</p>
						</div>
						<div className='bg-gray-800 p-6 rounded-lg text-center'>
							<h3 className='text-lg font-semibold mb-2 text-red-400'>Phone</h3>
							<p className='text-2xl font-bold text-white'>
								{user?.phone || 'N/A'}
							</p>
						</div>
					</div>

					{/* Medical Information */}
					<div className='bg-gray-800 p-8 rounded-lg mb-8'>
						<h2 className='text-3xl font-bold mb-6 text-red-400 text-center'>
							Medical Summary
						</h2>

						<div className='space-y-6'>
							<div className='bg-gray-700 p-6 rounded-lg'>
								<h3 className='text-xl font-semibold mb-3 text-red-300'>
									🩺 Medical Conditions
								</h3>
								<div className='text-gray-300'>
									{user?.diseases && user.diseases.length > 0 ? (
										<ul className='list-disc list-inside space-y-1'>
											{user.diseases.map((disease, idx) => (
												<li key={idx}>{disease}</li>
											))}
										</ul>
									) : (
										<p className='text-gray-400 italic'>
											No medical conditions recorded
										</p>
									)}
								</div>
							</div>

							<div className='bg-gray-700 p-6 rounded-lg'>
								<h3 className='text-xl font-semibold mb-3 text-red-300'>
									💊 Current Medications
								</h3>
								<div className='text-gray-300'>
									{user?.medications && user.medications.length > 0 ? (
										<ul className='list-disc list-inside space-y-1'>
											{user.medications.map((med, idx) => (
												<li key={idx}>{med}</li>
											))}
										</ul>
									) : (
										<p className='text-gray-400 italic'>
											No medications recorded
										</p>
									)}
								</div>
							</div>

							<div className='bg-gray-700 p-6 rounded-lg'>
								<h3 className='text-xl font-semibold mb-3 text-red-300'>
									⚠️ Allergies
								</h3>
								<div className='text-gray-300'>
									{user?.allergies && user.allergies.length > 0 ? (
										<ul className='list-disc list-inside space-y-1'>
											{user.allergies.map((allergy, idx) => (
												<li key={idx}>{allergy}</li>
											))}
										</ul>
									) : (
										<p className='text-gray-400 italic'>
											No allergies recorded
										</p>
									)}
								</div>
							</div>

							{user?.lastVisit && (
								<div className='bg-gray-700 p-6 rounded-lg'>
									<h3 className='text-xl font-semibold mb-3 text-red-300'>
										📅 Last Medical Update
									</h3>
									<p className='text-gray-300'>
										{new Date(user.lastVisit).toLocaleDateString()}
									</p>
								</div>
							)}
						</div>

						{(!user?.diseases ||
							user.diseases.length === 0 ||
							user.diseases[0] === 'No diseases recorded') && (
							<div className='text-center py-8 mt-6'>
								<div className='text-gray-500 text-4xl mb-4'>📋</div>
								<p className='text-gray-400 text-lg'>
									No medical data available
								</p>
								<p className='text-gray-500 text-sm mt-2'>
									Upload medical documents to generate your medical summary
								</p>
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className='flex justify-center gap-4'>
						<button
							onClick={() => navigate('/nav')}
							className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'>
							Back to Services
						</button>
						<button
							onClick={() => navigate('/upload')}
							className='bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'>
							Upload Documents
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
