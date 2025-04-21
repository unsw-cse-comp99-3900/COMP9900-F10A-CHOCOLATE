"use client";

export default function PrivatePolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    Your privacy is important to us. This Privacy Policy explains how Fresh Harvest collects, 
                    uses, and shares information about you when you use our services.
                </p>
            </div>

            {/* Information Collection Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <p className="text-gray-700">
                    We collect information about you when you use our services, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Personal information you provide when creating an account, such as your name, email, 
                        address, and phone number.</li>
                    <li>Payment information, such as credit card details, when you make a purchase.</li>
                    <li>Information about your interactions with our services, including purchase history and 
                        customer support interactions.</li>
                    <li>Technical information, such as your IP address, browser type, and operating system.</li>
                </ul>
            </div>

            {/* How We Use Information Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <p className="text-gray-700">
                    We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Provide, maintain, and improve our services.</li>
                    <li>Process transactions and send you related information, including purchase confirmations 
                        and invoices.</li>
                    <li>Communicate with you about products, services, and events offered by Fresh Harvest and 
                        others, and provide news and information we think will be of interest to you.</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
                    <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities 
                        and protect the rights and property of Fresh Harvest and others.</li>
                </ul>
            </div>

            {/* Information Sharing Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
                <p className="text-gray-700">
                    We may share information about you as follows or as otherwise described in this Privacy Policy:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>With vendors, consultants, and other service providers who need access to such 
                        information to carry out work on our behalf.</li>
                    <li>In response to a request for information if we believe disclosure is in accordance with, 
                        or required by, any applicable law, regulation, or legal process.</li>
                    <li>If we believe your actions are inconsistent with our user agreements or policies, or to 
                        protect the rights, property, and safety of Fresh Harvest or others.</li>
                    <li>With your consent or at your direction.</li>
                </ul>
            </div>

            {/* Your Rights Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <p className="text-gray-700">
                    You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Request access to the personal information we hold about you.</li>
                    <li>Request that we correct or update your personal information.</li>
                    <li>Request that we delete your personal information.</li>
                    <li>Opt out of receiving promotional communications from us by following the instructions 
                        in those communications.</li>
                </ul>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Contact Us</h2>
                <p className="text-gray-700 mb-4">
                    If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="space-y-2">
                    <p className="text-gray-700">
                        <span className="font-semibold">Email:</span> privacy@freshharvest.com
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">Phone:</span> 1-800-FRESH (Monday to Friday, 9 AM - 5 PM)
                    </p>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="text-sm text-gray-600 mt-8">
                <p>
                    * Fresh Harvest reserves the right to modify this Privacy Policy at any time. Any changes 
                    will be reflected on this page with an updated effective date. This policy was last 
                    updated on April 20, 2024.
                </p>
            </div>
        </div>
    );
}
