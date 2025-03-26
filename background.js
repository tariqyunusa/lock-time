import browser from "webextension-polyfill";

// 🚀 Extension Installed
browser.runtime.onInstalled.addListener(async () => {
    console.log("🚀 Extension Installed: Tracking all sites.");

    // Initialize storage
    await browser.storage.sync.set({ timeSpent: {}, limits: {} });

    // Create alarms to update time
    browser.alarms.create("trackTime", { periodInMinutes: 1 });
    browser.alarms.create("KeepAlive", { periodInMinutes: 5 });
});

// 🌐 Track tab updates
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        const url = cleanUrl(tab.url);
        console.log(`🌐 Navigated to: ${url}`);
        await checkBlockSite(url);
    }
});

// ⏰ Alarm listener to update time spent
browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "trackTime") {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });

        if (tabs.length === 0 || !tabs[0].url) return;

        const url = cleanUrl(tabs[0].url);
        const fullDate = getCurrentFormattedDate();

        try {
            const data = await browser.storage.sync.get("timeSpent");
            let timeSpent = data.timeSpent || {};

            if (!timeSpent[fullDate]) timeSpent[fullDate] = {};
            timeSpent[fullDate][url] = (timeSpent[fullDate][url] || 0) + 1;

            console.log(`🕒 ${url} - Time Spent: ${timeSpent[fullDate][url]} minutes`);
            await browser.storage.sync.set({ timeSpent });

            await checkBlockSite(url);
        } catch (error) {
            console.error("Error updating time spent:", error);
        }
    } else if (alarm.name === "KeepAlive") {
        console.log("👋 KeepAlive: Extension is still active");
    }
});

// 🚫 Check if site should be blocked
async function checkBlockSite(url) {
    const fullDate = getCurrentFormattedDate();

    try {
        const data = await browser.storage.sync.get(["timeSpent", "limits"]);
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

            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0) {
                await browser.tabs.update(tabs[0].id, { url: browser.runtime.getURL("blocked.html") });
            }
        }
    } catch (error) {
        console.error("Error retrieving storage data:", error);
    }
}

// 🛠 Helper Function: Clean URL (Removes "www.")
function cleanUrl(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch (error) {
        console.error("❌ Invalid URL:", url);
        return "";
    }
}

// 📅 Helper Function: Get Current Formatted Date
function getCurrentFormattedDate() {
    const now = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return `${dayNames[now.getDay()]} - ${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getFullYear()}`;
}
