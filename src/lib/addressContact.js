export const COUNTRY_OPTIONS = Object.freeze([
  { code: "IN", name: "India", callingCode: "+91" },
  { code: "US", name: "United States", callingCode: "+1" },
  { code: "GB", name: "United Kingdom", callingCode: "+44" },
  { code: "AE", name: "United Arab Emirates", callingCode: "+971" },
]);

const COUNTRY_BY_CODE = new Map(COUNTRY_OPTIONS.map((country) => [country.code, country]));
const STATE_ALIASES = Object.freeze({ TN: "Tamil Nadu", TAMILNADU: "Tamil Nadu" });

export const countryName = (value) => COUNTRY_BY_CODE.get(String(value || "").trim().toUpperCase())?.name || "";
export const callingCodeForCountry = (value) => COUNTRY_BY_CODE.get(String(value || "").trim().toUpperCase())?.callingCode || "";

export const normalizedStateLabel = (value) => {
  const raw = String(value || "").trim().replace(/\s+/g, " ");
  if (!raw) return "";
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (STATE_ALIASES[compact]) return STATE_ALIASES[compact];
  return raw.toLowerCase().replace(/(^|[\s-])\S/g, (letter) => letter.toUpperCase());
};

export const normalizePhone = ({ phone, country = "IN", callingCode } = {}) => {
  const raw = String(phone || "").trim();
  if (!raw) return "";
  const compact = raw.replace(/[\s()-]/g, "");
  if (compact.startsWith("+")) return `+${compact.slice(1).replace(/\D/g, "")}`;
  const digits = compact.replace(/\D/g, "");
  const prefix = String(callingCode || callingCodeForCountry(country) || "").replace(/\D/g, "");
  if (!prefix || !digits) return digits;
  if (digits.startsWith(prefix) && digits.length > prefix.length + 6) return `+${digits}`;
  return `+${prefix}${digits}`;
};

export const displayPhone = (phone, country = "IN") => {
  const normalized = normalizePhone({ phone, country });
  if (String(country).toUpperCase() === "IN" && /^\+91[6-9]\d{9}$/.test(normalized)) {
    const local = normalized.slice(3);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return normalized || String(phone || "").trim();
};

export const validateAddressContact = ({ fullName, email, phone, address = {}, callingCode } = {}) => {
  const errors = {};
  const country = String(address.country || "IN").trim().toUpperCase();
  const normalizedPhone = normalizePhone({ phone, country, callingCode });
  const localIndiaPhone = normalizedPhone.replace(/^\+91/, "");
  if (!String(fullName || "").trim() || String(fullName).trim().length < 2) errors.fullName = "Enter the recipient's full name.";
  if (email !== undefined && (!String(email || "").trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim()))) errors.email = "Enter a valid email address.";
  if (country === "IN" ? !/^[6-9]\d{9}$/.test(localIndiaPhone) : !/^\+\d{8,15}$/.test(normalizedPhone)) errors.phone = country === "IN" ? "Enter a valid 10-digit Indian mobile number." : "Enter a valid international phone number.";
  if (!String(address.addressLine1 || "").trim() || String(address.addressLine1).trim().length < 3) errors["address.addressLine1"] = "Enter your delivery address.";
  if (!String(address.city || "").trim() || String(address.city).trim().length < 2) errors["address.city"] = "Enter your city.";
  if (!String(address.state || "").trim() || String(address.state).trim().length < 2) errors["address.state"] = "Enter your state or region.";
  if (country === "IN" ? !/^[1-9]\d{5}$/.test(String(address.pincode || "").trim()) : !/^[A-Za-z0-9][A-Za-z0-9 -]{1,14}[A-Za-z0-9]$/.test(String(address.pincode || "").trim())) errors["address.pincode"] = country === "IN" ? "Enter a valid six-digit PIN code." : "Enter a valid postal code.";
  return { errors, normalizedPhone };
};
