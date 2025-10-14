"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function UserAppointments() {
  const { user } = useUser();
  const appointments = useQuery(api.appointments.getMyAppointments);
  const cancelAppointment = useMutation(api.appointments.cancelAppointment);

  // Add manual linking function as backup
  const manualLinkAppointments = useMutation(
    api.appointments.manualLinkAppointments
  );
  const [isLinking, setIsLinking] = useState(false);
  const [hasTriedLinking, setHasTriedLinking] = useState(false);

  // Manual linking function as a backup
  const handleManualLink = async () => {
    if (!user?.primaryEmailAddress?.emailAddress || isLinking) return;

    setIsLinking(true);
    try {
      const result = await manualLinkAppointments({
        email: user.primaryEmailAddress.emailAddress,
      });
      console.log("Manual linking result:", result);
      // Force refetch by not doing anything - the query will automatically refetch
    } catch (error) {
      console.error("Manual linking failed:", error);
    } finally {
      setIsLinking(false);
      setHasTriedLinking(true);
    }
  };

  // Auto-attempt manual linking if user has no appointments but hasn't tried yet
  useEffect(() => {
    if (
      user?.primaryEmailAddress?.emailAddress &&
      appointments?.length === 0 &&
      !hasTriedLinking &&
      !isLinking
    ) {
      console.log(
        "Auto-attempting to link appointments for:",
        user.primaryEmailAddress.emailAddress
      );
      handleManualLink();
    }
  }, [user, appointments, hasTriedLinking, isLinking]);

  const handleCancel = async (appointmentId: Id<"appointments">) => {
    try {
      await cancelAppointment({ appointmentId });
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  if (appointments === undefined) {
    return <div className="p-4">Načítání objednávek...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Vaše objednávky</h2>

        {/* Show manual link option if user just signed in */}
        {!hasTriedLinking && user?.primaryEmailAddress?.emailAddress && (
          <div className="mb-4 p-3 bg-white border border-[#e5ebe9] rounded-lg">
            <p className="text-sm text-[#3C493F] mb-2">
              Máte již nějaké objednávky na email{" "}
              {user.primaryEmailAddress.emailAddress}?
            </p>
            <button
              onClick={handleManualLink}
              disabled={isLinking}
              className="text-sm bg-[#3C493F] text-white px-3 py-1 rounded hover:bg-[#2d3730] disabled:opacity-50"
            >
              {isLinking ? "Propojuji..." : "Propojit existující objednávky"}
            </button>
          </div>
        )}

        <p className="text-gray-600">
          {hasTriedLinking
            ? "Nemáte žádné objednávky. Objednejte si svou první službu níže!"
            : "Zatím nemáte žádné objednávky. Objednejte si svou první službu níže!"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Vaše objednávky</h2>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment._id}
            className={`p-4 border rounded-lg ${
              appointment.status === "cancelled"
                ? "bg-[#fafbfa] border-[#e5ebe9]"
                : appointment.status === "confirmed"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{appointment.service}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.date).toLocaleDateString("cs-CZ")} v{" "}
                  {appointment.time}
                </p>
                <p className="text-sm text-gray-600">
                  Zákazník: {appointment.customerName}
                </p>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    Poznámky: {appointment.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === "cancelled"
                      ? "bg-[#f0f3f2] text-[#3C493F]"
                      : appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment.status === "cancelled"
                    ? "Zrušeno"
                    : appointment.status === "confirmed"
                      ? "Potvrzeno"
                      : "Čeká na potvrzení"}
                </span>
                {appointment.status === "pending" && (
                  <button
                    onClick={() => handleCancel(appointment._id)}
                    className="mt-2 text-[#3C493F] hover:text-[#3C493F] text-sm"
                  >
                    Zrušit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
