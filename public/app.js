// Tab switching
function switchToTab(tabName) {
  // Update buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Save to localStorage
  localStorage.setItem('activeTab', tabName);
  
  // Load data for active tab
  if (tabName === 'bethany') {
    loadBethanyBikeStats();
  } else if (tabName === 'activities') {
    loadActivities();
  } else if (tabName === 'settings') {
    loadCategoryStats();
  }
}

document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    switchToTab(button.dataset.tab);
  });
});

// Restore active tab on page load
const savedTab = localStorage.getItem('activeTab');
if (savedTab) {
  switchToTab(savedTab);
} else {
  // Default to 'bethany' tab if no saved tab
  switchToTab('bethany');
}

// Check auth status on load
checkAuthStatus();

// Strava Authentication
document.getElementById('auth-btn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/strava/auth');
    const data = await response.json();
    
    if (!response.ok) {
      // Handle error response
      showStatus('auth-status', data.error || 'Error connecting to Strava', 'error');
      return;
    }
    
    if (data.authUrl) {
      window.location.href = data.authUrl;
    } else {
      showStatus('auth-status', 'Invalid response from server', 'error');
    }
  } catch (error) {
    console.error('Error getting auth URL:', error);
    showStatus('auth-status', 'Error connecting to Strava: ' + error.message, 'error');
  }
});

// Shared sync activities function
async function syncActivities(statusEl = null) {
  // Use provided status element or default to the one in Components tab
  const defaultStatusEl = document.getElementById('sync-status');
  const targetStatusEl = statusEl || defaultStatusEl;

  targetStatusEl.textContent = 'Syncing activities...';
  targetStatusEl.className = 'status-message info';
  targetStatusEl.style.display = 'block';

  try {
    const response = await fetch('/api/strava/sync', { method: 'POST' });
    const data = await response.json();

    if (!response.ok) {
      // Handle error response
      const errorMsg = data.details || data.error || 'Sync failed';
      targetStatusEl.textContent = `Error: ${errorMsg}`;
      targetStatusEl.className = 'status-message error';
      console.error('Sync error:', data);
      return;
    }

    if (data.success) {
      targetStatusEl.textContent = `Successfully synced ${data.synced} new activities! (${data.skipped} already existed)`;
      targetStatusEl.className = 'status-message success';
      // Reload activities if on that tab
      if (document.getElementById('activities-tab').classList.contains('active')) {
        loadActivities();
      }
    } else {
      throw new Error(data.error || 'Sync failed');
    }
  } catch (error) {
    targetStatusEl.textContent = `Error: ${error.message}`;
    targetStatusEl.className = 'status-message error';
    console.error('Sync error:', error);
  }
}

// Sync activities (original button in Components tab)
document.getElementById('sync-btn').addEventListener('click', async () => {
  await syncActivities();
});

