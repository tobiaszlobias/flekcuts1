"use client";

import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmationDialog from "./ConfirmationDialog";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminPanel() {
  const appointments = useQuery(api.admin.getAllAppointments);
  const stats = useQuery(api.admin.getAppointmentStats);
  const updateStatus = useMutation(api.admin.updateAppointmentStatus);
  const deleteAppointment = useMutation(api.admin.deleteAppointment);

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
    if (filter === "all") return true;
    return appointment.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-[#3C493F]" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 border-green-200";
      case "cancelled":
        return "bg-[#fafbfa] border-[#e5ebe9]";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-crimson italic text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="font-montserrat text-lg text-gray-600">
            Správa všech objednávek FlekCuts
          </p>
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-montserrat text-sm font-semibold text-gray-900 mb-4">Filtrovat objednávky</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setFilter("all")}
              className={`font-montserrat ${
                filter === "all"
                  ? "bg-[#FF6B35] hover:bg-[#E5572C] text-white shadow-md"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#FF6B35] hover:bg-gray-50"
              } px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              Všechny ({stats.total})
            </Button>
            <Button
              onClick={() => setFilter("pending")}
              className={`font-montserrat ${
                filter === "pending"
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                  : "bg-white border-2 border-orange-300 text-orange-700 hover:border-orange-600 hover:bg-orange-50"
              } px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              Čekající ({stats.pending})
            </Button>
            <Button
              onClick={() => setFilter("confirmed")}
              className={`font-montserrat ${
                filter === "confirmed"
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                  : "bg-white border-2 border-green-300 text-green-700 hover:border-green-600 hover:bg-green-50"
              } px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              Potvrzené ({stats.confirmed})
            </Button>
            <Button
              onClick={() => setFilter("cancelled")}
              className={`font-montserrat ${
                filter === "cancelled"
                  ? "bg-gray-600 hover:bg-gray-700 text-white shadow-md"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-600 hover:bg-gray-50"
              } px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              Zrušené ({stats.cancelled})
            </Button>
          </div>
        </div>

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
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
                    appointment.status === "pending" ? "border-orange-200" :
                    appointment.status === "confirmed" ? "border-green-200" :
                    "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left side - Appointment Info */}
                    <div className="flex-1 space-y-4">
                      {/* Service and Status */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-crimson italic text-2xl font-bold text-gray-900 mb-2">
                            {appointment.service}
                          </h4>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(appointment.status)}
                            <span className={`text-sm font-medium ${
                              appointment.status === "confirmed" ? "text-green-700" :
                              appointment.status === "cancelled" ? "text-gray-600" :
                              "text-orange-700"
                            }`}>
                              {appointment.status === "pending" && "Čeká na potvrzení"}
                              {appointment.status === "confirmed" && "Potvrzeno"}
                              {appointment.status === "cancelled" && "Zrušeno"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Datum</p>
                            <p className="font-montserrat text-sm font-semibold text-gray-900">
                              {new Date(appointment.date).toLocaleDateString("cs-CZ", {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
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

                      {/* Customer Info */}
                      <div className="bg-[#FFF9F6] rounded-lg p-4 space-y-2">
                        <p className="text-xs text-gray-500 font-medium mb-2">Zákaznické údaje</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#FF6B35]" />
                            <span className="font-montserrat text-sm font-semibold text-gray-900">
                              {appointment.customerName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#FF6B35]" />
                            <span className="font-montserrat text-sm text-gray-700">
                              {appointment.customerEmail}
                            </span>
                          </div>
                          {appointment.customerPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-[#FF6B35]" />
                              <span className="font-montserrat text-sm text-gray-700">
                                {appointment.customerPhone}
                              </span>
                            </div>
                          )}
                        </div>
                        {appointment.notes && (
                          <div className="mt-3 pt-3 border-t border-orange-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">Poznámka</p>
                            <p className="font-montserrat text-sm text-gray-700">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Action Buttons */}
                    <div className="flex lg:flex-col gap-2 flex-wrap lg:min-w-[160px]">
                      {appointment.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                            className="flex-1 lg:flex-none font-montserrat bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Potvrdit
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                            variant="outline"
                            className="flex-1 lg:flex-none font-montserrat border-2 border-red-600 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Odmítnout
                          </Button>
                        </>
                      )}

                      {appointment.status === "confirmed" && (
                        <Button
                          onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                          variant="outline"
                          className="flex-1 lg:flex-none font-montserrat border-2 border-red-600 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Zrušit
                        </Button>
                      )}

                      {appointment.status === "cancelled" && (
                        <Button
                          onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                          className="flex-1 lg:flex-none font-montserrat bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Obnovit
                        </Button>
                      )}

                      <Button
                        onClick={() => handleDelete(appointment._id)}
                        variant="outline"
                        className="flex-1 lg:flex-none font-montserrat border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Smazat
                      </Button>
                    </div>
                  </div>
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
