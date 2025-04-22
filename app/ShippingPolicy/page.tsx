"use client";

export default function ShippingPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-6">Shipping Policy</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    Our shipping policy outlines delivery timeframes, fees, methods, and other important 
                    information to ensure your Fresh Harvest order reaches you in optimal condition.
                </p>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
                {/* Shipping Area */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Shipping Area</h2>
                    <p className="text-gray-700 mb-4">
                        Fresh Harvest currently offers delivery to the following regions:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Sydney Metropolitan Area</li>
                        <li>Greater Sydney Region (up to 50km from CBD)</li>
                        <li>Select areas in New South Wales</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                        We're continuously expanding our delivery network. If your area isn't currently serviced, 
                        please check back periodically or contact our customer service team to inquire about 
                        future coverage plans.
                    </p>
                </div>

                {/* Delivery Options */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Delivery Options</h2>
                    <div className="space-y-4">
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2 text-green-700">Standard Delivery</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li><span className="font-medium">Timeframe:</span> 1-3 business days</li>
                                <li><span className="font-medium">Cost:</span> $8.95 for orders under $100</li>
                                <li><span className="font-medium">Free shipping:</span> For orders over $100</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2 text-green-700">Express Delivery</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li><span className="font-medium">Timeframe:</span> Next business day (for orders placed before 12pm)</li>
                                <li><span className="font-medium">Cost:</span> $14.95</li>
                                <li><span className="font-medium">Available areas:</span> Sydney Metropolitan Area only</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-2 text-green-700">Same-Day Delivery</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li><span className="font-medium">Timeframe:</span> Same day (for orders placed before 10am)</li>
                                <li><span className="font-medium">Cost:</span> $19.95</li>
                                <li><span className="font-medium">Available areas:</span> Select Sydney suburbs only</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Order Processing */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Order Processing</h2>
                    <p className="text-gray-700 mb-4">
                        Orders are typically processed within 24 hours of placement. During peak periods or 
                        holidays, processing time may be slightly longer. You will receive a confirmation email 
                        once your order has been processed and another notification when it's out for delivery.
                    </p>
                </div>

                {/* Shipping Methods & Partners */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Shipping Methods & Partners</h2>
                    <p className="text-gray-700 mb-4">
                        We partner with local couriers and delivery services that specialize in handling fresh 
                        produce. Our shipping methods prioritize maintaining the freshness and quality of your 
                        items during transit.
                    </p>
                    <p className="text-gray-700 mb-4">
                        All items are carefully packaged in insulated containers with eco-friendly cooling 
                        materials to ensure your produce arrives in optimal condition, regardless of the 
                        weather conditions.
                    </p>
                </div>

                {/* Delivery Windows */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Delivery Windows</h2>
                    <p className="text-gray-700 mb-4">
                        Standard deliveries typically occur between 9am-5pm on weekdays. For your convenience, 
                        we offer the following delivery window options:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Morning: 9am-12pm</li>
                        <li>Afternoon: 12pm-5pm</li>
                        <li>Evening: 5pm-8pm (available in select areas, $5 additional fee)</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                        You can select your preferred delivery window during checkout.
                    </p>
                </div>

                {/* Delivery Instructions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Delivery Instructions</h2>
                    <p className="text-gray-700 mb-4">
                        During checkout, you have the option to provide special delivery instructions to our 
                        couriers. This may include gate codes, preferred placement locations, or other specific 
                        requests to ensure successful delivery.
                    </p>
                    <p className="text-gray-700 mb-4">
                        If no one is available to receive the delivery, our couriers will follow your instructions 
                        for safe placement of your order. Please note that Fresh Harvest cannot be responsible for 
                        theft or spoilage if special care instructions aren't provided.
                    </p>
                </div>

                {/* Tracking Your Order */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Tracking Your Order</h2>
                    <p className="text-gray-700 mb-4">
                        Once your order has been dispatched, you'll receive a tracking number via email. You can 
                        use this number to track your delivery's progress through your account dashboard or the 
                        link provided in the email.
                    </p>
                </div>

                {/* Failed Deliveries */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Failed Deliveries</h2>
                    <p className="text-gray-700 mb-4">
                        If a delivery cannot be completed due to incorrect address information, lack of access, 
                        or other issues, our courier will attempt to contact you via phone. If they cannot reach 
                        you, your order will be returned to our facility.
                    </p>
                    <p className="text-gray-700 mb-4">
                        For failed deliveries where Fresh Harvest is not at fault, a re-delivery fee may apply. 
                        Please contact our customer service team to arrange re-delivery.
                    </p>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Shipping Questions?</h2>
                    <p className="text-gray-700 mb-4">
                        If you have any questions about our shipping policy or need assistance with a delivery, 
                        please contact our customer service team at:
                    </p>
                    <div className="space-y-2">
                        <p className="text-gray-700">
                            <span className="font-semibold">Email:</span> shipping@freshharvest.com
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Phone:</span> 1-800-FRESH (Monday to Friday, 9 AM - 5 PM)
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="text-sm text-gray-600 mt-8">
                    <p>
                        * Last updated: May 15, 2024. Fresh Harvest reserves the right to modify this Shipping Policy at any time.
                    </p>
                </div>
            </div>
        </div>
    );
} 