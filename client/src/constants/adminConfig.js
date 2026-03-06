export const adminSidebarSections = [
  {
    title: "Overview",
    links: [{ label: "Dashboard", to: "/admin-dashboard" }],
  },
  {
    title: "User Controls",
    links: [
      { label: "Profile Management", to: "/admin-dashboard/profile-management" },
      { label: "Delete Any User", to: "/admin-dashboard/users/delete-user" },
      { label: "Update Any User", to: "/admin-dashboard/users/update-user" },
      { label: "View All Users", to: "/admin-dashboard/users-roles/view-all-users" },
      { label: "Update User Roles", to: "/admin-dashboard/users-roles/update-user-roles" },
      { label: "Suspend/Activate Users", to: "/admin-dashboard/users-roles/suspend-activate-users" },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Manage News Feed", to: "/admin-dashboard/news/manage-news-feed" },
      { label: "Create News", to: "/admin-dashboard/news/create-news" },
      { label: "Edit News", to: "/admin-dashboard/news/edit-news" },
      { label: "Delete News", to: "/admin-dashboard/news/delete-news" },
      { label: "Blog", to: "/admin-dashboard/blog" },
    ],
  },
  {
    title: "Media",
    links: [
      { label: "Upload Notes", to: "/admin-dashboard/media/upload-notes" },
      { label: "Upload Past Papers", to: "/admin-dashboard/media/upload-past-papers" },
      { label: "Upload Timetable", to: "/admin-dashboard/media/upload-timetable" },
    ],
  },
  {
    title: "Hostels & Verification",
    links: [
      { label: "Add Hostel", to: "/admin-dashboard/hostels/add-hostel" },
      { label: "Update Hostel", to: "/admin-dashboard/hostels/update-hostel" },
      { label: "Delete Hostel", to: "/admin-dashboard/hostels/delete-hostel" },
      { label: "Approve/Reject Posts", to: "/admin-dashboard/verify/approve-reject-posts" },
      { label: "Approve/Reject Events", to: "/admin-dashboard/verify/approve-reject-events" },
    ],
  },
];

