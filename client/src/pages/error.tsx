import { useLocation, useRouteError } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { ERRORS } from "@/lib/messages";

export default function Error() {
  // Handle errors from react-router-dom
  const error = useRouteError() as Record<string, string>;
  const errorMessage = error?.statusText || error?.message;
  // Handle errors from the server
  const location = useLocation() as {
    state: { error: { title: string; message: string } };
  };
  const state = location.state || {};
  if (errorMessage === "Not Found") state.error = ERRORS.NOT_FOUND;
  else if (errorMessage) Sentry.captureMessage(errorMessage);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-red-100 dark:bg-red-900">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <FileWarningIcon className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {state.error?.title || "Erreur interne !"}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 px-6">
            {state.error?.message ||
              (errorMessage && `Détails de l'erreur : ${errorMessage}`) ||
              "Une erreur interne est survenue. Veuillez réessayer plus tard. Si le problème persiste, veuillez contacter votre professeur par mail."}
          </p>
        </div>
      </div>
    </div>
  );
}

function FileWarningIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
