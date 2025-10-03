"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, Phone, Mail, CalendarDays } from "lucide-react";

interface BookingForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  service?: string;
}

// Confirmation Modal Component
const BookingConfirmationModal = ({
  isOpen,
  onClose,
  bookingDetails,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingForm;
}) => {
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("cs-CZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getServicePrice = (serviceName: string): number => {
    const services = [
      { name: "Fade", price: 350 },
      { name: "Klasický střih", price: 250 },
      { name: "Dětský střih - fade", price: 250 },
      { name: "Dětský střih - do ztracena", price: 200 },
      { name: "Vousy", price: 150 },
      { name: "Mytí vlasů", price: 100 },
      { name: "Kompletka", price: 500 },
      { name: "Vlasy do ztracena + Vousy", price: 350 },
    ];
    return services.find((s) => s.name === serviceName)?.price || 0;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Modal - Made more compact */}
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
          {/* Header with success animation */}
          <div className="bg-blue-600 p-4 text-center">
            <div className="animate-bounce mb-2">
              <CheckCircle className="w-12 h-12 text-white mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Objednávka odeslána!
            </h2>
            <p className="text-blue-100 text-sm">
              Brzy vás budeme kontaktovat pro potvrzení
            </p>
          </div>

          {/* Content - More compact */}
          <div className="p-4 space-y-3">
            {/* Booking Details */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
                <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                Detaily objednávky
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jméno:</span>
                  <span className="font-medium text-gray-800">
                    {bookingDetails.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Služba:</span>
                  <span className="font-medium text-gray-800">
                    {bookingDetails.service}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Datum:</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(bookingDetails.date)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Čas:</span>
                  <span className="font-medium text-gray-800">
                    {bookingDetails.time}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-gray-600">Cena:</span>
                  <span className="font-bold text-sm text-green-600">
                    {getServicePrice(bookingDetails.service)} Kč
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                Kontaktní údaje
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-2 text-gray-500" />
                  <span className="text-gray-600">{bookingDetails.email}</span>
                </div>
                {bookingDetails.phone && (
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-2 text-gray-500" />
                    <span className="text-gray-600">
                      {bookingDetails.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                Co bude následovat?
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>Během 24 hodin vás budeme kontaktovat</li>
                <li>Potvrdíme váš termín</li>
                <li>Pošleme vám připomínku den před návštěvou</li>
              </ul>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Rozumím
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length === 0) return "";

  if (numbers.startsWith("420")) {
    const rest = numbers.substring(3);
    if (rest.length === 0) return "+420";
    if (rest.length <= 3) return `+420 ${rest}`;
    if (rest.length <= 6)
      return `+420 ${rest.substring(0, 3)} ${rest.substring(3)}`;
    if (rest.length === 9)
      return `+420 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
    return `+420 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6, 9)}`;
  }

  if (numbers.startsWith("421")) {
    const rest = numbers.substring(3);
    if (rest.length === 0) return "+421";
    if (rest.length <= 3) return `+421 ${rest}`;
    if (rest.length <= 6)
      return `+421 ${rest.substring(0, 3)} ${rest.substring(3)}`;
    if (rest.length === 9)
      return `+421 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
    return `+421 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6, 9)}`;
  }

  if (numbers.startsWith("0")) {
    const localNumber = numbers.substring(1);
    if (localNumber.length === 0) return "0";
    if (localNumber.length <= 3) return `+420 ${localNumber}`;
    if (localNumber.length <= 6)
      return `+420 ${localNumber.substring(0, 3)} ${localNumber.substring(3)}`;
    if (localNumber.length === 9)
      return `+420 ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6)}`;
    return `+420 ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6, 9)}`;
  }

  if (numbers.length <= 3) return `+420 ${numbers}`;
  if (numbers.length <= 6)
    return `+420 ${numbers.substring(0, 3)} ${numbers.substring(3)}`;
  if (numbers.length === 9)
    return `+420 ${numbers.substring(0, 3)} ${numbers.substring(3, 6)} ${numbers.substring(6)}`;
  return `+420 ${numbers.substring(0, 3)} ${numbers.substring(3, 6)} ${numbers.substring(6, 9)}`;
};

const validatePhoneNumber = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, "");
  if (numbers.startsWith("420")) return numbers.length === 12;
  if (numbers.startsWith("421")) return numbers.length === 12;
  return numbers.length >= 10 && numbers.length <= 15;
};

