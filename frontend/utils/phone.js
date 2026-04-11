/**
 * Normalize Indian mobile numbers for the API (10 digits, no country code).
 * Accepts: 9876543210, 919876543210, +91 98765 43210, etc.
 */
export function normalizePhone(raw) {
  if (raw == null) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 10) return digits;
  return null;
}

export function formatApiError(err) {
  const data = err.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((e) => String(e).replace(/"/g, "")).join(" ");
  }
  if (data?.message) return String(data.message);
  if (err.request && !err.response) {
    return "Cannot reach server. Check Wi‑Fi and API URL.";
  }
  return err.message || "Something went wrong";
}
