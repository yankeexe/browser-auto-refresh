let stopTimeout = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    const { interval, duration } = request;
    chrome.storage.local.set({ interval, isRefreshing: true });

    // Clear any existing alarm
    chrome.alarms.clear('refresh');
    if (stopTimeout) {
      clearTimeout(stopTimeout);
      stopTimeout = null;
    }

    // Create a new alarm
    chrome.alarms.create('refresh', {
      delayInMinutes: interval / 60,
    });

    if (duration > 0) {
      stopTimeout = setTimeout(() => {
        chrome.alarms.clear('refresh');
        chrome.storage.local.set({ isRefreshing: false });
        if (stopTimeout) {
          clearTimeout(stopTimeout);
          stopTimeout = null;
        }
      }, duration * 60 * 1000);
    }
  } else if (request.action === 'stop') {
    chrome.alarms.clear('refresh');
    chrome.storage.local.set({ isRefreshing: false });
    if (stopTimeout) {
      clearTimeout(stopTimeout);
      stopTimeout = null;
    }
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
        // Recreate the alarm for the next interval
        chrome.storage.local.get(['interval'], (result) => {
          if (result.interval) {
            chrome.alarms.create('refresh', {
              delayInMinutes: result.interval / 60,
            });
          }
        });
      }
    });
  }
});