const getPhoneValidationMessage = (phone: string): string => {
  if (!phone) return "";
  const numbers = phone.replace(/\D/g, "");

  if (numbers.startsWith("420")) {
    if (numbers.length < 12) return "České číslo musí mít 9 číslic po +420";
    if (numbers.length > 12) return "Příliš mnoho číslic pro české číslo";
    return "";
  }

  if (numbers.startsWith("421")) {
    if (numbers.length < 12) return "Slovenské číslo musí mít 9 číslic po +421";
    if (numbers.length > 12) return "Příliš mnoho číslic pro slovenské číslo";
    return "";
  }

  if (numbers.length < 10) return "Telefonní číslo je příliš krátké";
  if (numbers.length > 15) return "Telefonní číslo je příliš dlouhé";
  return "";
};

// Enhanced date/time utility functions
const isDateTimeAvailable = (date: string, time: string): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  // Create appointment date in local timezone
  const appointmentDate = new Date(date);
  appointmentDate.setHours(hours, minutes, 0, 0);

  const timeDifference = appointmentDate.getTime() - now.getTime();
  const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);

  // Require at least 2 hours advance notice
  return hoursUntilAppointment >= 2;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Compact Calendar component with inline date/time selection
const CompactDateTimePicker = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableTimeSlots,
  bookedTimes,
}: {
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  availableTimeSlots: string[];
  bookedTimes: string[];
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeSlots, setShowTimeSlots] = useState(!!selectedDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (
      let i = 0;
      i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);
      i++
    ) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const yearStr = currentDate.getFullYear();
      const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const dayStr = currentDate.getDate().toString().padStart(2, "0");
      const dateString = `${yearStr}-${monthStr}-${dayStr}`;
      const dayOfWeek = currentDate.getDay();
      const isToday = new Date().toDateString() === currentDate.toDateString();
      const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
      const isWorking = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
      const isSelected = selectedDate === dateString;

      days.push({
        day,
        dateString,
        dayOfWeek,
        isToday,
        isPast,
        isWorking,
        isSelected,
      });
    }

    return days;
  };

  const isDateSelectable = (
    day: { isWorking: boolean; isPast: boolean } | null
  ): boolean => {
    if (!day) return false;
    return day.isWorking && !day.isPast;
  };

  const handleDateClick = (dateString: string) => {
    onDateSelect(dateString);
    setShowTimeSlots(true);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "Leden",
    "Únor",
    "Březen",
    "Duben",
    "Květen",
    "Červen",
    "Červenec",
    "Srpen",
    "Září",
    "Říjen",
    "Listopad",
    "Prosinec",
  ];

  return (
    <div className="space-y-4">
      {/* Mini Calendar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
              )
            }
            className="p-1 hover:bg-gray-100 rounded text-sm"
          >
            ←
          </button>
          <h3 className="text-sm font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
              )
            }
            className="p-1 hover:bg-gray-100 rounded text-sm"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day) => (
            <div
              key={day}
              className="p-1 text-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-1" />;
            }

            const isSelectable = isDateSelectable(day);

            return (
              <div key={day.dateString} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    isSelectable ? handleDateClick(day.dateString) : null
                  }
                  disabled={!isSelectable}
                  className={`
                    w-full aspect-square text-xs rounded transition-all duration-200 relative
                    ${day.isSelected ? "bg-blue-500 text-white font-semibold" : ""}
                    ${day.isToday && !day.isSelected ? "bg-blue-100 text-blue-700 font-semibold" : ""}
                    ${isSelectable && !day.isSelected && !day.isToday ? "hover:bg-blue-50 text-gray-900" : ""}
                    ${!isSelectable ? "text-gray-300 cursor-not-allowed" : ""}
                  `}
                >
                  <span className="relative z-10">{day.day}</span>
                  {/* Working day indicator */}
                  {day.isWorking && !day.isPast && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Otevřeno</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <span>Zavřeno</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots - Only show when date is selected */}
      {showTimeSlots && selectedDate && (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium mb-2 flex items-center text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Dostupné časy - {formatDate(selectedDate)}
          </h4>

          {availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-4 gap-1.5">
              {availableTimeSlots.map((time) => {
                const isBooked = bookedTimes.includes(time);
                const isAvailable = isDateTimeAvailable(selectedDate, time);
                const canSelect = !isBooked && isAvailable;
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => (canSelect ? onTimeSelect(time) : null)}
                    disabled={!canSelect}
                    className={`
                      p-2 text-xs rounded border transition-all duration-200
                      ${
                        isSelected
                          ? "bg-blue-500 text-white border-blue-500 font-medium"
                          : canSelect
                            ? "border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <Clock className="w-5 h-5 mx-auto mb-1 text-gray-300" />
              <p className="text-xs">V tento den není otevřeno</p>
            </div>
          )}
        </div>
      )}

      {/* Selected appointment summary */}
      {selectedDate && selectedTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-sm font-medium flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Vybraný termín: {formatDate(selectedDate)} v {selectedTime}
          </p>
          {!isDateTimeAvailable(selectedDate, selectedTime) && (
            <p className="text-orange-600 text-xs mt-1">
              ⚠️ Upozornění: Termín je méně než 2 hodiny předem
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Booking = () => {
  const { isSignedIn } = useAuth();
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    service: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceJustSelected, setServiceJustSelected] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingForm | null>(
    null
  );

  const createAppointment = useMutation(api.appointments.createAppointment);
  const createAnonymousAppointment = useMutation(
    api.appointments.createAnonymousAppointment
  );

  const appointmentsForDate = useQuery(
    api.appointments.getAppointmentsByDate,
    bookingForm.date ? { date: bookingForm.date } : "skip"
  );

  const bookedTimes =
    appointmentsForDate?.map((apt: Doc<"appointments">) => apt.time) || [];

  const services = [
    { name: "Fade", price: 350 },
    { name: "Klasický střih", price: 250 },
    { name: "Dětský střih - fade", price: 250 },
    { name: "Dětský střih - do ztracena", price: 200 },
    { name: "Vousy", price: 150 },
    { name: "Mytí vlasů", price: 100 },
    { name: "Kompletka", price: 500 },
    { name: "Vlasy do ztracena + Vousy", price: 350 },
  ];

  const getTimeSlots = (selectedDate: string) => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = date.getDay();

    const timeSlots = {
      1: [
        "9:00",
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
      ],
      2: [
        "9:00",
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
      ],
      3: [
        "9:00",
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
      ],
      4: [
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
      ],
      5: [
        "9:00",
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
      ],
    };

    return timeSlots[dayOfWeek as keyof typeof timeSlots] || [];
  };

  const availableTimeSlots = getTimeSlots(bookingForm.date);

  useEffect(() => {
    const handleServicePreSelection = (event: CustomEvent) => {
      const { serviceName } = event.detail;
      setBookingForm((prev) => ({ ...prev, service: serviceName }));
      setServiceJustSelected(true);
      setTimeout(() => setServiceJustSelected(false), 3000);
    };

    window.addEventListener(
      "preSelectService",
      handleServicePreSelection as EventListener
    );
    return () =>
      window.removeEventListener(
        "preSelectService",
        handleServicePreSelection as EventListener
      );
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!bookingForm.name.trim()) newErrors.name = "Jméno je povinné";
    if (!bookingForm.email.trim()) {
      newErrors.email = "Email je povinný";
    } else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) {
      newErrors.email = "Neplatný formát emailu";
    }

    if (!isSignedIn) {
      if (!bookingForm.phone.trim()) {
        newErrors.phone = "Telefon je povinný";
      } else if (!validatePhoneNumber(bookingForm.phone)) {
        newErrors.phone =
          getPhoneValidationMessage(bookingForm.phone) ||
          "Neplatné telefonní číslo";
      }
    }

    if (!bookingForm.service) newErrors.service = "Služba je povinná";
    if (!bookingForm.date) newErrors.date = "Datum je povinné";
    if (!bookingForm.time) newErrors.time = "Čas je povinný";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isSignedIn) {
        await createAppointment({
          customerName: bookingForm.name,
          customerEmail: bookingForm.email,
          service: bookingForm.service,
          date: bookingForm.date,
          time: bookingForm.time,
        });
      } else {
        await createAnonymousAppointment({
          customerName: bookingForm.name,
          customerEmail: bookingForm.email,
          customerPhone: bookingForm.phone,
          service: bookingForm.service,
          date: bookingForm.date,
          time: bookingForm.time,
        });
      }

      // Store booking details and show confirmation modal
      setConfirmedBooking({ ...bookingForm });
      setShowConfirmationModal(true);

      // Reset form
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        service: "",
      });
      setAttemptedSubmit(false);
    } catch (error: unknown) {
      console.error("Error creating booking:", error);
      if (
        error instanceof Error &&
        error.message?.includes("An appointment already exists at this time.")
      ) {
        toast.error("Tento termín je již obsazen. Zvolte prosím jiný čas.");
      } else {
        toast.error(
          "Nepodařilo se odeslat objednávku. Zkuste to prosím znovu."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateSelect = (date: string) => {
    handleInputChange("date", date);
    handleInputChange("time", ""); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    handleInputChange("time", time);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setConfirmedBooking(null);
  };

  return (
    <section id="objednat" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Objednejte si termín
          </h2>
          <p className="text-xl text-gray-600">
            Dopřejte si profesionální péči
          </p>

          {!isSignedIn && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                💡 Tip:{" "}
                <SignInButton mode="modal">
                  <button className="text-blue-600 hover:text-blue-800 underline font-medium">
                    Přihlaste se
                  </button>
                </SignInButton>{" "}
                pro sledování vašich objednávek
              </p>
            </div>
          )}

          {serviceJustSelected && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-700 font-medium">
                ✅ Služba &quot;{bookingForm.service}&quot; byla automaticky
                vybrána!{" "}
              </p>
            </div>
          )}
        </div>

        <Card className="rounded-xl border-0 shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Celé jméno{" "}
                    {attemptedSubmit && !bookingForm.name.trim() && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`mt-2 rounded-lg ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Zadejte vaše celé jméno"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email{" "}
                    {attemptedSubmit &&
                      (!bookingForm.email.trim() ||
                        !/\S+@\S+\.\S+/.test(bookingForm.email)) && (
                        <span className="text-red-500">*</span>
                      )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`mt-2 rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    placeholder="vas@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {!isSignedIn && (
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Telefon{" "}
                    {attemptedSubmit &&
                      (!bookingForm.phone.trim() ||
                        !validatePhoneNumber(bookingForm.phone)) && (
                        <span className="text-red-500">*</span>
                      )}
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        handleInputChange("phone", formatted);
                      }}
                      onKeyDown={(e) => {
                        if (
                          [8, 9, 27, 13, 46].includes(e.keyCode) ||
                          (e.keyCode === 65 && e.ctrlKey) ||
                          (e.keyCode === 67 && e.ctrlKey) ||
                          (e.keyCode === 86 && e.ctrlKey) ||
                          (e.keyCode === 88 && e.ctrlKey) ||
                          (e.keyCode >= 35 && e.keyCode <= 39)
                        ) {
                          return;
                        }
                        if (
                          (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                          (e.keyCode < 96 || e.keyCode > 105)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`rounded-lg transition-all duration-200 ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : bookingForm.phone &&
                              validatePhoneNumber(bookingForm.phone)
                            ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                            : bookingForm.phone
                              ? "border-yellow-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                      } focus:ring-2`}
                      placeholder="+420 123 456 789"
                    />
                    {bookingForm.phone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {validatePhoneNumber(bookingForm.phone) ? (
                          <span className="text-green-500 text-lg">✓</span>
                        ) : (
                          <span className="text-yellow-500 text-lg">⚠</span>
                        )}
                      </div>
                    )}
                  </div>

                  {errors.phone ? (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="mr-1">❌</span>
                      {errors.phone}
                    </p>
                  ) : bookingForm.phone &&
                    !validatePhoneNumber(bookingForm.phone) ? (
                    <p className="text-yellow-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {getPhoneValidationMessage(bookingForm.phone)}
                    </p>
                  ) : bookingForm.phone &&
                    validatePhoneNumber(bookingForm.phone) ? (
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">✅</span>
                      Platné telefonní číslo
                    </p>
                  ) : (
                    <p className="text-gray-500 text-xs mt-1">
                      Formáty: 123 456 789, 0123 456 789, +420 123 456 789
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="service" className="text-gray-700 font-medium">
                  Služba{" "}
                  {attemptedSubmit && !bookingForm.service && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Select
                  value={bookingForm.service}
                  onValueChange={(value) => handleInputChange("service", value)}
                >
                  <SelectTrigger
                    className={`mt-2 rounded-lg transition-all duration-300 ${
                      errors.service
                        ? "border-red-500"
                        : serviceJustSelected
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                    }`}
                  >
                    <SelectValue placeholder="Vyberte službu" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service, index) => (
                      <SelectItem key={index} value={service.name}>
                        {service.name} - {service.price} Kč
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && (
                  <p className="text-red-500 text-sm mt-1">{errors.service}</p>
                )}
              </div>

              {/* Compact Date & Time Picker */}
              <div>
                <Label className="text-gray-700 font-medium">
                  Preferovaný termín{" "}
                  {attemptedSubmit &&
                    (!bookingForm.date || !bookingForm.time) && (
                      <span className="text-red-500">*</span>
                    )}
                </Label>

                <div className="mt-2">
                  <CompactDateTimePicker
                    selectedDate={bookingForm.date}
                    selectedTime={bookingForm.time}
                    onDateSelect={handleDateSelect}
                    onTimeSelect={handleTimeSelect}
                    availableTimeSlots={availableTimeSlots}
                    bookedTimes={bookedTimes}
                  />
                </div>

                {/* Show validation errors */}
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-medium transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Odesílání...
                  </div>
                ) : (
                  "Odeslat objednávku"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmationModal && confirmedBooking && (
        <BookingConfirmationModal
          isOpen={showConfirmationModal}
          onClose={closeConfirmationModal}
          bookingDetails={confirmedBooking}
        />
      )}
    </section>
  );
};

export default Booking;
