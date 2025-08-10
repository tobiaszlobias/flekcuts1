"use client";

import { useState, useEffect } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import UserAppointments from "@/components/UserAppointments";
import AdminPanel from "@/components/AdminPanel";

export default function Home() {
  const [activeView, setActiveView] = useState<"home" | "dashboard" | "admin">(
    "dashboard"
  );

  useEffect(() => {
    const handleViewChange = (event: CustomEvent) => {
      setActiveView(event.detail);
    };

    window.addEventListener("viewChange", handleViewChange as EventListener);

    return () => {
      window.removeEventListener(
        "viewChange",
        handleViewChange as EventListener
      );
    };
  }, []);

  // Broadcast current view to navbar
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("currentViewChange", { detail: activeView })
    );
  }, [activeView]);

  return (
    <main>
      <AuthLoading>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </AuthLoading>

      <Authenticated>
        {activeView === "dashboard" ? (
          /* Dashboard View */
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="p-4 space-y-6">
              <div className="pt-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Vítejte zpět!
                </h1>
                <p className="text-gray-600 mb-6">
                  Zde můžete spravovat své objednávky
                </p>
              </div>
              <UserAppointments />
            </div>
            <Booking />
            <Footer />
          </div>
        ) : activeView === "admin" ? (
          /* Admin View */
          <AdminPanel />
        ) : (
          /* Home View */
          <>
            <Hero />
            <Services />
            <Booking />
            <Footer />
          </>
        )}
      </Authenticated>

      <Unauthenticated>
        <Hero />
        <Services />
        <div id="objednat" className="text-center p-8 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Ready to book?</h2>
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
              Sign in to book appointment
            </button>
          </SignInButton>
        </div>
        <Footer />
      </Unauthenticated>
    </main>
  );
}
