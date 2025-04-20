"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function ReturnsRefunds() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-6">Returns & Refunds Policy</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    We want you to be completely satisfied with your purchase. Please read our returns 
                    and refunds policy carefully to understand your rights and our procedures.
                </p>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                {/* Quality Guarantee Section */}
                <div className="bg-green-50 p-6 rounded-lg mb-8">
                    <h2 className="text-2xl font-bold text-green-700 mb-4">Our Fresh Quality Guarantee</h2>
                    <p className="text-gray-700">
                        At Fresh Harvest, we stand behind the quality of our products. If you're not 
                        satisfied with the freshness or quality of your produce, we're here to make it right.
                    </p>
                </div>

                {/* Detailed Policies */}
                <div className="mb-8">
                    <Accordion type="single" collapsible className="w-full">
                        {/* Eligible Items */}
                        <AccordionItem value="eligible-items">
                            <AccordionTrigger className="text-lg font-semibold">
                                What Items Are Eligible for Returns?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700 space-y-2">
                                <p>Items eligible for returns/refunds include:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Damaged or bruised produce upon delivery</li>
                                    <li>Items that don't meet our freshness standards</li>
                                    <li>Incorrect items delivered</li>
                                    <li>Missing items from your order</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Timeframe */}
                        <AccordionItem value="timeframe">
                            <AccordionTrigger className="text-lg font-semibold">
                                Return/Refund Timeframe
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700 space-y-2">
                                <ul className="space-y-2">
                                    <li>• Report quality issues within 24 hours of delivery</li>
                                    <li>• Missing or incorrect items must be reported within 24 hours</li>
                                    <li>• Refunds are processed within 3-5 business days</li>
                                    <li>• Credit card refunds may take 5-7 business days to appear</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* How to Request */}
                        <AccordionItem value="request-process">
                            <AccordionTrigger className="text-lg font-semibold">
                                How to Request a Return or Refund
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700 space-y-2">
                                <p>Follow these steps to request a return or refund:</p>
                                <ol className="list-decimal pl-6 space-y-2">
                                    <li>Log into your Fresh Harvest account</li>
                                    <li>Go to your order history</li>
                                    <li>Select the relevant order</li>
                                    <li>Click "Report Issue" and follow the prompts</li>
                                    <li>Include photos of damaged items if applicable</li>
                                </ol>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Refund Methods */}
                        <AccordionItem value="refund-methods">
                            <AccordionTrigger className="text-lg font-semibold">
                                Refund Methods
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700 space-y-2">
                                <p>Refunds will be issued to the original payment method:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Credit/debit card refunds: 5-7 business days</li>
                                    <li>Store credit: Immediate</li>
                                    <li>Alternative refund methods available upon request</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Non-Returnable Items */}
                        <AccordionItem value="non-returnable">
                            <AccordionTrigger className="text-lg font-semibold">
                                Non-Returnable Items
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700 space-y-2">
                                <p>The following items cannot be returned:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Items damaged after delivery due to improper storage</li>
                                    <li>Products with quality issues not reported within 24 hours</li>
                                    <li>Items marked as "Final Sale"</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {/* Contact Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Need Help?</h2>
                    <p className="text-gray-700 mb-4">
                        If you have any questions about our returns and refunds policy or need assistance 
                        with a return, our customer service team is here to help.
                    </p>
                    <div className="space-y-2">
                        <p className="text-gray-700">
                            <span className="font-semibold">Email:</span> support@freshharvest.com
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Phone:</span> 1-800-FRESH (Monday to Friday, 9 AM - 5 PM)
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="text-sm text-gray-600 mt-8">
                    <p>
                        * Fresh Harvest reserves the right to modify these policies at any time. Any changes 
                        will be reflected on this page with an updated effective date. This policy was last 
                        updated on April 20, 2024.
                    </p>
                </div>
            </div>
        </div>
    );
}
