import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoTrashOutline } from "react-icons/io5";
import { IoAddCircleOutline, IoRemoveCircleOutline } from "react-icons/io5";

const Alarm = () => {
  const [limits, setLimits] = useState([]);
  const [editingUrl, setEditingUrl] = useState(null); // Track which URL is being edited
  const [editingTime, setEditingTime] = useState(""); // Track the new time

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await browser.storage.sync.get(["limits"]);
      const limits = data.limits || {};
      setLimits(Object.entries(limits));
    } catch (error) {
      console.error("Error fetching limits:", error);
    }
  }

  async function updateLimit(url, newLimit) {
    try {
      const data = await browser.storage.sync.get("limits");
      let limits = data.limits || {};
      limits[url] = Math.max(1, newLimit); // Ensure the limit doesn't go below 1
      await browser.storage.sync.set({ limits });
      setLimits(Object.entries(limits));
    } catch (error) {
      console.error("Error updating limit:", error);
    }
  }

  async function removeLimit(url) {
    try {
      const data = await browser.storage.sync.get("limits");
      let limits = data.limits || {};
      delete limits[url];
      await browser.storage.sync.set({ limits });
      setLimits(Object.entries(limits));
    } catch (error) {
      console.error("Error removing limit:", error);
    }
  }

  const backToHome = () => {
    window.location.href = "/index.html";
  };

  const handleTimeChange = (e) => {
    setEditingTime(e.target.value);
  };

  const handleTimeBlur = (url) => {
    const newLimit = parseInt(editingTime, 10);
    if (!isNaN(newLimit)) {
      updateLimit(url, newLimit);
    }
    setEditingUrl(null);
    setEditingTime("");
  };

  const handleTimeKeyDown = (e, url) => {
    if (e.key === "Enter") {
      const newLimit = parseInt(editingTime, 10);
      if (!isNaN(newLimit)) {
        updateLimit(url, newLimit);
      }
      setEditingUrl(null);
      setEditingTime("");
    }
  };

  return (
    <div className="bg-white p-2 w-[350px] h-[400px] relative flex flex-col">
      <div className="w-full flex items-center gap-2 py-4 border-b border-gray-300 ">
        <button className="text-xl text-black cursor-pointer outline-none" onClick={backToHome}>
          <IoMdArrowRoundBack />
        </button>
        <h2 className="text-xl font-bold">Limits</h2>
      </div>
      <div className="flex-1 overflow-auto scrollbar-none">
        {limits.length > 0 ? (
          <div className="rounded-lg  mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className=" text-black">
                  <th className="p-2">URL</th>
                  <th className="p-2 text-center">Time (min)</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {limits.map(([url, limit], i) => (
                  <tr key={i} className="flex items-center justify-between">
                    <td className="p-2 break-all text-2xl font-bold">{url}</td>
                    <td className="p-2 text-center text-base flex items-center justify-center gap-2">
                      <button 
                        onClick={() => updateLimit(url, limit - 1)} 
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <IoRemoveCircleOutline size={18} />
                      </button>

                      {editingUrl === url ? (
                        <input
                          type="number"
                          value={editingTime}
                          onChange={handleTimeChange}
                          onBlur={() => handleTimeBlur(url)}
                          onKeyDown={(e) => handleTimeKeyDown(e, url)}
                          className="text-center w-16 p-1 border border-gray-300 rounded-md"
                        />
                      ) : (
                        <span
                          onClick={() => {
                            setEditingUrl(url);
                            setEditingTime(limit.toString());
                          }}
                          className="cursor-pointer"
                        >
                          {limit}
                        </span>
                      )}
                      <button 
                        onClick={() => updateLimit(url, limit + 1)} 
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <IoAddCircleOutline size={18} />
                      </button>
                    </td>
                    <td className="p-2 text-center text-base">
                      <button 
                        onClick={() => removeLimit(url)} 
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <IoTrashOutline />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-600">No limits set</div>
        )}
      </div>
    </div>
  );
};

export default Alarm;
