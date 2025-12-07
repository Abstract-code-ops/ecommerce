import React from 'react'
import Image from 'next/image'
import { Boxes, CreditCard, Recycle, Truck } from 'lucide-react'

const WhyUs = () => {
  return (
    <section className='bg-off-bg flex justify-around items-center max-w-7xl p-10 mt-20 mx-auto'>
      
      <div className="flex gap-6 font-inter">
        <span>
          <Recycle strokeWidth={1} size={60} className="mb-4 text-earthy-brown hover:scale-105 cursor-pointer" />
        </span>
        <div className="">
          <h3 className='text-lg'>Recycable Products</h3>
          <p className='text-sm text-black/50'>Made from sustainable materials.</p>
        </div>
      </div>

      <div className="flex gap-6 font-inter">
        <span>
          <Truck strokeWidth={1} size={60} className="mb-4 text-earthy-brown hover:scale-105 cursor-pointer" />
        </span>
        <div className="">
          <h3 className='text-lg'>Fast Delivery</h3>
          <p className='text-sm text-black/50'>Quick and reliable delivery.</p>
        </div>
      </div>

      <div className="flex gap-6 font-inter">
        <span>
          <CreditCard strokeWidth={1} size={60} className="mb-4 text-earthy-brown hover:scale-105 cursor-pointer" />
        </span>
        <div className="">
          <h3 className='text-lg'>Pay online</h3>
          <p className='text-sm text-black/50'>No installments available.</p>
        </div>
      </div>

      <div className="flex gap-6 font-inter">
        <span>
          <Boxes strokeWidth={1} size={60} className="mb-4 text-earthy-brown hover:scale-105 cursor-pointer" />
        </span>
        <div className="">
          <h3 className='text-lg'>Bulk Orders</h3>
          <p className='text-sm text-black/50'>Only on certain products.</p>
        </div>
      </div>
    </section>
  )
}

export default WhyUs