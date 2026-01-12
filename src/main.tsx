import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter, Route, Routes } from "react-router";
import { CheckersRoute } from "./components/routes/CheckersRoute/Checkers.route";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CheckersRoute />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </Provider>
);
