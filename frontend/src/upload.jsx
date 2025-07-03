import React, { useState } from 'react';

const UploadTest = () => {
	const [file, setFile] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [response, setResponse] = useState(null);
	const [error, setError] = useState(null);
	const [userData, setUserData] = useState(null);
	const [userId, setUserId] = useState(
		() => localStorage.getItem('userId') || null
	);

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (!selectedFile) return;

		const isValidType =
			selectedFile.type === 'application/pdf' ||
			selectedFile.type.startsWith('image/');
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

		const token =
			localStorage.getItem('accessToken') ||
			localStorage.getItem('authToken') ||
			localStorage.getItem('token');
		if (!token) {
			setError('Please login first');
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
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			const data = await res.json();
			console.log('Full upload response object:', data);

			if (!res.ok) throw new Error(data.message || 'Upload failed');
			setResponse(data);

			const extractedUserId = data?.data?.userId;
			console.log('Extracted userId:', extractedUserId);

			if (extractedUserId) {
				setUserId(extractedUserId);
				localStorage.setItem('userId', extractedUserId);
				await fetchUserData(extractedUserId);
			}
		} catch (err) {
			console.error('Upload error:', err);
			setError(err.message || 'Upload failed');
		} finally {
			setUploading(false);
		}
	};

	const fetchUserData = async (id = userId) => {
		if (!id) {
			setError('User ID not available. Please upload a document first.');
			return;
		}

		try {
			const res = await fetch(`http://localhost:8000/api/v1/upload/user/${id}`);
			const data = await res.json();

			if (!res.ok) throw new Error(data.message || 'Failed to fetch user data');

			setUserData(data);
		} catch (err) {
			console.error('Fetch error:', err);
			setError(err.message || 'Failed to fetch user data');
		}
	};

	const formatDate = (dateString) => {
		if (!dateString || dateString === 'Not specified') return 'Not available';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return 'Invalid date';
		}
	};

	const renderUserInfo = (data) => {
		if (!data?.data) return null;
		const user = data.data;

		// Helper function to check if data exists and is not "Not specified"
		const hasValidData = (value) => {
			if (Array.isArray(value)) {
				return (
					value.length > 0 &&
					value.some(
						(item) => item && item !== 'Not specified' && item.trim() !== ''
					)
				);
			}
			return value && value !== 'Not specified' && value.trim() !== '';
		};

		// Helper function to filter out "Not specified" values
		const filterValidData = (array) => {
			return Array.isArray(array)
				? array.filter(
						(item) => item && item !== 'Not specified' && item.trim() !== ''
				  )
				: [];
		};

		return (
			<div className='space-y-8'>
				{/* User Information Card */}
				<div className='bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm'>
					<div className='flex items-center mb-4'>
						<div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3'>
							<span className='text-white font-bold text-lg'>👤</span>
						</div>
						<h3 className='text-2xl font-bold text-blue-300'>
							Patient Information
						</h3>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						<div className='bg-blue-900/20 rounded-lg p-4 border border-blue-400/20'>
							<span className='text-blue-400 text-sm font-medium block mb-1'>
								Full Name
							</span>
							<span className='text-white text-lg font-semibold'>
								{hasValidData(user.name) ? (
									user.name
								) : (
									<span className='text-gray-400 italic'>Not provided</span>
								)}
							</span>
						</div>

						<div className='bg-blue-900/20 rounded-lg p-4 border border-blue-400/20'>
							<span className='text-blue-400 text-sm font-medium block mb-1'>
								Age
							</span>
							<span className='text-white text-lg font-semibold'>
								{hasValidData(user.age?.toString()) ? (
									user.age
								) : (
									<span className='text-gray-400 italic'>Not provided</span>
								)}
							</span>
						</div>

						<div className='bg-blue-900/20 rounded-lg p-4 border border-blue-400/20'>
							<span className='text-blue-400 text-sm font-medium block mb-1'>
								Phone
							</span>
							<span className='text-white text-lg font-semibold'>
								{hasValidData(user.phone) ? (
									user.phone
								) : (
									<span className='text-gray-400 italic'>Not provided</span>
								)}
							</span>
						</div>

						<div className='bg-blue-900/20 rounded-lg p-4 border border-blue-400/20'>
							<span className='text-blue-400 text-sm font-medium block mb-1'>
								Last Medical Update
							</span>
							<span className='text-white text-lg font-semibold'>
								{formatDate(user.lastVisit)}
							</span>
						</div>

						{/* Visit Info */}
						{user.visitInfo?.doctorName &&
							hasValidData(user.visitInfo.doctorName) && (
								<div className='bg-blue-900/20 rounded-lg p-4 border border-blue-400/20'>
									<span className='text-blue-400 text-sm font-medium block mb-1'>
										Doctor
									</span>
									<span className='text-white text-lg font-semibold'>
										{user.visitInfo.doctorName}
									</span>
								</div>
							)}

						{user.visitInfo?.hospitalClinic &&
							hasValidData(user.visitInfo.hospitalClinic) && (
								<div className='bg-blue-900/20 rounded-lg p-4 border border-blue-400/20'>
									<span className='text-blue-400 text-sm font-medium block mb-1'>
										Hospital/Clinic
									</span>
									<span className='text-white text-lg font-semibold'>
										{user.visitInfo.hospitalClinic}
									</span>
								</div>
							)}
					</div>
				</div>

				{/* Diagnosis & Risk Assessment */}
				{user.diagnosis?.primaryDiagnosis &&
					hasValidData(user.diagnosis.primaryDiagnosis) && (
						<div className='bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm'>
							<div className='flex items-center mb-4'>
								<div className='w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3'>
									<span className='text-white font-bold text-lg'>🎯</span>
								</div>
								<h4 className='text-xl font-bold text-red-300'>
									Diagnosis & Assessment
								</h4>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{user.diagnosis.primaryDiagnosis &&
									hasValidData(user.diagnosis.primaryDiagnosis) && (
										<div className='bg-red-900/20 rounded-lg p-4 border border-red-400/20'>
											<span className='text-red-400 text-sm font-medium block mb-1'>
												Primary Diagnosis
											</span>
											<span className='text-red-100 font-medium'>
												{user.diagnosis.primaryDiagnosis}
											</span>
										</div>
									)}

								{user.riskAssessment?.riskLevel && (
									<div className='bg-red-900/20 rounded-lg p-4 border border-red-400/20'>
										<span className='text-red-400 text-sm font-medium block mb-1'>
											Risk Level
										</span>
										<span
											className={`font-medium ${
												user.riskAssessment.riskLevel === 'High'
													? 'text-red-300'
													: user.riskAssessment.riskLevel === 'Medium'
													? 'text-yellow-300'
													: 'text-green-300'
											}`}>
											{user.riskAssessment.riskLevel}
										</span>
									</div>
								)}
							</div>
						</div>
					)}

				{/* Vitals */}
				{user.vitals &&
					Object.values(user.vitals).some((v) => hasValidData(v)) && (
						<div className='bg-gradient-to-r from-cyan-900/30 to-cyan-800/30 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm'>
							<div className='flex items-center mb-4'>
								<div className='w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center mr-3'>
									<span className='text-white font-bold text-lg'>📊</span>
								</div>
								<h4 className='text-xl font-bold text-cyan-300'>Vital Signs</h4>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{Object.entries(user.vitals).map(([key, value]) => {
									if (!hasValidData(value)) return null;
									return (
										<div
											key={key}
											className='bg-cyan-900/20 rounded-lg p-4 border border-cyan-400/20'>
											<span className='text-cyan-400 text-sm font-medium block mb-1'>
												{key
													.replace(/([A-Z])/g, ' $1')
													.replace(/^./, (str) => str.toUpperCase())}
											</span>
											<span className='text-cyan-100 font-medium'>{value}</span>
										</div>
									);
								})}
							</div>
						</div>
					)}

				{/* Medical Information Cards */}
				<div className='grid gap-6'>
					{/* Medical Conditions */}
					<div className='bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 border border-emerald-500/30 rounded-xl p-6 backdrop-blur-sm'>
						<div className='flex items-center mb-4'>
							<div className='w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-3'>
								<span className='text-white font-bold text-lg'>🩺</span>
							</div>
							<h4 className='text-xl font-bold text-emerald-300'>
								Medical Conditions
							</h4>
						</div>

						<div className='bg-emerald-900/20 rounded-lg p-4 border border-emerald-400/20'>
							{hasValidData(user.diseases) ? (
								<div className='grid gap-2'>
									{filterValidData(user.diseases).map((disease, idx) => (
										<div
											key={idx}
											className='flex items-center bg-emerald-800/30 rounded-lg p-3'>
											<span className='w-2 h-2 bg-emerald-400 rounded-full mr-3'></span>
											<span className='text-emerald-100 font-medium'>
												{disease}
											</span>
										</div>
									))}
								</div>
							) : (
								<div className='text-center py-8'>
									<div className='w-16 h-16 mx-auto mb-3 bg-emerald-700/30 rounded-full flex items-center justify-center'>
										<span className='text-emerald-400 text-2xl'>✨</span>
									</div>
									<p className='text-emerald-300 font-medium'>
										No medical conditions recorded
									</p>
									<p className='text-emerald-400/70 text-sm mt-1'>
										Your health profile looks clean!
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Current Medications */}
					<div className='bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm'>
						<div className='flex items-center mb-4'>
							<div className='w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3'>
								<span className='text-white font-bold text-lg'>💊</span>
							</div>
							<h4 className='text-xl font-bold text-purple-300'>
								Current Medications
							</h4>
						</div>

						<div className='bg-purple-900/20 rounded-lg p-4 border border-purple-400/20'>
							{hasValidData(user.medications) ? (
								<div className='grid gap-2'>
									{filterValidData(user.medications).map((med, idx) => (
										<div
											key={idx}
											className='flex items-center bg-purple-800/30 rounded-lg p-3'>
											<span className='w-2 h-2 bg-purple-400 rounded-full mr-3'></span>
											<span className='text-purple-100 font-medium'>{med}</span>
										</div>
									))}
								</div>
							) : (
								<div className='text-center py-8'>
									<div className='w-16 h-16 mx-auto mb-3 bg-purple-700/30 rounded-full flex items-center justify-center'>
										<span className='text-purple-400 text-2xl'>🌟</span>
									</div>
									<p className='text-purple-300 font-medium'>
										No medications recorded
									</p>
									<p className='text-purple-400/70 text-sm mt-1'>
										No current prescriptions on file
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Known Allergies */}
					<div className='bg-gradient-to-r from-orange-900/30 to-orange-800/30 border border-orange-500/30 rounded-xl p-6 backdrop-blur-sm'>
						<div className='flex items-center mb-4'>
							<div className='w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3'>
								<span className='text-white font-bold text-lg'>⚠️</span>
							</div>
							<h4 className='text-xl font-bold text-orange-300'>
								Known Allergies
							</h4>
						</div>

						<div className='bg-orange-900/20 rounded-lg p-4 border border-orange-400/20'>
							{hasValidData(user.allergies) ? (
								<div className='grid gap-2'>
									{filterValidData(user.allergies).map((allergy, idx) => (
										<div
											key={idx}
											className='flex items-center bg-orange-800/30 rounded-lg p-3'>
											<span className='w-2 h-2 bg-orange-400 rounded-full mr-3'></span>
											<span className='text-orange-100 font-medium'>
												{allergy}
											</span>
										</div>
									))}
								</div>
							) : (
								<div className='text-center py-8'>
									<div className='w-16 h-16 mx-auto mb-3 bg-orange-700/30 rounded-full flex items-center justify-center'>
										<span className='text-orange-400 text-2xl'>🛡️</span>
									</div>
									<p className='text-orange-300 font-medium'>
										No known allergies
									</p>
									<p className='text-orange-400/70 text-sm mt-1'>
										No allergic reactions on record
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Treatment Plan */}
					{user.treatmentPlan &&
						(hasValidData(user.treatmentPlan.prescriptions) ||
							hasValidData(user.treatmentPlan.followUp)) && (
							<div className='bg-gradient-to-r from-indigo-900/30 to-indigo-800/30 border border-indigo-500/30 rounded-xl p-6 backdrop-blur-sm'>
								<div className='flex items-center mb-4'>
									<div className='w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mr-3'>
										<span className='text-white font-bold text-lg'>📋</span>
									</div>
									<h4 className='text-xl font-bold text-indigo-300'>
										Treatment Plan
									</h4>
								</div>

								<div className='space-y-4'>
									{hasValidData(user.treatmentPlan.prescriptions) && (
										<div className='bg-indigo-900/20 rounded-lg p-4 border border-indigo-400/20'>
											<span className='text-indigo-400 text-sm font-medium block mb-2'>
												Prescriptions
											</span>
											<div className='space-y-2'>
												{filterValidData(user.treatmentPlan.prescriptions).map(
													(prescription, idx) => (
														<div
															key={idx}
															className='text-indigo-100 bg-indigo-800/30 rounded p-2'>
															{prescription}
														</div>
													)
												)}
											</div>
										</div>
									)}

									{hasValidData(user.treatmentPlan.followUp) && (
										<div className='bg-indigo-900/20 rounded-lg p-4 border border-indigo-400/20'>
											<span className='text-indigo-400 text-sm font-medium block mb-1'>
												Follow-up Instructions
											</span>
											<span className='text-indigo-100'>
												{user.treatmentPlan.followUp}
											</span>
										</div>
									)}
								</div>
							</div>
						)}

					{/* Lab Results */}
					{user.labResults &&
						Object.values(user.labResults).some((arr) => hasValidData(arr)) && (
							<div className='bg-gradient-to-r from-teal-900/30 to-teal-800/30 border border-teal-500/30 rounded-xl p-6 backdrop-blur-sm'>
								<div className='flex items-center mb-4'>
									<div className='w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center mr-3'>
										<span className='text-white font-bold text-lg'>🧪</span>
									</div>
									<h4 className='text-xl font-bold text-teal-300'>
										Lab Results
									</h4>
								</div>

								<div className='grid gap-4'>
									{Object.entries(user.labResults).map(
										([category, results]) => {
											if (!hasValidData(results)) return null;
											return (
												<div
													key={category}
													className='bg-teal-900/20 rounded-lg p-4 border border-teal-400/20'>
													<span className='text-teal-400 text-sm font-medium block mb-2'>
														{category
															.replace(/([A-Z])/g, ' $1')
															.replace(/^./, (str) => str.toUpperCase())}
													</span>
													<div className='space-y-1'>
														{filterValidData(results).map((result, idx) => (
															<div
																key={idx}
																className='text-teal-100 text-sm bg-teal-800/30 rounded p-2'>
																{result}
															</div>
														))}
													</div>
												</div>
											);
										}
									)}
								</div>
							</div>
						)}
				</div>
			</div>
		);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'>
			<div className='container mx-auto px-6 py-20'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent'>
						UPLOAD DOCUMENTS
					</h1>
					<p className='text-xl text-gray-300'>
						Upload medical documents and receive personalized patient insights
					</p>
				</div>

				{/* Upload Section */}
				<div className='max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 mb-8'>
					<div className='space-y-6'>
						{/* File Input */}
						<div>
							<label className='block text-gray-300 mb-2 font-medium'>
								Select Medical Document
							</label>
							<input
								type='file'
								accept='.pdf,image/*'
								onChange={handleFileChange}
								className='w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700'
							/>
							{file && (
								<p className='text-green-400 text-sm mt-2'>
									Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{' '}
									MB)
								</p>
							)}
						</div>

						{/* Error Display */}
						{error && (
							<div className='bg-red-900/50 border border-red-500 rounded-lg p-4'>
								<p className='text-red-300'>{error}</p>
							</div>
						)}

						{/* Upload Button */}
						<button
							onClick={handleUpload}
							disabled={!file || uploading}
							className='w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors'>
							{uploading ? 'Processing...' : 'Upload & Process'}
						</button>

						{/* Fetch Data Button */}
						{userId && (
							<button
								onClick={() => fetchUserData()}
								className='w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'>
								Get My Medical Data
							</button>
						)}
					</div>
				</div>

				{/* Response Display */}
				{response && (
					<div className='max-w-2xl mx-auto bg-green-900/30 border border-green-500 rounded-lg p-6 mb-8'>
						<h3 className='text-green-400 font-semibold mb-2'>
							Upload Successful!
						</h3>
						<p className='text-gray-300'>{response.message}</p>
						{response.data && (
							<p className='text-gray-300 text-sm mt-2'>
								Documents Processed: {response.data.documentsProcessed || 'N/A'}
							</p>
						)}
					</div>
				)}

				{/* User Data Display */}
				{userData && (
					<div className='max-w-6xl mx-auto'>
						<div className='text-center mb-8'>
							<h2 className='text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent'>
								Medical Records Summary
							</h2>
							<p className='text-gray-400'>
								Your comprehensive health profile and medical information
							</p>
						</div>
						{renderUserInfo(userData)}
					</div>
				)}

				{/* Instructions */}
				<div className='max-w-2xl mx-auto mt-8 bg-blue-900/30 border border-blue-500 rounded-lg p-6'>
					<h3 className='font-semibold text-blue-400 mb-3'>Instructions:</h3>
					<ul className='text-gray-300 space-y-2 text-sm'>
						<li>
							• Select a PDF or image file (medical document/prescription)
						</li>
						<li>• File size limit: 10MB</li>
						<li>• Click "Upload & Process" to extract medical data</li>
						<li>
							• Use "Get My Medical Data" to view stored patient information
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default UploadTest;
