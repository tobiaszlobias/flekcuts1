"use client";

import { useState, useEffect } from "react";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from "@clerk/nextjs";
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

const INITIAL_SKELETON_SESSION_KEY = "flekcuts.initialSkeletonShown";

const LoadingSkeleton = () => (
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

    {/* Gallery Skeleton */}
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto mb-8 sm:mb-12 text-center">
        <div className="h-12 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 w-80 bg-gray-200 rounded mx-auto animate-pulse"></div>
      </div>
      <div className="relative overflow-hidden py-4">
        <div className="flex gap-3 sm:gap-4 lg:gap-6">
          <div className="flex-shrink-0 w-64 h-48 sm:w-[20rem] sm:h-64 lg:w-[24rem] lg:h-80 bg-gray-200 rounded-xl sm:rounded-2xl animate-pulse"></div>
          <div className="flex-shrink-0 w-64 h-48 sm:w-[20rem] sm:h-64 lg:w-[24rem] lg:h-80 bg-gray-200 rounded-xl sm:rounded-2xl animate-pulse"></div>
          <div className="flex-shrink-0 w-64 h-48 sm:w-[20rem] sm:h-64 lg:w-[24rem] lg:h-80 bg-gray-200 rounded-xl sm:rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Booking Skeleton */}
    <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-80 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>
        <div className="bg-gray-100 rounded-xl p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Footer Skeleton */}
    <div className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-56 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="h-64 md:h-72 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [activeView, setActiveView] = useState<"home" | "dashboard" | "admin">(
    "home"
  );
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);

  // State for all modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showBusinessInfoModal, setShowBusinessInfoModal] = useState(false);

  useEffect(() => {
    const alreadyShown =
      window.sessionStorage.getItem(INITIAL_SKELETON_SESSION_KEY) === "1";

    if (alreadyShown) {
      setShowInitialSkeleton(false);
      return;
    }

    // Keep the skeleton a bit longer so images/fonts have time to load,
    // then reveal the page all at once.
    const MIN_MS = 700;
    const MAX_MS = 3000;

    let minElapsed = false;
    let pageLoaded = false;
    let finished = false;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const finish = () => {
      if (finished) return;
      finished = true;
      document.body.style.overflow = previousOverflow;
      setShowInitialSkeleton(false);
      window.sessionStorage.setItem(INITIAL_SKELETON_SESSION_KEY, "1");
    };

    const maybeFinish = () => {
      if (pageLoaded && minElapsed) finish();
    };

    const minTimer = window.setTimeout(() => {
      minElapsed = true;
      maybeFinish();
    }, MIN_MS);

    const maxTimer = window.setTimeout(() => {
      finish();
    }, MAX_MS);

    const onLoad = () => {
      pageLoaded = true;
      maybeFinish();
    };

    if (document.readyState === "complete") {
      pageLoaded = true;
      maybeFinish();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
      <ClerkLoading>
        {/* Skeleton Loading Screen */}
        <LoadingSkeleton />
      </ClerkLoading>

      <ClerkLoaded>
        {showInitialSkeleton && (
          <div className="fixed inset-0 z-50">
            <LoadingSkeleton />
          </div>
        )}

        <SignedIn>
          <div
            className={`transition-opacity duration-300 ${
              showInitialSkeleton ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {activeView === "dashboard" ? (
              <div className="min-h-screen bg-white">
                <div className="p-4 space-y-6">
                  <UserAppointments />
                </div>
                <Booking /> <Footer />
              </div>
            ) : activeView === "admin" ? (
              <AdminPanel />
            ) : (
              <>
                <Hero />
                <Services />
                <Gallery />
                <Booking /> <Footer />
              </>
            )}
          </div>
        </SignedIn>

        <SignedOut>
          <div
            className={`transition-opacity duration-300 ${
              showInitialSkeleton ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <Hero />
            <Services />
            <Gallery />
            <Booking /> <Footer />
          </div>
        </SignedOut>
      </ClerkLoaded>

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
    </main>
  );
}
