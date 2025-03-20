chrome.runtime.onInstalled.addListener(() => {
    console.log("🚀 Extension Installed: Resetting timeSpent and limits");
    chrome.storage.local.set({ timeSpent: {}, limits: {} });
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(`🔄 Tab Updated: ${changeInfo.status}, URL: ${tab.url}`);
  
    if (changeInfo.status === "complete") {
      if (!tab.url) return; // Prevent errors for special Chrome pages
  
      const url = new URL(tab.url).hostname;
      console.log(`🌐 Navigated to: ${url}`);
  
      chrome.storage.local.get(["timeSpent", "limits"], (data) => {
        let timeSpent = data.timeSpent || {};
        let limits = data.limits || {};
  
        console.log("🕒 Current Time Spent:", timeSpent);
        console.log("⏳ Limits Set:", limits);
  
        if (!timeSpent[url]) timeSpent[url] = 0;
  
        if (limits[url] && timeSpent[url] >= limits[url]) {
          console.log(`🚨 Time limit reached for ${url}, redirecting...`);
          chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
        } else {
          console.log(`✅ Tracking time for ${url}`);
          trackTime(url);
        }
      });
    }
  });
  
  function trackTime(url) {
    console.log(`⏳ Starting time tracking for ${url}`);
    let interval = setInterval(() => {
      chrome.storage.local.get("timeSpent", (data) => {
        let timeSpent = data.timeSpent || {};
        timeSpent[url] = (timeSpent[url] || 0) + 1;
  
        console.log(`🕒 Updated time for ${url}: ${timeSpent[url]} mins`);
        chrome.storage.local.set({ timeSpent });
      });
    }, 60000); // Increase time every minute
  }
  