/* =========================================================
   SMART GARBAGE MANAGEMENT SYSTEM
   Frontend-only version
   No Node.js / npm / database required
   ========================================================= */


/* ================= STORAGE ================= */

let users = JSON.parse(localStorage.getItem("smartUsers")) || [];

let complaints =
  JSON.parse(localStorage.getItem("smartComplaints")) || [];

let currentUser =
  JSON.parse(localStorage.getItem("smartCurrentUser")) || null;


/* ================= DEMO STAFF ================= */

const STAFF_EMAIL = "staff@smartclean.com";
const STAFF_PASSWORD = "staff123";


/* ================= SMART BINS ================= */

const bins = [
  {
    id: "B001",
    name: "Main Road",
    location: "Main Road",
    fill: 65
  },
  {
    id: "B002",
    name: "Bus Stand",
    location: "Central Bus Stand",
    fill: 92
  },
  {
    id: "B003",
    name: "Market Area",
    location: "Market Road",
    fill: 40
  },
  {
    id: "B004",
    name: "Government Hospital",
    location: "Hospital Road",
    fill: 78
  },
  {
    id: "B005",
    name: "Railway Station",
    location: "Railway Station Road",
    fill: 94
  },
  {
    id: "B006",
    name: "School Area",
    location: "Government School Road",
    fill: 55
  }
];


/* ================= PAGE NAVIGATION ================= */

function showPage(pageId) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.remove("hidden");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  /* Protected pages */

  if (pageId === "complaint" && !currentUser) {
    alert("Please login first.");
    showPage("login");
    return;
  }

  if (pageId === "myComplaints" && !currentUser) {
    alert("Please login first.");
    showPage("login");
    return;
  }

  if (pageId === "dashboard") {

    if (!currentUser || currentUser.role !== "staff") {
      alert("Staff login required.");
      showPage("login");
      return;
    }

    renderDashboard();
  }
}


/* ================= REGISTER ================= */

function register() {

  const name =
    document.getElementById("registerName").value.trim();

  const email =
    document.getElementById("registerEmail").value.trim();

  const password =
    document.getElementById("registerPassword").value;


  if (!name || !email || !password) {
    alert("Please fill all fields.");
    return;
  }


  if (password.length < 4) {
    alert("Password must contain at least 4 characters.");
    return;
  }


  const exists =
    users.some(
      user => user.email.toLowerCase() === email.toLowerCase()
    );


  if (exists) {
    alert("An account with this email already exists.");
    return;
  }


  const user = {
    id: Date.now(),
    name,
    email,
    password,
    role: "citizen"
  };


  users.push(user);

  localStorage.setItem(
    "smartUsers",
    JSON.stringify(users)
  );


  alert("Registration successful! Please login.");

  document.getElementById("registerName").value = "";
  document.getElementById("registerEmail").value = "";
  document.getElementById("registerPassword").value = "";

  showPage("login");
}


/* ================= LOGIN ================= */

function login() {

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;


  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }


  /* Staff */

  if (
    email.toLowerCase() === STAFF_EMAIL &&
    password === STAFF_PASSWORD
  ) {

    currentUser = {
      name: "Municipal Staff",
      email: STAFF_EMAIL,
      role: "staff"
    };

    localStorage.setItem(
      "smartCurrentUser",
      JSON.stringify(currentUser)
    );

    updateNavigation();

    alert("Staff login successful!");

    showPage("dashboard");

    return;
  }


  /* Citizen */

  const user = users.find(
    user =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
  );


  if (!user) {
    alert("Invalid email or password.");
    return;
  }


  currentUser = user;

  localStorage.setItem(
    "smartCurrentUser",
    JSON.stringify(currentUser)
  );


  updateNavigation();

  alert("Login successful!");

  showPage("complaint");
}


/* ================= LOGOUT ================= */

function logout() {

  currentUser = null;

  localStorage.removeItem("smartCurrentUser");

  updateNavigation();

  alert("You have been logged out.");

  showPage("home");
}


/* ================= NAVIGATION UPDATE ================= */

