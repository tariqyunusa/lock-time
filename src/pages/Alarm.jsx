import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoTrashOutline } from "react-icons/io5";
import { IoAddCircleOutline, IoRemoveCircleOutline } from "react-icons/io5";

const Alarm = () => {
  const [limits, setLimits] = useState([]);

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

  async function updateLimit(url, change) {
    try {
      const data = await browser.storage.sync.get("limits");
      let limits = data.limits || {};

      // Update the limit value (ensure it doesn't go below 1)
      limits[url] = Math.max(1, (limits[url] || 0) + change);

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

  return (
    <div className="bg-white p-2 w-[350px] h-[400px] relative flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center gap-2 py-4">
        <button className="text-xl text-black cursor-pointer outline-none" onClick={backToHome}>
          <IoMdArrowRoundBack />
        </button>
        <h2 className="text-xl font-bold">Limits</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        {limits.length > 0 ? (
          <div className="rounded-lg shadow">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-2">URL</th>
                  <th className="p-2 text-center">Time (min)</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {limits.map(([url, limit], i) => (
                  <tr key={i} className="hover:bg-gray-100">
                    <td className="p-2 break-all text-base">{url}</td>
                    <td className="p-2 text-center text-base flex items-center justify-center gap-2">
                      {/* Decrease Limit */}
                      <button 
                        onClick={() => updateLimit(url, -1)} 
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <IoRemoveCircleOutline size={18} />
                      </button>

                      {limit}

                      {/* Increase Limit */}
                      <button 
                        onClick={() => updateLimit(url, 1)} 
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <IoAddCircleOutline size={18} />
                      </button>
                    </td>
                    <td className="p-2 text-center text-base">
                      {/* Remove Limit */}
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
