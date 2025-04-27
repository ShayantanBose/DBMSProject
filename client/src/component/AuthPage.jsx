import "../styles/AuthPage.css";
import React, { useState } from "react";
import api from "../utils/axiosInstance";

export default function AuthPage({ setCurrentPage }) {
  const [secretKey, setSecretKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newUserConfirmation, setNewUserConfirmation] = useState(false);

  const handleSecretKeyChange = (event) => {
    setSecretKey(event.target.value);
    setErrorMessage("");
    setNewUserConfirmation(false);
  };

  const handleSubmit = async () => {
    if (!secretKey.trim()) {
      setErrorMessage("Please enter your secret key.");
      return;
    }

    try {
      //backend api
      const response = await api.post("/api/verify-user", { secretKey });
      localStorage.setItem("userSecretKey", secretKey);
      setCurrentPage("MainPopup");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setNewUserConfirmation(true);
      } else if (
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

  const handleCreateNewUser = async () => {
    try {
      const response = await api.post("/api/new-user", { secretKey });
      console.log("New user creation response:", response.data);

      localStorage.setItem("userSecretKey", secretKey);
      setCurrentPage("MainPopup");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred during new user creation.");
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
        {newUserConfirmation && (
          <div>
            <p>Secret key not found. Would you like to create a new account?</p>
            <button onClick={handleCreateNewUser}>Yes, create account</button>
          </div>
        )}
      </div>
    </div>
  );
}
