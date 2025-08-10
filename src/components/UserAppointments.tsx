"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function UserAppointments() {
  const appointments = useQuery(api.appointments.getMyAppointments);
  const cancelAppointment = useMutation(api.appointments.cancelAppointment);

  const handleCancel = async (appointmentId: Id<"appointments">) => {
    try {
      await cancelAppointment({ appointmentId });
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  if (appointments === undefined) {
    return <div className="p-4">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
        <p className="text-gray-600">
          No appointments yet. Book your first appointment below!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment._id}
            className={`p-4 border rounded-lg ${
              appointment.status === "cancelled"
                ? "bg-red-50 border-red-200"
                : appointment.status === "confirmed"
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{appointment.service}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.date).toLocaleDateString()} at{" "}
                  {appointment.time}
                </p>
                <p className="text-sm text-gray-600">
                  Customer: {appointment.customerName}
                </p>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    Notes: {appointment.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment.status.charAt(0).toUpperCase() +
                    appointment.status.slice(1)}
                </span>
                {appointment.status === "pending" && (
                  <button
                    onClick={() => handleCancel(appointment._id)}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Cancel
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
