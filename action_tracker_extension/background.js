chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadLogs") {
        (async () => {
            try {
                chrome.runtime.sendMessage({ progress: "Fetching actions from storage..." });
                const data = await chrome.storage.local.get("actions");
                const actions = data.actions || [];

                if (actions.length === 0) {
                    chrome.runtime.sendMessage({ progress: "No actions to upload." });
                    sendResponse({ status: "No actions to upload." });
                    return;
                }

                // Get the current active tab's URL
                let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                let landingUrl = tab && tab.url ? tab.url : '';

                chrome.runtime.sendMessage({ progress: "Uploading actions to backend..." });
                // Send actions and landingUrl to backend for Gist upload and automation
                const response = await fetch('http://localhost:10000/upload-and-run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ actions, landingUrl })
                });

                chrome.runtime.sendMessage({ progress: "Waiting for backend to generate script and run Playwright..." });
                const result = await response.json();

                if (result.success) {
                    await chrome.storage.local.set({ actions: [] });
                    chrome.runtime.sendMessage({ progress: "Script generated and Playwright run complete!" });
                    sendResponse({ status: "Upload and automation successful.", gistId: result.gistId });
                } else {
                    chrome.runtime.sendMessage({ progress: "Error: " + result.error });
                    sendResponse({ status: "Error: " + result.error });
                }
            } catch (err) {
                chrome.runtime.sendMessage({ progress: "Error during upload: " + err.message });
                console.error("Error during upload process:", err);
                sendResponse({ status: "Error: " + err.message });
            }
        })();
       
        return true;
    }
    
    if (request.action === "clearLogs") {
       debugger
        chrome.storage.local.remove(["actions", "shouldLog"], () => {
            if (chrome.runtime.lastError) {
                console.error("Error clearing logs:", chrome.runtime.lastError.message);
                sendResponse({ status: "Error clearing logs." });
            } else {
                console.log("Logs and flag cleared");
                sendResponse({ status: "Logs cleared successfully." });
            }
        });

   debugger
        return true;
    }
});

//This code is load a web page content when extension is install
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("index.html")
    });
  });
