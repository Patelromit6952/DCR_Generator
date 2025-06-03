import React from 'react'

const Quatationform = () => {
    const categories = ["Talav","Tanki","Marriege Hall","Party Hall","Office"];


  return (
    <div className='flex justify-center items-center p-2 h-[94vh] bg-white-100'>
        <div className='w-full max-w-md bg-gray-50 p-6 rounded-lg shadow-lg'>
            <h1 className='text-2xl font-bold text-center mb-4'>Create New Quotation</h1>
            <form className=' p-6 rounded-lg '>
                <div className='mb-4'>
                    <label className='block text-gray-700 mb-2'>Client Name</label>
                    <input type="text" required className='w-full px-3 py-2 border border-gray-300 rounded' placeholder='Enter client name' />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 mb-2'>Quotation Date</label>
                    <input type="date" required className='w-full px-3 py-2 border border-gray-300 rounded' />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 mb-2'>Items</label>
                    <select required className='w-full px-3 py-2 border border-gray-300 rounded'>
                        <option value="">Select Item</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className='w-full mt-5 bg-gray-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'>Create Quotation</button>
            </form>
        </div> 
    </div>
  )
}

export default Quatationform