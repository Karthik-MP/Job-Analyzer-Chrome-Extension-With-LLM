document.addEventListener("DOMContentLoaded", () => {
  // Check authentication status as soon as the popup is opened
  chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
    if (response.isAuthenticated) {
      window.location.href = "analysis.html";
      // statusElement.textContent = "Authenticated!";
      // Optionally, show user profile info
      // document.getElementById('userProfile').textContent = response.userProfile.name || 'No profile data';
    } else {
      console.log("Not authenticated.");
      // statusElement.textContent = "Not authenticated.";
    }
  });

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const showSignup = document.getElementById("showSignup");
  const showLogin = document.getElementById("showLogin");

  // Toggle between login and signup forms
  showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hide");
    signupForm.classList.remove("hide");
  });

  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    signupForm.classList.add("hide");
    loginForm.classList.remove("hide");
  });

  // Handle login
  document.getElementById("loginBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        chrome.storage.local.set(
          {
            userToken: data.token,
            userProfile: {
              email: data?.email,
              education: data?.education,
              visaStatus: data?.visaStatus,
              degree: data?.degree,
              major: data?.major,
              country: data?.country
            },
          },
          function () {
            window.location.href = 'analysis.html';
          }
        );
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  });

  // Validation function
  function validateForm(userData) {
    // Check if any field is empty
    for (let key in userData) {
      if (!userData[key]) {
        alert(`Please fill in the ${key} field.`);
        return false;
      }
    }
    return true
  }
  // Handle signup
  document.getElementById("signupBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    const userData = {
      email: document.getElementById("signupEmail").value,
      password: document.getElementById("signupPassword").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      country: document.getElementById("country").value,
      visaStatus: document.getElementById("visaStatus").value,
      university: document.getElementById("university").value,
      degree: document.getElementById("degree").value,
      major: document.getElementById("major").value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
    };
    setTimeout(()=>{},10000000);

    if (validateForm(userData)) {
      try {
        const response = await fetch("http://localhost:3000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
  
        const data = await response.json();
        if (response.ok) {
          alert("Signup successful! Please login.");
          signupForm.classList.add("hide");
          loginForm.classList.remove("hide");
        } else {
          alert(data.message || "Signup failed");
        }
      } catch (error) {
        alert("Error connecting to server");
      }
    } else {
      console.log("Form validation failed.");
    }
  });
});
