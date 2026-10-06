export const FORGOT_PASSWORD_STEPS = Object.freeze({
  EMAIL: "email",
  RESET: "reset",
  SUCCESS: "success",
});

export const transitionForgotPasswordStep = (step, event) => {
  if (event === "SEND_SUCCEEDED" && step === FORGOT_PASSWORD_STEPS.EMAIL) return FORGOT_PASSWORD_STEPS.RESET;
  if (event === "RESET_SUCCEEDED" && step === FORGOT_PASSWORD_STEPS.RESET) return FORGOT_PASSWORD_STEPS.SUCCESS;
  if (event === "CHANGE_EMAIL") return FORGOT_PASSWORD_STEPS.EMAIL;
  return step;
};

export const PASSWORD_POLICY_MESSAGE = "Use 8+ characters with uppercase, lowercase, and a number.";

export const maskEmail = (email) => {
  const [name, host] = String(email || "").trim().split("@");
  return name && host ? `${name[0]}***@${host}` : "your email";
};

export const isValidResetCode = (code) => /^\d{6}$/.test(code);

export const isValidPassword = (password) => (
  password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)
);

export const resetFieldErrors = ({ code, newPassword, confirmPassword }) => {
  const errors = {};
  if (!isValidResetCode(code)) errors.code = "Enter the six-digit verification code.";
  if (!isValidPassword(newPassword)) errors.newPassword = PASSWORD_POLICY_MESSAGE;
  if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
};

export const resetPayload = ({ email, code, newPassword, confirmPassword }) => ({
  email: String(email).trim(),
  code,
  newPassword,
  confirmPassword,
});

export const resetErrorField = (error) => {
  const message = String(error?.message || "");
  const detail = error?.payload?.error?.details?.[0];
  const path = Array.isArray(detail?.path) ? detail.path.join(".") : String(detail?.path || "");

  if (path.includes("code") || error?.status === 401 || /verification code|invalid or expired/i.test(message)) return "code";
  if (path.includes("confirmPassword") || /passwords do not match/i.test(message)) return "confirmPassword";
  if (path.includes("newPassword") || /password.*(8|uppercase|lowercase|number|policy)/i.test(message)) return "newPassword";
  return null;
};
