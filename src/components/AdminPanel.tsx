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
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Správa objednávek FlekCuts</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Celkem</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Čekající</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potvrzené</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.confirmed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zrušené</CardTitle>
              <XCircle className="h-4 w-4 text-[#3C493F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3C493F]">
                {stats.cancelled}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dnes</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#3C493F]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#3C493F]">
                {stats.today}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFilter("all")}
              className={`font-montserrat ${
                filter === "all"
                  ? "bg-[#3C493F] hover:bg-[#2d3730] text-white"
                  : "bg-white border-2 border-[#3C493F] text-[#3C493F] hover:bg-white hover:text-[#3C493F] hover:border-[#2d3730]"
              } px-6 py-3 rounded-full text-base hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer`}
            >
              <span className="relative z-10">Všechny ({stats.total})</span>
              {filter !== "all" && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d5ddd9] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>}
            </Button>
            <Button
              onClick={() => setFilter("pending")}
              className={`font-montserrat ${
                filter === "pending"
                  ? "bg-[#3C493F] hover:bg-[#2d3730] text-white"
                  : "bg-white border-2 border-[#3C493F] text-[#3C493F] hover:bg-white hover:text-[#3C493F] hover:border-[#2d3730]"
              } px-6 py-3 rounded-full text-base hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer`}
            >
              <span className="relative z-10">Čekající ({stats.pending})</span>
              {filter !== "pending" && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d5ddd9] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>}
            </Button>
            <Button
              onClick={() => setFilter("confirmed")}
              className={`font-montserrat ${
                filter === "confirmed"
                  ? "bg-[#3C493F] hover:bg-[#2d3730] text-white"
                  : "bg-white border-2 border-[#3C493F] text-[#3C493F] hover:bg-white hover:text-[#3C493F] hover:border-[#2d3730]"
              } px-6 py-3 rounded-full text-base hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer`}
            >
              <span className="relative z-10">Potvrzené ({stats.confirmed})</span>
              {filter !== "confirmed" && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d5ddd9] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>}
            </Button>
            <Button
              onClick={() => setFilter("cancelled")}
              className={`font-montserrat ${
                filter === "cancelled"
                  ? "bg-[#3C493F] hover:bg-[#2d3730] text-white"
                  : "bg-white border-2 border-[#3C493F] text-[#3C493F] hover:bg-white hover:text-[#3C493F] hover:border-[#2d3730]"
              } px-6 py-3 rounded-full text-base hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer`}
            >
              <span className="relative z-10">Zrušené ({stats.cancelled})</span>
              {filter !== "cancelled" && <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d5ddd9] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>}
            </Button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <p className="text-gray-500">Žádné objednávky k zobrazení</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(appointment.status)}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Appointment Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appointment.status)}
                        <span className="font-medium capitalize">
                          {appointment.status === "pending" && "Čekající"}
                          {appointment.status === "confirmed" && "Potvrzeno"}
                          {appointment.status === "cancelled" && "Zrušeno"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString(
                            "cs-CZ"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {appointment.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {appointment.customerEmail}
                        </span>
                      </div>
                      {appointment.customerPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {appointment.customerPhone}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-[#3C493F]">
                        {appointment.service}
                      </p>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          Poznámky: {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-fit">
                    {appointment.status === "pending" && (
                      <>
                        <Button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "confirmed")
                          }
                          className="font-montserrat bg-white border-2 border-green-600 text-green-600 hover:bg-white hover:text-green-700 hover:border-green-700 px-4 py-2 rounded-full text-sm hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer"
                        >
                          <CheckCircle className="h-4 w-4 mr-2 inline" />
                          <span className="relative z-10">Potvrdit</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50 to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
                        </Button>
                        <Button
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "cancelled")
                          }
                          className="font-montserrat bg-white border-2 border-red-600 text-red-600 hover:bg-white hover:text-red-700 hover:border-red-700 px-4 py-2 rounded-full text-sm hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer"
                        >
                          <XCircle className="h-4 w-4 mr-2 inline" />
                          <span className="relative z-10">Zrušit</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50 to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
                        </Button>
                      </>
                    )}

                    {appointment.status === "confirmed" && (
                      <Button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "cancelled")
                        }
                        className="font-montserrat bg-white border-2 border-red-600 text-red-600 hover:bg-white hover:text-red-700 hover:border-red-700 px-4 py-2 rounded-full text-sm hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer"
                      >
                        <XCircle className="h-4 w-4 mr-2 inline" />
                        <span className="relative z-10">Zrušit</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50 to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
                      </Button>
                    )}

                    {appointment.status === "cancelled" && (
                      <Button
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "confirmed")
                        }
                        className="font-montserrat bg-white border-2 border-green-600 text-green-600 hover:bg-white hover:text-green-700 hover:border-green-700 px-4 py-2 rounded-full text-sm hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4 mr-2 inline" />
                        <span className="relative z-10">Obnovit</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50 to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
                      </Button>
                    )}

                    <Button
                      onClick={() => handleDelete(appointment._id)}
                      className="font-montserrat bg-white border-2 border-[#3C493F] text-[#3C493F] hover:bg-white hover:text-[#3C493F] hover:border-[#2d3730] px-4 py-2 rounded-full text-sm hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2 inline" />
                      <span className="relative z-10">Smazat</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d5ddd9] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
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
