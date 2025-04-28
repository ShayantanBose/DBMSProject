import "../styles/AuthPage.css";
import React, { useState, useEffect } from "react";
import api from "../utils/axiosInstance";

export default function AuthPage({ setCurrentPage, authContext }) {
  const [secretKey, setSecretKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newUserConfirmation, setNewUserConfirmation] = useState(false);

  // Determine if user is new based on authContext
  const isNewUser = authContext?.userType === "new";

  useEffect(() => {
    // Reset state when authContext changes
    setErrorMessage("");
    setNewUserConfirmation(false);
  }, [authContext]);

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
      if (isNewUser) {
        const response = await api.post("/api/new-user", { secretKey });
        localStorage.setItem("userSecretKey", secretKey);
        setCurrentPage("MainPopup");
      } else {
        const response = await api.post("/api/verify-user", { secretKey });
        localStorage.setItem("userSecretKey", secretKey);
        setCurrentPage("MainPopup");
      }
    } catch (error) {
      if (error.response) {
        if (!isNewUser && error.response.status === 404) {
          setNewUserConfirmation(true);
        } else if (error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage(
            isNewUser
              ? "An error occurred during account creation."
              : "An error occurred during authentication."
          );
        }
      } else if (error.request) {
        // Request was made but no response was received
        setErrorMessage("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request
        setErrorMessage(
          isNewUser
            ? "An error occurred during account creation."
            : "An error occurred during authentication."
        );
      }
    }
  };

  const handleCreateNewUser = async () => {
    try {
      const response = await api.post("/api/new-user", { secretKey });
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
        <h2 className="enter-secret-heading">
          {isNewUser ? "Create a Secret Key" : "Enter Secret"}
        </h2>
        <input
          className="secret-input"
          type="text"
          value={secretKey}
          onChange={handleSecretKeyChange}
          placeholder={
            isNewUser ? "Enter new secret key" : "Enter your secret key"
          }
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button
          type="submit"
          className="submit-secret-button"
          onClick={handleSubmit}
        >
          {isNewUser ? "Create" : "Go"}
        </button>
      </div>
    </div>
  );
}
