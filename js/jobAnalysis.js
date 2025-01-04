document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('resultsContainer');
    let currentJobData = null;
  
    // Initialize match score chart
    const initMatchChart = (score) => {
      const ctx = document.getElementById('matchChart').getContext('2d');
      return new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [score, 100 - score],
            backgroundColor: ['#2563EB', '#E5E7EB']
          }],
          labels: ['Match', 'Gap']
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    };
  
    // Create skill match indicator
    const createSkillIndicator = (skill, match) => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between';
      div.innerHTML = `
        <span class="text-gray-700">${skill}</span>
        <span class="px-2 py-1 rounded ${
          match ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }">${match ? 'Match' : 'Gap'}</span>
      `;
      return div;
    };
  
    // Get job description from current page
    const getJobDescription = async () => {
      // Query the active tab in the current window
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const url = window.location.href;
    
          // Check if the page is from linkedin.com
          if (url.includes('linkedin.com')) {
            let jobDetails = {
              title: '',
              description: '',
              location: ''
            };
    
            // Extract the job title using the provided class
            const jobTitleElement = document.querySelector('.job-details-jobs-unified-top-card__job-title');
            if (jobTitleElement) {
              jobDetails.title = jobTitleElement.innerText.trim();
            }
    
            // Extract the job description using the provided class
            const jobDescriptionElement = document.querySelector('.jobs-description-content');
            if (jobDescriptionElement) {
              jobDetails.description = jobDescriptionElement.innerText.trim();
            }
    
            // Extract the job location using the provided class
            const jobLocationElement = document.querySelector('.job-details-jobs-unified-top-card__primary-description-container');
            if (jobLocationElement) {
              jobDetails.location = jobLocationElement.innerText.trim();
            }
    
            return jobDetails;
          } else {
            return { message: 'Not a LinkedIn job page.' };
          }
        }
      });
    
      return result[0].result; // Return the job details (title, description, location)
    };
    
  
    // Analyze job description
    const analyzeJob = async (jobDescription) => {
      try {
        const token = await new Promise((resolve) => {
          chrome.storage.local.get('userToken', (result) => {
            resolve(result.userToken);
          });
        });
  
        const response = await fetch('http://localhost:3000/api/analyze/job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ jobDescription })
        });
  
        return await response.json();
      } catch (error) {
        console.error('Error analyzing job:', error);
        throw error;
      }
    };
  
    // Handle analyze button click
    analyzeBtn.addEventListener('click', async () => {
      try {
        analyzeBtn.disabled = true;
        loadingState.classList.remove('hide');
        resultsContainer.classList.add('hide');
  
        const jobDescription = await getJobDescription();
        const analysis = await analyzeJob(jobDescription);
        currentJobData = analysis;
        console.log(analysis)
        // Update UI with analysis results
        document.getElementById('jobTitle').textContent = analysis?.jobDetails?.title;
        document.getElementById('company').textContent = analysis?.jobDetails?.company;
        document.getElementById('location').textContent = analysis?.jobDetails?.location;
        document.getElementById('salary').textContent = analysis?.jobDetails?.salary || 'Salary not specified';
  
        // Update match score
        // document.querySelector('#matchScoreContainer .text-3xl').textContent = 
        //   `${analysis.matchScore}%`;
        // initMatchChart(analysis.matchScore);
  
        // // Update skills
        // const skillsMatch = document.getElementById('skillsMatch');
        // skillsMatch.innerHTML = '';
        // analysis.skills.forEach(skill => {
        //   skillsMatch.appendChild(createSkillIndicator(skill.name, skill.match));
        // });
  
        // Update requirements
        // document.getElementById('visaRequirement').innerHTML = `
        //   <span class="text-gray-700">Visa Requirement:</span>
        //   <span class="px-2 py-1 rounded ${
        //     analysis.visaMatch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        //   }">${analysis.visaStatus}</span>
        // `;
  
        loadingState.classList.add('hide');
        resultsContainer.classList.remove('hide');
      } catch (error) {
        console.log(error)
        alert('Error analyzing job description. Please try again.');
      } finally {
        analyzeBtn.disabled = false;
      }
    });
  
    // Handle save job button
    document.getElementById('saveJobBtn').addEventListener('click', async () => {
      if (!currentJobData) return;
  
      try {
        const token = await new Promise((resolve) => {
          chrome.storage.local.get('userToken', (result) => {
            resolve(result.userToken);
          });
        });
  
        await fetch('http://localhost:3000/api/save-job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(currentJobData)
        });
  
        alert('Job saved successfully!');
      } catch (error) {
        alert('Error saving job. Please try again.');
      }
    });
  
    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      chrome.storage.local.remove('userToken', () => {
        window.location.href = 'popup.html';
      });
    });
  
    // Handle export
    document.getElementById('exportBtn').addEventListener('click', () => {
      if (!currentJobData) return;
      
      const report = generateReport(currentJobData);
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'job-analysis-report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
  