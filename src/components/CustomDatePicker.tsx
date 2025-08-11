"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";

interface CustomDatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  error?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selectedDate,
  onDateSelect,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const workingHours = {
    1: {
      // Monday
      morning: "9:00 - 11:45",
      afternoon: "13:00 - 17:00",
      isWorking: true,
    },
    2: {
      // Tuesday
      morning: "9:00 - 11:45",
      afternoon: "13:00 - 17:00",
      isWorking: true,
    },
    3: {
      // Wednesday
      morning: "9:00 - 11:45",
      afternoon: "13:00 - 17:00",
      isWorking: true,
    },
    4: {
      // Thursday
      morning: "",
      afternoon: "13:00 - 21:00",
      isWorking: true,
    },
    5: {
      // Friday
      morning: "9:00 - 11:45",
      afternoon: "13:00 - 17:00",
      isWorking: true,
    },
    6: {
      // Saturday
      morning: "",
      afternoon: "",
      isWorking: false,
    },
    0: {
      // Sunday
      morning: "",
      afternoon: "",
      isWorking: false,
    },
  };

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

  const dayNames = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Vyberte datum";
    const date = new Date(dateString + "T00:00:00");
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const dayOfWeek = [
      "Neděle",
      "Pondělí",
      "Úterý",
      "Středa",
      "Čtvrtek",
      "Pátek",
      "Sobota",
    ][date.getDay()];
    return `${dayOfWeek}, ${day}. ${month} ${year}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const yearStr = currentDate.getFullYear();
      const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = currentDate.getDate().toString().padStart(2, '0');
      const dateString = `${yearStr}-${monthStr}-${dayStr}`;
      const dayOfWeek = currentDate.getDay();
      const isToday = new Date().toDateString() === currentDate.toDateString();
      const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
      const isWorking =
        workingHours[dayOfWeek as keyof typeof workingHours]?.isWorking;
      const isSelected = selectedDate === dateString;

      days.push({
        day,
        dateString,
        dayOfWeek,
        isToday,
        isPast,
        isWorking,
        isSelected,
        workingHours: workingHours[dayOfWeek as keyof typeof workingHours],
      });
    }

    return days;
  };

  const handleDateClick = (dateString: string, isWorking: boolean) => {
    if (isWorking) {
      onDateSelect(dateString);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const days = getDaysInMonth(currentMonth);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest(".date-picker-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="date-picker-container relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full mt-2 px-3 py-2 border rounded-lg text-left flex items-center justify-between transition-all duration-200 ${
          error ? "border-red-500" : "border-gray-300 hover:border-blue-400"
        } ${isOpen ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {formatDisplayDate(selectedDate)}
        </span>
        <Clock className="w-4 h-4 text-gray-400" />
      </button>

      {/* Custom Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>

            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2"></div>;
              }

              return (
                <div key={day.dateString} className="relative group">
                  <button
                    type="button"
                    onClick={() =>
                      handleDateClick(
                        day.dateString,
                        day.isWorking && !day.isPast
                      )
                    }
                    disabled={!day.isWorking || day.isPast}
                    className={`w-full aspect-square p-1 text-sm rounded-lg transition-all duration-200 relative ${
                      day.isSelected
                        ? "bg-blue-600 text-white font-semibold"
                        : day.isToday
                          ? "bg-blue-100 text-blue-700 font-semibold"
                          : day.isWorking && !day.isPast
                            ? "hover:bg-blue-50 text-gray-900"
                            : "text-gray-300 cursor-not-allowed"
                    }`}
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
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Otevřeno</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span>Zavřeno</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