// Reset site button
document.getElementById('reset-site-btn').addEventListener('click', async () => {
  const resetStatusEl = document.getElementById('reset-status');

  // Multiple confirmations for safety
  const confirmed1 = confirm('⚠️ WARNING: This will permanently delete ALL data from the site!');
  if (!confirmed1) return;

  const confirmed2 = confirm('Are you absolutely sure? This includes:\n• All Strava activities\n• All component replacements\n• All maintenance history\n• Strava authentication tokens');
  if (!confirmed2) return;

  const confirmed3 = confirm('This action CANNOT be undone. Type "RESET" to confirm:');
  if (!confirmed3) return;

  const finalConfirm = prompt('Type "RESET" to confirm permanent deletion of all data:');
  if (finalConfirm !== 'RESET') {
    alert('Reset cancelled.');
    return;
  }

  resetStatusEl.textContent = 'Resetting site...';
  resetStatusEl.className = 'status-message info';
  resetStatusEl.style.display = 'block';

  try {
    const response = await fetch('/api/reset', {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      resetStatusEl.textContent = 'Site reset successfully! Reloading...';
      resetStatusEl.className = 'status-message success';

      // Clear all localStorage
      localStorage.clear();

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      throw new Error(data.error || 'Reset failed');
    }
  } catch (error) {
    console.error('Reset error:', error);
    resetStatusEl.textContent = `Reset failed: ${error.message}`;
    resetStatusEl.className = 'status-message error';
  }
});

// Sync activities (new button in My Bike tab)
document.getElementById('sync-btn-bike-tab').addEventListener('click', async () => {
  // Create or use a status element for the bike tab
  let statusEl = document.getElementById('sync-status-bike-tab');
  if (!statusEl) {
    // Create a temporary status element for the bike tab
    statusEl = document.createElement('div');
    statusEl.id = 'sync-status-bike-tab';
    statusEl.className = 'status-message';
    statusEl.style.marginTop = '10px';

    // Insert it after the sync button
    const button = document.getElementById('sync-btn-bike-tab');
    button.parentNode.insertBefore(statusEl, button.nextSibling);
  }

  await syncActivities(statusEl);
});

// Check authentication status
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/strava/token');
    const data = await response.json();
    
    if (data.hasToken) {
      document.getElementById('auth-status').textContent = '✅ Connected to Strava';
      document.getElementById('auth-status').className = 'status-message success';
      document.getElementById('sync-btn').style.display = 'inline-block';
      document.getElementById('auth-btn').textContent = 'Re-authenticate';
    } else {
      document.getElementById('auth-status').textContent = 'Not connected to Strava';
      document.getElementById('auth-status').className = 'status-message info';
    }
  } catch (error) {
    // Not authenticated
    document.getElementById('auth-status').textContent = 'Not connected to Strava';
    document.getElementById('auth-status').className = 'status-message info';
  }
  
  // Check for auth callback
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auth') === 'success') {
    showStatus('auth-status', 'Successfully authenticated!', 'success');
    checkAuthStatus();
    window.history.replaceState({}, document.title, '/');
  } else if (urlParams.get('error')) {
    const errorMsg = urlParams.get('error');
    let userFriendlyMsg = errorMsg;
    
    // Provide helpful error messages
    if (errorMsg === 'access_denied') {
      userFriendlyMsg = 'Access was denied. Please try again and authorize the app.';
    } else if (errorMsg === 'no_code') {
      userFriendlyMsg = 'No authorization code received. Please try connecting again.';
    } else if (errorMsg === 'token_exchange_failed') {
      userFriendlyMsg = 'Failed to exchange authorization code. Please check your Strava API credentials in .env file.';
    }
    
    showStatus('auth-status', `Authentication error: ${userFriendlyMsg}`, 'error');
    window.history.replaceState({}, document.title, '/');
  }
}

// Load activities
async function loadActivities() {
  const listEl = document.getElementById('activities-list');
  listEl.innerHTML = '<div class="loading">Loading activities...</div>';
  
  try {
    const response = await fetch('/api/activities');
    const activities = await response.json();

    console.log('Loaded activities:', activities.length, 'total');
    const replacementActivities = activities.filter(a => a.is_replacement);
    console.log('Replacement activities:', replacementActivities.length, replacementActivities.map(a => a.name));

    if (activities.length === 0) {
      listEl.innerHTML = '<div class="loading">No activities found. Sync with Strava to get started!</div>';
      return;
    }
    
    // Group activities by date (converted to Pacific time)
    const activitiesByDate = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.start_date);
      // Convert to Pacific time - format date in Pacific timezone
      const pacificDateStr = date.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); // 'en-CA' gives YYYY-MM-DD format
      const dateKey = pacificDateStr; // Already in YYYY-MM-DD format
      
      if (!activitiesByDate[dateKey]) {
        activitiesByDate[dateKey] = [];
      }
      activitiesByDate[dateKey].push(activity);
    });
    
    // Find the date range
    const allDates = Object.keys(activitiesByDate).map(d => new Date(d));
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    // Build calendar view for each month
    listEl.innerHTML = '<div class="calendar-view"></div>';
    const container = listEl.querySelector('.calendar-view');
    
    // Generate calendars for each month that has activities
    const currentMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    const endMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    
    while (currentMonth >= endMonth) {
      const monthCalendar = createMonthCalendar(currentMonth, activitiesByDate);
      container.appendChild(monthCalendar);
      
      // Move to previous month
      currentMonth.setMonth(currentMonth.getMonth() - 1);
    }
  } catch (error) {
    listEl.innerHTML = `<div class="status-message error">Error loading activities: ${error.message}</div>`;
  }
}

