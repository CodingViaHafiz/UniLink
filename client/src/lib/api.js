const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const apiFetch = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const headers = isFormData
    ? { ...(options.headers || {}) }                       // Let browser set Content-Type for FormData
    : { "Content-Type": "application/json", ...(options.headers || {}) };

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers,
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export { API_BASE };
