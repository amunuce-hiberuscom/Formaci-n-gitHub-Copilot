document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const activityDefaultOption = activitySelect.innerHTML;

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        const result = await response.json();
        showMessage(result.message, "success");
        await fetchActivities();
      } else {
        const result = await response.json();
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister participant. Please try again.", "error");
      console.error("Error unregistering participant:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = activityDefaultOption;

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantItems = details.participants.length > 0
          ? details.participants.map(p => `
            <li class="participant-row">
              <span class="participant-email">${p}</span>
              <button
                type="button"
                class="delete-participant"
                data-activity="${name}"
                data-email="${p}"
                title="Unregister participant"
                aria-label="Unregister ${p}"
              >
                &#x1F5D1;
              </button>
            </li>
          `).join("")
          : "<li class='no-participants'>No participants yet</li>";

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <details class="participants-section">
            <summary><strong>Participants</strong> <span class="participant-count">${details.participants.length} / ${details.max_participants}</span></summary>
            <ul class="participants-list">${participantItems}</ul>
          </details>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        await fetchActivities();
        signupForm.reset();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-participant");
    if (!deleteButton) {
      return;
    }

    const activityName = deleteButton.dataset.activity;
    const email = deleteButton.dataset.email;

    if (!activityName || !email) {
      return;
    }

    unregisterParticipant(activityName, email);
  });

  // Initialize app
  fetchActivities();
});
