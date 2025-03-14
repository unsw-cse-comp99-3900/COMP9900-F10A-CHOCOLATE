"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { ShoppingCart, Search, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils";


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileShop = () => {
    setMobileShopOpen(!mobileShopOpen);
  };

  const toggleMobileAbout = () => {
    setMobileAboutOpen(!mobileAboutOpen);
  };

  return (
    <header className="w-full">
      {/* Top header section */}
      <div className="w-full bg-gray-100 py-4 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <Link href="/" className="w-48 h-16 relative">
          <Image 
            src="/farmerplace-logo.png" 
            alt="Fresh Harvest Logo" 
            fill
            className="object-contain"
            priority
          />
        </Link>

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
            
            <li className="border-b border-gray-700">
              <div className="py-2 px-4">
                <button 
                  onClick={toggleMobileShop}
                  className="font-semibold hover:text-gray-300 transition-colors flex items-center w-full justify-between"
                >
                  <span>SHOP</span>
                  {mobileShopOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
              {mobileShopOpen && (
                <div className="bg-gray-800 py-1">
                  <Link href="/shop/categories" className="block py-2 px-8 hover:bg-gray-700">
                    Categories
                  </Link>
                </div>
              )}
            </li>
            
            <li className="border-b border-gray-700">
              <div className="py-2 px-4">
                <button 
                  onClick={toggleMobileAbout}
                  className="font-semibold hover:text-gray-300 transition-colors flex items-center w-full justify-between"
                >
                  <span>ABOUT US</span>
                  {mobileAboutOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
              {mobileAboutOpen && (
                <div className="bg-gray-800 py-1">
                  <Link href="/about" className="block py-2 px-8 hover:bg-gray-700">
                    About Us
                  </Link>
                  <Link href="/faq" className="block py-2 px-8 hover:bg-gray-700">
                    FAQs
                  </Link>
                </div>
              )}
            </li>
            
            <li className="py-2 px-4">
              <Link href="/contact" className="font-semibold hover:text-gray-300 transition-colors block">
                CONTACT US
              </Link>
            </li>
          </ul>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex justify-center py-3 bg-black">
          <div className="flex space-x-16">
            <Link href="/" className="text-white font-semibold hover:text-gray-300 transition-colors px-4 py-2">
              HOME
            </Link>
            
            <div className="relative group">
              <button className="text-white font-semibold hover:text-gray-300 transition-colors px-4 py-2 flex items-center">
                SHOP
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute hidden group-hover:block top-full left-0 bg-white text-black rounded-md shadow-lg w-[200px] z-50">
                <div className="py-2">
                  <Link href="/shop/categories" className="block px-4 py-2 hover:bg-gray-100">
                    Categories
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <button className="text-white font-semibold hover:text-gray-300 transition-colors px-4 py-2 flex items-center">
                ABOUT US
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute hidden group-hover:block top-full left-0 bg-white text-black rounded-md shadow-lg w-[200px] z-50">
                <div className="py-2">
                  <Link href="/about" className="block px-4 py-2 hover:bg-gray-100">
                    About Us
                  </Link>
                  <Link href="/faq" className="block px-4 py-2 hover:bg-gray-100">
                    FAQs
                  </Link>
                </div>
              </div>
            </div>
            
            <Link href="/contact" className="text-white font-semibold hover:text-gray-300 transition-colors px-4 py-2">
              CONTACT US
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

