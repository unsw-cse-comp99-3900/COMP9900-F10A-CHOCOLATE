"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FarmerPageIndex() {
  const router = useRouter();

  useEffect(() => {
    // If someone accesses /farmer-page directly, redirect to home page
    router.push("/#farmers");
  }, [router]);

  // Return a loading state while redirection happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Redirecting to farmers list...</p>
    </div>
  );
}