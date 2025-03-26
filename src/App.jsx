import { useState, useEffect } from "react";
import './App.css'
import { CiAlarmOn } from "react-icons/ci";
import { BiStats } from "react-icons/bi";

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
    <div className="bg-white h-full p-2 w-[350px] h-[400px] ">
      <nav className="flex justify-between items-center font-semibold w-full border-b border-gray-200 py-4 ">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl">Lock-Time</h1>
          <p className="text-xs">Curb distractions, stay productive.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-black text-white rounded-xl flex justify-center items center p-1.5 font-bold text-xl drop-shadow-xl cursor-pointer"><CiAlarmOn /></button>
          <button className="bg-black text-white rounded-xl flex justify-center items center p-1.5 font-bold text-xl drop-shadow-xl cursor-pointer"><BiStats /></button>
        </div>
      </nav>
      <ul>
        {/* {Object.entries(timeSpent).map(([site, time]) => (
          <li key={site}>
            {site}: {time} mins / {limits[site] || "No limit"} mins
          </li>
        ))} */}
      </ul>
      {/* <div className="popup__routes">
        <button disabled = {true}>Set Reminder</button>
        <button disabled={true}>See Logged Time</button>
      </div> */}
      <div className="flex justify-center items-center flex-col gap-4 mt-4 mb-8">
        <h1 className="text-2xl font-bold">Set Timer</h1>
        <div className="relative w-full flex justify-center items-center">
          <span className="absolute left-13 top-1/2 transform -translate-y-1/2 text-gray-500 select-none">
            https://
          </span>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="border border-gray-100 rounded-2xl p-2 shadow-xs transition:shadow duration-200 pl-[55px] w-[75%] outline-none"
          // placeholder="Enter website (e.g., youtube.com)"
          />
        </div>
        <div className="relative w-full flex justify-center items-center">
          <input type="number" placeholder="Time limit (mins)" value={inputLimit} className="border border-gray-100 rounded-2xl p-2 shadow-xs transition:shadow duration-200 w-[75%] outline-none" onChange={(e) => setInputLimit(e.target.value)} />
        </div>
        <button onClick={setSiteLimit} className="bg-black shadow-xs text-white font-bold rounded-2xl p-2 shadow-2xl  w-[75%] cursor-pointer outline-none">Set Limit</button>
      </div>
      <div className="flex justify-end items-center">
        <p className="font-light">Made with 🍵 by <a href="https://tareeq.vercel.app">Tariq Yunusa</a></p>
      </div>
    </div>
  );
}
