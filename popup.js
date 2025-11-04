document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const intervalInput = document.getElementById('interval');
  const durationInput = document.getElementById('duration');
  const durationUnitInput = document.getElementById('duration-unit');
  const statusDiv = document.getElementById('status');

  const updateUI = (isRefreshing) => {
    if (isRefreshing) {
      statusDiv.textContent = 'Status: Active';
      statusDiv.classList.add('active');
      statusDiv.classList.remove('inactive');
      intervalInput.disabled = true;
      durationInput.disabled = true;
      durationUnitInput.disabled = true;
      startButton.disabled = true;
      stopButton.disabled = false;
    } else {
      statusDiv.textContent = 'Status: Inactive';
      statusDiv.classList.add('inactive');
      statusDiv.classList.remove('active');
      intervalInput.disabled = false;
      durationInput.disabled = false;
      durationUnitInput.disabled = false;
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  };

  // Get the current state from storage and update the UI
  chrome.storage.local.get(['isRefreshing', 'interval', 'duration', 'durationUnit'], (result) => {
    updateUI(result.isRefreshing);
    intervalInput.value = result.interval || 10;
    durationInput.value = result.duration || 0;
    durationUnitInput.value = result.durationUnit || 'minutes';
  });

  startButton.addEventListener('click', () => {
    const interval = parseInt(intervalInput.value, 10);
    const duration = parseInt(durationInput.value, 10);
    const durationUnit = durationUnitInput.value;
    chrome.runtime.sendMessage({
      action: 'start',
      interval,
      duration,
      durationUnit,
    });
    chrome.storage.local.set({ isRefreshing: true, interval, duration, durationUnit });
    updateUI(true);
  });

  stopButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stop' });
    chrome.storage.local.set({ isRefreshing: false });
    updateUI(false);
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.isRefreshing) {
      updateUI(changes.isRefreshing.newValue);
    }
  });
});
