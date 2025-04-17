import { Children, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Stats from "./pages/Stats.jsx";
import Alarm from "./pages/Alarm.jsx";

import {motion, AnimatePresence} from "framer-motion"

export const AnimateWrapper = ({children}) => {
  return(
    <motion.div
    initial={{opacity:0, y: 15}}
    animate={{opacity:1, y: 0}}
    exit={{opacity:0, y: -15}}
    >
      {children}
    </motion.div>
  )
}

export const SideWrapper = ({children}) => {
return(
  <motion.div 
  initial={{opacity: 0, x: 15}}
  animate={{opacity: 1, x: 0}}
  exit={{opacity: 0, x: -15}}
  >
    {children}
  </motion.div>
)
}

createRoot(document.getElementById("root")).render(
    <AnimatePresence mode="wait">
      <BrowserRouter>
      <Routes>
        <Route path="/index.html" element={
          <AnimateWrapper>
            <App />
          </AnimateWrapper>
        } />
        <Route path="/reminders" element={
          <SideWrapper>
            <Alarm />
          </SideWrapper>
        } />
        <Route path="/stats" element={
          <SideWrapper >
            <Stats />
          </SideWrapper>
        } />
      </Routes>
    </BrowserRouter>
    </AnimatePresence>
);


