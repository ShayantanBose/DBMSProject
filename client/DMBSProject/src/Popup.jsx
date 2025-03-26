import Header from "./component/Header.jsx";
import InitialPopup from "./component/IntialPopup.jsx";
import AuthPage from "./component/AuthPage.jsx";
import { useState } from "react";
import "./styles/Popup.css";

export default function Popup() {
  const [currentPage, setCurrentPage] = useState("initial");
  return (
    <div className="popup-container">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === "initial" && (
        <InitialPopup
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === "auth" && (
        <AuthPage currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}
