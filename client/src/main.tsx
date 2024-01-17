import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import ConfirmEventPage from "./pages/confirm";
import Error from "./pages/error";

const router = createBrowserRouter([
  {
    errorElement: <Error />,
  },
  {
    path: "/confirm",
    element: <ConfirmEventPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