// Create a calendar for a specific month
function createMonthCalendar(monthDate, activitiesByDate) {
  const monthContainer = document.createElement('div');
  monthContainer.className = 'month-calendar';
  
  // Month header
  const monthHeader = document.createElement('h3');
  monthHeader.className = 'month-header';
  monthHeader.textContent = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  monthContainer.appendChild(monthHeader);
  
  // Day names header
  const dayNamesRow = document.createElement('div');
  dayNamesRow.className = 'calendar-week calendar-header-week';
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(dayName => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = dayName;
    dayNamesRow.appendChild(dayHeader);
  });
  monthContainer.appendChild(dayNamesRow);
  
  // Get first and last day of the month
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday
  const totalDays = lastDay.getDate();
  
  let currentWeek = document.createElement('div');
  currentWeek.className = 'calendar-week';
  
  // Add empty spacer cells at the beginning if the first day doesn't start on Sunday
  for (let i = 0; i < firstDayOfWeek; i++) {
    const spacer = document.createElement('div');
    spacer.className = 'calendar-day calendar-day-empty';
    currentWeek.appendChild(spacer);
  }
  
  // Generate calendar days - only for the current month
  const currentDate = new Date(firstDay);
  for (let day = 1; day <= totalDays; day++) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayActivities = activitiesByDate[dateKey] || [];
    
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);
    
    const activitiesContainer = document.createElement('div');
    activitiesContainer.className = 'day-activities';
    
      dayActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'calendar-activity-item';
        
        // Check if this is a replacement activity
        if (activity.is_replacement) {
          activityItem.style.background = 'linear-gradient(135deg, #4A6B5A 0%, #1B4332 100%)';
          // Use the actual activity name from the database
          activityItem.innerHTML = `
            <span class="activity-name" style="font-size: 0.85em; text-align: center;">${activity.name}</span>
          `;
        } else {
          activityItem.innerHTML = `
            <span class="activity-miles">${activity.distance_miles} mi</span>
            <span class="activity-time">${activity.moving_time_formatted}</span>
          `;
        }
        
        activitiesContainer.appendChild(activityItem);
      });
    
    dayCell.appendChild(activitiesContainer);
    currentWeek.appendChild(dayCell);
    
    // Start new week on Saturdays (end of week)
    if (currentDate.getDay() === 6) {
      monthContainer.appendChild(currentWeek);
      currentWeek = document.createElement('div');
      currentWeek.className = 'calendar-week';
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Add the last week if it has any days
  if (currentWeek.children.length > 0) {
    monthContainer.appendChild(currentWeek);
  }
  
  return monthContainer;
}

// Load bikes
async function loadBikes() {
  const listEl = document.getElementById('bikes-list');
  listEl.innerHTML = '<div class="loading">Loading bikes...</div>';
  
  try {
    const response = await fetch('/api/components/bikes');
    const bikes = await response.json();
    
    if (bikes.length === 0) {
      listEl.innerHTML = '<div class="loading">No bikes added yet. Click "Add Bike" to get started!</div>';
      return;
    }
    
    listEl.innerHTML = '';
    
    for (const bike of bikes) {
      const bikeCard = await createBikeCard(bike);
      listEl.appendChild(bikeCard);
    }
  } catch (error) {
    listEl.innerHTML = `<div class="status-message error">Error loading bikes: ${error.message}</div>`;
  }
}

