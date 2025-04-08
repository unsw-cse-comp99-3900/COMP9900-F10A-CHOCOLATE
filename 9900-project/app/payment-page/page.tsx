"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, CartItem } from "@/lib/CartContext";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [country, setCountry] = useState("Australia");
  const [saveInfo, setSaveInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Error states for each field
  const [errors, setErrors] = useState({
    email: "",
    nameOnCard: "",
    cardNumber: "",
    expireDate: "",
    securityCode: ""
  });

  // Calculate cart total
  const total = cartItems.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input changes and clear errors when user types
  const handleInputChange = (field: string, value: string) => {
    // Clear the error for this field when user types
    setErrors({
      ...errors,
      [field]: ""
    });

    // Update the field value
    switch(field) {
      case 'email':
        setEmail(value);
        break;
      case 'nameOnCard':
        setNameOnCard(value);
        break;
      case 'cardNumber':
        setCardNumber(value);
        break;
      case 'expireDate':
        setExpireDate(value);
        break;
      case 'securityCode':
        setSecurityCode(value);
        break;
      case 'country':
        setCountry(value);
        break;
    }
  };

  async function handlePay() {
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Reset all errors
    const newErrors = {
      email: "",
      nameOnCard: "",
      cardNumber: "",
      expireDate: "",
      securityCode: ""
    };
    
    let hasErrors = false;

    // Validate form fields
    if (!email || !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    if (!nameOnCard) {
      newErrors.nameOnCard = "Please enter the name on your card";
      hasErrors = true;
    }

    // Validation: Card Number must be 16 digits
    const cardRegex = /^\d{16}$/;
    if (!cardRegex.test(cardNumber)) {
      newErrors.cardNumber = "Card number must be exactly 16 digits";
      hasErrors = true;
    }

    // Validation: Expire date must be in MM/YY format
    if (!expireDate || !expireDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expireDate = "Enter date in MM/YY format";
      hasErrors = true;
    }

    // Validation: Security Code must be 3 digits
    const cvcRegex = /^\d{3}$/;
    if (!cvcRegex.test(securityCode)) {
      newErrors.securityCode = "Security code must be 3 digits";
      hasErrors = true;
    }

    // Update error state
    setErrors(newErrors);
    
    // If there are errors, don't proceed
    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Create order items array
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      // Create the order
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: orderItems,
          email,
          shippingAddress: country
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      
      // Clear cart
      clearCart();
      
      // Redirect to success page with the order ID
      router.push(`/payment-success?orderId=${order.id}`);
    } catch (error) {
      console.error("Payment error:", error);
      setErrors({
        ...errors,
        cardNumber: "Payment failed. Please try again."
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col md:flex-row gap-8 bg-white shadow-xl rounded-lg p-6 lg:p-10">
        {/* Order summary - full width on mobile, side by side on larger screens */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <div className="text-xl font-semibold flex justify-between">
            <span>My Order</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="border-t border-b py-4">
            <p className="font-medium">Details of order</p>
            <div className="max-h-60 overflow-y-auto my-2">
              {cartItems.map((item: CartItem) => (
                <p key={item.id} className="text-gray-600 py-1">
                  {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                </p>
              ))}
            </div>
          </div>

          <div className="flex justify-between font-bold text-xl border-t pt-4">
            <span>Total Payment</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment form - full width on mobile, side by side on larger screens */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div>
            <label className="font-medium">Email</label>
            <Input
              placeholder="johnsnow@gmail.com"
              className={`mt-2 rounded-md ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="font-medium">Name on Card</label>
            <Input
              placeholder="John Snow"
              className={`mt-2 rounded-md ${errors.nameOnCard ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={nameOnCard}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('nameOnCard', e.target.value)}
            />
            {errors.nameOnCard && <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>}
          </div>

          <div>
            <label className="font-medium">Card Number</label>
            <Input
              placeholder="1234 5678 9012 3456"
              className={`mt-2 rounded-md ${errors.cardNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={cardNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('cardNumber', e.target.value)}
            />
            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Expire Date</label>
              <Input
                placeholder="MM/YY"
                className={`mt-2 rounded-md ${errors.expireDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={expireDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('expireDate', e.target.value)}
              />
              {errors.expireDate && <p className="text-red-500 text-sm mt-1">{errors.expireDate}</p>}
            </div>

            <div>
              <label className="font-medium">Security Code</label>
              <Input
                placeholder="123"
                className={`mt-2 rounded-md ${errors.securityCode ? 'border-red-500 focus:ring-red-500' : ''}`}
                value={securityCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('securityCode', e.target.value)}
              />
              {errors.securityCode && <p className="text-red-500 text-sm mt-1">{errors.securityCode}</p>}
            </div>
          </div>

          <div>
            <label className="font-medium">Country</label>
            <Input
              placeholder="Australia"
              className="mt-2 rounded-md"
              value={country}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('country', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveInfo"
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="saveInfo" className="text-sm text-gray-600">
              Save my information for next time
            </label>
          </div>

          <Button
            onClick={handlePay}
            disabled={isSubmitting}
            className="w-full py-2 bg-black text-white hover:bg-black/80"
          >
            {isSubmitting ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}