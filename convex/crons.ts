import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Data retention: delete appointments + email logs 1 day after appointment time.
crons.interval(
  "cleanupOldAppointments",
  { hours: 24 },
  internal.appointments.cleanupOldAppointments,
  {}
);

// SMS připomínka den před termínem — každý den ve 13:00 Prague (= 11:00 UTC v létě)
crons.cron(
  "sendDailySmsReminders",
  "0 11 * * *",
  internal.notifications.sendDailySmsReminders,
  {}
);

export default crons;
