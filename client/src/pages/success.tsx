import { useEffect, useState } from "react";

export default function Success() {
  const [message, setMessage] = useState("Opération réussie !");
  const [details, setDetails] = useState(
    "L'opération a été effectuée avec succès. Vous pouvez fermer cette page."
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has("message")) {
      setDetails(queryParams.get("message")!);
    }
    if (queryParams.has("details")) {
      setMessage(queryParams.get("details")!);
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-green-100 dark:bg-green-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckIcon className="h-12 w-12 text-green-500 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {message}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{details}</p>
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: { className: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
