let stopTimeout = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    const { interval, duration, durationUnit } = request;
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
      let durationInMs = 0;
      if (durationUnit === 'seconds') {
        durationInMs = duration * 1000;
      } else {
        durationInMs = duration * 60 * 1000;
      }

      stopTimeout = setTimeout(() => {
        chrome.alarms.clear('refresh');
        chrome.storage.local.set({ isRefreshing: false });
        if (stopTimeout) {
          clearTimeout(stopTimeout);
          stopTimeout = null;
        }
      }, durationInMs);
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
