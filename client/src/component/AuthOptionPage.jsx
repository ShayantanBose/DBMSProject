import "../styles/AuthOptionPage.css";

export default function AuthOptionPage(props) {
  const handleNewUserClick = () => {
    props.setCurrentPage("auth", { userType: "new" });
  };

  const handleExistingUserClick = () => {
    props.setCurrentPage("auth", { userType: "existing" });
  };

  return (
    <div className="container">
      <div className="auth-box">
        <button className="auth-button" onClick={handleNewUserClick}>
          New User
        </button>
        <button className="auth-button" onClick={handleExistingUserClick}>
          Existing User
        </button>
      </div>
    </div>
  );
}
