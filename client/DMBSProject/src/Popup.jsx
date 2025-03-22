import { useState } from "react";

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function Popup() {
  const [tabInfo, setTabInfo] = useState(null);

  const getTabInfo = () => {
    if (!browserAPI?.runtime) {
      console.error("Browser API not available");
      return;
    }

    browserAPI.runtime.sendMessage({ action: "getTabInfo" }, (response) => {
      if (browserAPI.runtime.lastError) {
        console.error("Error:", browserAPI.runtime.lastError);
      } else if (response) {
        if (response.error) {
          console.error("Error from background:", response.error);
        } else {
          setTabInfo(response);
        }
      }
    });
  };

  return (
    <div style={{ padding: "10px", width: "200px" }}>
      <h2>React Extension</h2>
      <button onClick={getTabInfo}>Get Tab Info</button>
      {tabInfo && (
        <div>
          <p>
            <strong>Title:</strong> {tabInfo.title}
          </p>
          <p>
            <strong>URL:</strong> {tabInfo.url}
          </p>
        </div>
      )}
    </div>
  );
}

export default Popup;
