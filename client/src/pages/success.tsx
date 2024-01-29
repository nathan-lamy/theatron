import { useLocation } from "react-router-dom";

export default function Success() {
  const { state } = useLocation() as {
    state: { message: { title: string; message: string } };
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-green-100 dark:bg-green-900">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <CheckIcon className="h-12 w-12 text-green-500 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {state?.message?.title || "Opération réussie !"}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 px-6">
            {state?.message?.message ||
              "L'opération a été effectuée avec succès. Vous pouvez fermer cette page."}
          </p>
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