function updateNavigation() {

  const loginNav =
    document.getElementById("loginNav");

  const logoutNav =
    document.getElementById("logoutNav");


  if (currentUser) {

    loginNav.classList.add("hidden");
    logoutNav.classList.remove("hidden");


    /* Add dashboard links */

    if (
      currentUser.role === "staff" &&
      !document.getElementById("dashboardNav")
    ) {

      const button =
        document.createElement("button");

      button.id = "dashboardNav";
      button.textContent = "Dashboard";

      button.onclick = () =>
        showPage("dashboard");

      loginNav.parentElement.insertBefore(
        button,
        logoutNav
      );
    }


    if (
      currentUser.role === "citizen" &&
      !document.getElementById("myComplaintsNav")
    ) {

      const button =
        document.createElement("button");

      button.id = "myComplaintsNav";
      button.textContent = "My Complaints";

      button.onclick = () => {
        renderMyComplaints();
        showPage("myComplaints");
      };

      loginNav.parentElement.insertBefore(
        button,
        logoutNav
      );
    }

  } else {

    loginNav.classList.remove("hidden");
    logoutNav.classList.add("hidden");

    const dashboardNav =
      document.getElementById("dashboardNav");

    const myComplaintsNav =
      document.getElementById("myComplaintsNav");


    if (dashboardNav) {
      dashboardNav.remove();
    }

    if (myComplaintsNav) {
      myComplaintsNav.remove();
    }
  }
}


/* ================= LOCATION ================= */

function getLocation() {

  if (!navigator.geolocation) {
    alert("Location services are not supported by this browser.");
    return;
  }


  navigator.geolocation.getCurrentPosition(

    position => {

      const latitude =
        position.coords.latitude.toFixed(6);

      const longitude =
        position.coords.longitude.toFixed(6);


      document.getElementById("complaintLocation").value =
        `Latitude: ${latitude}, Longitude: ${longitude}`;


      alert("Your location has been added.");
    },

    () => {
      alert(
        "Unable to get your location. Please enter it manually."
      );
    }
  );
}


/* ================= SUBMIT COMPLAINT ================= */

function submitComplaint() {

  if (!currentUser) {
    alert("Please login first.");
    showPage("login");
    return;
  }


  const title =
    document.getElementById("complaintTitle").value.trim();

  const description =
    document.getElementById("complaintDescription").value.trim();

  const location =
    document.getElementById("complaintLocation").value.trim();

  const photoInput =
    document.getElementById("complaintPhoto");


  if (!title || !description || !location) {
    alert("Please complete the complaint form.");
    return;
  }


  let photoName = "";

  if (photoInput.files.length > 0) {
    photoName = photoInput.files[0].name;
  }


  const complaint = {

    id: Date.now(),

    userId: currentUser.id,

    citizenName: currentUser.name,

    citizenEmail: currentUser.email,

    title,

    description,

    location,

    photo: photoName,

    status: "Pending",

    truck: "Not Assigned",

    createdAt: new Date().toLocaleString()

  };


  complaints.unshift(complaint);


  localStorage.setItem(
    "smartComplaints",
    JSON.stringify(complaints)
  );


  alert(
    "Complaint submitted successfully!\nComplaint ID: " +
    complaint.id
  );


  document.getElementById("complaintTitle").value = "";
  document.getElementById("complaintDescription").value = "";
  document.getElementById("complaintLocation").value = "";
  document.getElementById("complaintPhoto").value = "";


  updateHomeStats();
}


/* ================= MY COMPLAINTS ================= */