// Create bike card
async function createBikeCard(bike) {
  const card = document.createElement('div');
  card.className = 'bike-card';
  
  // Load components for this bike
  let components = [];
  try {
    const response = await fetch(`/api/components/bikes/${bike.id}/components`);
    components = await response.json();
  } catch (error) {
    console.error('Error loading components:', error);
  }
  
  card.innerHTML = `
    <h3>${bike.name}</h3>
    ${bike.description ? `<p style="color: #4a5568; margin-bottom: 15px;">${bike.description}</p>` : ''}
    <button class="btn btn-small btn-primary add-component-btn" data-bike-id="${bike.id}" data-bike-name="${bike.name}">Add Component</button>
    <div class="components-list" style="margin-top: 15px;">
      ${components.length === 0 ? '<p style="color: #718096; font-size: 0.9em;">No components added yet</p>' : ''}
      ${components.map(comp => `
        <div class="component-item">
          <h4>${comp.name} <span class="badge ${comp.component_type.toLowerCase().replace(' ', '')}">${comp.component_type}</span></h4>
          <div class="component-meta">
            <span>📏 ${comp.usage_distance_miles} miles used</span>
            ${comp.service_interval_miles ? `<span>🎯 ${comp.service_interval_miles} mile interval</span>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Add event listener for add component button
  const addComponentBtn = card.querySelector('.add-component-btn');
  addComponentBtn.addEventListener('click', () => {
    openComponentModal(bike.id, bike.name);
  });
  
  return card;
}

// Modal handling
const bikeModal = document.getElementById('bike-modal');
const componentModal = document.getElementById('component-modal');
const bikeForm = document.getElementById('bike-form');
const componentForm = document.getElementById('component-form');

// Note: Add Bike functionality not currently implemented in UI
// Removed event listener for non-existent 'add-bike-btn'

document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', (e) => {
    e.target.closest('.modal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === bikeModal) bikeModal.style.display = 'none';
  if (e.target === componentModal) componentModal.style.display = 'none';
});

// Bike form submission
bikeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(bikeForm);
  
  try {
    const response = await fetch('/api/components/bikes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        description: formData.get('description')
      })
    });
    
    if (response.ok) {
      bikeModal.style.display = 'none';
      bikeForm.reset();
      loadBikes();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Component form submission
let currentBikeId = null;
function openComponentModal(bikeId, bikeName) {
  currentBikeId = bikeId;
  document.getElementById('modal-bike-name').textContent = bikeName;
  componentModal.style.display = 'block';
}

componentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentBikeId) return;
  
  const formData = new FormData(componentForm);
  
  try {
    const response = await fetch(`/api/components/bikes/${currentBikeId}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        component_type: formData.get('component_type'),
        install_date: formData.get('install_date') || null,
        install_distance: parseFloat(formData.get('install_distance')) || 0,
        service_interval_miles: formData.get('service_interval_miles') ? parseFloat(formData.get('service_interval_miles')) : null,
        notes: formData.get('notes') || null
      })
    });
    
    if (response.ok) {
      componentModal.style.display = 'none';
      componentForm.reset();
      loadBikes();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Load Bethany's Bike statistics (mileage and time only)
async function loadBethanyBikeStats() {
  try {
    const response = await fetch('/api/categories/stats');
    const stats = await response.json();
    
    // Check if chain is topped off
    const chainToppedOff = localStorage.getItem('chainToppedOff') === 'true';

    // Map category names to Bethany's Bike tab IDs with maximum values for progress bars
    const categories = [
      {
        name: 'Chain',
        id: 'chain',
        maxMiles: chainToppedOff ? 200 : 375,
        maxHours: chainToppedOff ? 10 : 22,
        showMileage: true,
        showTime: true, // Always show time bar for Chain
        useDays: false
      },
      { name: 'Power Meter Battery', id: 'power-meter', maxMiles: 3000, maxHours: 300, showMileage: false, useDays: false },
      { name: 'Di2 Shifter Battery', id: 'di2-shifter', maxMiles: 3000, maxHours: 100, showMileage: false, useDays: true, maxDays: 700 },
      { name: 'Di2 System Battery', id: 'di2-system', maxMiles: 750, maxHours: 100, showMileage: true, showTime: false, useDays: false },
      { name: 'Tubeless Sealant', id: 'sealant', maxMiles: 3000, maxHours: 150, showMileage: false, useDays: true, maxDays: 90 }
    ];
    
    categories.forEach(({ name, id, maxMiles, maxHours, showMileage, useDays, maxDays, showTime = true }) => {
      const contentEl = document.getElementById(`bethany-${id}-content`);
      
      if (contentEl && stats[name]) {
        const stat = stats[name];
        
        // Build HTML based on category configuration
        let html = '';
        
        if (showMileage) {
          const mileagePercent = Math.min((stat.mileage / maxMiles) * 100, 100);
          html += `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>Mileage:</strong>
                <span>${stat.mileage} / ${maxMiles} miles</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${mileagePercent}%; background: linear-gradient(90deg, #4A6B5A 0%, #1B4332 100%);"></div>
              </div>
            </div>
          `;
        }
        
        if (useDays) {
          // Calculate days since last replacement
          let diffDays = 0;
          let daysPercent = 0;
          
          if (stat.lastReplacement) {
            const lastReplacementDate = new Date(stat.lastReplacement + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = today - lastReplacementDate;
            diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            daysPercent = Math.min((diffDays / maxDays) * 100, 100);
          }
          
          html += `
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>Days:</strong>
                <span>${diffDays} / ${maxDays} days</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${daysPercent}%; background: linear-gradient(90deg, #D4C5A9 0%, #C4B99B 100%);"></div>
              </div>
            </div>
          `;
        } else if (showTime) {
          // Parse time from "H:MM" format to total minutes
          const timeParts = stat.time.split(':');
          const hours = parseInt(timeParts[0]) || 0;
          const minutes = parseInt(timeParts[1]) || 0;
          const totalMinutes = hours * 60 + minutes;
          const maxMinutes = maxHours * 60;
          const timePercent = Math.min((totalMinutes / maxMinutes) * 100, 100);
          
          html += `
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>Time:</strong>
                <span>${stat.time} / ${maxHours}:00</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${timePercent}%; background: linear-gradient(90deg, #D4C5A9 0%, #C4B99B 100%);"></div>
              </div>
            </div>
          `;
        }
        
        contentEl.innerHTML = html;
      }
    });
  } catch (error) {
    console.error('Error loading Bethany\'s Bike stats:', error);
  }
}

// Load category statistics for Settings tab (buttons and history only)
async function loadCategoryStats() {
  try {
    const [statsResponse, historyResponse] = await Promise.all([
      fetch('/api/categories/stats'),
      fetch('/api/categories/history')
    ]);
    
    const stats = await statsResponse.json();
    const history = await historyResponse.json();
    
    // Update each category section
    const categories = [
      { name: 'Chain', id: 'chain', buttonText: 'Rewaxed Today' },
      { name: 'Power Meter Battery', id: 'power-meter-battery', buttonText: 'Recharged Today' },
      { name: 'Di2 Shifter Battery', id: 'di2-shifter-battery', buttonText: 'Replaced Today' },
      { name: 'Di2 System Battery', id: 'di2-system-battery', buttonText: 'Recharged Today' },
      { name: 'Tubeless Sealant', id: 'tubeless-sealant', buttonText: 'Replaced Today' }
    ];
    
    categories.forEach(({ name, id, buttonText }) => {
      const contentEl = document.getElementById(`settings-${id}-content`);
      
      if (contentEl && stats[name]) {
        const categoryHistory = history[name] || [];
        
        // Format dates for display
        // Handle both old format (array of strings) and new format (array of objects with date and type)
        const historyList = categoryHistory.length > 0 
          ? categoryHistory.map(item => {
              // Handle both formats: string (old) or object (new)
              const date = typeof item === 'string' ? item : item.date;
              const type = typeof item === 'object' ? item.type : 'replacement';
              // Format date in Pacific timezone
              const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'America/Los_Angeles'
              });
              
              // Display "Topped off (date)" for topped off events, regular date for replacements
              return type === 'toppedOff' ? `Topped off (${formattedDate})` : formattedDate;
            }).join('<br>')
          : '<em style="color: #888;">No replacements recorded</em>';
        
        // Add Wax Pot Usage progress bar for Chain
        let waxPotUsageHtml = '';
        if (name === 'Chain') {
          // Only use the wax pot reset timestamp (NOT the topped off reset timestamp)
          // The topped off reset should only affect mileage/time bars, not the wax pot counter
          const regularResetKey = `waxPotReset_${name}`;
          const regularResetTimestamp = localStorage.getItem(regularResetKey);

          // Filter to only actual replacements (exclude topped off events) and handle both old/new formats
          const actualReplacements = categoryHistory.filter(item => {
            const date = typeof item === 'string' ? item : item.date;
            const type = typeof item === 'object' ? item.type : 'replacement';
            // Only count actual replacements, not topped off events
            return type === 'replacement';
          });

          // Count replacements after reset timestamp (or all if no reset)
          const replacementCount = regularResetTimestamp
            ? actualReplacements.filter(item => {
                const date = typeof item === 'string' ? item : item.date;
                return new Date(date + 'T00:00:00') > new Date(regularResetTimestamp);
              }).length
            : actualReplacements.length;

          const maxWaxPot = 30;
          const waxPotPercent = Math.min((replacementCount / maxWaxPot) * 100, 100);
          waxPotUsageHtml = `
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <strong>Wax Pot Usage:</strong>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span>${replacementCount} / ${maxWaxPot}</span>
                  <button class="btn btn-danger btn-small reset-wax-pot-btn" data-category="${name}" style="font-size: 0.8em; padding: 4px 8px;">Reset Wax Pot</button>
                </div>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${waxPotPercent}%; background: linear-gradient(90deg, #D4C5A9 0%, #C4B99B 100%);"></div>
              </div>
            </div>
          `;
        }
        
        contentEl.innerHTML = `
          <div style="margin-bottom: 15px;">
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
              <button class="btn btn-primary replace-btn" data-category="${name}">${buttonText}</button>
              <button class="btn btn-secondary manual-date-btn" data-category="${name}">Choose manual date</button>
              ${name === 'Chain' ? `<button class="btn btn-info topped-off-btn" data-category="${name}">Topped Off</button>` : ''}
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px;">
              ${waxPotUsageHtml}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="font-size: 1.1em;">Replacement History:</strong>
                <button class="btn btn-danger btn-small reset-history-btn" data-category="${name}" style="font-size: 0.8em; padding: 4px 8px;">Reset History</button>
              </div>
              <div style="font-size: 0.95em; color: #4a5568; line-height: 1.6;">
                ${historyList}
              </div>
            </div>
          </div>
        `;
        
        // Add event listener to the replace button
        const replaceBtn = contentEl.querySelector('.replace-btn');
        if (replaceBtn) {
          replaceBtn.addEventListener('click', () => handleReplacement(name));
        }
        
        // Add event listener to manual date button
        const manualDateBtn = contentEl.querySelector('.manual-date-btn');
        if (manualDateBtn) {
          manualDateBtn.addEventListener('click', () => openManualDateModal(name));
        }

        // Add event listener to reset wax pot button
        const resetWaxPotBtn = contentEl.querySelector('.reset-wax-pot-btn');
        if (resetWaxPotBtn) {
          resetWaxPotBtn.addEventListener('click', () => handleResetWaxPot(name));
        }

        // Add event listener to topped off button
        const toppedOffBtn = contentEl.querySelector('.topped-off-btn');
        if (toppedOffBtn) {
          toppedOffBtn.addEventListener('click', () => handleToppedOff(name));
        }

        // Add event listener to reset history button
        const resetHistoryBtn = contentEl.querySelector('.reset-history-btn');
        if (resetHistoryBtn) {
          resetHistoryBtn.addEventListener('click', () => handleResetHistory(name));
        }
      }
    });
  } catch (error) {
    console.error('Error loading category stats:', error);
  }
}