export const adminModuleRoutes = [
  {
    path: "profile-management",
    title: "Profile Management",
    description: "Review and update admin profile metadata and session settings.",
    tableTitle: "Profile Data",
    columns: ["Field", "Current Value", "Status"],
    rows: [
      ["Display Name", "UniLink Admin", "Synced"],
      ["Contact Email", "admin@unilink.edu", "Verified"],
      ["Security", "MFA Pending", "Action Needed"],
    ],
  },
  {
    path: "users/delete-user",
    title: "Delete Any User",
    description: "Select users that should be removed from the platform.",
    tableTitle: "Deletion Queue",
    columns: ["User", "Role", "Reason", "Action"],
    rows: [
      ["Ayesha Khan", "student", "Duplicate account", "Delete"],
      ["Bilal Ahmed", "faculty", "Policy violation", "Delete"],
    ],
  },
  {
    path: "users/update-user",
    title: "Update Any User",
    description: "Edit user account fields and update verification details.",
    tableTitle: "Editable User Records",
    columns: ["User", "Role", "Email", "Action"],
    rows: [
      ["Saad Iqbal", "student", "saad@uni.edu", "Edit"],
      ["Hina Raza", "faculty", "hina@uni.edu", "Edit"],
    ],
  },
  {
    path: "news/manage-news-feed",
    title: "Manage News Feed",
    description: "Monitor news lifecycle, publishing status, and scheduling.",
    tableTitle: "News Feed Items",
    columns: ["Headline", "Author", "Status", "Updated"],
    rows: [
      ["Semester Schedule Released", "Admin", "Published", "2h ago"],
      ["Exam Rules Update", "Faculty", "Draft", "6h ago"],
    ],
  },
  {
    path: "news/create-news",
    title: "Create News",
    description: "Create a new news update and publish it to the student feed.",
    mode: "news-form",
  },
  {
    path: "news/edit-news",
    title: "Edit News",
    description: "Modify existing news items and update publication details.",
    tableTitle: "Editable News",
    columns: ["Headline", "Status", "Last Editor", "Action"],
    rows: [
      ["Hostel Fee Reminder", "Published", "Admin", "Edit"],
      ["Library Notice", "Draft", "Admin", "Edit"],
    ],
  },
  {
    path: "news/delete-news",
    title: "Delete News",
    description: "Remove outdated or invalid news posts from the portal.",
    tableTitle: "News Deletion",
    columns: ["Headline", "Category", "Created", "Action"],
    rows: [
      ["Event Cancellation", "Events", "Jan 08", "Delete"],
      ["Old Admissions Alert", "Admissions", "Jan 03", "Delete"],
    ],
  },
  {
    path: "users-roles/view-all-users",
    title: "View All Users",
    description: "Central user directory with role and account status visibility.",
    tableTitle: "User Directory",
    columns: ["Name", "Email", "Role", "Status"],
    rows: [
      ["Ali Noor", "ali@uni.edu", "student", "Active"],
      ["Sara Khan", "sara@uni.edu", "faculty", "Active"],
      ["Umer Shah", "umer@uni.edu", "admin", "Active"],
    ],
  },
  {
    path: "users-roles/update-user-roles",
    title: "Update User Roles",
    description: "Promote or demote users across admin, faculty, and student roles.",
    tableTitle: "Role Updates",
    columns: ["User", "Current Role", "New Role", "Action"],
    rows: [
      ["Maha Tariq", "student", "faculty", "Save"],
      ["Faisal Awan", "faculty", "admin", "Save"],
    ],
  },
  {
    path: "users-roles/suspend-activate-users",
    title: "Suspend or Activate Users",
    description: "Control account state for moderation and operational support.",
    tableTitle: "Account Status Controls",
    columns: ["User", "Role", "Current State", "Action"],
    rows: [
      ["Komal Yousaf", "student", "Suspended", "Activate"],
      ["Rafay Ali", "student", "Active", "Suspend"],
    ],
  },
  {
    path: "media/upload-notes",
    title: "Upload Notes",
    description: "Upload or stage academic notes for students.",
    mode: "upload",
    uploadType: "notes",
  },
  {
    path: "media/upload-past-papers",
    title: "Upload Past Papers",
    description: "Upload previous exam papers for archived access.",
    mode: "upload",
    uploadType: "past-papers",
  },
  {
    path: "media/upload-timetable",
    title: "Upload Timetable",
    description: "Upload class timetables and session plans for departments.",
    mode: "upload",
    uploadType: "timetable",
  },
  {
    path: "hostels/add-hostel",
    title: "Add Hostel",
    description: "Create hostel records and initialize listing status.",
    tableTitle: "Hostel Records",
    columns: ["Hostel", "Capacity", "Rooms", "Action"],
    rows: [
      ["Al Noor Hostel", "320", "160", "Add"],
      ["Iqra Girls Hostel", "280", "140", "Add"],
    ],
  },
  {
    path: "hostels/update-hostel",
    title: "Update Hostel",
    description: "Update hostel rates, availability, and contact details.",
    tableTitle: "Hostel Updates",
    columns: ["Hostel", "Updated Field", "Value", "Action"],
    rows: [
      ["Al Noor Hostel", "Monthly Fee", "22000", "Update"],
      ["Iqra Girls Hostel", "Available Rooms", "18", "Update"],
    ],
  },
  {
    path: "hostels/delete-hostel",
    title: "Delete Hostel",
    description: "Remove invalid or retired hostel listings.",
    tableTitle: "Hostel Deletion",
    columns: ["Hostel", "Reason", "Listed On", "Action"],
    rows: [
      ["Metro Hostel", "Closed", "Nov 2025", "Delete"],
      ["Campus View", "Duplicate", "Dec 2025", "Delete"],
    ],
  },
  {
    path: "verify/approve-reject-posts",
    title: "Approve/Reject Posts",
    description: "Moderate platform posts before public visibility.",
    tableTitle: "Post Moderation",
    columns: ["Post", "Submitted By", "Category", "Action"],
    rows: [
      ["Need roommate in Block B", "Student", "Housing", "Approve / Reject"],
      ["Book exchange request", "Student", "Marketplace", "Approve / Reject"],
    ],
  },
  {
    path: "verify/approve-reject-events",
    title: "Approve/Reject Events",
    description: "Review event requests and publication eligibility.",
    tableTitle: "Event Moderation",
    columns: ["Event", "Organizer", "Date", "Action"],
    rows: [
      ["AI Society Meetup", "Faculty Club", "Mar 12", "Approve / Reject"],
      ["Cricket Trials", "Sports Office", "Mar 18", "Approve / Reject"],
    ],
  },
  {
    path: "blog",
    title: "Blog",
    description: "Manage official blogs and public updates from admin panel.",
    tableTitle: "Blog Management",
    columns: ["Title", "Author", "Visibility", "Action"],
    rows: [
      ["Campus Safety Guide", "Admin", "Public", "Edit"],
      ["Orientation Highlights", "Admin", "Public", "Edit"],
    ],
  },
];

export const quickActionLinks = [
  { label: "Create News", to: "/admin-dashboard/news/create-news" },
  { label: "View Users", to: "/admin-dashboard/users-roles/view-all-users" },
  { label: "Upload Notes", to: "/admin-dashboard/media/upload-notes" },
];
