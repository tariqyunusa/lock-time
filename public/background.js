chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension Installed: Tracking all sites.");
  chrome.storage.sync.set({ timeSpent: {}, limits: {} });

  chrome.alarms.create("trackTime", { periodInMinutes: 1 });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log(`🌐 Navigated to: ${new URL(tab.url).hostname}`);
  }
});


chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "trackTime") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].url) return;

      const url = new URL(tabs[0].url).hostname;
      const now = new Date();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const date = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getFullYear()}`;
      const fullDate = `${dayNames[now.getDay()]} - ${date}`;

      chrome.storage.sync.get(["timeSpent", "limits"], (data) => {
        let timeSpent = data.timeSpent || {};
        let limits = data.limits || {};

        if (!timeSpent[fullDate]) timeSpent[fullDate] = {};
        timeSpent[fullDate][url] = (timeSpent[fullDate][url] || 0) + 1;

        console.log(`🕒 ${url} on ${fullDate} - Time Spent: ${timeSpent[fullDate][url]} minutes`);

        chrome.storage.sync.set({ timeSpent });

        // Check if limit exceeded
        if (limits[url] && timeSpent[fullDate][url] >= limits[url]) {
          console.log(`⛔ Blocking ${url} - Limit Reached`);
          chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL("blocked.html") });
        }
      });
    });
  }
});
