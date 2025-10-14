# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlekCuts is a Next.js 15 barbershop booking application for a salon in Bruntál, Czech Republic. The app allows customers to book appointments online (both authenticated and anonymous bookings), manage appointments, and provides an admin panel for business management.

**Tech Stack:**

- Next.js 15 (App Router with RSC)
- React 19
- TypeScript
- Tailwind CSS 4
- Convex (backend-as-a-service for database, auth, and real-time updates)
- Clerk (authentication)
- shadcn/ui components
- Resend (email notifications)

## Essential Commands

### Development

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

### Convex Backend

```bash
npx convex dev           # Start Convex backend in development mode
npx convex deploy        # Deploy Convex backend to production
```

### Testing & Debugging

- Use browser DevTools with React DevTools extension
- Check Convex dashboard for backend logs and database inspection
- Check Clerk dashboard for authentication issues

## Architecture Overview

### Authentication Flow

- **Clerk** handles user authentication (sign-in/sign-up)
- **Convex + Clerk integration** via `ConvexProviderWithClerk` provides authenticated queries/mutations
- **Webhook** (`convex/http.ts`) syncs Clerk users to Convex database
- **Anonymous bookings** are supported - stored with `userId: "anonymous"`
- **Auto-linking**: When anonymous users sign up, their previous bookings are linked via `linkAnonymousAppointments` mutation

### Database Schema (Convex)

Located in `convex/schema.ts`:

- **appointments**: Stores all bookings (both authenticated and anonymous)
- **userRoles**: Maps users to roles (user/admin)
- **emailLogs**: Tracks all sent emails for audit trail
- **users**: Synced from Clerk via webhook

### State Management & Data Flow

1. **React Query Pattern**: Convex uses hooks (`useQuery`, `useMutation`) similar to React Query
2. **Real-time Updates**: Convex queries automatically subscribe to database changes
3. **Optimistic Updates**: UI updates immediately, syncs with backend automatically
4. **Auth Context**: Available through `useAuth()` from Clerk throughout the app

### Component Architecture

- **Page Structure**: `src/app/page.tsx` conditionally renders views based on auth state
  - Unauthenticated: Full landing page (Hero → Services → Gallery → Booking → Footer)
  - Authenticated: Same as above, plus Dashboard and Admin views
- **Layout**: `src/app/layout.tsx` wraps app with ClerkProvider → ConvexClientProvider → Navbar
- **View Switching**: Custom event system (`viewChange` events) for navigation between Home/Dashboard/Admin
- **Modal System**: Custom event-driven modals for legal documents (Privacy, Terms, Business Info)

### Backend Functions (Convex)

Key files in `convex/` directory:

**appointments.ts**: Core booking logic

- `createAppointment` / `createAnonymousAppointment`: Create bookings
- `getMyAppointments`: Fetch user's bookings
- `cancelAppointment`: Cancel booking
- `linkAnonymousAppointments`: Link anonymous bookings to authenticated user
- Debug functions for troubleshooting (`debugAllAppointments`, etc.)

**admin.ts**: Admin-only operations

- `getAllAppointments`: View all bookings
- `updateAppointmentStatus`: Change booking status (triggers email)
- `deleteAppointment`: Remove booking
- `getAdminDashboardStats`: Statistics for admin panel
- Manual email controls for admins

**notifications.ts**: Email system (assumed, referenced in mutations)

- Auto-sends confirmation emails on booking creation
- Sends status update emails on booking changes
- Daily reminders via cron jobs

**crons.ts**: Scheduled tasks (likely for appointment reminders)

**roles.ts**: Role-based access control helpers

**users.ts**: User management and Clerk webhook handler

### Styling & UI

- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Pre-built components in `src/components/ui/`
- **Custom fonts**: Anek and Aileron loaded in `src/fonts/fonts.ts`
- **Responsive**: Mobile-first design with breakpoints

### Key Features