function renderMyComplaints() {

  const container =
    document.getElementById("complaintsList");


  if (!currentUser) {
    container.innerHTML =
      "<p>Please login to view your complaints.</p>";
    return;
  }


  const mine =
    complaints.filter(
      complaint => complaint.userId === currentUser.id
    );


  if (mine.length === 0) {

    container.innerHTML = `
      <div class="form-card">
        <h3>No complaints yet</h3>
        <p>You haven't submitted any garbage complaints.</p>
        <br>
        <button
          class="primary-btn"
          onclick="showPage('complaint')"
        >
          Report Garbage
        </button>
      </div>
    `;

    return;
  }


  container.innerHTML =
    mine.map(complaint => `

      <div class="complaint-card">

        <div class="complaint-header">

          <div>
            <h3>${escapeHTML(complaint.title)}</h3>

            <p>
              <strong>Complaint ID:</strong>
              ${complaint.id}
            </p>
          </div>

          <span class="complaint-status">
            ${escapeHTML(complaint.status)}
          </span>

        </div>

        <p>
          ${escapeHTML(complaint.description)}
        </p>

        <p>
          📍 ${escapeHTML(complaint.location)}
        </p>

        <p>
          🚛 Truck:
          ${escapeHTML(complaint.truck)}
        </p>

        <p>
          📅 ${escapeHTML(complaint.createdAt)}
        </p>

        ${
          complaint.photo
            ? `<p>📷 Photo: ${escapeHTML(complaint.photo)}</p>`
            : ""
        }

      </div>

    `).join("");
}


/* ================= SMART BINS ================= */

function renderBins() {

  const container =
    document.getElementById("binsGrid");


  container.innerHTML =
    bins.map(bin => {

      const alert = bin.fill >= 90;

      return `

        <div class="bin-card ${alert ? "alert" : ""}">

          <div class="bin-header">

            <div>
              <div class="bin-name">
                🗑️ ${bin.id}
              </div>

              <div class="bin-location">
                📍 ${bin.location}
              </div>
            </div>

            <strong>
              ${bin.fill}%
            </strong>

          </div>


          <div class="fill-bar">

            <div
              class="fill-level ${alert ? "danger" : ""}"
              style="width:${bin.fill}%"
            ></div>

          </div>


          ${
            alert
              ? `<div class="alert-text">
                  🚨 COLLECTION REQUIRED
                 </div>`
              : `<p>
                  Bin operating normally.
                 </p>`
          }

        </div>

      `;

    }).join("");


  updateHomeStats();
}


/* ================= DASHBOARD ================= */

function renderDashboard() {

  const total =
    complaints.length;

  const pending =
    complaints.filter(
      complaint =>
        complaint.status !== "Resolved"
    ).length;

  const resolved =
    complaints.filter(
      complaint =>
        complaint.status === "Resolved"
    ).length;

  const alerts =
    bins.filter(
      bin => bin.fill >= 90
    ).length;


  document.getElementById("dashComplaints")
    .textContent = total;

  document.getElementById("dashPending")
    .textContent = pending;

  document.getElementById("dashResolved")
    .textContent = resolved;

  document.getElementById("dashAlerts")
    .textContent = alerts;


  renderStaffComplaints();
  renderStaffBins();
}


/* ================= STAFF COMPLAINTS ================= */

function renderStaffComplaints() {

  const container =
    document.getElementById("staffComplaints");


  if (complaints.length === 0) {

    container.innerHTML =
      "<p>No citizen complaints available.</p>";

    return;
  }


  container.innerHTML =
    complaints.map(complaint => `

      <div class="complaint-card">

        <div class="complaint-header">

          <div>

            <h3>
              ${escapeHTML(complaint.title)}
            </h3>

            <p>
              👤 ${escapeHTML(complaint.citizenName)}
            </p>

          </div>

          <span class="complaint-status">
            ${escapeHTML(complaint.status)}
          </span>

        </div>


        <p>
          ${escapeHTML(complaint.description)}
        </p>

        <p>
          📍 ${escapeHTML(complaint.location)}
        </p>


        <div class="form-group">

          <label>Update Status</label>

          <select
            onchange="updateComplaintStatus(${complaint.id}, this.value)"
          >

            <option
              ${complaint.status === "Pending" ? "selected" : ""}
            >
              Pending
            </option>

            <option
              ${complaint.status === "Assigned" ? "selected" : ""}
            >
              Assigned
            </option>

            <option
              ${complaint.status === "In Progress" ? "selected" : ""}
            >
              In Progress
            </option>

            <option
              ${complaint.status === "Resolved" ? "selected" : ""}
            >
              Resolved
            </option>

          </select>

        </div>


        <div class="form-group">

          <label>Assign Truck</label>

          <select
            onchange="assignTruck(${complaint.id}, this.value)"
          >

            <option value="Not Assigned">
              Not Assigned
            </option>

            <option
              ${complaint.truck === "T001" ? "selected" : ""}
            >
              T001
            </option>

            <option
              ${complaint.truck === "T002" ? "selected" : ""}
            >
              T002
            </option>

            <option
              ${complaint.truck === "T003" ? "selected" : ""}
            >
              T003
            </option>

          </select>

        </div>

      </div>

    `).join("");
}


