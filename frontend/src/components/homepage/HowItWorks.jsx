import React from 'react';
import { MessageSquareText, Link2, MailCheck, UserKey } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section className="bg-[#e5eeff] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How EscrowPay works
          </h1>
          <p className="text-lg text-gray-600">
            Four simple steps to stress-free selling on WhatsApp and social media
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
            <h3 className="flex items-center gap-3 font-semibold text-gray-900 mb-2">
              <MessageSquareText size={20} className="text-blue-600" />
              Message EscrowPay on WhatsApp
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Send item details, amount, and customer phone number. EscrowPay instantly generates a secure payment invoice link.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
            <h3 className="flex items-center gap-3 font-semibold text-gray-900 mb-2">
              <Link2 size={20} className="text-blue-600" />
              Link is sent to the customer
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              The link gets sent to the customer automatically, and funds are locked safely in escrow once they pay.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
            <h3 className="flex items-center gap-3 font-semibold text-gray-900 mb-2">
              <MailCheck size={20} className="text-blue-600" />
              Buyer receives a delivery OTP
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Once payment is verified, the buyer automatically gets a secret 6-digit delivery confirmation code.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
            <h3 className="flex items-center gap-3 font-semibold text-gray-900 mb-2">
              <UserKey size={20} className="text-blue-600" />
              Enter OTP to release funds
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Once the item has been delivered, collect the OTP from the buyer and send it to EscrowPay for the immediate release of funds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;