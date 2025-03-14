import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';


const Header = () => {
  return (
    <header className="w-full">
      {/* Top header section */}
      <div className="w-full bg-gray-100 py-4 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between">
        {/* Logo placeholder */}
        <div className="w-48 h-16 bg-gray-300 flex items-center justify-center border border-gray-400">
          <div className="w-full h-full relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-auto md:flex-1 mx-4 my-4 md:my-0">
          <input
            type="text"
            placeholder="Search For Products"
            className="w-full py-3 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
      
          </button>
        </div>

        {/* Login/Register and Cart */}
        <div className="flex items-center space-x-4">
          {/* Login/Register button */}
          <Button className="bg-black text-white px-6 py-3 rounded hover:bg-black/30 transition-colors">
            Login/Register
          </Button>

          {/* Shopping cart */}
          <div className="flex items-center">
            <div className="relative">
              <Link href="/cart" className="text-3xl">
               
              </Link>
            </div>
            <div className="ml-2">
              <div className="font-bold">0 items</div>
              <div>AUD $0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="w-full bg-black text-white">
        <ul className="flex justify-center space-x-12 py-4">
          <li>
            <Link href="/" className="font-bold hover:text-gray-300 transition-colors">
              HOME
            </Link>
          </li>
          <li>
            <Link href="/shop" className="font-bold hover:text-gray-300 transition-colors">
              SHOP
            </Link>
          </li>
          <li>
            <Link href="/about" className="font-bold hover:text-gray-300 transition-colors">
              ABOUT US
            </Link>
          </li>
          <li>
            <Link href="/contact" className="font-bold hover:text-gray-300 transition-colors">
              CONTACT US
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
