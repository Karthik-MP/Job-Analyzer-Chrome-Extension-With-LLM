chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      // Initialize storage with default values
      chrome.storage.local.set({
        isLoggedIn: false,
        userProfile: null,
        savedJobs: [],
        settings: {
          notifications: true,
          autoAnalysis: false
        }
      });
    }
  });
  
  // Handle messages from content scripts and popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'checkAuth':
        // Check if user is authenticated
        console.log(chrome.storage.local.get(['userToken']))
        chrome.storage.local.get(['userToken']).then((result) => {
          sendResponse({
            isAuthenticated: !!result.userToken,
            // userProfile: result.userProfile
          });
        });
        return true; // Will respond asynchronously
  
      case 'logout':
        // Clear user data on logout
        chrome.storage.local.remove(['userToken']).then(() => {
          sendResponse({ success: true });
        });
        return true;
  
      case 'saveJob':
        // Save job to storage
        chrome.storage.local.get('savedJobs', (result) => {
          const savedJobs = result.savedJobs || [];
          // Prevent duplicate saves
          if (!savedJobs.some(job => job.id === request.jobData.id)) {
            savedJobs.push({
              ...request.jobData,
              savedAt: new Date().toISOString()
            });
            chrome.storage.local.set({ savedJobs }, () => {
              sendResponse({ success: true });
            });
          } else {
            sendResponse({ success: false, message: 'Job already saved' });
          }
        });
        return true;
  
      case 'getSavedJobs':
        // Retrieve saved jobs
        chrome.storage.local.get('savedJobs', (result) => {
          sendResponse({ savedJobs: result.savedJobs || [] });
        });
        return true;
  
      case 'analyzeCurrentPage':
        // Inject content script for job analysis
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          try {
            // Inject content script if not already present
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['contentScript.js']
            });
  
            // Send message to content script to start analysis
            chrome.tabs.sendMessage(tabs[0].id, { action: 'startAnalysis' }, 
              async (response) => {
                if (response?.jobData) {
                  // Get user profile for analysis
                  const userProfile = await new Promise((resolve) => {
                    chrome.storage.local.get('userProfile', (result) => {
                      resolve(result.userProfile);
                    });
                  });
  
                  // Send data to backend for analysis
                  const token = await new Promise((resolve) => {
                    chrome.storage.local.get('userToken', (result) => {
                      resolve(result.userToken);
                    });
                  });
  
                  // Analyze job data
                  try {
                    const analysisResponse = await fetch('http://localhost:3000/api/analyze-job', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        jobData: response.jobData,
                        userProfile
                      })
                    });
  
                    const analysisResult = await analysisResponse.json();
                    sendResponse({ success: true, analysis: analysisResult });
                  } catch (error) {
                    sendResponse({ 
                      success: false, 
                      error: 'Error analyzing job description' 
                    });
                  }
                }
              });
          } catch (error) {
            sendResponse({ 
              success: false, 
              error: 'Error injecting content script' 
            });
          }
        });
        return true;
  
      case 'updateSettings':
        // Update user settings
        chrome.storage.local.get('settings', (result) => {
          const currentSettings = result.settings || {};
          const newSettings = { ...currentSettings, ...request.settings };
          chrome.storage.local.set({ settings: newSettings }, () => {
            sendResponse({ success: true, settings: newSettings });
          });
        });
        return true;
  
      case 'getSettings':
        // Retrieve user settings
        chrome.storage.local.get('settings', (result) => {
          sendResponse({ settings: result.settings || {} });
        });
        return true;
    }
  });
  
  // Handle periodic token refresh
  const refreshToken = async () => {
    try {
      const { userToken } = await chrome.storage.local.get('userToken');
      if (!userToken) return;
  
      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
  
      if (response.ok) {
        const { token } = await response.json();
        await chrome.storage.local.set({ userToken: token });
      } else {
        // Token refresh failed, log user out
        await chrome.storage.local.remove(['userToken', 'userProfile']);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  };