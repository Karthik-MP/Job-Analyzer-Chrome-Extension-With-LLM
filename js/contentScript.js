chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getJobDescription') {
      // Customize this based on the job board website
      const jobDescription = document.body.innerText;
      sendResponse({ jobDescription });
    }
  });

// Check if the user is authenticated on page load
chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
  if (response.status === "authenticated") {
    console.log("User is authenticated with:", response.credentials);
  } else {
    console.log("User is not authenticated.");
  }
});

// content.js

window.addEventListener('load', function () {
  // Check if we are on a LinkedIn job page
  if (window.location.href.includes("/jobs/")) {
      
      // Wait for the specific div (like job details or description section) to load
      const interval = setInterval(() => {
          const jobDescriptionDiv = document.querySelector('.jobs-s-apply'); // Find a specific div class or selector
          if (jobDescriptionDiv) {
              clearInterval(interval);
              
              // Create a new button element
              const button = document.createElement('button');
              button.innerText = 'Analyze';
              button.style.paddingRight='2rem';
              button.style.paddingLeft='2rem';
              button.style.margin='2%';
              button.style.cursor='pointer';
              button.style.backgroundColor='#9c27b0';
              button.style.borderRadius='45%';
              button.style.borderColor= '#9c27b0';
              button.style.color='white';
              button.style.fontWeight='500';
              button.style.fontSize='0.875em';
              button.style.fontFamily='var(--artdeco-reset-typography-font-family-sans)';
              button.style.boxShadow='#9c27b0';
              
              // Add button click action
              button.addEventListener('click', function () {
                  alert('Button clicked!');
              });

              // Append the button to the job description div or any other specific div
              jobDescriptionDiv.appendChild(button);
          }
      }, 1000); // Check every second for the div
  }
});
