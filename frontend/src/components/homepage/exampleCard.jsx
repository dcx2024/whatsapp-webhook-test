import React from 'react'
import { Phone, EllipsisVertical, ReceiptText, CircleCheck, CheckCheck, Shield } from 'lucide-react';

const ExampleCard = () => {
    return (
        <section className='bg-[#e5eeff] w-full relative min-h-screen'>
            <div className='absolute top-[-70px] left-1/2 transform -translate-x-1/2 z-[99] flex flex-col justify-center px-4 max-w-md item-center mx-auto top-1 '>
                <div className='flex justify-between items-center bg-[#006c49] py-2 px-2 rounded-xl rounded-br-none rounded-bl-none poxition'>
                    <div className='flex items-center gap-2'>
                        <div className='border rounded-full p-2 bg-[#dce9ff] border-transparent'>
                            <Shield />
                        </div>
                        <div className='flex flex-col text-white text-left'>
                            <h2 className='font-semibold'>EscrowPay bot</h2>
                            <p className='text-xs text-gray-200 font-thin'>24/7 Escrow</p>
                        </div>
                    </div>
                    <div className='flex text-white'>
                        <Phone />
                        <EllipsisVertical />
                    </div>
                </div>
                <div className='bg-surface-bright flex flex-col gap-3  p-3 rounded-xl rounded-tl-none rounded-tr-none'>
                    {/* Outgoing Message Bubble 1 */}
                    <div className='flex justify-end'>
                        <p className='bg-[#d9fdd3] text-gray-800 p-3 rounded-xl rounded-tr-none shadow-sm text-sm max-w-[85%]'>
                            Create order: Vintage Ankara Bag, ₦185,000, Buyer: 08034567890
                            <br />
                            <span className='flex text-[0.5rem] justify-end items-center'>10:40 AM<CheckCheck size={10} /></span>
                        </p>
                    </div>
                    <div className='flex justify-start'>
                        <p className='bg-white p-3 rounded-xl rounded-tl-none max-w-[85%] text-sm'><span className='text-primary font-semibold text-xs flex items-center'><ReceiptText size={12} />Invoice #EP-9021 Created</span>
                            Payment link Generated: <span className='text-primary font-semibold '>EscrowPay.ng/pay/ep-9021</span> <br />
                            Share this link with your buyer.Funds will be held securely.
                            <span className='flex text-[0.5rem] justify-end items-center text-gray-800'>10:40 AM</span>
                        </p>
                    </div>
                    <div className='flex justify-start'>
                        <p className='max-w-[85%] bg-white p-3 rounded-xl rounded-tl-none text-sm'><span className='text-[#00714d] font-semibold flex items-center'><CircleCheck size={12} />Payment Received & Secured!</span>
                            <span className='text-xs text-gray-500 font-semibold'>₦185,000 is securely held in Escrow.You may now dispatch the item.</span><br />

                            <span className='font-bold text-xs '>Delivery Confirmation has been sent to Buyer.(0803***7890)</span>
                            <span className='flex text-[0.5rem] justify-end items-center text-gray-800'>10:40 AM</span>
                        </p>
                    </div>
                    <div className='flex justify-end'>
                        <p className='bg-[#d9fdd3] text-gray-800 p-3 rounded-xl rounded-tr-none shadow-sm text-sm max-w-[85%]'>
                            Release Funds:482901(Enter the OTP received from the buyer)
                            <br />
                            <span className='flex text-[0.5rem] justify-end items-center'>10:40 AM<CheckCheck size={10} /></span>
                        </p>
                    </div>
                     <div className='flex justify-start'>
                        <p className='max-w-[85%] bg-white p-3 rounded-xl rounded-tl-none text-sm'><span className='text-[#00714d] font-semibold flex items-center'><CircleCheck size={12} />Funds Have been released to the Seller</span>
                            
                            <span className='flex text-[0.5rem] justify-end items-center text-gray-800'>10:40 AM</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ExampleCard