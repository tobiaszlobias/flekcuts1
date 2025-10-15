"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Calendar, Clock, Scissors, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Check if appointment can be cancelled (24 hours before)
  const canCancelAppointment = (date: string, time: string): boolean => {
    const appointmentDateTime = new Date(date + 'T' + time);
    const now = new Date();
    const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil >= 24;
  };

  if (appointments === undefined) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Vaše objednávky</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 border rounded-lg bg-gray-50 border-gray-200 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-6 bg-gray-300 rounded-full w-24"></div>
                  <div className="h-8 bg-gray-300 rounded-full w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Separate upcoming and past appointments
  const now = new Date();
  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.date + 'T' + apt.time);
    return aptDate >= now && apt.status !== "cancelled";
  }).sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()) || [];

  const pastAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.date + 'T' + apt.time);
    return aptDate < now || apt.status === "cancelled";
  }).sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()) || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          icon: CheckCircle2,
          label: "Potvrzeno",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          badgeColor: "bg-green-100 text-green-800"
        };
      case "cancelled":
        return {
          icon: XCircle,
          label: "Zrušeno",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-600",
          badgeColor: "bg-gray-100 text-gray-700"
        };
      default:
        return {
          icon: AlertCircle,
          label: "Čeká na potvrzení",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-700",
          badgeColor: "bg-orange-100 text-orange-800"
        };
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-crimson italic text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
              Moje objednávky
            </h1>
            <p className="font-montserrat text-lg text-gray-600">
              Přehled všech vašich rezervací
            </p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scissors className="w-10 h-10 text-[#FF6B35]" />
              </div>
              <h3 className="font-crimson italic text-2xl font-bold text-gray-900 mb-3">
                Zatím žádné objednávky
              </h3>

              {!hasTriedLinking && user?.primaryEmailAddress?.emailAddress && (
                <div className="mb-6 p-4 bg-[#FFF0E8] border border-[#FF6B35]/20 rounded-xl">
                  <p className="text-sm text-gray-700 mb-3">
                    Máte již nějaké objednávky na email{" "}
                    <span className="font-semibold">{user.primaryEmailAddress.emailAddress}</span>?
                  </p>
                  <Button
                    onClick={handleManualLink}
                    disabled={isLinking}
                    className="font-montserrat bg-[#FF6B35] hover:bg-[#E5572C] text-white px-6 py-2 rounded-full text-sm transition-all duration-200 disabled:opacity-50"
                  >
                    {isLinking ? "Propojuji..." : "Propojit existující objednávky"}
                  </Button>
                </div>
              )}

              <p className="font-montserrat text-gray-600 mb-6">
                {hasTriedLinking
                  ? "Nemáte žádné objednávky. Objednejte si svou první službu!"
                  : "Začněte tím, že si zarezervujete svůj první termín"}
              </p>

              <Button
                onClick={() => {
                  const element = document.getElementById("objednat");
                  if (element) {
                    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                  }
                }}
                className="font-montserrat bg-[#FF6B35] hover:bg-[#E5572C] text-white px-8 py-3 rounded-full text-base font-medium transition-all duration-200 hover:scale-105"
              >
                Objednat termín
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-crimson italic text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Moje objednávky
          </h1>
          <p className="font-montserrat text-lg text-gray-600">
            Celkem {appointments.length} {appointments.length === 1 ? 'objednávka' : appointments.length < 5 ? 'objednávky' : 'objednávek'}
          </p>
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="font-montserrat text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF6B35]" />
              Nadcházející ({upcomingAppointments.length})
            </h2>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const config = getStatusConfig(appointment.status);
                const StatusIcon = config.icon;

                return (
                  <div
                    key={appointment._id}
                    className={`bg-white rounded-xl shadow-sm border ${config.borderColor} p-6 hover:shadow-md transition-shadow duration-200`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left side - Appointment info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Scissors className="w-5 h-5 text-[#FF6B35]" />
                              <h3 className="font-crimson italic text-2xl font-bold text-gray-900">
                                {appointment.service}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${config.textColor}`} />
                              <span className={`text-sm font-medium ${config.textColor}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Datum</p>
                              <p className="font-montserrat text-sm font-semibold text-gray-900">
                                {new Date(appointment.date).toLocaleDateString("cs-CZ", {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Čas</p>
                              <p className="font-montserrat text-sm font-semibold text-gray-900">
                                {appointment.time}
                              </p>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="bg-[#FFF9F6] rounded-lg p-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">Poznámka</p>
                            <p className="font-montserrat text-sm text-gray-700">{appointment.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex flex-col gap-2">
                        {appointment.status === "pending" && (
                          <>
                            {canCancelAppointment(appointment.date, appointment.time) ? (
                              <Button
                                onClick={() => handleCancel(appointment._id)}
                                variant="outline"
                                className="font-montserrat border-2 border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                              >
                                Zrušit objednávku
                              </Button>
                            ) : (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="text-xs text-orange-700 font-medium">
                                  Nelze zrušit objednávku méně než 24 hodin před termínem
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {appointment.status === "confirmed" && (
                          <>
                            {canCancelAppointment(appointment.date, appointment.time) ? (
                              <Button
                                onClick={() => handleCancel(appointment._id)}
                                variant="outline"
                                className="font-montserrat border-2 border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
                              >
                                Zrušit objednávku
                              </Button>
                            ) : (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="text-xs text-orange-700 font-medium text-center">
                                  Nelze zrušit méně než 24h před termínem
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="font-montserrat text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Historie ({pastAppointments.length})
            </h2>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => {
                const config = getStatusConfig(appointment.status);
                const StatusIcon = config.icon;

                return (
                  <div
                    key={appointment._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-75 hover:opacity-100 transition-opacity duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Scissors className="w-4 h-4 text-gray-500" />
                              <h3 className="font-crimson italic text-xl font-bold text-gray-700">
                                {appointment.service}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${config.textColor}`} />
                              <span className={`text-sm font-medium ${config.textColor}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(appointment.date).toLocaleDateString("cs-CZ")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
