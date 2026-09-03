import React from 'react';

const Navbar = () => {
  return (
    <section className="flex justify-between items-center p-4">
      <img src="" alt="Logo" className="w-10 h-10 bg-gray-200" /> 
      
      <div>
        <ul className="flex gap-6">
          <li className="relative group cursor-pointer">
            Home
            {/* The animated underline */}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </li>
          <li className="relative group cursor-pointer">
            How it works
            {/* The animated underline */}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </li>
        </ul>
      </div>

      <div className="flex gap-4 items-center">
        <button className="font-medium hover:text-gray-600 transition-colors">Login</button>
        <button className="bg-primary text-white px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity">
          Register
        </button>
      </div>
    </section>
  );
};

export default Navbar;