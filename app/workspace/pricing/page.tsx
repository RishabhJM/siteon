import { PricingTable } from '@clerk/nextjs'
import React from 'react'

function Pricing() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full'>
      <h2 className='font-bold text-4xl '>Pricing</h2>
      <div className='flex w-200 mt-4'>
    <PricingTable />
    </div>
  </div>
  )
}

export default Pricing