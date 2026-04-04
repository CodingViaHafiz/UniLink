import { SERVER_URL } from "../../lib/api";

/**
 * UserAvatar — shows the user's profile photo if set, otherwise falls back to
 * a role-coloured gradient circle with their initial.
 *
 * Props:
 *   user        — the auth user object (needs .fullName, .role, .profileImage)
 *   className   — Tailwind classes that control size AND shape
 *                 e.g. "h-9 w-9 rounded-full" or "h-20 w-20 rounded-2xl"
 *   textSize    — font-size class for the fallback initial (default "text-sm")
 */

const ROLE_GRADIENT = {
  student: "from-sky-400 to-blue-600",
  faculty: "from-blue-500 to-violet-600",
  admin:   "from-emerald-400 to-teal-600",
};

const UserAvatar = ({ user, className = "h-9 w-9 rounded-full", textSize = "text-sm" }) => {
  const initial  = user?.fullName?.charAt(0)?.toUpperCase() || "U";
  const gradient = ROLE_GRADIENT[user?.role] || ROLE_GRADIENT.student;

  if (user?.profileImage) {
    return (
      <img
        src={`${SERVER_URL}${user.profileImage}`}
        alt={user?.fullName || "User"}
        className={`shrink-0 object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br font-black text-white ${gradient} ${textSize} ${className}`}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
