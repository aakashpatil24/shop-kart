import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

type ToastType = "success" | "error" | "info" | "warning";

const base = {
  duration: 3000,
  close: true,
  gravity: "top",
  position: "right",
  stopOnFocus: true,
};

const styles: Record<ToastType, { background: string }> = {
  success: { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" },
  error: { background: "linear-gradient(135deg, #dc2626, #b91c1c)" },
  info: { background: "linear-gradient(135deg, #2563eb, #1d4ed8)" },
  warning: { background: "linear-gradient(135deg, #d97706, #b45309)" },
};

const show = (text: string, type: ToastType = "success") =>
  Toastify({ ...base, text, style: styles[type] }).showToast();

export const toast = {
  success: (text: string) => show(text, "success"),
  error: (text: string) => show(text, "error"),
  info: (text: string) => show(text, "info"),
  warning: (text: string) => show(text, "warning"),
};

