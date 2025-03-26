import "../styles/AuthPage.css";
import React, { useState } from "react";
import api from "../utils/axiosInstance";

export default function AuthPage({ authContext, setCurrentPage }) {
  const [secretKey, setSecretKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSecretKeyChange = (event) => {
    setSecretKey(event.target.value);
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (!secretKey.trim()) {
      setErrorMessage("Please enter your secret key.");
      return;
    }

    try {
      if (authContext.userType === "new") {
        const response = await api.post("/api/new-user", { secretKey });
        console.log("New user creation response:", response.data);
        setCurrentPage("MainPopup");
      } else if (authContext.userType === "existing") {
        const response = await api.post("/api/verify-user", { secretKey });
        console.log("Existing user verification response:", response.data);
        setCurrentPage("MainPopup");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred during authentication.");
      }
    }
  };

  return (
    <div className="container">
      <div className="auth-box">
        <h2 className="enter-secret-heading">Enter Secret</h2>
        <input
          className="secret-input"
          type="text"
          value={secretKey}
          onChange={handleSecretKeyChange}
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button
          type="submit"
          className="submit-secret-button"
          onClick={handleSubmit}
        >
          Go
        </button>
      </div>
    </div>
  );
}
