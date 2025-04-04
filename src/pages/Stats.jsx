import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { IoMdArrowRoundBack } from "react-icons/io";
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";

const Stats = () => {
  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState("today");
  const [totalAccumulatedTime, setTotalAccumulatedTime] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await browser.storage.sync.get(["timeSpent"]);
        const timeSpent = data.timeSpent || {};

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            label: `${dayNames[date.getDay()]} - ${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`,
            value: date.toISOString().split("T")[0],
          };
        });

        setSelectedDate(last7Days[0].value);

        const today = new Date();
        const todayLabel = `${dayNames[today.getDay()]} - ${today.getDate().toString().padStart(2, "0")}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getFullYear()}`;
        
        const todayData = timeSpent[todayLabel] || {};
        const totalTimeToday = Object.values(todayData).reduce((sum, value) => sum + value, 0);
        setTotalAccumulatedTime(totalTimeToday);
        
        const formattedStats = {};
        last7Days.forEach(({ label }) => {
          const dayData = timeSpent[label] || {};

          formattedStats[label] = Object.entries(dayData).map(([site, time]) => ({
            site,
            timeSpent: time,
          }));
        });

        setStats({ data: formattedStats, dates: last7Days });
      } catch (error) {
        console.error("Error fetching storage data:", error);
      }
    }
    fetchData();
  }, []);

  const selectedStats = stats.dates?.find((d) => d.value === selectedDate)?.label;
  const dailyData = stats.data?.[selectedStats] || [];
  const totalTimeByDay = stats.dates?.map(({ label }) => ({
    date: label,
    totalTime: stats.data[label]?.reduce((sum, entry) => sum + (entry.timeSpent || 0), 0) || 0,
  })) || [];

  const formatTime = (minutes) => {
    const totalSeconds = minutes * 60;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  
  const toHome = () => {
    window.location.href = "/index.html";
  };

  return (
    <div className="bg-white p-4 w-[350px] h-[400px] relative overflow-hidden">
      <div className="w-full flex justify-between items-center border-b border-gray-200 py-4">
        <div className="flex gap-1.5 items-center">
          <button onClick={toHome} className="text-xl text-black cursor-pointer outline-none"> <IoMdArrowRoundBack /></button>
          <h2 className="text-xl font-bold">Web Stats</h2>
        </div>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="p-2 border border-gray-300 outline-none rounded-xl shadow-sm text-gray-400"
        >
          <option value="today">Today</option>
        </select>
      </div>
      <div className="h-full w-full overflow-scroll scrollbar-none">
        {viewMode === "today" ? (
          <div className="h-48 mt-4">
            <h3 className="text-lg font-semibold">Time Spent Today</h3>
            <div className="mt-4 p-4 bg-black flex flex-col text-white rounded-2xl">
              <p>Time Spent Today</p>
              <h1 className="text-2xl font-bold">{formatTime(totalAccumulatedTime)}</h1>
            </div>
            <div className="mt-2 pb-16">
              <ul className="flex gap-2 flex-wrap py-4">
                {dailyData.map((entry) => (
                  <li key={entry.site} className="flex items-center space-x-2">
                    <div className="p-2 rounded-3xl bg-black">
                      <span className="text-white">{entry.site}: {entry.timeSpent} mins</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="h-48 mt-4">
            <h3 className="text-lg font-semibold">Total Time Spent (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={totalTimeByDay}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalTime" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