// Helper function to get current date in Pacific timezone (YYYY-MM-DD format)
function getPacificDate() {
  const now = new Date();
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); // Returns YYYY-MM-DD format
}

// Handle topped off button click
async function handleToppedOff(category) {
  try {
    // Create a calendar event for "Chain Topped Off" but don't count it as wax pot usage
    console.log('Topped Off button clicked for category:', category);
    console.log('Making API call to /api/categories/replace');

    // Use Pacific time date
    const pacificDate = getPacificDate();

    const response = await fetch('/api/categories/replace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, date: pacificDate, toppedOff: true, calendarOnly: true })
    });

    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API call failed:', response.status, errorText);
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);

    if (data.success) {
      // Store topped off reset timestamp (for counter reset)
      const resetKey = `chainToppedOffReset`;
      const resetTimestamp = new Date().toISOString();
      localStorage.setItem(resetKey, resetTimestamp);

      // Store topped off state in localStorage
      const toppedOffKey = `chainToppedOff`;
      localStorage.setItem(toppedOffKey, 'true');

      // Reload stats for both tabs
      loadCategoryStats();
      loadBethanyBikeStats();

      // Always reload activities data to ensure calendar events are updated
      console.log('Reloading activities after topped off');
      loadActivities();

      // Show success message
      alert('Silca Super Secret is good for 200 miles (10 hours) of riding.');
    } else {
      throw new Error(data.error || 'Failed to mark as topped off');
    }
  } catch (error) {
    console.error('Error marking chain as topped off:', error);
    alert('Error marking chain as topped off: ' + error.message);
  }
}

