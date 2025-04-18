"use client";

import { FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Search, Menu, X, ChevronDown, ChevronRight, User, LogOut, Wheat, Apple, CandyCane, LeafyGreen, Vegan, ShoppingCart} from 'lucide-react';
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
  
  // Define fixed categories with subcategories
  const categoryData = [
    {
      name: 'Wheat',
      subcategories: ['Whole Wheat', 'Wheat Flour', 'Wheat Bran', 'Semolina', 'Wheat Germ']
    },
    {
      name: 'SugarCane',
      subcategories: ['Raw Sugar', 'Brown Sugar', 'Molasses', 'Jaggery', 'Cane Syrup']
    },
    {
      name: 'Lentils',
      subcategories: ['Red Lentils', 'Green Lentils', 'Yellow Lentils', 'Black Lentils', 'Split Peas']
    },
    {
      name: 'Fruit',
      subcategories: ['Apples', 'Bananas', 'Oranges', 'Berries', 'Grapes']
    },
    {
      name: 'Veggie',
      subcategories: ['Tomatoes', 'Carrots', 'Spinach', 'Broccoli', 'Potatoes']
    }
  ];
  
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
        {/* Mobile view - centered logo container */}
        <div className="w-full flex justify-center md:hidden mb-4">
          <Link href="/" className="w-32 h-16 relative">
            <Image 
              src="/farmerplace-logo.png" 
              alt="Fresh Harvest Logo" 
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>
        
        {/* Desktop view - logo and search in a row */}
        <div className="hidden md:flex items-center md:w-auto md:flex-1">
          {/* Desktop logo */}
          <Link href="/" className="w-32 h-16 relative mr-4 flex-shrink-0">
            <Image 
              src="/farmerplace-logo.png" 
              alt="Fresh Harvest Logo" 
              fill
              className="object-contain"
              priority
            />
          </Link>
          
          {/* Search bar */}
          <div className="relative w-full mx-4">
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
        </div>
        
        {/* Mobile search bar */}
        <div className="relative w-full md:hidden my-2">
          <form onSubmit={handleSubmit} className="flex">
            <div className="relative w-24">
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
          {/* Mobile view - show cart icon here for mobile only */}
          <div className="md:hidden">
            <Link href="/cart" className="relative p-2 hover:bg-gray-200 rounded-full transition-colors">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ShoppingCart size={24} className="text-black" />
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    0
                  </span>
                </div>
                <div className="text-xs font-medium mt-1">$0.00</div>
              </div>
            </Link>
          </div>

          {isLoggedIn ? (  // if user is logged in, display My Account droplist button 
            <>
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
              
              {/* Desktop cart for logged in users */}
              <div className="hidden md:block">
                <Link href="/cart" className="relative p-2 hover:bg-gray-200 rounded-lg transition-colors group">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <ShoppingCart size={24} className="text-black group-hover:text-green-600 transition-colors" />
                      <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        0
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">Your Cart</span>
                      <span className="text-sm font-bold">$0.00</span>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          ) : (    // if user is not logged in, display Login and Register buttons
            <>
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
              
              {/* Desktop cart for guest users - positioned after register button */}
              <div className="hidden md:block">
                <Link href="/cart" className="relative p-2 hover:bg-gray-200 rounded-lg transition-colors group">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <ShoppingCart size={24} className="text-black group-hover:text-green-600 transition-colors" />
                      <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        0
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">Your Cart</span>
                      <span className="text-sm font-bold">$0.00</span>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
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
                  {categoryData.map((category, index) => (
                    <div key={index}>
                      <Link 
                        href={`/product-page/${category.name.toLowerCase()}`} 
                        className="block py-2 px-8 hover:bg-gray-700 font-medium border-b border-gray-700 text-white"
                      >
                        {category.name === 'Wheat' && <Wheat size={20} />}
                        {category.name === 'SugarCane' && <CandyCane size={20} />}
                        {category.name === 'Lentils' && <Vegan size={20} />}
                        {category.name === 'Fruit' && <Apple size={20} />}
                        {category.name === 'Veggie' && <LeafyGreen size={20} />}
                        {category.name}
                      </Link>
                      <div className="ml-4 pl-6 border-l border-gray-700 space-y-1 py-1">
                        {category.subcategories.map((subcategory, subIndex) => (
                          <Link 
                            key={subIndex} 
                            href={`/product-page/${category.name.toLowerCase()}/${subcategory.toLowerCase()}`}
                            className="block py-1 px-4 text-gray-400 hover:text-white text-sm"
                          >
                            {subcategory}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
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
              <div className="absolute hidden group-hover:block top-full left-0 bg-white text-black rounded-md shadow-lg w-auto min-w-[800px] z-50">
                <div className="grid grid-cols-5 gap-8 p-8">
                  {categoryData.map((category, index) => (
                    <div key={index} className="col-span-1">
                      <Link 
                        href={`/product-page/${category.name.toLowerCase()}`}
                        className="flex items-center px-4 py-3 rounded font-semibold text-gray-800 hover:text-green-600 transition-colors text-lg border-b border-gray-200 mb-3"
                      >
                        <span className="mr-2 text-green-600">
                          {category.name === 'Wheat' && <Wheat size={22} />}
                          {category.name === 'SugarCane' && <CandyCane size={22} />}
                          {category.name === 'Lentils' && <LeafyGreen size={22} />}
                          {category.name === 'Fruit' && <Apple size={22} />}
                          {category.name === 'Veggie' && <Vegan size={22} />}
                        </span>
                        {category.name}
                      </Link>
                      <ul className="space-y-2 mt-3">
                        {category.subcategories.map((subcategory, subIndex) => (
                          <li key={subIndex}>
                            <Link 
                              href={`/product-page/${category.name.toLowerCase()}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block px-4 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded"
                            >
                              {subcategory}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
