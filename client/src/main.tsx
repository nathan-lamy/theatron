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
import Register from "./pages/register";

import { ThemeProvider } from "./components/ThemeProvider";

const router = createBrowserRouter([
  {
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
  {
    path: "/register",
    element: <Register />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
