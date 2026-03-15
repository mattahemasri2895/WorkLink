// API utility with automatic token refresh
export const apiCall = async (url, options = {}) => {
  let token = localStorage.getItem("token") || localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  // Set default headers
  const headers = {
    // default JSON header; may be removed later if body is FormData
    "Content-Type": "application/json",
    ...options.headers,
  };

  // if user is sending FormData, let browser set Content-Type with boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  // Add token to request
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If token expired (401), try to refresh
  if (response.status === 401 && refreshToken) {
    try {
      console.log("Token expired, attempting refresh...");
      
      const refreshResponse = await fetch(
        "http://localhost:8000/api/auth/token/refresh/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        console.log("Token refreshed successfully");
        
        // Store new token
        localStorage.setItem("token", data.access);
        token = data.access;

        // Retry original request with new token
        headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed, redirect to login
        console.log("Token refresh failed, redirecting to login");
        localStorage.clear();
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return response;
};
