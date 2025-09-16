import "@cloudscape-design/global-styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Router from "./Router";

const root = document.getElementById("root")!;

createRoot(root).render(
    <StrictMode>
        <Router />
    </StrictMode>
);
