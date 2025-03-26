import "../styles/Popup.css";
import UserIcon from "../assets/User.png";

export default function Header(props) {
  return (
    <div className="header">
      <h2 onClick={() => props.setCurrentPage("MainPopup")}>BROWSESYNC</h2>
      <div className="user-icon">
        <img
          src={UserIcon}
          alt="User Icon"
          draggable="false"
          onClick={() => props.setCurrentPage("authOption")}
        />
      </div>
    </div>
  );
}
