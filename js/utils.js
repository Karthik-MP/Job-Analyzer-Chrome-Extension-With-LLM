const API_URL = 'http://localhost:3000/api';

const showToast = (message, type = 'success') => {
  const toast = document.getElementById('toast');
  const toastMessage = toast.querySelector('div div');
  
  toast.querySelector('.flex').className = `flex items-center p-4 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`;
  
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
};

const setLoading = (button, isLoading) => {
    if (isLoading) {
      button.disabled = true;
      button.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Loading...
      `;
    } else {
      button.disabled = false;
      button.textContent = button.getAttribute('data-original-text');
    }
}