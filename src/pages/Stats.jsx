import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";

const Stats = () => {
  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState("today");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await browser.storage.sync.get(["timeSpent", "limits"]);
        const timeSpent = data.timeSpent || {};
        const limits = data.limits || {};

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

        const formattedStats = {};
        last7Days.forEach(({ label }) => {
          const dayData = timeSpent[label] || {};
          const allSites = new Set([...Object.keys(dayData), ...Object.keys(limits)]);

          formattedStats[label] = Array.from(allSites).map((site) => ({
            site,
            timeSpent: dayData[site] || 0,
            limit: limits[site] || null,
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

  // Filter out sites that have limits, i.e., only include those without a limit
  const filteredDailyData = dailyData.filter((entry) => entry.limit === null);

  const totalTimeByDay = stats.dates?.map(({ label }) => ({
    date: label,
    totalTime: (stats.data[label]?.reduce((sum, { timeSpent }) => sum + timeSpent, 0) || 0),
  })) || [];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#ffbb28", "#0088FE", "#00C49F"];

  return (
    <div className="bg-white p-4 w-[350px] h-[400px] relative overflow-hidden">
      <div className="w-full flex justify-between items-center border-b border-gray-200 py-4">
        <h2 className="text-xl font-bold">Web Stats</h2>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="p-2 border border-gray-300 outline-none rounded-xl shadow-sm text-gray-400"
        >
          <option value="today">Today</option>
          <option value="last7days">Last 7 Days</option>
        </select>
      </div>

      {viewMode === "today" ? (
        <div className="h-48 mt-4">
          <h3 className="text-lg font-semibold">Time Spent on {selectedStats}</h3>
          {filteredDailyData.length > 0 ? (
            <>
              <div className="h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredDailyData}
                      dataKey="timeSpent"
                      nameKey="site"
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      fill="#8884d8"
                      label
                    >
                      {filteredDailyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend below the Pie Chart */}
              <div className="mt-4">
                <h4 className="font-semibold">Legend</h4>
                <ul>
                  {filteredDailyData.map((entry, index) => (
                    <li key={entry.site} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span>{entry.site}: {entry.timeSpent} mins</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center">No data available</p>
          )}
        </div>
      ) : (
        <div className="h-48 mt-4">
          <h3 className="text-lg font-semibold">Total Time Spent (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={totalTimeByDay}>
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalTime" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Stats;
