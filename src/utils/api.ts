const API_URL = import.meta.env.VITE_APP_API_URL;

export const getApiUrl = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_URL}/dev/${cleanPath}`;
};
