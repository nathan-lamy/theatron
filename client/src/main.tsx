import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import ConfirmEventPage from "./pages/confirm";
import Error from "./pages/error";
import Success from "./pages/success";

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
    path: "/confirm",
    element: <ConfirmEventPage />,
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
