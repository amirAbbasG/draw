import React from "react";

import { createRoot } from "react-dom/client";

import "./style.css";

import { BrowserRouter } from "react-router-dom";

import Providers from "@/components/providers";
import AppRoutes from "@/routes";

const App = () => (
  <BrowserRouter>
    <Providers>
      <AppRoutes />
    </Providers>
  </BrowserRouter>
);

createRoot(document.getElementById("app")!).render(<App />);
