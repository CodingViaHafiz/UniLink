export const adminSidebarSections = [
  {
    title: "Overview",
    links: [{ label: "Dashboard", to: "/admin-dashboard" }],
  },
  {
    title: "Users",
    links: [{ label: "User Management", to: "/admin-dashboard/users" }],
  },
  {
    title: "Content",
    links: [
      { label: "Resources", to: "/admin-dashboard/resources" },
      { label: "Blogs", to: "/admin-dashboard/blogs" },
      { label: "Hostels", to: "/admin-dashboard/hostels" },
      { label: "Calendar", to: "/admin-dashboard/calendar" },
    ],
  },
  {
    title: "Approvals",
    links: [
      { label: "Feedback", to: "/admin-dashboard/feedback" },
      { label: "Marketplace", to: "/admin-dashboard/marketplace" },
      { label: "Lost & Found", to: "/admin-dashboard/lost-found" },
    ],
  },
];

export const quickActionLinks = [
  { label: "Manage Users", to: "/admin-dashboard/users" },
  { label: "Upload Resource", to: "/admin-dashboard/resources" },
  { label: "Publish Blog", to: "/admin-dashboard/blogs" },
  { label: "Add Hostel", to: "/admin-dashboard/hostels" },
];
