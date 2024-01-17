import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import ConfirmEventPage from "./pages/confirm";

const router = createBrowserRouter([
  {
    // TODO: Error
    errorElement: <div>Not Found</div>,
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
