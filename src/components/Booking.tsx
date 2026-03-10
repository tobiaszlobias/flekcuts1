"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
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
import { Clock, CheckCircle } from "lucide-react";
import {
  BOOKING_DROPDOWN_SERVICES,
  deriveServiceFromName,
  deriveServiceSelection,
  formatServiceNameForDisplay,
} from "@/lib/services";
import { isAnnouncementActive } from "@/components/AnnouncementBanner";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

type Vacation = {
  _id: Id<"vacations">;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  note?: string;
};

interface BookingForm {
  name: string;
  email: string;
  phone: string;
  notes: string;
  date: string;
  time: string;
  service: string; // base service
  addBeard: boolean;
  addWash: boolean;
}

type BookingField = keyof BookingForm;
type StringBookingField = Exclude<BookingField, "addBeard" | "addWash">;
type FormErrors = Partial<Record<BookingField, string>>;

const getExplicitPlusPrefixLength = (raw: string): 2 | 3 | null => {
  const match = raw.match(/^\+(\d{2,3})\s/);
  if (!match) return null;
  return match[1].length === 2 ? 2 : 3;
};

const formatPlusPhone = (digits: string, ccLength = 3): string => {
  if (!digits) return "+";
  if (digits.length <= ccLength) return `+${digits}`;

  const country = digits.slice(0, ccLength);
  const rest = digits.slice(ccLength);
  if (!rest) return `+${country}`;

  const groups = rest.match(/.{1,3}/g)?.join(" ") ?? rest;
  return `+${country} ${groups}`;
};

// Phone validation: keep local format and allow +xx/+xxx international prefix.
const validatePhoneNumber = (phone: string): boolean => {
  const raw = phone.trim();
  const numbers = phone.replace(/\D/g, "");
  if (!numbers) return false;
  if (raw.startsWith("+")) {
    const explicitPrefixLength = getExplicitPlusPrefixLength(raw);
    if (explicitPrefixLength === 2) return numbers.length === 11;
    return numbers.length === 12;
  }
  return numbers.length === 9;
};

