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

// Simple phone validation - just check for minimum 9 digits
const validatePhoneNumber = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, "");
  return numbers.length >= 9;
};

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
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
          <div className="bg-[#3C493F] p-4 text-center">
            <div className="animate-bounce mb-2">
              <CheckCircle className="w-12 h-12 text-white mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Objednávka odeslána!
            </h2>
            <p className="text-white/90 text-sm">
              Brzy vás budeme kontaktovat pro potvrzení
            </p>
          </div>

          <div className="p-4 space-y-3">
            <div className="bg-white rounded-lg p-3 border border-[#f0f3f2]">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
                <CalendarDays className="w-4 h-4 mr-2 text-[#3C493F]" />
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

                <div className="flex justify-between pt-2 border-t border-[#e5ebe9]">
                  <span className="text-gray-600">Cena:</span>
                  <span className="font-bold text-sm text-green-600">
                    {getServicePrice(bookingDetails.service)} Kč
                  </span>
                </div>
              </div>
            </div>

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
              className="w-full font-montserrat bg-white border-2 border-[#3C493F] text-[#3C493F] hover:bg-white hover:text-[#3C493F] hover:border-[#2d3730] px-12 py-6 rounded-full text-xl sm:text-2xl hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer"
            >
              <span className="relative z-10">Rozumím</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d5ddd9] to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const isDateTimeAvailable = (date: string, time: string): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const appointmentDate = new Date(date);
  appointmentDate.setHours(hours, minutes, 0, 0);
  const timeDifference = appointmentDate.getTime() - now.getTime();
  const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);
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

    for (
      let i = 0;
      i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);
      i++
    ) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const yearStr = currentDate.getFullYear();
      const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const dayStr = currentDate.getDate().toString().padStart(2, "0");
      const dateString = `${yearStr}-${monthStr}-${dayStr}`;
      const dayOfWeek = currentDate.getDay();
      const isToday = new Date().toDateString() === currentDate.toDateString();
      const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
      const isWorking = dayOfWeek >= 1 && dayOfWeek <= 5;
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
      <div className="bg-white border border-gray-200 rounded-lg p-3">
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
          {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day) => (
            <div
              key={day}
              className="p-1 text-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

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
                    ${day.isSelected ? "bg-[#3C493F] text-white font-semibold" : ""}
                    ${day.isToday && !day.isSelected ? "bg-[#f0f3f2] text-[#3C493F] font-semibold" : ""}
                    ${isSelectable && !day.isSelected && !day.isToday ? "hover:bg-white text-gray-900" : ""}
                    ${!isSelectable ? "text-gray-300 cursor-not-allowed" : ""}
                  `}
                >
                  <span className="relative z-10">{day.day}</span>
                  {day.isWorking && !day.isPast && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

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
                          ? "bg-[#3C493F] text-white border-[#3C493F] font-medium"
                          : canSelect
                            ? "border-[#e5ebe9] hover:border-[#7E8D85] hover:bg-white"
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

      {selectedDate && selectedTime && (
        <div className="bg-white border border-[#e5ebe9] rounded-lg p-3">
          <p className="text-[#3C493F] text-sm font-medium flex items-center">
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

    if (!bookingForm.phone.trim()) {
      newErrors.phone = "Telefon je povinný";
    } else if (!validatePhoneNumber(bookingForm.phone)) {
      newErrors.phone = "Zadejte alespoň 9 číslic";
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

      setConfirmedBooking({ ...bookingForm });
      setShowConfirmationModal(true);

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
    handleInputChange("time", "");
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
          <h2 className="font-crimson italic text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Objednejte si termín
          </h2>
          <p className="font-montserrat text-lg sm:text-xl lg:text-2xl text-gray-600">
            Dopřejte si profesionální péči
          </p>

          {!isSignedIn && (
            <div className="mt-4 p-4 bg-white border border-[#e5ebe9] rounded-lg">
              <p className="text-[#3C493F] text-sm">
                💡 Tip:{" "}
                <SignInButton mode="modal">
                  <button className="text-[#3C493F] hover:text-[#3C493F] underline font-medium">
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
                      <span className="text-[#7E8D85]">*</span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`mt-2 rounded-lg ${errors.name ? "border-[#3C493F]" : "border-gray-300"}`}
                    placeholder="Zadejte vaše celé jméno"
                  />
                  {errors.name && (
                    <p className="text-[#7E8D85] text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email{" "}
                    {attemptedSubmit &&
                      (!bookingForm.email.trim() ||
                        !/\S+@\S+\.\S+/.test(bookingForm.email)) && (
                        <span className="text-[#7E8D85]">*</span>
                      )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`mt-2 rounded-lg ${errors.email ? "border-[#3C493F]" : "border-gray-300"}`}
                    placeholder="vas@email.com"
                  />
                  {errors.email && (
                    <p className="text-[#7E8D85] text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Telefon{" "}
                  {attemptedSubmit &&
                    (!bookingForm.phone.trim() ||
                      !validatePhoneNumber(bookingForm.phone)) && (
                      <span className="text-[#7E8D85]">*</span>
                    )}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`mt-2 rounded-lg ${errors.phone ? "border-[#3C493F]" : "border-gray-300"}`}
                  placeholder="+420 123 456 789"
                />
                {errors.phone && (
                  <p className="text-[#7E8D85] text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="service" className="text-gray-700 font-medium">
                  Služba{" "}
                  {attemptedSubmit && !bookingForm.service && (
                    <span className="text-[#7E8D85]">*</span>
                  )}
                </Label>
                <Select
                  value={bookingForm.service}
                  onValueChange={(value) => handleInputChange("service", value)}
                >
                  <SelectTrigger
                    className={`mt-2 rounded-lg transition-all duration-300 ${
                      errors.service
                        ? "border-[#3C493F]"
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
                  <p className="text-[#7E8D85] text-sm mt-1">{errors.service}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-medium">
                  Preferovaný termín{" "}
                  {attemptedSubmit &&
                    (!bookingForm.date || !bookingForm.time) && (
                      <span className="text-[#7E8D85]">*</span>
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

                {errors.date && (
                  <p className="text-[#7E8D85] text-sm mt-1">{errors.date}</p>
                )}
                {errors.time && (
                  <p className="text-[#7E8D85] text-sm mt-1">{errors.time}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-montserrat bg-[#3C493F] hover:!bg-[#3C493F] text-white !border-none px-12 rounded-full text-xl sm:text-2xl hover:scale-102 active:scale-99 transition-all duration-200 relative overflow-hidden group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[60px] sm:h-[64px] flex items-center justify-center shadow-none outline-none focus:outline-none focus-visible:ring-0"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span className="relative z-10">Odesílání...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Odeslat objednávku</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-70 animate-shimmer"></span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {showConfirmationModal && confirmedBooking && (
        <BookingConfirmationModal
          isOpen={showConfirmationModal}
          onClose={closeConfirmationModal}
          bookingDetails={confirmedBooking}
        />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Booking;
