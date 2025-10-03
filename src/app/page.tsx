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
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </AuthLoading>

      <Authenticated>
        {activeView === "dashboard" ? (
          /* Dashboard View - Only for authenticated users */
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
