import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ERRORS, SUCCESS } from "./messages";
import { type NavigateFunction } from "react-router-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const redirect = (navigate: NavigateFunction) => ({
  toError: (error: (typeof ERRORS)[keyof typeof ERRORS]) =>
    navigate(`/error`, { state: { error } }),
  toSuccess: (message: (typeof SUCCESS)[keyof typeof SUCCESS]) =>
    navigate(`/success`, { state: { message } }),
});

export { ERRORS, SUCCESS, redirect };
