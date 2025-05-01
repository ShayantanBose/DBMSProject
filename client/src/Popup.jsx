import Header from "./component/Header.jsx";
import InitialPopup from "./component/IntialPopup.jsx";
import AuthOptionPage from "./component/AuthOptionPage.jsx";
import AuthPage from "./component/AuthPage.jsx";
import { useState } from "react";
import "./styles/Popup.css";

export default function Popup() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Skip auth if userSecretKey is already stored
    return localStorage.getItem("userSecretKey") ? "MainPopup" : "authOption";
  });
  const [authContext, setAuthContext] = useState({});

  const navigate = (page, context = {}) => {
    setCurrentPage(page);
    setAuthContext(context);
  };

  return (
    <div className="popup-container">
      <Header currentPage={currentPage} setCurrentPage={navigate} />
      {currentPage === "MainPopup" && <InitialPopup />}
      {currentPage === "authOption" && (
        <AuthOptionPage setCurrentPage={navigate} />
      )}
      {currentPage === "auth" && (
        <AuthPage setCurrentPage={navigate} authContext={authContext} />
      )}
    </div>
  );
}
