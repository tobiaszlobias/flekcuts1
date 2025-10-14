"use client";

import { useState, useEffect } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import UserAppointments from "@/components/UserAppointments";
import AdminPanel from "@/components/AdminPanel";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";
import TermsOfServiceModal from "../components/TermsOfServiceModal";
import BusinessInfoModal from "../components/BusinessInfoModal";
import CookieNotice from "../components/CookieNotice";

export default function Home() {
  const [activeView, setActiveView] = useState<"home" | "dashboard" | "admin">(
    "home"
  );

  // State for all modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showBusinessInfoModal, setShowBusinessInfoModal] = useState(false);

  useEffect(() => {
    const handleViewChange = (event: CustomEvent) => {
      setActiveView(event.detail);
    };

    const handleShowPrivacyPolicy = () => {
      setShowPrivacyModal(true);
    };

    const handleShowTermsOfService = () => {
      setShowTermsModal(true);
    };

    const handleShowBusinessInfo = () => {
      setShowBusinessInfoModal(true);
    };

    // Add all event listeners
    window.addEventListener("viewChange", handleViewChange as EventListener);
    window.addEventListener(
      "showPrivacyPolicy",
      handleShowPrivacyPolicy as EventListener
    );
    window.addEventListener(
      "showTermsOfService",
      handleShowTermsOfService as EventListener
    );
    window.addEventListener(
      "showBusinessInfo",
      handleShowBusinessInfo as EventListener
    );

    return () => {
      // Clean up all event listeners
      window.removeEventListener(
        "viewChange",
        handleViewChange as EventListener
      );
      window.removeEventListener(
        "showPrivacyPolicy",
        handleShowPrivacyPolicy as EventListener
      );
      window.removeEventListener(
        "showTermsOfService",
        handleShowTermsOfService as EventListener
      );
      window.removeEventListener(
        "showBusinessInfo",
        handleShowBusinessInfo as EventListener
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
        {/* Skeleton Loading Screen */}
        <div className="min-h-screen bg-white">
          {/* Navbar Skeleton */}
          <div className="sticky top-0 z-50 bg-white/30 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Skeleton */}
          <div className="px-4 sm:px-6 lg:px-8 bg-white py-48">
            <div className="max-w-7xl mx-auto text-center">
              <div className="h-16 sm:h-20 lg:h-24 w-3/4 bg-gray-200 rounded mx-auto mb-6 animate-pulse"></div>
              <div className="h-8 sm:h-10 w-1/2 bg-gray-200 rounded mx-auto mb-12 animate-pulse"></div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="h-16 w-64 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
                <div className="h-16 w-64 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Services Skeleton */}
          <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="h-12 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
              <div className="space-y-6 mb-12">
                <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthLoading>

      <Authenticated>
        {activeView === "dashboard" ? (
          /* Dashboard View - Only for authenticated users */
          <div className="min-h-screen bg-white">
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
            <Booking /> <Footer />
          </div>
        ) : activeView === "admin" ? (
          /* Admin View */
          <AdminPanel />
        ) : (
          /* Home View - Same as unauthenticated but with auth context */
          <>
            <Hero />
            <Services />
            <Gallery />
            <Booking /> <Footer />
          </>
        )}
      </Authenticated>

      <Unauthenticated>
        {/* Show full site including booking form for unauthenticated users */}
        <Hero />
        <Services />
        <Gallery />
        <Booking /> <Footer />
      </Unauthenticated>

      {/* All Legal Modals */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      <BusinessInfoModal
        isOpen={showBusinessInfoModal}
        onClose={() => setShowBusinessInfoModal(false)}
      />

      {/* Cookie Notice Banner */}
      <CookieNotice />
    </main>
  );
}
