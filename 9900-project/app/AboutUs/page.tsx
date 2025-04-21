export default function AboutUs() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-6">About Fresh Harvest</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Connecting local farmers with conscious consumers to build a sustainable, 
                    transparent, and community-driven food system.
                </p>
            </div>

            {/* Mission Section */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-green-600">Our Mission</h2>
                    <p className="text-gray-700">
                        At Fresh Harvest, we're on a mission to revolutionize the way people access fresh, 
                        locally-grown produce. We believe in creating a direct bridge between farmers and 
                        consumers, eliminating unnecessary intermediaries and ensuring both parties benefit 
                        from a more efficient and transparent marketplace.
                    </p>
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-green-600">Our Vision</h2>
                    <p className="text-gray-700">
                        We envision a future where every community has direct access to fresh, locally-sourced 
                        produce, where farmers receive fair compensation for their hard work, and where 
                        sustainable agriculture is the norm, not the exception.
                    </p>
                </div>
            </div>

            {/* Values Section */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">Our Core Values</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 text-green-700">Sustainability</h3>
                        <p className="text-gray-700">
                            We promote environmentally conscious farming practices and support local agriculture 
                            to reduce food miles and environmental impact.
                        </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 text-green-700">Transparency</h3>
                        <p className="text-gray-700">
                            We believe in complete transparency in our operations, pricing, and the journey of 
                            food from farm to table.
                        </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 text-green-700">Community</h3>
                        <p className="text-gray-700">
                            We're building a strong community of farmers and consumers who share our vision 
                            of a better, more sustainable food system.
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8 text-center">How Fresh Harvest Works</h2>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-green-600">For Farmers</h3>
                        <ul className="space-y-4 text-gray-700">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Create your digital storefront and showcase your products
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Set your own prices and manage your inventory
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Connect directly with customers and receive orders
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Grow your business with our support and tools
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-green-600">For Customers</h3>
                        <ul className="space-y-4 text-gray-700">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Browse and buy fresh produce directly from local farmers
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Know exactly where your food comes from
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Support local agriculture and sustainable practices
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                Enjoy convenient delivery of fresh, seasonal produce
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Join Us Section */}
            <div className="text-center bg-green-50 p-12 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Join Our Growing Community</h2>
                <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                    Whether you're a farmer looking to expand your reach or a consumer seeking fresh, 
                    local produce, Fresh Harvest is here to connect you with the future of food.
                </p>
                <div className="flex justify-center gap-4">
                    <a 
                        href="/register-page" 
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Get Started
                    </a>
                    <a 
                        href="/FAQ-page" 
                        className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
}