import React from 'react'
import { Link } from 'react-router-dom'

export const Home = () => {
  return (
    <div>
        {/* <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-blue-600">Saumi Consultancy</h1>
      <a href="#" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Quotation</a>
    </div>
  </header> */}

 
  <section class="py-10">
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
      <Link class="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <h3 class="text-lg font-semibold mb-2">📂 View All Quotations</h3>
        <p class="text-sm">Access and manage all quotations.</p>
      </Link>
      <Link class="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <h3 class="text-lg font-semibold mb-2">📊 Reports / History</h3>
        <p class="text-sm">View history of bills and quotations.</p>
      </Link>
      <Link class="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
        <h3 class="text-lg font-semibold mb-2">👥 Manage Clients</h3>
        <p class="text-sm">Add, edit or delete client information.</p>
      </Link>
    </div>
  </section>

  {/* <section class="py-6">
    <div class="max-w-6xl mx-auto px-4">
      <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
      <ul class="bg-white p-6 rounded shadow space-y-2">
        <li>Quotation #1234 created for XYZ Ltd.</li>
        <li>Bill #5678 generated for ABC Enterprises.</li>
        <li>Client PQR Associates added.</li>
      </ul>
    </div>
  </section> */}

  <section class="bg-gray-50 py-10 mt-5">
    <div class="max-w-4xl mx-auto px-4 text-center">
      <h2 class="text-2xl font-bold text-black-700 mb-4">About RK Technologies</h2>
      <p class="text-gray-700">We help businesses manage their quotations and billing with ease. Our platform provides simple tools to create, view, and track client transactions efficiently and professionally.</p>
    </div>
  </section> 
  <footer class="bg-gray-100 py-6 mt-20 text-center text-sm text-gray-600">
    <p>&copy; 2025 RK Technologies. All rights reserved.</p>
    <p>Contact: info@rktechnologies.com | +91-XXXXXXXXXX</p>
  </footer>
    </div>
  )
}
