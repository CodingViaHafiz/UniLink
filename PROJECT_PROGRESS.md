# UniLink Project Progress (So Far)

Date: 2026-03-13

**Overview**
UniLink is a MERN application with a React (Vite) frontend and an Express + MongoDB backend. The current build delivers authentication, role-based access control, core modules (blogs, resources, hostels), and admin/faculty dashboards with supporting APIs.

**Backend (Express + MongoDB)**
- API base setup with CORS (credentials enabled), cookie parsing, JSON body parsing, and static serving of `/uploads`.
- Health check endpoint at `/api/health`.
- Auth flow using JWT in HTTP-only cookies (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`).
- Role-based middleware (`protect`, `authorizeRoles`) for student/faculty/admin access control.
- Blog module with create/read/update/delete and ownership checks.
- Resource module with file uploads (notes, past-papers, timetable), filtering by type, and ownership checks.
- Hostel module with image uploads and CRUD for admin users.
- Admin analytics endpoints for stats, activity over recent months, and recent activity feed.
- Upload handling via Multer with per-module folders (`uploads/hostels`, `uploads/resources`).

**Backend Data Models**
- User: `fullName`, `email`, `password`, `role` (student/faculty/admin).
- Blog: `title`, `content`, `author`, `authorId`, `role`.
- Resource: `title`, `description`, `fileUrl`, `type`, `uploadedBy`, `uploadedByName`, `role`.
- Hostel: `name`, `location`, `price`, `contact`, `description`, `imageUrl`, `uploadedBy`.

**Frontend (React + Vite)**
- App routing with protected routes and role-gated routes.
- Auth context with session loading via `/auth/me`, plus `login`, `register`, and `logout` helpers.
- API helper that targets `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api`) and sends cookies.
- Main pages: Home, About, Blogs, Resources by type, Hostels, Auth (login/register), Not Found.
- Faculty dashboard page for faculty-only access.
- Admin dashboard with layout and sections for Overview, Resources, Blogs, and Hostels.
- Toast notifications wired via `react-toastify`.

**Current Module Coverage**
- Authentication and role management.
- Blog publishing and management for faculty/admin.
- Resource uploads and listings by type.
- Hostel listings with image uploads.
- Admin stats and activity reporting endpoints.

**Project Structure**
- Frontend: `client/` (Vite-based React app).
- Backend: `server/` (Express API, MongoDB models, file uploads).

