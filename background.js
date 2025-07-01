const sites = [
    "claude.ai",
    "chat.deepseek.com",
    "grok.x.ai",
    "chat.openai.com"
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = new URL(tab.url);
        const hostname = url.hostname;

        const isSiteMatch = sites.some(site => hostname.includes(site));

        if (isSiteMatch) {
            chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ["styles.css"]
            });
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"]
            });
        }
    }
}); 