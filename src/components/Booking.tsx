"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomDatePicker from "./CustomDatePicker";
import { toast } from "sonner";
import { SignInButton } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface BookingForm {
  name: string;
  email: string;
  phone: string; // Added phone for anonymous bookings
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

interface BookingProps {
  isAuthenticated?: boolean;
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, "");

  // Handle empty input
  if (numbers.length === 0) {
    return "";
  }

  // If starts with 420 (Czech Republic)
  if (numbers.startsWith("420")) {
    const rest = numbers.substring(3);

    if (rest.length === 0) return "+420";
    if (rest.length <= 3) return `+420 ${rest}`;
    if (rest.length <= 6)
      return `+420 ${rest.substring(0, 3)} ${rest.substring(3)}`;
    if (rest.length === 9)
      return `+420 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;

    // Limit to exactly 9 digits after +420
    return `+420 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6, 9)}`;
  }

  // If starts with 421 (Slovakia)
  if (numbers.startsWith("421")) {
    const rest = numbers.substring(3);

    if (rest.length === 0) return "+421";
    if (rest.length <= 3) return `+421 ${rest}`;
    if (rest.length <= 6)
      return `+421 ${rest.substring(0, 3)} ${rest.substring(3)}`;
    if (rest.length === 9)
      return `+421 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;

    // Limit to exactly 9 digits after +421
    return `+421 ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6, 9)}`;
  }

  // If starts with 0 (local Czech number)
  if (numbers.startsWith("0")) {
    const localNumber = numbers.substring(1);

    if (localNumber.length === 0) return "0";
    if (localNumber.length <= 3) return `+420 ${localNumber}`;
    if (localNumber.length <= 6)
      return `+420 ${localNumber.substring(0, 3)} ${localNumber.substring(3)}`;
    if (localNumber.length === 9)
      return `+420 ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6)}`;

    // Limit to exactly 9 digits
    return `+420 ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6, 9)}`;
  }

  // For numbers starting with neither 420, 421, nor 0, assume Czech
  if (numbers.length <= 3) return `+420 ${numbers}`;
  if (numbers.length <= 6)
    return `+420 ${numbers.substring(0, 3)} ${numbers.substring(3)}`;
  if (numbers.length === 9)
    return `+420 ${numbers.substring(0, 3)} ${numbers.substring(3, 6)} ${numbers.substring(6)}`;

  // Limit to exactly 9 digits for Czech numbers
  return `+420 ${numbers.substring(0, 3)} ${numbers.substring(3, 6)} ${numbers.substring(6, 9)}`;
};

const validatePhoneNumber = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, "");

  // Czech numbers: +420 followed by exactly 9 digits
  if (numbers.startsWith("420")) {
    return numbers.length === 12; // 420 + 9 digits
  }

  // Slovak numbers: +421 followed by exactly 9 digits
  if (numbers.startsWith("421")) {
    return numbers.length === 12; // 421 + 9 digits
  }

  // Any other format must be at least 10 digits total (basic international validation)
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

