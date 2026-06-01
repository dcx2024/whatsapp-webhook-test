import React, { useState } from 'react';

const PaymentForm = () => {
    // 1. Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: ''
    });

    const onChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            // 2. Send both formData AND the token to the backend
            const response = await fetch('http://localhost:3000/api/payment/initialise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    ...formData, 
                    token: token // This is crucial for the backend to get the price
                })
            });

            if (response.ok) {
                const resData = await response.json();
                // 3. Redirect user to Paystack's authorization URL
                if (resData.authorization_url) {
                    window.location.href = resData.authorization_url;
                }
            } else {
                console.error('Error submitting data');
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <section className="flex items-center justify-center min-h-screen">
            <div className="p-8 bg-slate-900 text-white rounded-lg shadow-xl">
                <h2 className="text-xl font-bold mb-4">Complete Your Payment</h2>
                <form onSubmit={onSubmit}>
                    {/* Email */}
                    <div className='flex flex-col py-2'>
                        <label htmlFor='email' className='text-sm mb-1'>Email Address:</label>
                        <input
                            type='email'
                            name='email'
                            required
                            placeholder='Enter your email'
                            value={formData.email}
                            onChange={onChange}
                            className='bg-[#21384A] rounded w-[30vw] px-2 py-2 border border-transparent focus:border-blue-500 outline-none'
                        />
                    </div>

                    {/* Phone Number */}
                    <div className='flex flex-col py-2'>
                        <label htmlFor='phoneNumber' className='text-sm mb-1'>Phone Number:</label>
                        <input
                            type='tel'
                            name='phoneNumber'
                            placeholder='Enter your phone number'
                            value={formData.phoneNumber}
                            onChange={onChange}
                            className='bg-[#21384A] rounded w-[30vw] px-2 py-2 border border-transparent focus:border-blue-500 outline-none'
                        />
                    </div>

                    <div className='py-4'>
                        <button type='submit' className='w-full bg-blue-600 px-4 py-2 rounded font-semibold hover:bg-blue-700 transition'>
                            Proceed to Pay
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default PaymentForm; 