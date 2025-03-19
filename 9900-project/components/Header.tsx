"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { ShoppingCart, Search, Menu, X, ChevronDown, ChevronRight, User, LogOut } from 'lucide-react';
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
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchType, setSearchType] = useState("product");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileShop = () => {
    setMobileShopOpen(!mobileShopOpen);
  };

  const toggleMobileAbout = () => {
    setMobileAboutOpen(!mobileAboutOpen);
  };
  
  const toggleAccountDropdown = () => {
    setAccountDropdownOpen(!accountDropdownOpen);
  };
  
  const toggleSearchDropdown = () => {
    setSearchDropdownOpen(!searchDropdownOpen);
  };
  
  const setSearchTypeAndClose = (type: string) => {
    setSearchType(type);
    setSearchDropdownOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // stop page from refreshing
    const input = e.currentTarget.input.value;
    router.push(`/search?q=${input}&type=${searchType}`)
  };

  return (
    <header className="w-full">
      {/* Top header section */}
      <div className="w-full bg-gray-100 py-4 px-4 md:px-12 flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <Link href="/" className="w-32 h-16 relative">
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
          <form onSubmit={handleSubmit} className="flex">
            <div className="relative w-24 md:w-32">
              <button 
                type="button"
                onClick={toggleSearchDropdown}
                className="h-full py-3 px-2 border border-r-0 border-black/30 rounded-l-full bg-white flex items-center justify-between w-full text-left"
              >
                <span className="truncate text-sm ml-2 font-semibold">{searchType === "product" ? "Products" : "Farmers"}</span>
                <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />
              </button>
              
              {searchDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-md border border-gray-200 shadow-lg z-50">
                  <button 
                    type="button"
                    onClick={() => setSearchTypeAndClose("product")}
                    className={`block w-full text-left px-4 py-2 ${searchType === "product" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    Products
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSearchTypeAndClose("farmer")}
                    className={`block w-full text-left px-4 py-2 ${searchType === "farmer" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    Farmers
                  </button>
                </div>
              )}
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                name="input"
                placeholder={`Search for ${searchType === "product" ? "products" : "farmers"}...`}
                className="w-full py-3 pl-4 pr-12 border border-black/30 rounded-r-full focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button type="submit" className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Search className="rounded-full h-10 w-10 px-2 bg-black/30 hover:bg-green-600 text-white cursor-pointer" />
              </button>
            </div>
          </form>
        </div>

        {/* Login/Register/My Account and Cart */}
        <div className="flex items-center space-x-4">
         
          {isLoggedIn ? (  // if user is logged in, display My Account droplist button 
            <div className="relative">
              <Button 
                onClick={toggleAccountDropdown}
                className="bg-black text-white px-4 py-5 rounded hover:bg-black/50 transition-colors flex items-center space-x-0 w-36 h-12"
              >
                <User size={20} />
                <span className="">My Account</span>
                <ChevronDown size={20} />
              </Button>
              
         
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-50 py-1">
                  <Link href="/account/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    My Profile
                  </Link>
                  {user?.role === "FARMER" && (
                    <Link href="/account/store" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                      My Store
                    </Link>
                  )}
                  <Link href="/account/orders" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                    My Orders
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (    // if user is not logged in, display Login and Register buttons
            <div className="flex space-x-2">
              <Link href="/login-page">
                <Button className="bg-black text-white px-4 py-5 rounded hover:bg-black/50 transition-colors w-28 h-12">
                  Login
                </Button>
              </Link>
              <Link href="/register-page">
                <Button className="bg-white text-black border border-black px-4 py-5 rounded hover:bg-gray-100 transition-colors w-28 h-12">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Shopping cart */}
          <div className="flex items-center">
            <div className="relative">
              <Link href="/cart" className="text-3xl">
                <ShoppingCart size={25} />
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
                    // TODO: add categories
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
}

export default Header;

