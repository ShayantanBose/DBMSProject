import "../styles/AuthOptionPage.css";
export default function AuthOptionPage(props) {
  function handlePageChange() {
    props.setCurrentPage("auth");
  }
  return (
    <div className="container">
      <div className="auth-box">
        <button className="auth-button" onClick={handlePageChange}>
          New User
        </button>
        <button className="auth-button" onClick={handlePageChange}>
          Existing User
        </button>
      </div>
    </div>
  );
}
