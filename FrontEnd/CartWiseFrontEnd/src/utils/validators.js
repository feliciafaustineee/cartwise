export function validateName(value) {
  if (!value) return null;

  if (value.trim().length < 2) {
    return "Name must be at least 2 characters";
  }

  return "";
}

export function validateEmail(value) {
  if (!value) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return "Invalid email format (ex: name@example.com)";
  }

  return "";
}

export function validatePassword(value, signinError = "") {
  if (!value || value.trim() === "") {
    return "Password is required.";
  }

  if (signinError) {
    return signinError;
  }

  const errors = [];

  if (value.length < 8 || value.length > 12) {
    errors.push("8–12 characters");
  }

  if (!/[A-Z]/.test(value)) {
    errors.push("1 uppercase");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    errors.push("1 special character");
  }

  return errors.length
    ? `Password must contain ${errors.join(", ")}`
    : "";
}