1. **Anonymous Booking**: Users can book without signing up (requires phone number)
2. **Authenticated Booking**: Signed-in users can track their appointments
3. **Real-time Availability**: Calendar shows booked slots in real-time
4. **Business Hours**: Monday-Wednesday, Friday: 9:00-11:45, 13:00-17:00 | Thursday: 13:00-21:00
5. **Email Notifications**: Automatic confirmation and reminder emails
6. **Admin Panel**: Manage all appointments, view statistics
7. **2-hour minimum booking**: Prevents last-minute bookings

## Important Patterns & Conventions

### Working with Convex

- Always check authentication in mutations: `const identity = await ctx.auth.getUserIdentity()`
- Use indexes for efficient queries (defined in schema)
- Schedule background tasks with `ctx.scheduler.runAfter()`
- Handle errors gracefully - don't throw if non-critical operations fail (e.g., email sending)

### Component Structure

- **Client Components**: Mark with `"use client"` for interactivity
- **Server Components**: Use by default for better performance
- **Type Safety**: Import types from `convex/_generated/dataModel` for Convex documents

### Error Handling

- Use `toast.error()` from `sonner` for user-facing errors
- Log errors to console for debugging
- Always validate form inputs before submission
- Check for duplicate bookings before creation

### Czech Language

- All user-facing text is in Czech
- Date/time formatting uses `cs-CZ` locale
- Use Czech business terminology (e.g., "objednávka" for booking)

## Environment Variables

Required in `.env.local`:

```
# Convex
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Resend (for emails)
RESEND_API_KEY=
```

## Deployment Notes

- **Production URL**: flekcuts.cz
- **Hosting**: Likely Vercel (Next.js native)
- **Standalone Output**: Configured for Docker deployments
- **Image Optimization**: Configured for Unsplash and custom CDN
- **Speed Insights**: Vercel analytics integrated

## Common Tasks

### Adding a New Service

1. Update service list in `src/components/Booking.tsx` (services array)
2. Update the same list in `src/components/Services.tsx` for display
3. Update price calculation in confirmation modal

### Modifying Business Hours

1. Update `getTimeSlots()` function in `src/components/Booking.tsx`
2. Update structured data in `src/app/layout.tsx` (Schema.org JSON-LD)

### Adding a New Admin Feature

1. Create function in `convex/admin.ts` with `checkIsAdmin` helper
2. Add UI in `src/components/AdminPanel.tsx`
3. Use `useMutation` or `useQuery` to call the function

### Debugging Bookings

- Use debug functions in `convex/appointments.ts`:
  - `debugAllAppointments`: See all bookings
  - `debugAppointmentsByEmail`: Find bookings by email
  - `debugCurrentUser`: Check current user identity
  - `manualLinkAppointments`: Manually link anonymous bookings

## File Structure Highlights

```
convex/
  appointments.ts       # Booking CRUD operations
  admin.ts             # Admin-only functions
  schema.ts            # Database schema
  http.ts              # Clerk webhook handler
  notifications.ts     # Email system (inferred)

src/
  app/
    layout.tsx         # Root layout, metadata, providers
    page.tsx           # Main page with view switching
    globals.css        # Global styles

  components/
    Booking.tsx        # Booking form with calendar
    AdminPanel.tsx     # Admin dashboard
    UserAppointments.tsx  # User's booking list
    Navbar.tsx         # Navigation
    Hero.tsx           # Landing hero section
    Services.tsx       # Services showcase
    Gallery.tsx        # Photo gallery
    Footer.tsx         # Footer with legal links
    ui/                # shadcn/ui components
```

## SEO & Metadata

- Comprehensive Open Graph and Twitter Card metadata in `layout.tsx`
- Schema.org structured data for local business
- Geo-coordinates for local SEO (Bruntál location)
- Keywords optimized for Czech local search

## Git Workflow Guidelines

Claude should commit and push code after every **meaningful change** (e.g., new feature, backend logic update, schema change, business rule update). Small cosmetic edits (spacing, typos) can be grouped before committing.

### Commit & Push Rules

1. **Stage all modified files**:
   ```bash
   git add .
   ```
