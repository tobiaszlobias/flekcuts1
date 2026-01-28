"use client";

import { useConvex, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmationDialog from "./ConfirmationDialog";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOKING_DROPDOWN_SERVICES, deriveServiceSelection } from "@/lib/services";
import {
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  TrendingUp,
  Phone,
  RotateCcw,
} from "lucide-react";

const timeToMinutes = (time: string) => {
  const [hoursStr, minutesStr = "0"] = time.split(":");
  return Number(hoursStr) * 60 + Number(minutesStr);
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const getLocalNow = (): { date: string; yearMonth: string; minutes: number } => {
  const d = new Date();
  const year = d.getFullYear();
  const month = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return {
    date: `${year}-${month}-${day}`,
    yearMonth: `${year}-${month}`,
    minutes: d.getHours() * 60 + d.getMinutes(),
  };
};

const getTodayInPrague = (): { date: string; yearMonth: string } => {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Prague",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
  } catch {
    const local = getLocalNow();
    return { date: local.date, yearMonth: local.yearMonth };
  }
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = get("year") || new Date().getFullYear().toString();
  const month = get("month") || String(new Date().getMonth() + 1).padStart(2, "0");
  const day = get("day") || String(new Date().getDate()).padStart(2, "0");
  return { date: `${year}-${month}-${day}`, yearMonth: `${year}-${month}` };
};

const getNowInPrague = (): { date: string; minutes: number } => {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Prague",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
  } catch {
    const local = getLocalNow();
    return { date: local.date, minutes: local.minutes };
  }
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = get("year") || new Date().getFullYear().toString();
  const month = get("month") || String(new Date().getMonth() + 1).padStart(2, "0");
  const day = get("day") || String(new Date().getDate()).padStart(2, "0");
  const hour = Number(get("hour") || "0");
  const minute = Number(get("minute") || "0");
  return { date: `${year}-${month}-${day}`, minutes: hour * 60 + minute };
};

