import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Data retention: delete appointments + email logs 1 day after appointment time.
crons.interval("cleanupOldAppointments", { hours: 24 }, api.appointments.cleanupOldAppointments, {});

export default crons;

