import { useState, useEffect } from "react";
import './App.css'
import { CiAlarmOn } from "react-icons/ci";
import { BiStats } from "react-icons/bi";
import {Link} from "react-router-dom"
import browser from "webextension-polyfill";
import Selector from "./components/Selector";

export default function Popup() {
  const [timeSpent, setTimeSpent] = useState({});
  const [limits, setLimits] = useState({});
  const [inputUrl, setInputUrl] = useState("");
  const [inputLimit, setInputLimit] = useState("");
  const [reset, setReset] = useState(false);

  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fullDate = `${dayNames[today.getDay()]} - ${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${today.getFullYear()}`;

    useEffect(() => {
      async function fetchData() {
          try {
              const data = await browser.storage.sync.get(["timeSpent", "limits"]);
              setTimeSpent(data.timeSpent?.[fullDate] || {});
              setLimits(data.limits || {});
          } catch (error) {
              console.error("Error fetching storage data:", error);
          }
      }
  
      fetchData();
  }, []);
  

  const setSiteLimit = async () => {
    if (!inputUrl || !inputLimit) return;
  
    let storedValue = inputUrl.replace(/^www\./, "");
  
    try {
      const data = await browser.storage.sync.get("limits");
      let newLimits = { ...data.limits, [storedValue]: parseTimeString(inputLimit) };
  
      await browser.storage.sync.set({ limits: newLimits });
  
      setLimits(newLimits);
      setInputUrl(""); 
      setInputLimit("");
  
      // Trigger a reset in Selector
      setReset((prev) => !prev);
  
      alert(`✅ A limit has been set on ${storedValue} for ${inputLimit}`);
  
      console.log(`✅ Limit set for ${storedValue}: ${inputLimit} mins`);
    } catch (error) {
      console.error("❌ Error setting site limit:", error);
    }
  };
  
// Convert HH:MM:SS string to minutes (for consistency)
const parseTimeString = (timeString) => {
    const [hh, mm, ss] = timeString.split(":").map(Number);
    return hh * 60 + mm + Math.floor(ss / 60); // Convert to total minutes
};




  const handleUrlChange = (e) => {
    let value = e.target.value.trim();

    value = value.replace(/^(https?:\/\/)/, "");
  
    setInputUrl(value); 
  };

  return (
    <div className="bg-white  p-2 w-[350px] h-[400px] relative">
      <nav className="flex justify-between items-center font-semibold w-full border-b border-gray-200 py-4 ">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl">Lock-Time</h1>
          <p className="text-xs">Curb distractions, stay productive.</p>
        </div>
        <div className="flex gap-2">
          <Link to='/reminders'>
          <button className="bg-black text-white rounded-xl flex justify-center items center p-1.5 font-bold text-xl drop-shadow-xl cursor-pointer"><CiAlarmOn /></button>
          </Link>
          <Link to='/stats'>
          <button className="bg-black text-white rounded-xl flex justify-center items center p-1.5 font-bold text-xl drop-shadow-xl cursor-pointer"><BiStats /></button>
          </Link>
        </div>
      </nav>
      <ul>
        
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
            onChange={handleUrlChange}
            className="border border-gray-100 rounded-2xl p-2 shadow-xs transition:shadow duration-200 pl-[55px] w-[75%] outline-none"
          // placeholder="Enter website (e.g., youtube.com)"
          />
        </div>
        <div className="relative w-full flex justify-center items-center">
        <Selector inputLimit={inputLimit} setInputLimit={setInputLimit} reset={reset} />
        </div>
        <button onClick={setSiteLimit} className="bg-black shadow-xs text-white font-bold rounded-2xl p-2   w-[75%] cursor-pointer outline-none">Set Limit</button>
      </div>
      <div className="flex justify-end items-center absolute bottom-0 right-0 p-2">
        <p className="font-light">Made with 🍵 by <a href="https://tareeq.vercel.app">Tariq Yunusa</a></p>
      </div>
    </div>
  );
}
