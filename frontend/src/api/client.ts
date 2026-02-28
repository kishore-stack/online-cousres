import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

/* REQUEST */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* RESPONSE */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    /* if access token expired */
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          "http://localhost:5000/auth/refresh",
          { token: refreshToken }
        );

        const newAccess = res.data.accessToken;

        localStorage.setItem("accessToken", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;