document.addEventListener("DOMContentLoaded", () => {
    const editFields = document.getElementById("editFields");
    const saveAllBtn = document.getElementById("saveAll");
    const closeBtn = document.getElementById("closeWindow");
    let cachedActions = [];
  
    function renderFields() {
        chrome.storage.local.get("actions", (data) => {
          editFields.innerHTML = "";
          cachedActions = data.actions || [];
      
          const xpathMap = new Map(); // key: XPath, value: { index, value }
      
          // Iterate from end to start to get the latest entry per XPath
          for (let i = cachedActions.length - 1; i >= 0; i--) {
            const action = cachedActions[i];
            const match = action.match(/Entered text '(.*?)' in field \| XPath: (.*)/);
            if (match) {
              const value = match[1];
              const xpath = match[2];
              if (!xpathMap.has(xpath)) {
                xpathMap.set(xpath, { index: i, value });
              }
            }
          }
      
          // Now build the input fields
          xpathMap.forEach(({ index, value }, xpath) => {
            const block = document.createElement("div");
            block.className = "edit-block";
            block.innerHTML = `
              <div><strong>XPath:</strong> ${xpath}</div>
              <input type="text" id="edit-${index}" value="${value}" />
            `;
            editFields.appendChild(block);
          });
        });
      }
      
  
      saveAllBtn.addEventListener("click", () => {
        const updatedActions = [...cachedActions];
        const updatesToDOM = [];
      
        editFields.querySelectorAll("input").forEach((input) => {
          const id = input.id; // e.g., "edit-5"
          const index = parseInt(id.replace("edit-", ""), 10);
          const newText = input.value;
      
          const match = cachedActions[index].match(/Entered text '(.*?)' in field \| XPath: (.*)/);
          if (match && newText) {
            const xpath = match[2];
            updatedActions[index] = `Entered text '${newText}' in field | XPath: ${xpath}`;
            updatesToDOM.push({ xpath, value: newText });
          }
        });
      
        chrome.storage.local.set({ actions: updatedActions }, () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "updateFields",
              updates: updatesToDOM,
            });
          });
      
         
          window.close();
        });
      });
      
  
    closeBtn.addEventListener("click", () => {
      window.close();
    });
  
    renderFields();
  });
  