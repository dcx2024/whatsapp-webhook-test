import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerRegistration = () => {
    const navigate = useNavigate();

    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Verify states
    const [isVerifying, setIsVerifying] = useState(false);
    const [accountName, setAccountName] = useState('');
    const [verificationError, setVerificationError] = useState('');

    // Password toggle state
    const [showPassword, setShowPassword] = useState(false);

    // Fetch banks on component mount
    useEffect(() => {
        fetch('http://localhost:3000/api/payment/fetchbanks')
            .then((response) => response.json())
            .then((data) => {
                setBanks(data.banks);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching Banks:", error);
                setIsLoading(false);
            });
    }, []);

    const [formData, setFormData] = useState({
        full_name: '',
        business_name: '',
        email: '',
        phone_no: '',
        password: '',
        account_no: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        const finalSubmissionData = {
            ...formData,
            bank_code: selectedBank,
            accountName: accountName
        };

        console.log("Submitting seller data:", finalSubmissionData);

        try {
            const response = await fetch('http://localhost:3000/api/seller/register-seller', { // Adjust endpoint as needed
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalSubmissionData)
            });

            if (response.ok) {
                navigate('/dashboard');
            } else {
                const data = await response.json();
                console.error("Registration failed:", data.message);
                alert(data.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const verifyAcct = async (e) => {
        e.preventDefault();

        if (!formData.account_no || !selectedBank) {
            setVerificationError("Please enter an account number and select a bank.");
            return;
        }

        setIsVerifying(true);
        setVerificationError('');
        setAccountName('');

        try {
            const response = await fetch('http://localhost:3000/api/payment/verifyAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    acctNumber: formData.account_no,
                    bankCode: selectedBank
                })
            });

            const data = await response.json();

            if (response.ok) {
                setAccountName(data.accountName);
            } else {
                setVerificationError(data.message || 'Failed to verify account.');
            }
        } catch (error) {
            console.error("Account verification failed:", error);
            setVerificationError("A network error occurred. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <section className='max-w-md mx-auto mt-10 p-6 border-2 border-gray-200 rounded-lg shadow-sm'>
            <h1 className='text-2xl font-bold text-gray-900'>EscrowPay</h1>
            <h2 className='text-lg font-semibold text-gray-700 mt-2'>Seller Registration</h2>
            <p className='text-gray-500 mb-6'>Secure your social commerce transactions</p>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

                <div className='flex flex-col items-start w-full'>
                    <label htmlFor="fullName" className='text-sm font-medium mb-1'>Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className='w-full border border-gray-300 p-2 rounded-md'
                        required
                    />
                </div>

                <div className='flex flex-col items-start w-full'>
                    <label htmlFor="businessName" className='text-sm font-medium mb-1'>Business Name</label>
                    <input
                        type="text"
                        id="businessName"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleChange}
                        className='w-full border border-gray-300 p-2 rounded-md'
                        required
                    />
                </div>

                <div className='flex flex-col items-start w-full'>
                    <label htmlFor="email" className='text-sm font-medium mb-1'>Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className='w-full border border-gray-300 p-2 rounded-md'
                        required
                    />
                </div>

                <div className='flex flex-col items-start w-full'>
                    <label htmlFor="phone" className='text-sm font-medium mb-1'>Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone_no"
                        value={formData.phone_no}
                        onChange={handleChange}
                        className='w-full border border-gray-300 p-2 rounded-md'
                        required
                    />
                </div>

                <div className='flex flex-col items-start w-full'>
                    <label htmlFor="account_no" className='text-sm font-medium mb-1'>Account Number</label>
                    <input
                        type="text"
                        id="account_no"
                        name="account_no"
                        value={formData.account_no}
                        onChange={handleChange}
                        className='w-full border border-gray-300 p-2 rounded-md'
                        required
                    />
                </div>

                <div className='flex flex-col items-start w-full'>
                    <label htmlFor="banks" className='text-sm font-medium mb-1'>Bank</label>
                    <select
                        id="banks"
                        name='banks'
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className='w-full border border-gray-300 p-2 rounded-md bg-white'
                        disabled={isLoading}
                        required
                    >
                        <option value="" disabled>
                            {isLoading ? "Loading banks..." : "Select your bank"}
                        </option>

                        {banks.map((bank, index) => (
                            <option key={bank.id || index} value={bank.code || bank.name}>
                                {bank.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='flex flex-col items-start w-full'>
                    <label htmlFor="password" className='text-sm font-medium mb-1'>Password</label>
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className='w-full border border-gray-300 p-2 pr-16 rounded-md'
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {/* --- Verification Status Messages --- */}
                {accountName && (
                    <div className='w-full p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm'>
                        Verified Name: <span className="font-bold">{accountName}</span>
                    </div>
                )}

                {verificationError && (
                    <div className='w-full p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm'>
                        {verificationError}
                    </div>
                )}

                {/* --- Action Buttons --- */}
                <button
                    type="button"
                    onClick={verifyAcct}
                    disabled={isVerifying || !formData.account_no || !selectedBank}
                    className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${isVerifying || !formData.account_no || !selectedBank
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                >
                    {isVerifying ? 'Verifying Account...' : 'Verify Account'}
                </button>

                <button
                    type="submit"
                    disabled={!accountName || isSubmitting}
                    className={`mt-2 w-full font-semibold py-2 px-4 rounded-md transition-colors ${!accountName || isSubmitting
                            ? 'bg-blue-300 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isSubmitting ? 'Registering...' : 'Register Account'}
                </button>
            </form>
        </section>
    )
}

export default SellerRegistration;