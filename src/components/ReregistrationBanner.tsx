"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SignedOut } from "@clerk/nextjs";
import { X } from "lucide-react";
import {
  dismissReregistrationNotice,
  isReregistrationNoticeDismissed,
} from "@/lib/reregistrationNotice";

const ReregistrationBanner = () => {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);
    setDismissed(isReregistrationNoticeDismissed());
  }, []);

  const close = () => {
    dismissReregistrationNotice();
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  return createPortal(
    <SignedOut>
      <div className="fixed inset-x-0 top-0 z-[2147483645] flex h-16 items-center border-b border-[#FF6B35]/30 bg-[#FFF4EE]">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex-1 truncate font-montserrat text-sm text-gray-800">
            <span className="font-semibold text-gray-900">Aktualizovali jsme přihlašování.</span>{" "}
            Registrujte se prosím znovu — objednávky zůstanou zachovány.
          </div>
          <button
            onClick={close}
            aria-label="Zavřít"
            className="shrink-0 rounded-full p-1 text-gray-500 hover:bg-black/5 hover:text-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SignedOut>,
    document.body
  );
};

export default ReregistrationBanner;
