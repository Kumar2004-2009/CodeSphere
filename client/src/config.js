const serverUrl = import.meta.env.VITE_SERVER_URL || "";

export const API_URL = serverUrl || window.location.origin.replace(":3000", ":4000");
export const SOCKET_URL = API_URL;