export default function AdminPanel() {
  const convex = useConvex();
  const appointments = useQuery(api.admin.getAllAppointments);
  const updateStatus = useMutation(api.admin.updateAppointmentStatus);
  const deleteAppointment = useMutation(api.admin.deleteAppointment);
  const vacations = useQuery(api.admin.getAllVacations);
  const createVacation = useMutation(api.admin.createVacation);
  const deleteVacation = useMutation(api.admin.deleteVacation);
  const createInternalBlock = useMutation(api.admin.createInternalBlock);
  const deleteInternalBlock = useMutation(api.admin.deleteInternalBlock);

  const [mode, setMode] = useState<"overview" | "manage">("overview");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [appointmentToDeleteId, setAppointmentToDeleteId] = useState<Id<"appointments"> | null>(null);
  const [showVacationUi, setShowVacationUi] = useState(false);
  const [showInternalBlockUi, setShowInternalBlockUi] = useState(false);
  const [internalBlocks, setInternalBlocks] = useState<any[] | null>(null);
  const [internalBlocksError, setInternalBlocksError] = useState<string | null>(null);
  const [vacationForm, setVacationForm] = useState<{
    startDate: string;
    endDate: string;
    allDay: boolean;
    startTime: string;
    endTime: string;
    note: string;
  }>({
    startDate: "",
    endDate: "",
    allDay: true,
    startTime: "",
    endTime: "",
    note: "",
  });
  const [isSavingVacation, setIsSavingVacation] = useState(false);
  const [internalBlockForm, setInternalBlockForm] = useState<{
    date: string;
    time: string;
    service: string;
    addBeard: boolean;
    addWash: boolean;
    note: string;
  }>({
    date: "",
    time: "",
    service: "",
    addBeard: false,
    addWash: false,
    note: "",
  });
  const [isSavingInternalBlock, setIsSavingInternalBlock] = useState(false);

  const loadInternalBlocks = async () => {
    try {
      setInternalBlocksError(null);
      const result = await convex.query(api.admin.getMyInternalBlocks, {});
      setInternalBlocks(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Failed to load internal blocks:", error);
      setInternalBlocks([]);
      setInternalBlocksError(
        "Nepodařilo se načíst vlastní termíny. Zkontrolujte, že je nasazený Convex backend."
      );
    }
  };

  useEffect(() => {
    void loadInternalBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatVacationDate = (date: string) =>
    new Date(date + "T00:00:00").toLocaleDateString("cs-CZ", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleCreateVacation = async () => {
    const startDate = vacationForm.startDate.trim();
    const endDate = vacationForm.endDate.trim();
    const note = vacationForm.note.trim();
    const startTime = vacationForm.allDay ? "" : vacationForm.startTime.trim();
    const endTime = vacationForm.allDay ? "" : vacationForm.endTime.trim();

    if (!startDate || !endDate) {
      toast.error("Vyplňte datum od a do");
      return;
    }

    if (!vacationForm.allDay && (!startTime || !endTime)) {
      toast.error("Vyplňte čas od i do (nebo zvolte celý den)");
      return;
    }

    setIsSavingVacation(true);
    try {
      await createVacation({
        startDate,
        endDate,
        startTime: startTime ? startTime : undefined,
        endTime: endTime ? endTime : undefined,
        note: note ? note : undefined,
      });
      toast.success("Dovolená byla přidána");
      setVacationForm({
        startDate: "",
        endDate: "",
        allDay: true,
        startTime: "",
        endTime: "",
        note: "",
      });
    } catch (error) {
      console.error("Failed to create vacation:", error);
      toast.error("Nepodařilo se přidat dovolenou");
    } finally {
      setIsSavingVacation(false);
    }
  };

  const handleDeleteVacation = async (vacationId: Id<"vacations">) => {
    try {
      await deleteVacation({ vacationId });
      toast.success("Dovolená byla smazána");
    } catch (error) {
      console.error("Failed to delete vacation:", error);
      toast.error("Nepodařilo se smazat dovolenou");
    }
  };

  const handleCreateInternalBlock = async () => {
    const date = internalBlockForm.date.trim();
    const time = internalBlockForm.time.trim();
    const note = internalBlockForm.note.trim();
    const baseName = internalBlockForm.service.trim();

    if (!date || !time) {
      toast.error("Vyplňte datum a čas");
      return;
    }
    if (!baseName) {
      toast.error("Vyberte službu");
      return;
    }

    const derived = deriveServiceSelection({
      baseName,
      addBeard: internalBlockForm.addBeard,
      addWash: internalBlockForm.addWash,
    });

    setIsSavingInternalBlock(true);
    try {
      await createInternalBlock({
        date,
        time,
        service: derived.displayName ? derived.displayName : undefined,
        durationMinutes: derived.durationMinutes ? derived.durationMinutes : undefined,
        note: note ? note : undefined,
      });
      toast.success("Vlastní termín byl přidán");
      setInternalBlockForm({
        date: "",
        time: "",
        service: "",
        addBeard: false,
        addWash: false,
        note: "",
      });
      await loadInternalBlocks();
    } catch (error) {
      console.error("Failed to create internal block:", error);
      toast.error("Nepodařilo se přidat vlastní termín");
    } finally {
      setIsSavingInternalBlock(false);
    }
  };

  const handleDeleteInternalBlock = async (blockId: Id<any>) => {
    try {
      await deleteInternalBlock({ blockId });
      toast.success("Vlastní termín byl smazán");
      await loadInternalBlocks();
    } catch (error) {
      console.error("Failed to delete internal block:", error);
      toast.error("Nepodařilo se smazat vlastní termín");
    }
  };

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

  if (appointments === undefined) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
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

  const filteredAppointments = appointments;
  const vacationList = vacations || [];
  const internalBlockList = internalBlocks || [];

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

  const prague = getTodayInPrague();
  const nowPrague = getNowInPrague();
  const todayCount = appointments.filter((a) => a.date === prague.date).length;
  const monthCount = appointments.filter((a) => a.date.startsWith(prague.yearMonth)).length;

  const sortedAppointments = filteredAppointments
    .slice()
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

  const sortedInternalBlocks = internalBlockList
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

  const blocksByDate = sortedInternalBlocks.reduce<Record<string, typeof sortedInternalBlocks>>(
    (acc, blk) => {
      (acc[blk.date] ||= []).push(blk);
      return acc;
    },
    {}
  );

  const dateKeys = Array.from(
    new Set([...Object.keys(appointmentsByDate), ...Object.keys(blocksByDate)])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-crimson italic text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              }}
              className={`font-montserrat ${
                mode === "manage"
                  ? "bg-[#FF6B35] hover:bg-[#E5572C] text-white shadow-sm"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#FF6B35] hover:bg-gray-50"
              } px-4 py-2 rounded-full text-sm font-medium transition-colors`}
            >
              Upravit
            </Button>
            <Button
              onClick={() => setShowVacationUi((v) => !v)}
              className={`font-montserrat ${
                showVacationUi
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-white border-2 border-blue-200 text-blue-800 hover:bg-blue-50"
              } px-4 py-2 rounded-full text-sm font-medium transition-colors`}
            >
              Přidat dovolenou
            </Button>
            <Button
              onClick={() => setShowInternalBlockUi((v) => !v)}
              className={`font-montserrat ${
                showInternalBlockUi
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-white border-2 border-blue-200 text-blue-800 hover:bg-blue-50"
              } px-4 py-2 rounded-full text-sm font-medium transition-colors`}
            >
              Vlastní termín
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-700" />
              </div>
              <div className="font-montserrat text-xs text-blue-800/80">Dnes</div>
            </div>
            <div className="mt-2 font-montserrat text-3xl font-bold text-blue-800">
              {todayCount}
            </div>
            <div className="font-montserrat text-xs text-blue-800/70">
              objednávek dnes
            </div>
          </div>

          <div className="rounded-xl border border-[#FF6B35]/25 bg-[#FF6B35]/10 p-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-white/70 rounded-lg flex items-center justify-center border border-[#FF6B35]/20">
                <Calendar className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div className="font-montserrat text-xs text-[#FF6B35]/80">
                Celkem za měsíc
              </div>
            </div>
            <div className="mt-2 font-montserrat text-3xl font-bold text-[#FF6B35]">
              {monthCount}
            </div>
            <div className="font-montserrat text-xs text-[#FF6B35]/70">
              objednávek tento měsíc
            </div>
          </div>
        </div>

        {/* Vacations */}
        {showVacationUi && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-montserrat text-lg font-bold text-gray-900">
                Dovolená
              </h3>
              <p className="font-montserrat text-sm text-gray-600">
                Přidané dny se zobrazí v kalendáři (modře) a blokují rezervace.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-700">Datum od</Label>
                  <Input
                    type="date"
                    value={vacationForm.startDate}
                    onChange={(e) =>
                      setVacationForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Datum do</Label>
                  <Input
                    type="date"
                    value={vacationForm.endDate}
                    onChange={(e) =>
                      setVacationForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    id="vac-all-day"
                    type="checkbox"
                    checked={vacationForm.allDay}
                    onChange={(e) =>
                      setVacationForm((prev) => ({
                        ...prev,
                        allDay: e.target.checked,
                        startTime: e.target.checked ? "" : prev.startTime,
                        endTime: e.target.checked ? "" : prev.endTime,
                      }))
                    }
                    className="h-4 w-4 accent-blue-600"
                  />
                  <Label htmlFor="vac-all-day" className="text-gray-700">
                    Celý den
                  </Label>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-700">Čas od</Label>
                  <Input
                    type="time"
                    value={vacationForm.startTime}
                    onChange={(e) =>
                      setVacationForm((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    disabled={vacationForm.allDay}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Čas do</Label>
                  <Input
                    type="time"
                    value={vacationForm.endTime}
                    onChange={(e) =>
                      setVacationForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    disabled={vacationForm.allDay}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-3">
                <Label className="text-gray-700">Poznámka (volitelné)</Label>
                <Input
                  value={vacationForm.note}
                  onChange={(e) =>
                    setVacationForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Např. dovolená"
                  className="mt-1"
                />
              </div>

              <div className="mt-4">
                <Button
                  onClick={handleCreateVacation}
                  disabled={isSavingVacation}
                  className="w-full font-montserrat bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 shadow-sm"
                >
                  {isSavingVacation ? "Ukládám..." : "Přidat dovolenou"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              {vacations === undefined ? (
                <div className="text-sm text-gray-500">Načítání…</div>
              ) : vacationList.length === 0 ? (
                <div className="text-sm text-gray-500">Zatím žádná dovolená</div>
              ) : (
                <div className="space-y-2">
                  {vacationList.map((v) => {
                    const dateLabel =
                      v.startDate === v.endDate
                        ? formatVacationDate(v.startDate)
                        : `${formatVacationDate(v.startDate)} – ${formatVacationDate(v.endDate)}`;
                    const timeLabel =
                      v.startTime && v.endTime ? `${v.startTime}–${v.endTime}` : "celý den";
                    return (
                      <div
                        key={v._id}
                        className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-2 w-2 rounded-full bg-blue-600" />
                              <div className="font-montserrat text-sm font-semibold text-gray-900 truncate">
                                {dateLabel}
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-700">
                              <Clock className="h-3.5 w-3.5 text-blue-700" />
                              <span className="font-montserrat">{timeLabel}</span>
                            </div>
                            {v.note && (
                              <div className="mt-1 font-montserrat text-xs text-gray-600">
                                {v.note}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handleDeleteVacation(v._id)}
                            variant="outline"
                            className="border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:bg-white rounded-xl px-3 py-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Internal blocks */}
        {showInternalBlockUi && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-montserrat text-lg font-bold text-gray-900">
                  Vlastní termíny
                </h3>
                <p className="font-montserrat text-sm text-gray-600">
                  Termíny jsou viditelné jen v adminu, blokují rezervace a v přehledu jsou modře.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="font-montserrat text-xs text-gray-700">Datum</Label>
                    <Input
                      type="date"
                      value={internalBlockForm.date}
                      onChange={(e) =>
                        setInternalBlockForm((p) => ({ ...p, date: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-montserrat text-xs text-gray-700">Čas</Label>
                    <Input
                      type="time"
                      value={internalBlockForm.time}
                      onChange={(e) =>
                        setInternalBlockForm((p) => ({ ...p, time: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="font-montserrat text-xs text-gray-700">Služba</Label>
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
                      <Select
                        value={internalBlockForm.service}
                        onValueChange={(value) =>
                          setInternalBlockForm((p) => ({ ...p, service: value }))
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Vyberte službu" />
                        </SelectTrigger>
                        <SelectContent>
                          {BOOKING_DROPDOWN_SERVICES.map((s) => (
                            <SelectItem key={s.id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={internalBlockForm.addBeard}
                          onChange={(e) =>
                            setInternalBlockForm((p) => ({ ...p, addBeard: e.target.checked }))
                          }
                        />
                        Vousy
                      </label>

                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={internalBlockForm.addWash}
                          onChange={(e) =>
                            setInternalBlockForm((p) => ({ ...p, addWash: e.target.checked }))
                          }
                        />
                        Mytí
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="font-montserrat text-xs text-gray-700">Poznámka</Label>
                    <Input
                      value={internalBlockForm.note}
                      onChange={(e) =>
                        setInternalBlockForm((p) => ({ ...p, note: e.target.value }))
                      }
                      className="mt-1"
                      placeholder="Např. vlastní klient / blokace"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={handleCreateInternalBlock}
                    disabled={isSavingInternalBlock}
                    className="w-full font-montserrat bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2"
                  >
                    {isSavingInternalBlock ? "Ukládám..." : "Přidat vlastní termín"}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="font-montserrat text-sm font-semibold text-gray-900 mb-3">
                  Seznam
                </div>
                {internalBlocksError ? (
                  <div className="text-sm text-red-600">{internalBlocksError}</div>
                ) : internalBlocks === null ? (
                  <div className="text-sm text-gray-500">Načítám...</div>
                ) : internalBlockList.length === 0 ? (
                  <div className="text-sm text-gray-500">Zatím žádné vlastní termíny</div>
                ) : (
                  <div className="space-y-2">
                    {sortedInternalBlocks.map((b) => (
                      <div
                        key={b._id}
                        className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-2 w-2 rounded-full bg-blue-600" />
                              <div className="font-montserrat text-sm font-semibold text-gray-900 truncate">
                                {new Date(b.date + "T00:00:00").toLocaleDateString("cs-CZ", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}{" "}
                                • {b.time}
                              </div>
                            </div>
                            <div className="mt-1 font-montserrat text-xs text-gray-700">
                              {(b.service || "Blokace") + ` (${b.durationMinutes} min)`}
                            </div>
                            {b.note && (
                              <div className="mt-1 font-montserrat text-xs text-gray-600">
                                {b.note}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handleDeleteInternalBlock(b._id)}
                            variant="outline"
                            className="border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:bg-white rounded-xl px-3 py-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-montserrat text-xl font-bold text-gray-900">
              {mode === "overview"
                ? `Přehled (${sortedAppointments.length} objednávek, ${sortedInternalBlocks.length} blokací)`
                : `Upravit (${sortedAppointments.length} objednávek, ${sortedInternalBlocks.length} blokací)`}
            </h3>
          </div>

          <div className="space-y-4">
            {sortedAppointments.length === 0 && sortedInternalBlocks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-montserrat text-gray-600">Žádné položky k zobrazení</p>
              </div>
            ) : (
              dateKeys.map((date) => (
                <div key={date} className="space-y-2">
                  {(() => {
                    const dayAppointments = appointmentsByDate[date] || [];
                    const dayBlocks = blocksByDate[date] || [];
                    const totalCount = dayAppointments.length + dayBlocks.length;
                    const doneCount = dayAppointments.filter((a) => a.status === "confirmed").length;
                    return (
                  <div className="sticky top-2 z-10">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full backdrop-blur border px-4 py-2 shadow-sm ${
                        date === prague.date
                          ? "bg-[#FFF4EF]/90 border-[#FF6B35]/20"
                          : "bg-white/90 border-gray-200"
                      }`}
                    >
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
                        ({totalCount})
                      </span>
                      {date === prague.date && (
                        <span className="inline-flex items-center rounded-full bg-[#FF6B35]/10 text-[#FF6B35] px-2 py-0.5 text-xs font-semibold">
                          Dnes
                        </span>
                      )}
                      <span className="font-montserrat text-xs text-gray-500">
                        Hotovo {doneCount}/{dayAppointments.length}
                      </span>
                    </div>
                  </div>
                    );
                  })()}

                  {(() => {
                    const dayAppointments = appointmentsByDate[date] || [];
                    const dayBlocks = blocksByDate[date] || [];
                    const items: Array<
                      | { kind: "appointment"; value: (typeof sortedAppointments)[number] }
                      | { kind: "block"; value: (typeof sortedInternalBlocks)[number] }
                    > = [
                      ...dayAppointments.map((a) => ({ kind: "appointment" as const, value: a })),
                      ...dayBlocks.map((b) => ({ kind: "block" as const, value: b })),
                    ].sort((a, b) => timeToMinutes(a.value.time) - timeToMinutes(b.value.time));

                    return items.map((item) => {
                      if (item.kind === "block") {
                        const block = item.value;
                        const isToday = date === nowPrague.date;
                        const blockMinutes = timeToMinutes(block.time);
                        const isPast =
                          date < nowPrague.date || (isToday && blockMinutes < nowPrague.minutes);
                        const timingLabel = isPast ? "Po termínu" : "Před termínem";
                        const timingChrome = isPast
                          ? "border-gray-200 bg-white text-gray-700"
                          : "border-blue-200 bg-white text-blue-700";

                        return (
                          <div
                            key={block._id}
                            className={`rounded-xl border border-blue-200 bg-blue-50 p-3 ${
                              isToday ? "ring-2 ring-[#FF6B35]/20" : ""
                            }`}
                          >
                            <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr_260px] gap-3 items-center">
                              <div className="rounded-lg bg-white/70 border border-white/60 px-3 py-2 text-center">
                                <div className="font-montserrat text-xl font-bold text-gray-900">
                                  {block.time}
                                </div>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-montserrat text-sm font-semibold text-blue-900 truncate">
                                    {block.service || "Vlastní termín"}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${timingChrome}`}
                                  >
                                    <Clock className="h-3.5 w-3.5" />
                                    {timingLabel}
                                  </span>
                                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2 py-0.5 text-xs font-medium text-blue-700">
                                    {block.durationMinutes} min
                                  </span>
                                </div>
                                {block.note && (
                                  <div className="mt-1 text-xs text-blue-900/80 truncate">
                                    {block.note}
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end gap-2">
                                {mode === "manage" && (
                                  <Button
                                    onClick={() => handleDeleteInternalBlock(block._id)}
                                    variant="outline"
                                    className="border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 hover:bg-white rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Smazat</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const appointment = item.value;
                    const isToday = date === nowPrague.date;
                    const appointmentMinutes = timeToMinutes(appointment.time);
                    const isPast =
                      date < nowPrague.date ||
                      (isToday && appointmentMinutes < nowPrague.minutes);
                    const timingLabel = isPast ? "Po termínu" : "Před termínem";
                    const timingChrome =
                      isPast && appointment.status === "pending"
                        ? "border-red-200 bg-white text-red-700"
                        : isPast
                          ? "border-gray-200 bg-white text-gray-700"
                          : "border-blue-200 bg-white text-blue-700";
                    if (mode === "overview") {
                      return (
                        <div
                          key={appointment._id}
                          className={`rounded-xl border p-3 ${getCardChrome(appointment.status)} ${
                            isToday ? "ring-2 ring-[#FF6B35]/20" : ""
                          }`}
                        >
                          <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr_260px] gap-3 items-center">
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
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${timingChrome}`}
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                  {timingLabel}
                                </span>
                                {appointment.status !== "pending" && (
                                  <span
                                    className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                                      appointment.status === "confirmed"
                                        ? "border-green-200 bg-white text-green-700"
                                        : "border-red-200 bg-white text-red-700"
                                    }`}
                                  >
                                    {getStatusIcon(appointment.status)}
                                    {appointment.status === "confirmed" && "OK"}
                                    {appointment.status === "cancelled" && "Zrušeno"}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 text-xs text-gray-600 truncate">
                                {appointment.customerName} • {appointment.customerEmail}
                                {appointment.customerPhone ? ` • ${appointment.customerPhone}` : ""}
                              </div>
                            </div>

                            <div className="hidden sm:flex justify-end gap-2">
                              {appointment.status === "pending" && (
                                <Button
                                  onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                                  className="font-montserrat bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Hotovo
                                </Button>
                              )}
                              {appointment.status !== "pending" && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-2 text-xs font-medium ${
                                    appointment.status === "confirmed"
                                      ? "border-green-200 bg-white text-green-700"
                                      : "border-red-200 bg-white text-red-700"
                                  }`}
                                >
                                  {getStatusIcon(appointment.status)}
                                  {appointment.status === "confirmed" && "Potvrzeno"}
                                  {appointment.status === "cancelled" && "Zrušeno"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={appointment._id}
                        className={`rounded-xl border p-4 ${getCardChrome(appointment.status)} ${
                          isToday ? "ring-2 ring-[#FF6B35]/20" : ""
                        }`}
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
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${timingChrome}`}
                                  >
                                    <Clock className="h-3.5 w-3.5" />
                                    {timingLabel}
                                  </span>
                                  {appointment.status !== "pending" && (
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium bg-white ${
                                        appointment.status === "confirmed"
                                          ? "border-green-200 text-green-700"
                                          : "border-red-200 text-red-700"
                                      }`}
                                    >
                                      {getStatusIcon(appointment.status)}
                                      {appointment.status === "confirmed" && "Potvrzeno"}
                                      {appointment.status === "cancelled" && "Zrušeno"}
                                    </span>
                                  )}
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
                                  Hotovo
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
                              <>
                                <Button
                                  onClick={() => handleStatusUpdate(appointment._id, "pending")}
                                  variant="outline"
                                  className="flex-1 lg:flex-none font-montserrat border-2 border-gray-300 text-gray-700 hover:border-[#FF6B35] hover:text-[#FF6B35] hover:bg-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Vrátit
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
                    });
                  })()}
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
