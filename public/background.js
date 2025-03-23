chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension Installed: Tracking all sites.");
  chrome.storage.sync.set({ timeSpent: {}, limits: {} });

  chrome.alarms.create("trackTime", { periodInMinutes: 1 });
  chrome.alarms.create("KeepAlive", { periodInMinutes: 5 });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url).hostname;
    console.log(`🌐 Navigated to: ${url}`);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "trackTime") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].url) return;

      const url = new URL(tabs[0].url).hostname;
      const now = new Date();
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const day = dayNames[now.getDay()];
      const date = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getFullYear()}`;

      const fullDate = `${day} - ${date}`;

      chrome.storage.sync.get("timeSpent", (data) => {
        let timeSpent = data.timeSpent || {};
        if (!timeSpent[fullDate]) timeSpent[fullDate] = {};
        timeSpent[fullDate][url] = (timeSpent[fullDate][url] || 0) + 1;

        console.log(`🕒 ${url} on ${fullDate} - Time Spent: ${timeSpent[fullDate][url]} minutes`);
        chrome.storage.sync.set({ timeSpent });
      });
    });
  }

  if (alarm.name === "KeepAlive") {
    chrome.storage.sync.get(null, () => {
      console.log("👋 KeepAlive: Extension is still active");
    });
  }
});
