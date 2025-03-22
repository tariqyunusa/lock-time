chrome.runtime.onInstalled.addListener(() => {
    console.log("🚀 Extension Installed: Tracking all sites.");
    chrome.storage.local.set({ timeSpent: {}, limits: {} });

    chrome.alarms.create("trackTime", {periodInMinutes: 1})
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(`🔄 Tab Updated: ${changeInfo.status}, URL: ${tab.url}`);
  
    if (changeInfo.status === "complete" && tab.url) {
      const url = new URL(tab.url).hostname;
      console.log(`🌐 Navigated to: ${url}`);
      trackTime(url)
    }
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm === "trackTime") {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if(tabs.length === 0 || !tabs[0].url) return;

        const url = new URL(tabs[0].url).hostname
        chrome.storage.local.get("timeSpent", (data) => {
          let timeSpent = data.timeSpent || {}
          timeSpent[url] = (timeSpent[url] || 0) + 1

          console.log(`🕒 Updated time for ${url}: ${timeSpent[url]} mins`)
          chrome.storage.local.set({timeSpent})
        })
      })
    }
  })
  

  chrome.alarms.create("KeepAlive", {periodInMinutes: 5})
  chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name === "KeepAlive") {
      console.log("👋 KeepAlive: Extension is still active");
      
    }
  })

  function trackTime(url) {
    console.log(`⏳ Starting time tracking for ${url}`);
    let interval = setInterval(() => {
      chrome.storage.local.get("timeSpent", (data) => {
        let timeSpent = data.timeSpent || {};
        timeSpent[url] = (timeSpent[url] || 0) + 1;
  
        console.log(`🕒 Updated time for ${url}: ${timeSpent[url]} mins`);
        chrome.storage.local.set({ timeSpent });
      });
    }, 60000); 
  }
  