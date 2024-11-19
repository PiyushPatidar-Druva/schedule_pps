// content.js
// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "replaceTextarea") {
    // Find the textarea with the class _.parameterizedSpecification
    const textarea = document.getElementsByName("_.parameterizedSpecification")[0];

    if (textarea) {
      // Replace the textarea's value with the new value passed from the popup
      textarea.value = request.newValue;
      sendResponse({ success: true, message: "Textarea updated successfully" });
    } else {
      sendResponse({ success: false, message: "Textarea not found" });
    }
  }

  // Action to get the current value of the textarea
  if (request.action === "getTextareaValue") {
    const textarea = document.getElementsByName("_.parameterizedSpecification")[0];

    if (textarea) {
      // Send the current value of the textarea back to the popup
      sendResponse({ success: true, value: textarea.value });
    } else {
      sendResponse({ success: false, message: "Textarea not found" });
    }
  }

  // Ensure asynchronous response for `sendResponse`
  return true; // Keeps the message channel open for sendResponse
});
