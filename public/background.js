chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension Installed: Tracking all sites.");
  
  // Initialize storage
  chrome.storage.sync.set({ timeSpent: {}, limits: {} });

  // Create an alarm to update time every minute
  chrome.alarms.create("trackTime", { periodInMinutes: 1 });
  chrome.alarms.create("KeepAlive", { periodInMinutes: 5 });
});

// Track active tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
      const url = new URL(tab.url).hostname;
      console.log(`🌐 Navigated to: ${url}`);
      checkBlockSite(url);
  }
});

// Alarm listener to update time spent
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "trackTime") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length === 0 || !tabs[0].url) return;

          const url = new URL(tabs[0].url).hostname;

          // Get current date and day
          const now = new Date();
          const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const day = dayNames[now.getDay()];
          const date = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${now.getFullYear()}`;
          const fullDate = `${day} - ${date}`;

          // Retrieve and update time spent
          chrome.storage.sync.get("timeSpent", (data) => {
              let timeSpent = data.timeSpent || {};
              if (!timeSpent[fullDate]) timeSpent[fullDate] = {}; // Initialize for the day
              timeSpent[fullDate][url] = (timeSpent[fullDate][url] || 0) + 1;

              console.log(`🕒 ${url} on ${fullDate} - Time Spent: ${timeSpent[fullDate][url]} minutes`);
              chrome.storage.sync.set({ timeSpent }, () => checkBlockSite(url)); // Check after update
          });
      });
  } else if (alarm.name === "KeepAlive") {
      console.log("👋 KeepAlive: Extension is still active");
  }
});

// Function to check if the site should be blocked
function checkBlockSite(url) {
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = dayNames[now.getDay()];
  const date = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getFullYear()}`;
  const fullDate = `${day} - ${date}`;

  chrome.storage.sync.get(["timeSpent", "limits"], (data) => {
      let timeSpent = data.timeSpent || {};
      let limits = data.limits || {};

      if (!timeSpent[fullDate]) {
          console.log(`⚠️ [NO DATA] No tracking found for ${url} today.`);
          return;
      }

      let siteTime = timeSpent[fullDate][url] || 0;
      let limit = limits[url];

      console.log(`🔍 Checking site: ${url} - Spent: ${siteTime} mins (Limit: ${limit || "No Limit"})`);

      if (limit && siteTime >= limit) {
          console.log(`🚫 [BLOCK] ${url} exceeded the limit! Redirecting...`);

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs.length > 0) {
                  chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL("blocked.html") });
              }
          });
      }
  });
}
