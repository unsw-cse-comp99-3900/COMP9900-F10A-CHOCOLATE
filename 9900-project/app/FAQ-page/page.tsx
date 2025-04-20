"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h1>
            
            {/* General Questions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">General Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="what-is-fresh-harvest">
                        <AccordionTrigger>What is Fresh Harvest?</AccordionTrigger>
                        <AccordionContent>
                            Fresh Harvest is an online marketplace connecting local farmers directly with customers. 
                            We provide a platform where you can buy fresh, locally-sourced produce directly from 
                            farmers in your area, ensuring both quality and support for local agriculture.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="how-to-start">
                        <AccordionTrigger>How do I get started?</AccordionTrigger>
                        <AccordionContent>
                            Simply create an account by clicking the "Register" button. Choose whether you want to 
                            register as a customer or a farmer. Once registered, you can start browsing products 
                            or set up your store if you're a farmer.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* For Customers */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">For Customers</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="how-to-order">
                        <AccordionTrigger>How do I place an order?</AccordionTrigger>
                        <AccordionContent>
                            Browse through our selection of products, add items to your cart, and proceed to checkout. 
                            You can review your order before confirming. We'll notify you when the farmer accepts 
                            your order and prepares it for delivery.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="payment-methods">
                        <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                        <AccordionContent>
                            We accept major credit cards and debit cards. All payments are processed securely 
                            through our payment system to ensure your financial information is protected.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="order-status">
                        <AccordionTrigger>How can I track my order status?</AccordionTrigger>
                        <AccordionContent>
                            Once you've placed an order, you can track its status in your account dashboard. 
                            Orders progress through several stages: Pending, Prepared, Delivered, and Completed. 
                            You'll receive notifications at each stage of the process.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* For Farmers */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">For Farmers</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="sell-products">
                        <AccordionTrigger>How can I start selling my products?</AccordionTrigger>
                        <AccordionContent>
                            After registering as a farmer, you can create your store profile and start listing 
                            your products. Add product details, including descriptions, prices, quantities, and 
                            photos. Once your store is set up, customers can browse and purchase your products.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="manage-orders">
                        <AccordionTrigger>How do I manage orders?</AccordionTrigger>
                        <AccordionContent>
                            You can manage all orders through your farmer dashboard. When you receive an order, 
                            you can update its status as you prepare and deliver it. The system will automatically 
                            notify customers of any status changes.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="pricing">
                        <AccordionTrigger>How do I set my prices?</AccordionTrigger>
                        <AccordionContent>
                            You have full control over your product pricing. Consider your production costs, 
                            market rates, and desired profit margin. You can update prices at any time through 
                            your product management dashboard.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Support & Contact */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Support & Contact</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="contact-support">
                        <AccordionTrigger>How can I contact support?</AccordionTrigger>
                        <AccordionContent>
                            For any questions or concerns, you can reach our support team through:
                            <ul className="list-disc pl-6 mt-2">
                                <li>Email: support@freshharvest.com</li>
                                <li>Phone: 1-800-FRESH (Monday to Friday, 9 AM - 5 PM)</li>
                                <li>Contact form on our website</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="report-issue">
                        <AccordionTrigger>How do I report an issue with my order?</AccordionTrigger>
                        <AccordionContent>
                            If you experience any issues with your order, you can:
                            <ul className="list-disc pl-6 mt-2">
                                <li>Contact the farmer directly through the messaging system</li>
                                <li>Use the "Report Issue" button on your order details page</li>
                                <li>Contact our support team for immediate assistance</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
  