// Handle reset wax pot button click
async function handleResetWaxPot(category) {
  // Confirm with user
  const confirmed = confirm(`Are you sure you want to reset the Wax Pot usage counter for ${category}? The replacement history will be preserved, but the counter will start from zero.`);
  if (!confirmed) {
    return;
  }

  try {
    // Store reset timestamp in localStorage (keyed by category)
    const resetKey = `waxPotReset_${category}`;
    const resetTimestamp = new Date().toISOString();
    localStorage.setItem(resetKey, resetTimestamp);

    // Reload category stats to update the display
    await loadCategoryStats();

    // Show success message
    alert('Wax Pot usage counter has been reset! The replacement history is preserved.');
  } catch (error) {
    console.error('Error resetting wax pot:', error);
    alert('Error resetting wax pot: ' + error.message);
  }
}

// Handle reset history button click
async function handleResetHistory(category) {
  // Confirm with user
  const confirmed = confirm(`Are you sure you want to delete all replacement history for ${category}? This action cannot be undone.`);
  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/categories/history/${encodeURIComponent(category)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reset history');
    }

    const data = await response.json();

    if (data.success) {
      // Reload category stats to update the display
      await loadCategoryStats();

      // Reload activities if on activities tab (to update calendar)
      if (document.getElementById('activities-tab').classList.contains('active')) {
        loadActivities();
      }

      // Show success message
      alert(`Replacement history for ${category} has been cleared.`);
    } else {
      throw new Error(data.error || 'Failed to reset history');
    }
  } catch (error) {
    console.error('Error resetting history:', error);
    alert('Error resetting history: ' + error.message);
  }
}

