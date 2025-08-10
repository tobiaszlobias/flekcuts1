"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomDatePicker from "./CustomDatePicker";
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
  date: string;
  time: string;
  service: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  date?: string;
  time?: string;
  service?: string;
}

const Booking = () => {
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: "",
    email: "",
    date: "",
    time: "",
    service: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceJustSelected, setServiceJustSelected] = useState(false);

  // Convex mutation to create appointment
  const createAppointment = useMutation(api.appointments.createAppointment);

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

  // Updated submit handler using Convex
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create appointment using Convex
      await createAppointment({
        customerName: bookingForm.name,
        customerEmail: bookingForm.email,
        service: bookingForm.service,
        date: bookingForm.date,
        time: bookingForm.time,
      });

      alert(
        "Objednávka byla úspěšně odeslána! Budeme vás kontaktovat pro potvrzení termínu."
      );

      // Clear the form
      setBookingForm({ name: "", email: "", date: "", time: "", service: "" });
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Nepodařilo se odeslat objednávku. Zkuste to prosím znovu.");
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
            Naplánujte si návštěvu u našich zkušených holičů
          </p>
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
                    Celé jméno
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
                    Email
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

              <div>
                <Label htmlFor="service" className="text-gray-700 font-medium">
                  Služba
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
                    Preferované datum
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
                    Preferovaný čas
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
                        availableTimeSlots.map((time, index) => (
                          <SelectItem key={index} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      ) : bookingForm.date ? (
                        <SelectItem value="" disabled>
                          Žádné dostupné časy
                        </SelectItem>
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
