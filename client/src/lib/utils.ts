import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ERRORS, SUCCESS } from "./messages";
import { type NavigateFunction } from "react-router-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const redirect = (navigate: NavigateFunction) => ({
  toError: (error?: (typeof ERRORS)[keyof typeof ERRORS]) =>
    navigate(`/error`, { state: { error } }),
  toSuccess: (message: (typeof SUCCESS)[keyof typeof SUCCESS]) =>
    navigate(`/success`, { state: { message } }),
});

export const formatDate = (date: Date) => {
  date = new Date(date);
  // Return the date in French format like this : lundi 1 janvier 2021 à 20h00
  return date
    .toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
    .replace(":", "h");
};

export { ERRORS, SUCCESS, redirect };
