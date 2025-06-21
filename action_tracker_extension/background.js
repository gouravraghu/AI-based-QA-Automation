chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadLogs") {
        (async () => {
            try {
                const data = await chrome.storage.local.get("actions");
                const actions = data.actions || [];

                if (actions.length === 0) {
                    sendResponse({ status: "No actions to download" });
                    return;
                }

                const textContent = actions.join("\n");
                const dataUrl = "data:text/plain;charset=utf-8," + encodeURIComponent(textContent);

                await chrome.downloads.download({
                    url: dataUrl,
                    filename: "user_actions.txt",
                    saveAs: true
                });

                await chrome.storage.local.set({ actions: [] });

                sendResponse({ status: "Download and clear successful." });
            } catch (err) {
                console.error("Error during download process:", err);
                sendResponse({ status: "Error: " + err.message });
            }
        })();

        return true; 
    }

    if (request.action === "clearLogs") {
        chrome.storage.local.set({ actions: [] }, () => {
            sendResponse({ status: "Logs cleared successfully." });
        });
        return true;
    }
});

//This code is load a web page content when extension is install
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("index.html")
    });
  });