// Phone formatting helper
const formatPhoneDisplay = (phone: string): string => {
  const hasPlus = phone.trim().startsWith("+");
  const numbers = phone.replace(/\D/g, "");
  if (!numbers) return phone;
  if (hasPlus) {
    const ccLength = numbers.length === 11 ? 2 : 3;
    return formatPlusPhone(numbers, ccLength);
  }
  if (numbers.length >= 9) {
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)}`;
  }
  return numbers;
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useBodyScrollLock(isOpen);

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
    return deriveServiceFromName(serviceName).priceCzk || 0;
  };

  const getServiceDurationMinutes = (serviceName: string): number => {
    return deriveServiceFromName(serviceName).durationMinutes || 0;
  };

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
        data-scroll-lock-allow="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Objednávka potvrzena
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Vaše objednávka byla úspěšně vytvořena
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Potvrzení jsme poslali na <span className="font-semibold">{bookingDetails.email}</span>.
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Pro zobrazení, úpravu nebo zrušení objednávky se přihlaste stejným
                  e‑mailem. Najdete ji v sekci{" "}
                  <span className="font-semibold">Moje objednávky</span> na{" "}
                  <span className="font-semibold">flekcuts.cz</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF9F6] border border-[#FF6B35]/20 rounded-lg p-4">
            <p className="text-sm text-gray-800">
              Objednávku lze zrušit nejpozději{" "}
              <span className="font-semibold">24 hodin</span> před termínem.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Služba</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatServiceNameForDisplay(bookingDetails.service)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Cena</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{getServicePrice(bookingDetails.service)} Kč</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Datum</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(bookingDetails.date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Čas</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{bookingDetails.time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Délka</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {getServiceDurationMinutes(bookingDetails.service)} min
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-sm text-gray-900 mt-1">{bookingDetails.email}</p>
              </div>
              {bookingDetails.phone && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Telefon</p>
                  <p className="text-sm text-gray-900 mt-1">{formatPhoneDisplay(bookingDetails.phone)}</p>
                </div>
              )}
              {bookingDetails.notes?.trim() && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Poznámka</p>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                    {bookingDetails.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-[#FF6B35] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#E5572C] transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const SLOT_MINUTES = 15;

const timeStringToMinutes = (time: string): number => {
  const [hoursStr, minutesStr = "0"] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

const minutesToTimeString = (minutesFromMidnight: number): string => {
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
};

const generateSlots = (
  startMinutes: number,
  endMinutesExclusive: number,
  stepMinutes: number
): string[] => {
  const slots: string[] = [];
  for (let minutes = startMinutes; minutes < endMinutesExclusive; minutes += stepMinutes) {
    slots.push(minutesToTimeString(minutes));
  }
  return slots;
};

const overlapsMinutes = (
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean => startA < endB && startB < endA;

const isDateTimeAvailable = (date: string, time: string): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const appointmentDate = new Date(date);
  appointmentDate.setHours(hours, minutes, 0, 0);
  const timeDifference = appointmentDate.getTime() - now.getTime();
  const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);
  return hoursUntilAppointment >= 2;
};

const isDateTimeInFuture = (date: string, time: string): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const appointmentDate = new Date(date);
  appointmentDate.setHours(hours, minutes, 0, 0);
  return appointmentDate.getTime() > now.getTime();
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

const isDateWithinNextMonth = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString + "T00:00:00");
  if (Number.isNaN(date.getTime())) return false;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const maxDate = new Date(todayStart);
  maxDate.setMonth(maxDate.getMonth() + 1);

  return date >= todayStart && date <= maxDate;
};

const formatDateIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateInRange = (date: string, start: string, end: string) =>
  date >= start && date <= end;

const parseTimeToMinutesSafe = (time?: string): number | null => {
  if (!time) return null;
  const [hoursStr, minutesStr = "0"] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const getVacationIntervalsForDate = (vacations: Vacation[], date: string) => {
  const relevant = vacations.filter((v) => dateInRange(date, v.startDate, v.endDate));
  const intervals: Array<{ start: number; end: number; label: string }> = [];
  for (const v of relevant) {
    const start = parseTimeToMinutesSafe(v.startTime);
    const end = parseTimeToMinutesSafe(v.endTime);
    if (start === null || end === null) {
      intervals.push({ start: 0, end: 24 * 60, label: v.note || "Dovolená" });
    } else {
      intervals.push({ start, end, label: v.note || "Dovolená" });
    }
  }
  return intervals;
};

const CompactDateTimePicker = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableStartTimes,
  bookedTimes,
  vacations,
  isLoadingAvailability = false,
}: {
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  availableStartTimes: string[];
  bookedTimes: string[];
  vacations: Vacation[];
  isLoadingAvailability?: boolean;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeSlots, setShowTimeSlots] = useState(!!selectedDate);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const maxDate = new Date(todayStart);
  maxDate.setMonth(maxDate.getMonth() + 1);

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
      const isTooFar = currentDate > maxDate;
      const isVacationFullDay = vacations.some(
        (v) =>
          dateInRange(dateString, v.startDate, v.endDate) &&
          (!v.startTime || !v.endTime)
      );
      const isVacationPartial = vacations.some(
        (v) =>
          dateInRange(dateString, v.startDate, v.endDate) &&
          !!v.startTime &&
          !!v.endTime
      );
      const isWorking = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isSelected = selectedDate === dateString;

      days.push({
        day,
        dateString,
        dayOfWeek,
        isToday,
        isPast,
        isTooFar,
        isVacationFullDay,
        isVacationPartial,
        isWorking,
        isSelected,
      });
    }

    return days;
  };

  const isDateSelectable = (
    day: {
      isWorking: boolean;
      isPast: boolean;
      isTooFar: boolean;
      isVacationFullDay: boolean;
    } | null
  ): boolean => {
    if (!day) return false;
    return day.isWorking && !day.isPast && !day.isTooFar && !day.isVacationFullDay;
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
	                    w-full aspect-square text-xs rounded transition-all duration-200 relative ring-1 ring-inset
	                    ${
                        day.isSelected
                          ? "bg-[#FF8C5A] text-white font-semibold shadow-md scale-105 ring-[#FF8C5A]"
                          : day.isVacationFullDay && !day.isPast
                            ? "bg-blue-100 text-blue-900 font-semibold ring-blue-200 cursor-not-allowed"
                            : day.isVacationPartial && !day.isPast
                              ? "bg-blue-50 text-gray-900 ring-blue-200"
                              : isSelectable
                                ? "bg-[#FFF0E8] text-gray-900 ring-[#FFD3C2] hover:bg-[#FFE6DA] hover:text-[#FF6B35]"
                                : "bg-gray-50 text-gray-300 ring-gray-100 cursor-not-allowed"
                      }
	                    ${day.isToday && !day.isSelected && isSelectable ? "shadow-[inset_0_0_0_2px_rgba(255,107,53,0.35)]" : ""}
	                  `}
	                >
	                  <span className="relative z-10">{day.day}</span>
	                  {!day.isSelected &&
	                    isSelectable &&
	                    !day.isVacationFullDay &&
	                    !day.isVacationPartial && (
	                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF6B35] rounded-full"></div>
	                    )}
	                  {!day.isSelected &&
	                    (day.isVacationFullDay || day.isVacationPartial) &&
	                    !day.isPast && (
	                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
	                    )}
	                </button>
	              </div>
	            );
	          })}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full"></div>
              <span>Otevřeno</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <span>Zavřeno</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Dovolená</span>
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

          {isLoadingAvailability ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
              <span>Načítám dostupné časy…</span>
            </div>
          ) : (
            <>
              {(() => {
                const vac = getVacationIntervalsForDate(vacations, selectedDate);
                if (vac.length === 0) return null;
                const isFullDay = vac.some((v) => v.start === 0 && v.end === 24 * 60);
                const label = vac[0]?.label || "Dovolená";
                return (
                  <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                    <span className="font-medium">{label}</span>
                    {isFullDay ? (
                      <span> — tento den je zavřeno</span>
                    ) : (
                      <span> — část dne není dostupná</span>
                    )}
                  </div>
                );
              })()}

              {(() => {
                const timeToMinutes = (t: string) => {
                  const [h, m = "0"] = t.split(":");
                  return Number(h) * 60 + Number(m);
                };

                const displayedTimes = (() => {
                  if (!selectedTime) return availableStartTimes;
                  if (availableStartTimes.includes(selectedTime)) return availableStartTimes;
                  return [selectedTime, ...availableStartTimes];
                })()
                  .slice()
                  .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

                return displayedTimes.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {displayedTimes.map((time) => {
                      const isBooked = bookedTimes.includes(time);
                      const isWithin2Hours = !isDateTimeAvailable(selectedDate, time);
                      const isStartAvailable = availableStartTimes.includes(time);
                      const canSelect = !isBooked && !isWithin2Hours && isStartAvailable;
                      const isSelected = selectedTime === time;

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => (canSelect ? onTimeSelect(time) : null)}
                          disabled={!canSelect}
                          aria-pressed={isSelected}
                          title={
                            isSelected && !canSelect
                              ? "Vybráno (už není dostupné pro zvolenou službu)"
                              : undefined
                          }
                          className={`
                            relative p-2 text-xs rounded border transition-all duration-200
                            ${
                              isSelected
                                ? "bg-[#FF8C5A] text-white border-[#FF8C5A] font-medium"
                                : canSelect
                                  ? "border-[#e5ebe9] hover:border-[#FF6B35] hover:bg-white"
                                  : isBooked
                                    ? "border-gray-300 bg-gray-200 text-gray-700 cursor-not-allowed"
                                    : "border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
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
                    <p className="text-xs">Pro zvolenou službu nejsou dostupné časy</p>
                  </div>
                );
              })()}
            </>
          )}

        </div>
      )}

      {selectedDate && selectedTime && (
        <div className="bg-white border border-[#FF6B35]/30 rounded-lg p-3">
          <p className="text-[#FF6B35] text-sm font-medium flex items-center">
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
    notes: "",
    date: "",
    time: "",
    service: "",
    addBeard: false,
    addWash: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServiceSelectOpen, setIsServiceSelectOpen] = useState(false);
  const [serviceJustSelected, setServiceJustSelected] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingForm | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useBodyScrollLock(isServiceSelectOpen, { strategy: "overflow" });

  const createAppointment = useMutation(api.appointments.createAppointment);
  const createAnonymousAppointment = useMutation(
    api.appointments.createAnonymousAppointment
  );

  const appointmentsForDate = useQuery(
    api.appointments.getAppointmentsByDate,
    bookingForm.date ? { date: bookingForm.date } : "skip"
  );

  const bookingWindowStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const bookingWindowEnd = (() => {
    const d = new Date(bookingWindowStart);
    d.setMonth(d.getMonth() + 1);
    return d;
  })();

  const vacationsQuery = useQuery(api.vacations.getVacationsByRange, {
    startDate: formatDateIso(bookingWindowStart),
    endDate: formatDateIso(bookingWindowEnd),
  });

  const vacations = vacationsQuery ?? [];
  const isAvailabilityLoading =
    !!bookingForm.date &&
    (appointmentsForDate === undefined || vacationsQuery === undefined);

  const isDefined = <T,>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined;

  const serviceOptions = [
    "Panský střih",
    "Dětský střih",
    "Vousy",
    "Kompletní servis",
  ]
    .map((name) => BOOKING_DROPDOWN_SERVICES.find((s) => s.name === name))
    .filter(isDefined);

  const derivedSelection = deriveServiceSelection({
    baseName: bookingForm.service,
    addBeard: false,
    addWash: false,
  });

  const getOpenSlotsForDate = (selectedDate: string): string[] => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = date.getDay();

    // Working hours:
    // Mon/Wed/Fri: 07:30-15:30
    // Tue/Thu:     09:00-16:00, 17:00-21:00
    const schedule: Record<number, Array<[number, number]>> = {
      1: [[7 * 60 + 30, 15 * 60 + 30]],
      2: [
        [9 * 60, 16 * 60],
        [17 * 60, 21 * 60],
      ],
      3: [[7 * 60 + 30, 15 * 60 + 30]],
      4: [
        [9 * 60, 16 * 60],
        [17 * 60, 21 * 60],
      ],
      5: [[7 * 60 + 30, 15 * 60 + 30]],
    };

    const periods = schedule[dayOfWeek as keyof typeof schedule] || [];
    return periods.flatMap(([start, end]) => generateSlots(start, end, SLOT_MINUTES));
  };

  const getWorkingPeriodsForDate = (selectedDate: string): Array<[number, number]> => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = date.getDay();
    const schedule: Record<number, Array<[number, number]>> = {
      1: [[7 * 60 + 30, 15 * 60 + 30]],
      2: [
        [9 * 60, 16 * 60],
        [17 * 60, 21 * 60],
      ],
      3: [[7 * 60 + 30, 15 * 60 + 30]],
      4: [
        [9 * 60, 16 * 60],
        [17 * 60, 21 * 60],
      ],
      5: [[7 * 60 + 30, 15 * 60 + 30]],
    };
    return schedule[dayOfWeek as keyof typeof schedule] || [];
  };

  const openSlots = getOpenSlotsForDate(bookingForm.date);
  const workingPeriods = getWorkingPeriodsForDate(bookingForm.date);

  const existingIntervals = (isAvailabilityLoading ? [] : appointmentsForDate || [])
    .filter((apt) => apt.status !== "cancelled")
    .map((apt) => {
      const start = timeStringToMinutes(apt.time);
      const maybeDuration = (apt as unknown as { durationMinutes?: unknown }).durationMinutes;
      const durationMinutes =
        (typeof maybeDuration === "number" ? maybeDuration : undefined) ??
        deriveServiceFromName(apt.service || "").durationMinutes ??
        30;
      const end = start + durationMinutes;
      return { start, end };
    })
    .filter((interval) => Number.isFinite(interval.start) && Number.isFinite(interval.end));

  const vacationIntervals = !isAvailabilityLoading && bookingForm.date
    ? getVacationIntervalsForDate(vacations, bookingForm.date).map((v) => ({
        start: v.start,
        end: v.end,
      }))
    : [];

  const bookedSlotSet = new Set<string>();
  for (const slot of openSlots) {
    const slotStart = timeStringToMinutes(slot);
    const slotEnd = slotStart + SLOT_MINUTES;
    if (!Number.isFinite(slotStart)) continue;
    const isBooked = existingIntervals.some((apt) =>
      overlapsMinutes(slotStart, slotEnd, apt.start, apt.end)
    );
    const isVacation = vacationIntervals.some((v) =>
      overlapsMinutes(slotStart, slotEnd, v.start, v.end)
    );
    if (isBooked || isVacation) bookedSlotSet.add(slot);
  }

  const bookedTimes = Array.from(bookedSlotSet);

  const availableTimeSlots = (() => {
    if (!bookingForm.date) return [];
    if (isAvailabilityLoading) return [];
    if (openSlots.length === 0) return [];

    const durationMinutes = derivedSelection.durationMinutes || SLOT_MINUTES;

    return openSlots.filter((time) => {
      const start = timeStringToMinutes(time);
      if (!Number.isFinite(start)) return false;
      const end = start + durationMinutes;

      const fitsWithinWorkingHours = workingPeriods.some(
        ([pStart, pEnd]) => start >= pStart && end <= pEnd
      );
      if (!fitsWithinWorkingHours) return false;

      const overlapsExisting = existingIntervals.some((apt) =>
        overlapsMinutes(start, end, apt.start, apt.end)
      );
      if (overlapsExisting) return false;

      const overlapsVacation = vacationIntervals.some((v) =>
        overlapsMinutes(start, end, v.start, v.end)
      );
      if (overlapsVacation) return false;

      // Also require the first 15-min slot to be free (UI uses this for greying)
      if (bookedSlotSet.has(time)) return false;

      return true;
    });
  })();

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

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 0px 0px'
      }
    );

    const node = sectionRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
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
      newErrors.phone = "Použijte 123 456 789 nebo +420 123 456 789";
    }

    if (!bookingForm.service) newErrors.service = "Služba je povinná";
    if (!bookingForm.date) newErrors.date = "Datum je povinné";
    if (!bookingForm.time) newErrors.time = "Čas je povinný";
    if (bookingForm.date && !isDateWithinNextMonth(bookingForm.date)) {
      newErrors.date = "Termín lze rezervovat maximálně 1 měsíc dopředu";
    }
    if (
      bookingForm.date &&
      bookingForm.time &&
      !availableTimeSlots.includes(bookingForm.time)
    ) {
      newErrors.time = "Vybraný čas už není dostupný pro zvolenou službu";
    }
    if (
      bookingForm.date &&
      bookingForm.time &&
      !isDateTimeInFuture(bookingForm.date, bookingForm.time)
    ) {
      newErrors.time = "Termín musí být v budoucnu";
    } else if (
      bookingForm.date &&
      bookingForm.time &&
      !isDateTimeAvailable(bookingForm.date, bookingForm.time)
    ) {
      newErrors.time = "Termín musí být alespoň 2 hodiny dopředu";
    }

    setErrors(newErrors);

    const firstErrorKey = (
      ["name", "email", "phone", "service", "dateTime"] as const
    ).find((key) => {
      if (key === "dateTime") return !!newErrors.date || !!newErrors.time;
      return !!(newErrors as Record<string, unknown>)[key];
    });

    if (firstErrorKey) {
      const node = fieldRefs.current[firstErrorKey];
      if (node) {
        requestAnimationFrame(() => {
          node.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusTarget = node.querySelector<HTMLElement>(
            "input, button, [role='combobox']"
          );
          focusTarget?.focus?.();
        });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const serviceNameToSave = derivedSelection.displayName || bookingForm.service;
      if (isSignedIn) {
        await createAppointment({
          customerName: bookingForm.name,
          customerEmail: bookingForm.email,
          customerPhone: bookingForm.phone,
          service: serviceNameToSave,
          date: bookingForm.date,
          time: bookingForm.time,
          notes: bookingForm.notes.trim() ? bookingForm.notes.trim() : undefined,
        });
      } else {
        await createAnonymousAppointment({
          customerName: bookingForm.name,
          customerEmail: bookingForm.email,
          customerPhone: bookingForm.phone,
          service: serviceNameToSave,
          date: bookingForm.date,
          time: bookingForm.time,
          notes: bookingForm.notes.trim() ? bookingForm.notes.trim() : undefined,
        });
      }

      setConfirmedBooking({ ...bookingForm, service: serviceNameToSave });
      setShowConfirmationModal(true);

      setBookingForm({
        name: "",
        email: "",
        phone: "",
        notes: "",
        date: "",
        time: "",
        service: "",
        addBeard: false,
        addWash: false,
      });
      setAttemptedSubmit(false);
    } catch (error: unknown) {
      console.error("Error creating booking:", error);
      const message = error instanceof Error ? error.message : "";
      if (message.includes("An appointment already exists at this time.")) {
        toast.error("Tento termín je již obsazen. Zvolte prosím jiný čas.");
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("Nepodařilo se odeslat objednávku. Zkuste to prosím znovu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneInput = (value: string): string => {
    const trimmed = value.trimStart();
    const hasPlus = trimmed.startsWith("+");
    const numbers = trimmed.replace(/\D/g, "");
    const explicitPrefixLength = getExplicitPlusPrefixLength(trimmed);

    if (!numbers && hasPlus) return "+";
    if (!numbers) return "";
    if (hasPlus) {
      const ccLength = explicitPrefixLength ?? 3;
      const maxDigits = ccLength + 9;
      const clipped = numbers.slice(0, maxDigits);
      if (explicitPrefixLength && clipped.length <= ccLength) {
        return `+${clipped} `;
      }
      return formatPlusPhone(clipped, ccLength);
    }

    const normalizedDigits = numbers.startsWith("420")
      ? numbers.slice(0, 12)
      : `420${numbers.slice(0, 9)}`;
    return formatPlusPhone(normalizedDigits, 3);
  };

  const handleInputChange = (field: StringBookingField, value: string) => {
    setBookingForm((prev) => {
      const next = { ...prev, [field]: value } as BookingForm;
      if (field === "service") {
        next.addBeard = false;
        next.addWash = false;
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setBookingForm((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
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
    <section
      ref={sectionRef}
      id="objednat"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="text-center mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s'
          }}
        >
          <h2 className="font-crimson italic text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Objednejte si termín
          </h2>
          <p className="font-montserrat text-lg sm:text-xl lg:text-2xl text-gray-600">
            Dopřejte si profesionální péči
          </p>

          {!isSignedIn && (
            <div className="mt-4 p-4 bg-white border border-[#FF6B35]/20 rounded-lg">
              <p className="text-gray-700 text-sm">
                💡 Tip:{" "}
                <SignInButton mode="modal">
                  <button className="text-[#FF6B35] hover:text-[#E5572C] underline font-medium">
                    Přihlaste se
                  </button>
                </SignInButton>{" "}
                pro sledování vašich objednávek
              </p>
            </div>
          )}

          {serviceJustSelected && (
            <div className="mt-4 p-3 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-lg">
              <p className="text-[#FF6B35] font-medium">
                ✅ Služba &quot;{bookingForm.service}&quot; byla automaticky
                vybrána!{" "}
              </p>
            </div>
          )}

          {isAnnouncementActive() && (
            <div className="relative mt-5 rounded-2xl border border-[#FF6B35]/35 bg-[linear-gradient(135deg,#FFE8DA_0%,#FFF3EC_50%,#FFFFFF_100%)] p-4 text-left shadow-[0_18px_42px_rgba(255,107,53,0.16)]">
              <p className="font-montserrat text-sm font-semibold leading-relaxed text-gray-900 sm:text-base">
                Od 1. dubna 2026 platí nová nabídka služeb, ceny a otevírací doba.
              </p>
            </div>
          )}
        </div>

        <Card
          className="rounded-xl border-0 shadow-lg"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
          }}
        >
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  ref={(el) => {
                    fieldRefs.current["name"] = el;
                  }}
                >
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Celé jméno{" "}
                    {attemptedSubmit && !bookingForm.name.trim() && (
                      <span className="text-[#FF6B35]">*</span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`mt-2 rounded-lg transition-all duration-200 ${errors.name ? "border-[#FF6B35]" : "border-gray-300 hover:border-[#FF6B35] focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"}`}
                    placeholder="Zadejte vaše celé jméno"
                  />
                  {errors.name && (
                    <p className="text-[#FF6B35] text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div
                  ref={(el) => {
                    fieldRefs.current["email"] = el;
                  }}
                >
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email{" "}
                    {attemptedSubmit &&
                      (!bookingForm.email.trim() ||
                        !/\S+@\S+\.\S+/.test(bookingForm.email)) && (
                        <span className="text-[#FF6B35]">*</span>
                      )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`mt-2 rounded-lg transition-all duration-200 ${errors.email ? "border-[#FF6B35]" : "border-gray-300 hover:border-[#FF6B35] focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"}`}
                    placeholder="vas@email.com"
                  />
                  {errors.email && (
                    <p className="text-[#FF6B35] text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div
                ref={(el) => {
                  fieldRefs.current["phone"] = el;
                }}
              >
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Telefon{" "}
                  {attemptedSubmit &&
                    (!bookingForm.phone.trim() ||
                      !validatePhoneNumber(bookingForm.phone)) && (
                      <span className="text-[#FF6B35]">*</span>
                    )}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`mt-2 rounded-lg transition-all duration-200 ${errors.phone ? "border-[#FF6B35]" : "border-gray-300 hover:border-[#FF6B35] focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"}`}
                  placeholder="+420 123 456 789"
                />
                {errors.phone && (
                  <p className="text-[#FF6B35] text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div
                ref={(el) => {
                  fieldRefs.current["service"] = el;
                }}
              >
                <Label htmlFor="service" className="text-gray-700 font-medium">
                  Služba{" "}
                  {attemptedSubmit && !bookingForm.service && (
                    <span className="text-[#FF6B35]">*</span>
                  )}
                </Label>
                <Select
                  value={bookingForm.service}
                  onValueChange={(value) => handleInputChange("service", value)}
                  onOpenChange={setIsServiceSelectOpen}
                >
                  <SelectTrigger
                    id="service"
                    className={`mt-2 rounded-lg transition-all duration-300 ${
                      errors.service
                        ? "border-[#FF6B35]"
                        : serviceJustSelected
                          ? "border-[#FF6B35] bg-[#FF6B35]/5"
                          : "border-gray-300 hover:border-[#FF6B35] focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20"
                    }`}
                  >
                    <SelectValue placeholder="Vyberte službu" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name} - od {service.priceCzk} Kč
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && (
                  <p className="text-[#FF6B35] text-sm mt-1">{errors.service}</p>
                )}

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700 font-medium">Shrnutí služby</p>
                  </div>

                  {!!bookingForm.service && (
                    <p className="text-xs text-gray-500 mt-2">
                      Cena od {derivedSelection.priceCzk} Kč • {derivedSelection.durationMinutes} min
                    </p>
                  )}
                </div>
              </div>

              <div
                ref={(el) => {
                  fieldRefs.current["dateTime"] = el;
                }}
              >
                <Label className="text-gray-700 font-medium">
                  Preferovaný termín{" "}
                  {attemptedSubmit &&
                    (!bookingForm.date || !bookingForm.time) && (
                      <span className="text-[#FF6B35]">*</span>
                    )}
                </Label>

                <div className="mt-2">
                  <CompactDateTimePicker
                    selectedDate={bookingForm.date}
                    selectedTime={bookingForm.time}
                    onDateSelect={handleDateSelect}
                    onTimeSelect={handleTimeSelect}
                    availableStartTimes={availableTimeSlots}
                    bookedTimes={bookedTimes}
                    vacations={vacations}
                    isLoadingAvailability={isAvailabilityLoading}
                  />
                </div>

                {errors.date && (
                  <p className="text-[#FF6B35] text-sm mt-1">{errors.date}</p>
                )}
                {errors.time && (
                  <p className="text-[#FF6B35] text-sm mt-1">{errors.time}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Poznámka (volitelné)</Label>
                <div className="mt-2">
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Např. speciální požadavek, alergie, poznámka k účesu…"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {bookingForm.notes.length}/500
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-montserrat bg-[#FF6B35] hover:!bg-[#FF6B35] text-white !border-none px-12 rounded-full text-xl sm:text-2xl hover:scale-105 active:scale-99 transition-all duration-200 relative overflow-visible group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[60px] sm:h-[64px] flex items-center justify-center shadow-none outline-none focus:outline-none focus-visible:ring-0"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span className="relative z-10">Odesílání...</span>
                  </div>
                ) : (
                  <>
                    <span className="absolute inset-[-3px] rounded-full animate-border-rotate" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 340deg, rgba(255, 255, 255, 0.9) 350deg, rgba(255, 255, 255, 0) 360deg)' }}></span>
                    <span className="absolute inset-0 bg-[#FF6B35] rounded-full"></span>
                    <span className="relative z-10">Odeslat objednávku</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 group-hover:opacity-70 animate-shimmer z-[5]"></span>
                  </>
                )}
              </Button>

              <p className="mt-2 text-xs text-gray-500 leading-relaxed text-center">
                Odesláním rezervace berete na vědomí{" "}
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("showPrivacyPolicy"));
                  }}
                  className="text-gray-600 underline underline-offset-2 hover:text-[#FF6B35] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]/30 rounded-sm"
                  aria-label="Otevřít Zásady ochrany osobních údajů"
                >
                  Zásady ochrany osobních údajů
                </button>{" "}
                a{" "}
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("showTermsOfService"));
                  }}
                  className="text-gray-600 underline underline-offset-2 hover:text-[#FF6B35] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]/30 rounded-sm"
                  aria-label="Otevřít Všeobecné obchodní podmínky"
                >
                  Všeobecné obchodní podmínky
                </button>
                .
              </p>
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

        @keyframes borderRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-shimmer {
          animation: shimmer 4s ease-in-out infinite;
        }

        .animate-border-rotate {
          animation: borderRotate 6s linear infinite;
          pointer-events: none;
        }

        .group:hover .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }

        .group:hover .animate-border-rotate {
          animation: borderRotate 2s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Booking;