const Booking = ({ isAuthenticated = false }: BookingProps) => {
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

  // Convex mutations
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

  // Dynamic time slots based on selected date
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
      ], // Monday
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
      ], // Tuesday
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
      ], // Wednesday
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
      ], // Thursday
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
      ], // Friday
    };

    return timeSlots[dayOfWeek as keyof typeof timeSlots] || [];
  };

  const availableTimeSlots = getTimeSlots(bookingForm.date);

  // Listen for service pre-selection from Services component
  useEffect(() => {
    const handleServicePreSelection = (event: CustomEvent) => {
      const { serviceName } = event.detail;
      setBookingForm((prev) => ({ ...prev, service: serviceName }));
      setServiceJustSelected(true);

      // Clear the highlight after 3 seconds
      setTimeout(() => {
        setServiceJustSelected(false);
      }, 3000);
    };

    window.addEventListener(
      "preSelectService",
      handleServicePreSelection as EventListener
    );

    return () => {
      window.removeEventListener(
        "preSelectService",
        handleServicePreSelection as EventListener
      );
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!bookingForm.name.trim()) {
      newErrors.name = "Jméno je povinné";
    }

    if (!bookingForm.email.trim()) {
      newErrors.email = "Email je povinný";
    } else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) {
      newErrors.email = "Neplatný formát emailu";
    }

    // Enhanced phone validation for anonymous bookings
    if (!isAuthenticated) {
      if (!bookingForm.phone.trim()) {
        newErrors.phone = "Telefon je povinný";
      } else if (!validatePhoneNumber(bookingForm.phone)) {
        newErrors.phone =
          getPhoneValidationMessage(bookingForm.phone) ||
          "Neplatné telefonní číslo";
      }
    }

    if (!bookingForm.service) {
      newErrors.service = "Služba je povinná";
    }

    if (!bookingForm.date) {
      newErrors.date = "Datum je povinné";
    }

    if (!bookingForm.time) {
      newErrors.time = "Čas je povinný";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAuthenticated) {
        // Create appointment linked to authenticated user
        await createAppointment({
          customerName: bookingForm.name,
          customerEmail: bookingForm.email,
          service: bookingForm.service,
          date: bookingForm.date,
          time: bookingForm.time,
        });
      } else {
        // Create anonymous appointment
        await createAnonymousAppointment({
          customerName: bookingForm.name,
          customerEmail: bookingForm.email,
          customerPhone: bookingForm.phone,
          service: bookingForm.service,
          date: bookingForm.date,
          time: bookingForm.time,
        });
      }

      toast.success(
        "Objednávka byla úspěšně odeslána! Budeme vás kontaktovat pro potvrzení termínu."
      );

      // Clear the form
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        service: "",
      });
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
          {!isAuthenticated && (
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
                vybrána!
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
                    Celé jméno <span className="text-red-500">*</span>
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
                    Email <span className="text-red-500">*</span>
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

              {/* Enhanced Phone field for anonymous users */}
              {!isAuthenticated && (
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Telefon <span className="text-red-500">*</span>
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
                        // Allow backspace, delete, tab, escape, enter
                        if (
                          [8, 9, 27, 13, 46].includes(e.keyCode) ||
                          // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                          (e.keyCode === 65 && e.ctrlKey) ||
                          (e.keyCode === 67 && e.ctrlKey) ||
                          (e.keyCode === 86 && e.ctrlKey) ||
                          (e.keyCode === 88 && e.ctrlKey) ||
                          // Allow home, end, left, right
                          (e.keyCode >= 35 && e.keyCode <= 39)
                        ) {
                          return;
                        }
                        // Ensure that it's a number and stop the keypress
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
                    {/* Status indicator */}
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

                  {/* Error or validation messages */}
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
                  Služba <span className="text-red-500">*</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date" className="text-gray-700 font-medium">
                    Preferované datum <span className="text-red-500">*</span>
                  </Label>
                  <CustomDatePicker
                    selectedDate={bookingForm.date}
                    onDateSelect={(date) => {
                      handleInputChange("date", date);
                      // Reset time when date changes since available times vary by day
                      if (bookingForm.time) {
                        handleInputChange("time", "");
                      }
                    }}
                    error={errors.date}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="time" className="text-gray-700 font-medium">
                    Preferovaný čas <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={bookingForm.time}
                    onValueChange={(value) => handleInputChange("time", value)}
                    disabled={!bookingForm.date}
                  >
                    <SelectTrigger
                      className={`mt-2 rounded-lg ${
                        errors.time
                          ? "border-red-500"
                          : !bookingForm.date
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-300"
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          !bookingForm.date
                            ? "Nejprve vyberte datum"
                            : "Vyberte čas"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((time, index) => {
                          const isBooked = bookedTimes.includes(time);
                          return (
                            <SelectItem
                              key={index}
                              value={time}
                              disabled={isBooked}
                            >
                              {time} {isBooked && "(Obsazeno)"}
                            </SelectItem>
                          );
                        })
                      ) : bookingForm.date ? (
                        <div className="text-center text-gray-500 py-2">
                          Žádné dostupné časy
                        </div>
                      ) : null}
                    </SelectContent>
                  </Select>
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                  {bookingForm.date && availableTimeSlots.length === 0 && (
                    <p className="text-amber-600 text-sm mt-1">
                      V tento den není otevřeno
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-medium"
              >
                {isSubmitting ? "Odesílání..." : "Odeslat objednávku"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Booking;
