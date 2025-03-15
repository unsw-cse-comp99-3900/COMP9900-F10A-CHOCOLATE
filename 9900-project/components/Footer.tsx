import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from './ui/button';

const Footer = () => {
  return (
    <footer className="bg-gray-100  pb-8">
      {/* Newsletter Subscription */}
      <div className="bg-black py-4 mb-4">
        <div className="container mx-auto px-4 lg:px-16">
          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between">
            <div className="text-white text-xl md:text-2xl font-medium mb-4 text-center lg:text-left lg:mb-0 lg:ml-8 lg:text-3xl">
              Don't miss our newsletter!
            </div>
            <div className="flex w-full max-w-xl lg:w-auto lg:mr-8">
              <div className="flex h-12 w-full">
                <input
                  type="email"
                  placeholder="Email address"
                  className="px-6 py-3 rounded-l-full w-full lg:w-[400px] focus:outline-none bg-white border border-gray-300 h-full"
                />
                <Button className="bg-white text-black hover:bg-gray-200 rounded-r-full px-8 h-full font-medium border border-l-0 border-gray-300">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Social Media */}
          <div className="col-span-1 flex flex-col items-center md:items-center md:-mt-6">
            <div className="w-40 h-40 relative mb-2">
              <Image 
                src="/farmerplace-logo.png" 
                alt="Fresh Harvest Logo" 
                fill
                className="object-contain"
              />
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <Link href="#" className="text-gray-600 hover:text-green-600 font-semibold transition-colors">
                <Facebook size={30} />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-green-600 font-semibold transition-colors">
                <Instagram size={30} />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-green-600 font-semibold  transition-colors">
                <Twitter size={30} />
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="col-span-1 flex flex-col items-center md:items-center">
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-center">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-green-600 font-semibold transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shpping" className="text-gray-600 hover:text-green-600 font-semibold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-green-600 font-semibold transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-green-600 font-semibold transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 flex flex-col items-center md:items-center">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-center">
              <li className="text-gray-600">
                <span className="font-medium">Email:</span> info@freshharvest.com
              </li>
              <li className="text-gray-600">
                <span className="font-medium">Phone:</span> +61 2 1234 5678
              </li>
              <li className="text-gray-600">
                <span className="font-medium">Address:</span> 123 Farm Road, Sydney, NSW 2000
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} Fresh Harvest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
