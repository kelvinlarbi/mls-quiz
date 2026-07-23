import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "./contexts/ProfileContext";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import Review from "./pages/Review.tsx";
import "./style.css";

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="review" element={<Review />} />
          </Route>
        </Routes>
      </ProfileProvider>
    </BrowserRouter>
  </StrictMode>
);
