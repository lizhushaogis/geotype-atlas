import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";

declare global {
  interface Window {
    GEOTYPE_SUBMISSION_ENDPOINT?: string;
    GEOTYPE_SUPABASE_URL?: string;
    GEOTYPE_SUPABASE_PUBLISHABLE_KEY?: string;
  }
}

window.GEOTYPE_SUBMISSION_ENDPOINT = import.meta.env.VITE_SUBMISSION_ENDPOINT || "";
window.GEOTYPE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
window.GEOTYPE_SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