// Handle replacement button click
async function handleReplacement(category, date = null) {
  let actionText = 'replaced';
  if (category === 'Chain') {
    actionText = 'rewaxed';
  } else if (category === 'Power Meter Battery' || category === 'Di2 System Battery') {
    actionText = 'recharged';
  }
  
  // Use Pacific time date if no date provided
  const pacificDate = date || getPacificDate();
  const dateText = date ? ` on ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}` : ' today';
  
  if (!confirm(`Mark ${category} as ${actionText}${dateText}? This will reset the counter.`)) {
    return;
  }
  
  try {
    const response = await fetch('/api/categories/replace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, date: pacificDate })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // If this is a chain replacement, clear the topped off state
      if (category === 'Chain') {
        localStorage.removeItem('chainToppedOff');
      }

      // Reload stats for both tabs
      loadCategoryStats();
      loadBethanyBikeStats();
      
      // Reload activities if on activities tab
      if (document.getElementById('activities-tab').classList.contains('active')) {
        loadActivities();
      }
    } else {
      alert('Error recording replacement');
    }
  } catch (error) {
    console.error('Error recording replacement:', error);
    alert('Error recording replacement: ' + error.message);
  }
}

// Open manual date modal for Chain
function openManualDateModal(category) {
  let modal = document.getElementById('manual-date-modal');
  if (!modal) {
    // Create modal if it doesn't exist
    const modalHTML = `
      <div id="manual-date-modal" class="modal">
        <div class="modal-content">
          <span class="close manual-date-close">&times;</span>
          <h2 id="manual-date-title">Select Date for Replacement</h2>
          <form id="manual-date-form">
            <label>
              Date: <input type="date" id="replacement-date" name="date" required>
            </label>
            <button type="submit" class="btn btn-primary">Confirm</button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    modal = document.getElementById('manual-date-modal');
    const closeBtn = modal.querySelector('.manual-date-close');
    const form = document.getElementById('manual-date-form');
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dateInput = document.getElementById('replacement-date');
      const selectedDate = dateInput.value;
      const currentCategory = modal.dataset.category;
      modal.style.display = 'none';
      await handleReplacement(currentCategory, selectedDate);
    });
  }
  
  // Update modal with current category
  modal.dataset.category = category;
  const title = document.getElementById('manual-date-title');
  if (title) {
    title.textContent = `Select Date for ${category} Replacement`;
  }
  
  // Set today's date as default and show modal
  const dateInput = document.getElementById('replacement-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today; // Don't allow future dates
  }
  
  modal.style.display = 'block';
}

// Helper function
function showStatus(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `status-message ${type}`;
  el.style.display = 'block';
}