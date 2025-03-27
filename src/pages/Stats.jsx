import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

const Stats = () => {
  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await browser.storage.sync.get(["timeSpent", "limits"]);
        const timeSpent = data.timeSpent || {};
        const limits = data.limits || {};

        // Generate last 7 days' formatted dates
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            label: `${dayNames[date.getDay()]} - ${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${date.getFullYear()}`,
            value: date.toISOString().split("T")[0], // ISO date format (YYYY-MM-DD) for comparison
          };
        });

        // Set default selected date to today
        setSelectedDate(last7Days[0].value);

        // Batch data by date
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

  return (
    <div className="bg-white  p-2 w-[350px] h-[400px] relative">
      <div className="w-full flex justify-between items-center border-b border-gray-200 py-4">
        <h2 className="text-xl font-bold mb-4">Web Stats</h2>

        {/* Dropdown to select date */}
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border border-gray-300 outline-none rounded-xl mb-4 shadow-sm text-gray-400"
        >
          {stats.dates &&
            stats.dates.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
        </select>
      </div>

      {/* Display stats for the selected date */}
      {stats.data && stats.dates && (
        <div className="max-h-[300px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">{stats.dates.find(d => d.value === selectedDate)?.label}</h3>
          <ul>
            {stats.data[stats.dates.find(d => d.value === selectedDate)?.label]?.length > 0 ? (
              stats.data[stats.dates.find(d => d.value === selectedDate)?.label].map(({ site, timeSpent, limit }) => (
                <li
                  key={site}
                  className={`border-b py-2 px-4 rounded-md mb-2 ${limit ? "bg-red-200" : "bg-gray-100"}`}
                >
                  <strong>{site}</strong>: {timeSpent} mins / {limit !== null ? `${limit} mins` : "No limit"}
                </li>
              ))
            ) : (
              <p className="text-gray-500">No data for this day.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Stats;
