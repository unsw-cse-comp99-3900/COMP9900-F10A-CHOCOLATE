"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
            placeholder="Search For Products/Farmers"
            className="w-full py-3 px-4 rounded-full border border-black/30 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Search size={20} />
          </button>
        </div>

        {/* Login/Register and Cart */}
        <div className="flex items-center space-x-4">
          {/* Login/Register button */}
          <Button className="bg-black text-white px-6 py-6 rounded hover:bg-black/50 transition-colors">
            Login/Register 
          </Button>

          {/* Shopping cart */}
          <div className="flex items-center">
            <div className="relative">
              <Link href="/cart" className="text-3xl">
                <ShoppingCart />
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
      <nav className="w-full bg-black text-white relative">
        {/* Mobile menu button */}
        <div className="md:hidden flex justify-between items-center px-4 py-3">
          <span className="font-bold text-lg">Menu</span>
          <button 
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <ul className="flex flex-col py-2">
            <li className="py-2 px-4 border-b border-gray-700">
              <Link href="/" className="font-semibold hover:text-gray-300 transition-colors block">
                HOME
              </Link>
            </li>
            <li className="py-2 px-4 border-b border-gray-700">
              <Link href="/shop" className="font-semibold hover:text-gray-300 transition-colors block">
                SHOP
              </Link>
            </li>
            <li className="py-2 px-4 border-b border-gray-700">
              <Link href="/about" className="font-semibold hover:text-gray-300 transition-colors block">
                ABOUT US
              </Link>
            </li>
            <li className="py-2 px-4">
              <Link href="/contact" className="font-semibold hover:text-gray-300 transition-colors block">
                CONTACT US
              </Link>
            </li>
          </ul>
        </div>

        {/* Desktop menu */}
        <ul className="hidden md:flex justify-center space-x-24 py-3">
          <li>
            <Link href="/" className="font-semibold hover:text-gray-300 transition-colors">
              HOME
            </Link>
          </li>
          <li>
            <Link href="/shop" className="font-semibold hover:text-gray-300 transition-colors">
              SHOP
            </Link>
          </li>
          <li>
            <Link href="/about" className="font-semibold hover:text-gray-300 transition-colors">
              ABOUT US
            </Link>
          </li>
          <li>
            <Link href="/contact" className="font-semibold hover:text-gray-300 transition-colors">
              CONTACT US
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
