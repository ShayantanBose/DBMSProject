import "../styles/Popup.css";
import UserIcon from "../assets/User.png";

export default function Header() {
  return (
    <div className="header">
      <h2>BROWSESYNC</h2>
      <div className="user-icon">
        <img src={UserIcon} alt="User Icon" draggable="false" />
      </div>
    </div>
  );
}
