export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getCurrentUser = () => {
  const email = localStorage.getItem("userEmail") || "";
  const role = localStorage.getItem("userRole") || "";
  const userId = localStorage.getItem("userId") || "";

  return {
    email,
    role,
    userId,
    displayName: email ? email.split("@")[0] : "Utilisateur",
  };
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
};
