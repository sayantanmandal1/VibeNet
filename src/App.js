import "./App.css";
import Pages from "./Components/Pages/Pages";
import { BrowserRouter } from "react-router-dom";
import AppContext from "./Components/AppContext/AppContext";
import { AnimatedCursor } from "./Components/AnimatedCursor";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "./Components/ErrorBoundary";
import React, { useState } from "react";


function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <ErrorBoundary>
      <div className="relative">
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContext>
            <AnimatedCursor />
            <AnimatePresence mode="wait">
              <Pages darkMode={darkMode} setDarkMode={setDarkMode} />
            </AnimatePresence>
          </AppContext>
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  );
}

export default App;
