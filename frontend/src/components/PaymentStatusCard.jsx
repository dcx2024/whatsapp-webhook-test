import React from 'react'
import CheckIcon from './CheckIcons'

const PaymentStatusCard = () => {
  return (
    <div className='bg-[#006644] flex flex-col justify-self-center items-center rounded-md max-w-xs p-6'>
        <div className='bg-[#008060] rounded-md w-fit '>
        <CheckIcon size={34} /> 
        
        </div>

        <div className='text-center'>
            <h1 className='text-3xl text-white pt-4 font-bold'>
                Payment Successful
            </h1>
            <p className='hidden'>
                Your transaction has been processed successfully and the funds are held in escrow
            </p>
        </div>
    </div>
  )
}

export default PaymentStatusCard