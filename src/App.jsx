import { useState, useEffect } from "react";

export default function Popup() {
  const [sites, setSites] = useState({});
  const [limits, setLimits] = useState({});
  const [inputUrl, setInputUrl] = useState("");
  const [inputLimit, setInputLimit] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["timeSpent", "limits"], (data) => {
      setSites(data.timeSpent || {});
      setLimits(data.limits || {});
    });
  }, []);

  const setSiteLimit = () => {
    chrome.storage.local.get("limits", (data) => {
      let newLimits = { ...data.limits, [inputUrl]: parseInt(inputLimit) };
      chrome.storage.local.set({ limits: newLimits });
      setLimits(newLimits);
    });
  };

  return (
    <div>
      <h2>LockTime</h2>
      <ul>
        {Object.keys(sites).map((site) => (
          <li key={site}>{site}: {sites[site]} mins / {limits[site] || "No limit"} mins</li>
        ))}
      </ul>
      <input type="text" placeholder="Enter site" onChange={(e) => setInputUrl(e.target.value)} value={inputUrl}/>
      <input type="number" placeholder="Time limit (mins)" onChange={(e) => setInputLimit(e.target.value)} value={inputLimit}/>
      <button onClick={setSiteLimit}>Set Limit</button>
    </div>
  );
}
