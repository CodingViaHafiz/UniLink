export const adminSidebarSections = [
  {
    title: "Overview",
    links: [{ label: "Dashboard", to: "/admin-dashboard" }],
  },
  {
    title: "Content",
    links: [
      { label: "Resources", to: "/admin-dashboard/resources" },
      { label: "Blogs", to: "/admin-dashboard/blogs" },
      { label: "Hostels", to: "/admin-dashboard/hostels" },
    ],
  },
];

export const quickActionLinks = [
  { label: "Upload Resource", to: "/admin-dashboard/resources" },
  { label: "Publish Blog", to: "/admin-dashboard/blogs" },
  { label: "Add Hostel", to: "/admin-dashboard/hostels" },
];
