import { useState, useEffect } from "react";
import './App.css'

export default function Popup() {
  const [timeSpent, setTimeSpent] = useState({});
  const [limits, setLimits] = useState({});
  const [inputUrl, setInputUrl] = useState("");
  const [inputLimit, setInputLimit] = useState("");

  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fullDate = `${dayNames[today.getDay()]} - ${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${today.getFullYear()}`;

  useEffect(() => {
    chrome.storage.sync.get(["timeSpent", "limits"], (data) => {
      setTimeSpent(data.timeSpent?.[fullDate] || {});
      setLimits(data.limits || {});
    });
  }, []);

  const setSiteLimit = () => {
    if (!inputUrl || !inputLimit) return;
    chrome.storage.sync.get("limits", (data) => {
      let newLimits = { ...data.limits, [inputUrl]: parseInt(inputLimit) };
      chrome.storage.sync.set({ limits: newLimits });
      setLimits(newLimits);
      setInputUrl("");
      setInputLimit("");
    });
  };

  return (
    <div className="popup">
      <h2>🔐 Lock Time</h2>
      <p>Your Productivty Buddy.</p>
      <ul>
        {/* {Object.entries(timeSpent).map(([site, time]) => (
          <li key={site}>
            {site}: {time} mins / {limits[site] || "No limit"} mins
          </li>
        ))} */}
      </ul>
      <input type="text" placeholder="Enter site (e.g., youtube.com)" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} />
      <input type="number" placeholder="Time limit (mins)" value={inputLimit} onChange={(e) => setInputLimit(e.target.value)} />
      <button onClick={setSiteLimit}>Set Limit</button>
    </div>
  );
}
