export function saveLoginData(data, rememberMe) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  if (rememberMe) {
    localStorage.setItem("rememberDevice", "true");
  }
}

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

export const getToken = () => localStorage.getItem("token");

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberDevice");
};

export const isLoggedIn = () => !!getToken();