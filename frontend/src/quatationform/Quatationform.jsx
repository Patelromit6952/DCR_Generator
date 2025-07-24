import React, { useState } from 'react';

const Quatationform = () => {
    const categories = [
        { name: "SedB", icon: "🏗️", description: "Sed construction services" },
        { name: "Main-Building", icon: "🏢", description: "Core building structure and development" },
        { name: "RCC-Road", icon: "🛣️", description: "Road construction & infrastructure" },
        { name: "PaverBlock", icon: "🧱", description: "Paver block installation" },
        { name: "Electric-StoreRoom", icon: "🏗️", description: "Electric and store room setup and construction" },
        { name: "SecurityCabin", icon: "🚧", description: "Security cabin construction and setup" }, 
    //     { name: "Marriage Hall", icon: "💒", description: "Wedding venue setup" },
    //     { name: "Party Hall", icon: "🎉", description: "Party venue arrangements" },
    //     { name: "Office", icon: "🏢", description: "Office construction & setup" },
    //     { name: "Tanki", icon: "🚰", description: "Water tank services" },
    ];

    const [selectedCategory, setSelectedCategory] = useState('');

    const handleCategorySelect = (categoryName) => {
        setSelectedCategory(categoryName);
    };

    const handleCreateQuotation = (categoryName) => {
        window.location.href = `/dashboard/createform/${categoryName}`;
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
            <div className='max-w mx-auto'>
                {/* Header */}
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-800 mb-2'>Create New Quotation</h1>
                    <p className='text-gray-600'>Choose a category for your quotation</p>
                </div>

                {/* Category Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            onClick={() => handleCategorySelect(category.name)}
                            className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-2 ${
                                selectedCategory === category.name 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-transparent hover:border-blue-200'
                            }`}
                        >
                            <div className='text-center'>
                                <div className='text-4xl mb-4'>{category.icon}</div>
                                <h3 className='text-xl font-bold text-gray-800 mb-2'>{category.name}</h3>
                                <p className='text-gray-600 text-sm mb-4'>{category.description}</p>

                                {/* Button shown only on selected card */}
                                {selectedCategory === category.name ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent parent click
                                            handleCreateQuotation(category.name);
                                        }}
                                        className='mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200'
                                    >
                                        Create Quotation
                                    </button>
                                ) : (
                                    <div className='w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-700 font-medium'>
                                        Select
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Quatationform;
