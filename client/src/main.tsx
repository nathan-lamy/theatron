import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import "./lib/sentry";

import ConfirmPage from "./pages/confirm";
import LoadingConfirmPage from "./pages/loading/confirm";
import { loader as confirmLoader } from "./loaders/confirm";

import Error from "./pages/error";
import Success from "./pages/success";

import { withSuspense } from "./lib/suspense";

const router = createBrowserRouter([
  {
    // TODO: Not found page
    errorElement: <Error />,
  },
  {
    path: "/error",
    element: <Error />,
  },
  {
    path: "/confirm/:eventId",
    element: (
      <Suspense fallback={<LoadingConfirmPage />}>
        <ConfirmPage />
      </Suspense>
    ),
    loader: withSuspense(confirmLoader),
    errorElement: <Error />,
  },
  {
    path: "/success",
    element: <Success />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
