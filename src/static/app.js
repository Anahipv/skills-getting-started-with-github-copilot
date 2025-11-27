document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="activity-card-participants">
            <h5>Participants</h5>
            ${
              details.participants.length > 0
                ? `<ul class="participants-list">${details.participants
                    .map(
                      (participant) =>
                        `<li style="list-style:none;display:flex;align-items:center;gap:8px;">${participant} <span class="delete-participant" title="Remove" data-activity="${name}" data-email="${participant}" style="cursor:pointer;color:#c00;font-size:18px;">&#128465;</span></li>`
                    )
                    .join("")}</ul>`
                : `<p style="color:#888;">No participants yet.</p>`
            }
          </div>
        `;
        // Solo agregar el event listener una vez, fuera del forEach y del template
        if (!activitiesList._deleteListenerAdded) {
          activitiesList.addEventListener("click", async (e) => {
            if (e.target.classList.contains("delete-participant")) {
              const activity = e.target.getAttribute("data-activity");
              const email = e.target.getAttribute("data-email");
              if (confirm(`¿Eliminar a ${email} de ${activity}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(activity)}/remove?email=${encodeURIComponent(email)}`, {
                    method: "POST"
                  });
                  const result = await response.json();
                  if (response.ok) {
                    messageDiv.textContent = result.message;
                    messageDiv.className = "success";
                    fetchActivities();
                  } else {
                    messageDiv.textContent = result.detail || "Error removing participant";
                    messageDiv.className = "error";
                  }
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => {
                    messageDiv.classList.add("hidden");
                  }, 4000);
                } catch (err) {
                  messageDiv.textContent = "Error removing participant.";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
              }
            }
          });
          activitiesList._deleteListenerAdded = true;
        }
        // Clear loading message and dropdown
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

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
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
              // Actualizar la lista de actividades para reflejar el nuevo participante
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || "Error signing up";
              messageDiv.className = "error";
            }
            messageDiv.classList.remove("hidden");
            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 4000);
          } catch (error) {
            messageDiv.textContent = "Error signing up.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
          }
        });

  // Initial fetch of activities
  fetchActivities();
});
