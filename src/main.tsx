
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import ErrorBoundary from "./ErrorBoundary";

import { SocketProvider } from "./core/socket/SocketContext";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <SocketProvider>
      <App />
    </SocketProvider>
  </ErrorBoundary>
);
