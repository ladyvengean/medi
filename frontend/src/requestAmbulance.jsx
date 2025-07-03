import React, { useState } from 'react';

const RequestAmbulance = () => {
	const [showForm, setShowForm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);
	const [formData, setFormData] = useState({
		patientName: '',
		contactNumber: '',
		pickupAddress: '',
		emergencyType: '',
		additionalInfo: ''
	});

	const emergencyTypes = [
		'Medical Emergency',
		'Accident',
		'Heart Attack',
		'Breathing Problem',
		'Other'
	];

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validation
		if (
			!formData.patientName ||
			!formData.contactNumber ||
			!formData.pickupAddress ||
			!formData.emergencyType
		) {
			setError('Please fill in all required fields');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(
				'http://localhost:8000/api/v1/auth/ambulance-request',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formData)
				}
			);

			const data = await response.json();

			if (response.ok) {
				setSuccess(true);
				setFormData({
					patientName: '',
					contactNumber: '',
					pickupAddress: '',
					emergencyType: '',
					additionalInfo: ''
				});

				// Show success for 4 seconds then reset
				setTimeout(() => {
					setSuccess(false);
					setShowForm(false);
				}, 4000);
			} else {
				throw new Error(data.message || 'Failed to submit ambulance request');
			}
		} catch (err) {
			console.error('Ambulance request error:', err);
			setError(err.message || 'Failed to submit request');
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-green-500 text-6xl mb-4'>🚑</div>
					<h2 className='text-3xl font-bold mb-4 text-green-400'>
						Emergency Request Submitted!
					</h2>
					<p className='text-gray-300 mb-4'>
						Your ambulance request has been received and prioritized.
					</p>
					<div className='bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 max-w-md mx-auto'>
						<p className='text-red-300 font-semibold'>
							Emergency services will contact you shortly!
						</p>
					</div>
					<div className='animate-pulse text-gray-400'>Redirecting...</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'>
			{!showForm ? (
				<div className='container mx-auto px-6 py-20 text-center'>
					{/* Main Section */}
					<h1 className='text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent'>
						REQUEST AMBULANCE
					</h1>
					<p className='text-xl text-gray-300 mb-16 max-w-3xl mx-auto'>
						Emergency medical assistance is just a click away. Fast, reliable
						ambulance service.
					</p>

					{/* Simple Benefits */}
					<div className='mb-16'>
						<div className='bg-gray-800 p-8 rounded-lg mb-6 max-w-2xl mx-auto'>
							<h3 className='text-2xl font-semibold mb-4 text-red-400'>
								Why Choose Our Service?
							</h3>
							<p className='text-gray-300 mb-4'>✓ 24/7 Available</p>
							<p className='text-gray-300 mb-4'>✓ Quick Response Time</p>
							<p className='text-gray-300'>✓ Professional Medical Team</p>
						</div>
					</div>

					{/* Emergency Notice */}
					<div className='bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-16 max-w-2xl mx-auto'>
						<h3 className='text-xl font-bold text-red-400 mb-2'>
							EMERGENCY NOTICE
						</h3>
						<p className='text-gray-300'>
							For life-threatening emergencies, call 108 immediately.
						</p>
					</div>

					{/* CTA Button */}
					<button
						onClick={() => setShowForm(true)}
						className='bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors'>
						Request Ambulance
					</button>
				</div>
			) : (
				/* Form Section */
				<div className='container mx-auto px-6 py-12'>
					<div className='max-w-lg mx-auto bg-gray-800 rounded-lg p-8'>
						<h2 className='text-2xl font-bold text-red-400 mb-6 text-center'>
							Request Ambulance
						</h2>

						{error && (
							<div className='mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg'>
								<p className='text-red-300'>{error}</p>
							</div>
						)}

						<form
							onSubmit={handleSubmit}
							className='space-y-4'>
							<div>
								<label className='block text-gray-300 mb-2'>
									Patient Name *
								</label>
								<input
									type='text'
									name='patientName'
									value={formData.patientName}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
									placeholder='Enter patient name'
									disabled={loading}
									required
								/>
							</div>

							<div>
								<label className='block text-gray-300 mb-2'>
									Contact Number *
								</label>
								<input
									type='tel'
									name='contactNumber'
									value={formData.contactNumber}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
									placeholder='Your phone number'
									disabled={loading}
									required
								/>
							</div>

							<div>
								<label className='block text-gray-300 mb-2'>
									Emergency Type *
								</label>
								<select
									name='emergencyType'
									value={formData.emergencyType}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
									disabled={loading}
									required>
									<option value=''>Select Emergency Type</option>
									{emergencyTypes.map((type) => (
										<option
											key={type}
											value={type}>
											{type}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-gray-300 mb-2'>
									Pickup Address *
								</label>
								<textarea
									name='pickupAddress'
									value={formData.pickupAddress}
									onChange={handleInputChange}
									rows='3'
									className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
									placeholder='Current location address'
									disabled={loading}
									required></textarea>
							</div>

							<div>
								<label className='block text-gray-300 mb-2'>
									Additional Information
								</label>
								<textarea
									name='additionalInfo'
									value={formData.additionalInfo}
									onChange={handleInputChange}
									rows='3'
									className='w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white'
									placeholder='Any additional details (optional)'
									disabled={loading}></textarea>
							</div>

							<div className='flex gap-4 pt-4'>
								<button
									type='button'
									onClick={() => setShowForm(false)}
									className='flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition-colors'
									disabled={loading}>
									Back
								</button>
								<button
									type='submit'
									className='flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors'
									disabled={loading}>
									{loading ? 'Submitting...' : 'Submit Request'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default RequestAmbulance;
