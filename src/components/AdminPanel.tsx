"use client";

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmationDialog from "./ConfirmationDialog";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Users,
  TrendingUp,
  Phone,
} from "lucide-react";

const timeToMinutes = (time: string) => {
  const [hoursStr, minutesStr = "0"] = time.split(":");
  return Number(hoursStr) * 60 + Number(minutesStr);
};

export default function AdminPanel() {
  const appointments = useQuery(api.admin.getAllAppointments);
  const stats = useQuery(api.admin.getAppointmentStats);
  const updateStatus = useMutation(api.admin.updateAppointmentStatus);
  const deleteAppointment = useMutation(api.admin.deleteAppointment);

  const [mode, setMode] = useState<"overview" | "manage">("overview");
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [appointmentToDeleteId, setAppointmentToDeleteId] = useState<Id<"appointments"> | null>(null);

  const handleStatusUpdate = async (
    appointmentId: Id<"appointments">,
    status: "pending" | "confirmed" | "cancelled"
  ) => {
    try {
      await updateStatus({ appointmentId, status });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Nepodařilo se aktualizovat stav objednávky");
    }
  };

  const handleDelete = async (appointmentId: Id<"appointments">) => {
    setAppointmentToDeleteId(appointmentId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (appointmentToDeleteId) {
      try {
        await deleteAppointment({ appointmentId: appointmentToDeleteId });
        toast.success("Objednávka byla úspěšně smazána.");
      } catch (error) {
        console.error("Failed to delete appointment:", error);
        toast.error("Nepodařilo se smazat objednávku");
      } finally {
        setAppointmentToDeleteId(null);
        setShowConfirmDialog(false);
      }
    }
  };

  const cancelDelete = () => {
    setAppointmentToDeleteId(null);
    setShowConfirmDialog(false);
  };

  if (appointments === undefined || stats === undefined) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>

          {/* Statistics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-300 rounded w-12"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-300 rounded-full w-32"></div>
              ))}
            </div>
          </div>

          {/* Appointments List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border p-6 animate-pulse"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="h-5 bg-gray-300 rounded w-24"></div>
                      <div className="h-5 bg-gray-300 rounded w-32"></div>
                      <div className="h-5 bg-gray-300 rounded w-20"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-4 bg-gray-300 rounded w-40"></div>
                      <div className="h-4 bg-gray-300 rounded w-48"></div>
                    </div>
                    <div className="h-12 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-fit">
                    <div className="h-10 bg-gray-300 rounded-full w-32"></div>
                    <div className="h-10 bg-gray-300 rounded-full w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredAppointments = appointments.filter((appointment) => {
    if (mode === "manage") return true;
    if (filter === "all") return true;
    return appointment.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getCardChrome = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 border-green-200";
      case "cancelled":
        return "bg-red-50 border-red-200";
      default:
        return "bg-orange-50 border-orange-200";
    }
  };

  const sortedAppointments = filteredAppointments
    .slice()
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

  const appointmentsByDate = sortedAppointments.reduce<Record<string, typeof sortedAppointments>>(
    (acc, apt) => {
      (acc[apt.date] ||= []).push(apt);
      return acc;
    },
    {}
  );

  const dateKeys = Object.keys(appointmentsByDate).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-crimson italic text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="font-montserrat text-lg text-gray-600">
              Správa všech objednávek FlekCuts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setMode("overview")}
              className={`font-montserrat ${
                mode === "overview"
                  ? "bg-[#FF6B35] hover:bg-[#E5572C] text-white shadow-sm"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#FF6B35] hover:bg-gray-50"
              } px-4 py-2 rounded-full text-sm font-medium transition-colors`}
            >
              Přehled
            </Button>
            <Button
              onClick={() => {
                setMode("manage");
                setFilter("all");
              }}
              className={`font-montserrat ${
                mode === "manage"
                  ? "bg-[#FF6B35] hover:bg-[#E5572C] text-white shadow-sm"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#FF6B35] hover:bg-gray-50"
              } px-4 py-2 rounded-full text-sm font-medium transition-colors`}
            >
              Upravit
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#FF6B35]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm font-medium text-gray-600">Celkem</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">{stats.pending}</div>
            <div className="text-sm font-medium text-gray-600">Čekající</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.confirmed}</div>
            <div className="text-sm font-medium text-gray-600">Potvrzené</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-600 mb-1">{stats.cancelled}</div>
            <div className="text-sm font-medium text-gray-600">Zrušené</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.today}</div>
            <div className="text-sm font-medium text-gray-600">Dnes</div>
          </div>
        </div>

        {/* Filters (Overview only) */}
        {mode === "overview" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-montserrat text-sm font-semibold text-gray-900 mb-4">
              Filtrovat objednávky
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setFilter("all")}
                className={`font-montserrat ${
                  filter === "all"
                    ? "bg-[#FF6B35] hover:bg-[#E5572C] text-white shadow-sm"
                    : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#FF6B35] hover:bg-gray-50"
                } px-6 py-2.5 rounded-full text-sm font-medium transition-colors`}
              >
                Všechny ({stats.total})
              </Button>
              <Button
                onClick={() => setFilter("pending")}
                className={`font-montserrat ${
                  filter === "pending"
                    ? "bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                    : "bg-white border-2 border-orange-300 text-orange-700 hover:border-orange-600 hover:bg-orange-50"
                } px-6 py-2.5 rounded-full text-sm font-medium transition-colors`}
              >
                Čekající ({stats.pending})
              </Button>
              <Button
                onClick={() => setFilter("confirmed")}
                className={`font-montserrat ${
                  filter === "confirmed"
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    : "bg-white border-2 border-green-300 text-green-700 hover:border-green-600 hover:bg-green-50"
                } px-6 py-2.5 rounded-full text-sm font-medium transition-colors`}
              >
                Potvrzené ({stats.confirmed})
              </Button>
              <Button
                onClick={() => setFilter("cancelled")}
                className={`font-montserrat ${
                  filter === "cancelled"
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    : "bg-white border-2 border-red-300 text-red-700 hover:border-red-600 hover:bg-red-50"
                } px-6 py-2.5 rounded-full text-sm font-medium transition-colors`}
              >
                Zrušené ({stats.cancelled})
              </Button>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-montserrat text-xl font-bold text-gray-900">
              {filter === "all" && `Všechny objednávky (${filteredAppointments.length})`}
              {filter === "pending" && `Čekající objednávky (${filteredAppointments.length})`}
              {filter === "confirmed" && `Potvrzené objednávky (${filteredAppointments.length})`}
              {filter === "cancelled" && `Zrušené objednávky (${filteredAppointments.length})`}
            </h3>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-montserrat text-gray-600">Žádné objednávky k zobrazení</p>
              </div>
            ) : (
              dateKeys.map((date) => (
                <div key={date} className="space-y-2">
                  <div className="sticky top-2 z-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 px-4 py-2 shadow-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-montserrat text-sm font-semibold text-gray-900">
                        {new Date(date + "T00:00:00").toLocaleDateString("cs-CZ", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-montserrat text-xs text-gray-500">
                        ({appointmentsByDate[date].length})
                      </span>
                    </div>
                  </div>

                  {appointmentsByDate[date].map((appointment) => {
                    if (mode === "overview") {
                      return (
                        <div
                          key={appointment._id}
                          className={`rounded-xl border p-3 ${getCardChrome(appointment.status)}`}
                        >
                          <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr_220px] gap-3 items-center">
                            <div className="rounded-lg bg-white/70 border border-white/60 px-3 py-2 text-center">
                              <div className="font-montserrat text-xl font-bold text-gray-900">
                                {appointment.time}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-montserrat text-sm font-semibold text-gray-900 truncate">
                                  {appointment.service}
                                </span>
                                <span
                                  className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                                    appointment.status === "pending"
                                      ? "border-orange-200 bg-white text-orange-700"
                                      : appointment.status === "confirmed"
                                        ? "border-green-200 bg-white text-green-700"
                                        : "border-red-200 bg-white text-red-700"
                                  }`}
                                >
                                  {getStatusIcon(appointment.status)}
                                  {appointment.status === "pending" && "Čeká"}
                                  {appointment.status === "confirmed" && "OK"}
                                  {appointment.status === "cancelled" && "Zrušeno"}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-600 truncate">
                                {appointment.customerName} • {appointment.customerEmail}
                                {appointment.customerPhone ? ` • ${appointment.customerPhone}` : ""}
                              </div>
                            </div>

                            <div className="hidden sm:block text-right">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                  appointment.status === "pending"
                                    ? "border-orange-200 bg-white text-orange-700"
                                    : appointment.status === "confirmed"
                                      ? "border-green-200 bg-white text-green-700"
                                      : "border-red-200 bg-white text-red-700"
                                }`}
                              >
                                {getStatusIcon(appointment.status)}
                                {appointment.status === "pending" && "Čeká na potvrzení"}
                                {appointment.status === "confirmed" && "Potvrzeno"}
                                {appointment.status === "cancelled" && "Zrušeno"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={appointment._id}
                        className={`rounded-xl border p-4 ${getCardChrome(appointment.status)}`}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_auto] gap-4 items-start">
                          <div className="rounded-lg bg-white/70 border border-white/60 p-3">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4" />
                              <p className="font-montserrat text-xs font-medium">
                                {new Date(appointment.date + "T00:00:00").toLocaleDateString("cs-CZ", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-600" />
                              <p className="font-montserrat text-2xl font-bold text-gray-900">
                                {appointment.time}
                              </p>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="font-crimson italic text-xl font-bold text-gray-900 leading-snug">
                                  {appointment.service}
                                </h4>
                                <div className="mt-1 flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium bg-white ${
                                      appointment.status === "pending"
                                        ? "border-orange-200 text-orange-700"
                                        : appointment.status === "confirmed"
                                          ? "border-green-200 text-green-700"
                                          : "border-red-200 text-red-700"
                                    }`}
                                  >
                                    {getStatusIcon(appointment.status)}
                                    {appointment.status === "pending" && "Čeká na potvrzení"}
                                    {appointment.status === "confirmed" && "Potvrzeno"}
                                    {appointment.status === "cancelled" && "Zrušeno"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 rounded-lg border border-white/60 bg-white/70 p-3">
                              <p className="text-xs text-gray-600 font-medium mb-2">Zákazník</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <User className="h-4 w-4 text-[#FF6B35]" />
                                  <span className="font-montserrat text-sm font-semibold text-gray-900 truncate">
                                    {appointment.customerName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                  <Mail className="h-4 w-4 text-[#FF6B35]" />
                                  <span className="font-montserrat text-sm text-gray-700 truncate">
                                    {appointment.customerEmail}
                                  </span>
                                </div>
                                {appointment.customerPhone && (
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Phone className="h-4 w-4 text-[#FF6B35]" />
                                    <span className="font-montserrat text-sm text-gray-700 truncate">
                                      {appointment.customerPhone}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {appointment.notes && (
                                <div className="mt-2 pt-2 border-t border-gray-200/60">
                                  <p className="text-xs text-gray-600 font-medium mb-1">Poznámka</p>
                                  <p className="font-montserrat text-sm text-gray-700 leading-relaxed">
                                    {appointment.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex lg:flex-col gap-2 lg:min-w-[160px]">
                            {appointment.status === "pending" && (
                              <>
                                <Button
                                  onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                                  className="flex-1 lg:flex-none font-montserrat bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Potvrdit
                                </Button>
                                <Button
                                  onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                                  variant="outline"
                                  className="flex-1 lg:flex-none font-montserrat border-2 border-red-600 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Zrušit
                                </Button>
                              </>
                            )}

                            {appointment.status === "confirmed" && (
                              <Button
                                onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                                variant="outline"
                                className="flex-1 lg:flex-none font-montserrat border-2 border-red-600 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Zrušit
                              </Button>
                            )}

                            {appointment.status === "cancelled" && (
                              <>
                                <Button
                                  onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                                  className="flex-1 lg:flex-none font-montserrat bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Obnovit
                                </Button>
                                <Button
                                  onClick={() => handleDelete(appointment._id)}
                                  variant="outline"
                                  className="flex-1 lg:flex-none font-montserrat border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:bg-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Trvale smazat
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Potvrdit smazání objednávky"
        description="Opravdu chcete smazat tuto objednávku? Tato akce je nevratná."
      />
    </div>
  );
}
