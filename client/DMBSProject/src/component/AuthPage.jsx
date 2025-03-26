import "../styles/AuthPage.css";
export default function AuthPage() {
  return (
    <div className="container">
      <div className="auth-box">
        <h2 className="enter-secret-heading">Enter Secret</h2>
        <input className="secret-input" />
        <button type="submit" className="submit-secret-button">
          Go
        </button>
      </div>
    </div>
  );
}