/* ================= UPDATE STATUS ================= */

function updateComplaintStatus(id, status) {

  const complaint =
    complaints.find(
      complaint => complaint.id === id
    );


  if (!complaint) {
    return;
  }


  complaint.status = status;


  localStorage.setItem(
    "smartComplaints",
    JSON.stringify(complaints)
  );


  renderDashboard();

  alert("Complaint status updated.");
}


/* ================= ASSIGN TRUCK ================= */

function assignTruck(id, truck) {

  const complaint =
    complaints.find(
      complaint => complaint.id === id
    );


  if (!complaint) {
    return;
  }


  complaint.truck = truck;


  if (
    truck !== "Not Assigned" &&
    complaint.status === "Pending"
  ) {
    complaint.status = "Assigned";
  }


  localStorage.setItem(
    "smartComplaints",
    JSON.stringify(complaints)
  );


  renderDashboard();

  alert(
    truck === "Not Assigned"
      ? "Truck assignment removed."
      : `${truck} assigned successfully.`
  );
}


/* ================= STAFF BIN ALERTS ================= */

function renderStaffBins() {

  const container =
    document.getElementById("staffBins");


  container.innerHTML =
    bins.map(bin => {

      const alert =
        bin.fill >= 90;


      return `

        <div class="complaint-card">

          <div class="complaint-header">

            <div>

              <h3>
                🗑️ ${bin.id} - ${bin.name}
              </h3>

              <p>
                📍 ${bin.location}
              </p>

            </div>

            <strong>
              ${bin.fill}%
            </strong>

          </div>


          <div class="fill-bar">

            <div
              class="fill-level ${alert ? "danger" : ""}"
              style="width:${bin.fill}%"
            ></div>

          </div>


          ${
            alert
              ? `<p class="alert-text">
                   🚨 Collection required
                 </p>`
              : `<p>
                   ✅ Normal
                 </p>`
          }

        </div>

      `;

    }).join("");
}


/* ================= TRUCK ================= */

function trackTruck(truckId) {

  const trucks = {

    T001: {
      location: "Main Road",
      latitude: "10.7905",
      longitude: "78.7047"
    },

    T002: {
      location: "Bus Stand",
      latitude: "10.7867",
      longitude: "78.7041"
    },

    T003: {
      location: "Market Area",
      latitude: "10.7921",
      longitude: "78.6999"
    }

  };


  const truck =
    trucks[truckId];


  if (!truck) {
    return;
  }


  const mapURL =
    `https://www.google.com/maps/search/?api=1&query=${truck.latitude},${truck.longitude}`;


  const openMap =
    confirm(
      `${truckId}\n\n` +
      `Location: ${truck.location}\n` +
      `Latitude: ${truck.latitude}\n` +
      `Longitude: ${truck.longitude}\n\n` +
      `Open location in Google Maps?`
    );


  if (openMap) {
    window.open(mapURL, "_blank");
  }
}


/* ================= HOME STATS ================= */

function updateHomeStats() {

  const complaintElement =
    document.getElementById("homeComplaints");

  const alertElement =
    document.getElementById("homeAlerts");


  if (complaintElement) {
    complaintElement.textContent =
      complaints.length;
  }


  if (alertElement) {
    alertElement.textContent =
      bins.filter(bin => bin.fill >= 90).length;
  }
}


/* ================= SECURITY HELPER ================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ================= INITIALIZATION ================= */

document.addEventListener("DOMContentLoaded", () => {

  updateNavigation();

  renderBins();

  updateHomeStats();

});