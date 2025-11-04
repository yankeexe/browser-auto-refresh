document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const intervalInput = document.getElementById('interval');
  const durationInput = document.getElementById('duration');
  const statusDiv = document.getElementById('status');

  // Get the current state from storage and update the UI
  chrome.storage.local.get(['isRefreshing', 'interval', 'duration'], (result) => {
    if (result.isRefreshing) {
      statusDiv.textContent = 'Status: Active';
      intervalInput.value = result.interval || 10;
      durationInput.value = result.duration || 0;
      intervalInput.disabled = true;
      durationInput.disabled = true;
      startButton.disabled = true;
      stopButton.disabled = false;
    } else {
      statusDiv.textContent = 'Status: Inactive';
      intervalInput.disabled = false;
      durationInput.disabled = false;
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  });

  startButton.addEventListener('click', () => {
    const interval = parseInt(intervalInput.value, 10);
    const duration = parseInt(durationInput.value, 10);
    chrome.runtime.sendMessage({
      action: 'start',
      interval,
      duration,
    });
    chrome.storage.local.set({ isRefreshing: true, interval, duration });
    statusDiv.textContent = 'Status: Active';
    intervalInput.disabled = true;
    durationInput.disabled = true;
    startButton.disabled = true;
    stopButton.disabled = false;
  });

  stopButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stop' });
    chrome.storage.local.set({ isRefreshing: false });
    statusDiv.textContent = 'Status: Inactive';
    intervalInput.disabled = false;
    durationInput.disabled = false;
    startButton.disabled = false;
    stopButton.disabled = true;
  });
});
