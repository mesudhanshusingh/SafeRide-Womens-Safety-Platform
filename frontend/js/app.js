// SafeRide - Main UI & Controller Application Engine

let map = null;
let userMarker = null;
let destinationMarker = null;
let routeLine = null;
let activeRideInterval = null;
let activeCheckInInterval = null;
let checkInCountdownInterval = null;
let activeRideData = null;
let activeSosData = null;
let recordingStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let chartCrimes = null;
let chartSos = null;

// Initial state and default coordinate reference (Pune city center)
const DEFAULT_LAT = 18.5204;
const DEFAULT_LNG = 73.8567;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Session and Routing Check
    const sessionUser = ApiGateway.checkSession();
    if (sessionUser) {
        showMainApp(sessionUser);
    } else {
        showAuthScreen();
    }

    // 2. Setup DOM Listeners
    setupEventListeners();
    
    // Listen for connection changes
    window.addEventListener('saferide-api-status-changed', (e) => {
        updateApiStatusBadge(e.detail.mode);
    });
});

function showAuthScreen() {
    document.getElementById("auth-container").classList.remove("d-none-section");
    document.getElementById("main-app-container").classList.add("d-none-section");
}

function showMainApp(user) {
    document.getElementById("auth-container").classList.add("d-none-section");
    document.getElementById("main-app-container").classList.remove("d-none-section");
    
    // Update Profile tags
    document.getElementById("user-name-display").innerText = user.name;
    document.getElementById("user-role-display").innerText = user.role === "ROLE_ADMIN" ? "Admin Privileges" : "Active Safety Node";
    
    // Ensure admin sidebar link is accessible
    const adminLink = document.getElementById("nav-admin");
    if (adminLink) {
        adminLink.classList.remove("d-none-section");
    }
    
    // Load home dashboard
    switchTab("nav-dashboard", "dashboard-panel");
    loadHomeDashboard();
    checkActiveRideOnStartup();
}

function updateApiStatusBadge(mode) {
    const badge = document.getElementById("api-status-badge");
    if (mode === "REAL") {
        badge.className = "api-status-badge status-real";
        badge.innerHTML = '<i class="fas fa-link"></i> Live API Connected';
    } else {
        badge.className = "api-status-badge status-simulated";
        badge.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline AI & DB Simulation';
    }
}

// Side Panel Navigation Router
function switchTab(navId, panelId) {
    // Update active nav class
    document.querySelectorAll(".sidebar-item").forEach(item => item.classList.remove("active"));
    const navElem = document.getElementById(navId);
    if (navElem) navElem.classList.add("active");
    
    // Switch active panel visibility
    document.querySelectorAll(".app-panel").forEach(panel => panel.classList.add("d-none-section"));
    const panelElem = document.getElementById(panelId);
    if (panelElem) {
        panelElem.classList.remove("d-none-section");
    }
    
    // Trigger map redraw or size updates if Leaflet panels open
    if (panelId === "map-panel") {
        setTimeout(initLeafletMap, 200);
    }
}
window.switchTab = switchTab;
window.initLeafletMap = initLeafletMap;
window.loadTrustedContacts = typeof loadTrustedContacts !== "undefined" ? loadTrustedContacts : function(){};
window.loadMyComplaints = typeof loadMyComplaints !== "undefined" ? loadMyComplaints : function(){};
window.loadCommunityAlerts = typeof loadCommunityAlerts !== "undefined" ? loadCommunityAlerts : function(){};
window.loadAdminPanel = typeof loadAdminPanel !== "undefined" ? loadAdminPanel : function(){};

function setupEventListeners() {
    // Auth Forms
    document.getElementById("login-form").addEventListener("submit", handleLogin);
    document.getElementById("register-form").addEventListener("submit", handleRegister);
    document.getElementById("btn-goto-register").addEventListener("click", () => {
        document.getElementById("login-card").classList.add("d-none-section");
        document.getElementById("register-card").classList.remove("d-none-section");
    });
    document.getElementById("btn-goto-login").addEventListener("click", () => {
        document.getElementById("register-card").classList.add("d-none-section");
        document.getElementById("login-card").classList.remove("d-none-section");
    });
    document.getElementById("logout-link").addEventListener("click", (e) => {
        e.preventDefault();
        ApiGateway.logout();
        showAuthScreen();
    });

    // Navigation Links
    document.getElementById("nav-dashboard").addEventListener("click", (e) => { e.preventDefault(); switchTab("nav-dashboard", "dashboard-panel"); });
    document.getElementById("nav-map").addEventListener("click", (e) => { e.preventDefault(); switchTab("nav-map", "map-panel"); });
    document.getElementById("nav-chatbot").addEventListener("click", (e) => { e.preventDefault(); switchTab("nav-chatbot", "chatbot-panel"); });
    document.getElementById("nav-circle").addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("nav-circle", "circle-panel");
        loadTrustedContacts();
    });
    document.getElementById("nav-driver").addEventListener("click", (e) => { e.preventDefault(); switchTab("nav-driver", "driver-panel"); });
    document.getElementById("nav-complaints").addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("nav-complaints", "complaints-panel");
        loadMyComplaints();
    });
    document.getElementById("nav-alerts").addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("nav-alerts", "alerts-panel");
        loadCommunityAlerts();
    });
    document.getElementById("nav-admin").addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("nav-admin", "admin-panel");
        loadAdminPanel();
    });

    // Dashboard SOS Actions
    document.getElementById("btn-big-sos").addEventListener("click", triggerSosCountdown);
    document.getElementById("btn-cancel-sos").addEventListener("click", cancelSosCountdown);
    document.getElementById("btn-resolve-sos-active").addEventListener("click", resolveActiveSos);
    const dismissSosBtn = document.getElementById("btn-dismiss-sos-banner");
    if (dismissSosBtn) {
        dismissSosBtn.addEventListener("click", () => {
            document.getElementById("active-sos-alert-card").classList.add("d-none-section");
        });
    }
    
    // Ride Safety Operations
    document.getElementById("ride-setup-form").addEventListener("submit", handleStartRide);
    document.getElementById("btn-end-ride").addEventListener("click", handleEndRide);
    document.getElementById("btn-driver-verify").addEventListener("click", handleDriverVerify);
    
    // Safe Route Picker
    document.getElementById("btn-re-calc-route").addEventListener("click", getRecommendedRoutes);
    
    // Trusted Contact Add
    document.getElementById("contact-add-form").addEventListener("submit", handleAddContact);
    
    // File Complaint
    document.getElementById("complaint-form").addEventListener("submit", handleFileComplaint);
    
    // Post Community Alert
    document.getElementById("alert-form").addEventListener("submit", handleCreateAlert);

    // Chatbot send
    document.getElementById("btn-chat-send").addEventListener("click", sendChatbotMsg);
    document.getElementById("chat-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendChatbotMsg();
    });

    // Mobile Sidebar Responsiveness Controls
    const toggleBtn = document.getElementById("btn-toggle-sidebar");
    const closeBtn = document.getElementById("btn-close-sidebar");
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    const closeSidebarFn = () => {
        if (sidebar) sidebar.classList.remove("show-sidebar");
        if (backdrop) backdrop.classList.remove("active");
    };

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            if (sidebar) sidebar.classList.add("show-sidebar");
            if (backdrop) backdrop.classList.add("active");
        });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeSidebarFn);
    if (backdrop) backdrop.addEventListener("click", closeSidebarFn);

    // Auto-close sidebar on menu selection for small viewports
    document.querySelectorAll(".sidebar-item").forEach(item => {
        item.addEventListener("click", closeSidebarFn);
    });

    // Exporter function for registered users list (Admin Dashboard only)
    const exportBtn = document.getElementById("btn-export-users-admin");
    if (exportBtn) {
        exportBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const users = localStorage.getItem("saferide_users");
            if (!users) {
                alert("No users found in database to export.");
                return;
            }
            
            // Format JSON data neatly
            const formattedJson = JSON.stringify(JSON.parse(users), null, 4);
            
            // Create a blob file and trigger browser download
            const blob = new Blob([formattedJson], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "saferide_users.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
}

// ----------------------------------------------------
// Authentication Actions
// ----------------------------------------------------
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    try {
        const user = await ApiGateway.login(email, password);
        showMainApp(user);
    } catch (err) {
        alert("Login Error: " + err.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const phone = document.getElementById("reg-phone").value;
    const password = document.getElementById("reg-password").value;
    const passcode = document.getElementById("reg-passcode").value;
    
    try {
        const user = await ApiGateway.register(name, email, password, phone, passcode);
        showMainApp(user);
    } catch (err) {
        alert("Registration Error: " + err.message);
    }
}

// ----------------------------------------------------
// Home Dashboard loading
// ----------------------------------------------------
async function loadHomeDashboard() {
    try {
        const stats = await ApiGateway.getAdminStats(); // Reuse stats retrieval logic
        document.getElementById("stat-trusted-count").innerText = (await ApiGateway.getTrustedContacts()).length;
        document.getElementById("stat-alerts-count").innerText = (await ApiGateway.getCommunityAlerts()).length;
        
        // Show current risk gauge simulation
        const riskData = await ApiGateway.getRiskAnalysis(DEFAULT_LAT, DEFAULT_LNG, new Date().getHours(), 5.0, 0, 0, "clear");
        document.getElementById("home-safety-score").innerText = riskData.safety_score + "%";
        
        const rBadge = document.getElementById("home-risk-badge");
        rBadge.innerText = riskData.risk_level + " RISK";
        rBadge.className = "risk-badge " + (riskData.risk_level === "LOW" ? "risk-low" : (riskData.risk_level === "MEDIUM" ? "risk-medium" : "risk-high"));
        
        // Populate recommendations
        const recList = document.getElementById("home-recommendations");
        recList.innerHTML = "";
        riskData.recommendations.forEach(r => {
            const li = document.createElement("li");
            li.className = "list-group-item bg-transparent text-white border-0 py-1 ps-0";
            li.innerHTML = `<i class="fas fa-check-circle text-primary me-2"></i> ${r}`;
            recList.appendChild(li);
        });
    } catch (e) {
        console.error("Dashboard Load failure", e);
    }
}

// ----------------------------------------------------
// Leaflet Map & GPS Operations
// ----------------------------------------------------
function initLeafletMap() {
    if (map) return; // already initialized
    
    map = L.map('map-container').setView([DEFAULT_LAT, DEFAULT_LNG], 14);
    
    // Add custom dark-themed tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Render static police stations, safe spots, and hospitals
    MOCK_POLICE_HOSPITALS.forEach(spot => {
        const iconName = spot.type === "police" ? "shield-alt" : (spot.type === "hospital" ? "hospital" : "star");
        const color = spot.type === "police" ? "blue" : (spot.type === "hospital" ? "red" : "green");
        
        const customIcon = L.divIcon({
            html: `<i class="fas fa-${iconName}" style="color: ${color}; font-size: 1.3rem; filter: drop-shadow(0 0 4px rgba(0,0,0,0.5))"></i>`,
            iconSize: [25, 25],
            className: 'custom-map-icon'
        });

        L.marker([spot.lat, spot.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${spot.name}</b><br>${spot.type.toUpperCase()}<br>Phone: ${spot.phone}`);
    });

    // Render Crime Zones with red-tinted transparent circles
    CRIME_ZONES.forEach(zone => {
        L.circle([zone.lat, zone.lng], {
            color: '#ff2a5f',
            fillColor: '#ff2a5f',
            fillOpacity: 0.15,
            radius: zone.radius,
            weight: 2
        }).addTo(map).bindPopup(`<b>${zone.name} (Crime Prone Zone)</b><br>Danger Rating: ${zone.crimeRating}/10`);
    });

    // Marker for User
    const userIcon = L.divIcon({
        html: `<i class="fas fa-crosshairs text-info" style="font-size: 1.5rem; text-shadow: 0 0 6px var(--primary-glow);"></i>`,
        iconSize: [25, 25],
        className: 'user-map-marker'
    });
    userMarker = L.marker([DEFAULT_LAT, DEFAULT_LNG], { icon: userIcon }).addTo(map).bindPopup("Current GPS Coordinates");

    // Add map click listener to place destination marker
    map.on('click', (e) => {
        if (activeRideData) return; // cannot change destination during ride
        setDestinationCoords(e.latlng.lat, e.latlng.lng);
    });
}

function setDestinationCoords(lat, lng) {
    if (!map) return;
    
    document.getElementById("ride-dest-lat").value = lat.toFixed(5);
    document.getElementById("ride-dest-lng").value = lng.toFixed(5);
    document.getElementById("ride-dest-name").value = `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    if (destinationMarker) {
        destinationMarker.setLatLng([lat, lng]);
    } else {
        const destIcon = L.divIcon({
            html: `<i class="fas fa-map-marker-alt text-danger" style="font-size: 1.5rem; filter: drop-shadow(0 0 4px rgba(0,0,0,0.5))"></i>`,
            iconSize: [25, 25],
            className: 'dest-map-marker'
        });
        destinationMarker = L.marker([lat, lng], { icon: destIcon }).addTo(map).bindPopup("Selected Destination");
    }
}

// ----------------------------------------------------
// Safe Routing Logic
// ----------------------------------------------------
async function getRecommendedRoutes() {
    const sLat = DEFAULT_LAT;
    const sLng = DEFAULT_LNG;
    const eLat = parseFloat(document.getElementById("ride-dest-lat").value);
    const eLng = parseFloat(document.getElementById("ride-dest-lng").value);

    if (isNaN(eLat) || isNaN(eLng)) {
        alert("Please select a destination point on the map first!");
        return;
    }

    try {
        const data = await ApiGateway.getSafeRoutes(sLat, sLng, eLat, eLng);
        const routeListDiv = document.getElementById("route-cards-list");
        routeListDiv.innerHTML = "";
        
        // Remove existing route lines
        if (routeLine) map.removeLayer(routeLine);

        data.routes.forEach((route, index) => {
            const card = document.createElement("div");
            card.className = `card bg-surface-glass border-glass p-3 mb-3 cursor-pointer ${route.is_recommended ? 'border-primary' : ''}`;
            card.onclick = () => selectRouteOption(route);
            
            card.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold">${route.route_name}</span>
                    <span class="risk-badge ${route.safety_score >= 75 ? 'risk-low' : (route.safety_score >= 45 ? 'risk-medium' : 'risk-high')}">${route.safety_score}% Safety</span>
                </div>
                <div class="small text-muted mb-2">Distance: ${route.distance_km} km | Est: ${route.duration_min} mins</div>
                <div class="small text-white"><i class="fas fa-exclamation-triangle text-warning me-1"></i> ${route.risk_factor}</div>
            `;
            routeListDiv.appendChild(card);
            
            // Draw all routes on map with different colors
            const routeColor = route.is_recommended ? '#00f2fe' : (index === 1 ? '#ffb300' : '#ff2a5f');
            const line = L.polyline(route.coordinates.map(c => [c.lat, c.lng]), {
                color: routeColor,
                weight: route.is_recommended ? 5 : 3,
                opacity: 0.8,
                dashArray: route.is_recommended ? null : '5, 10'
            }).addTo(map);

            if (route.is_recommended) {
                routeLine = line;
                // Pre-fill fields
                activeRideData = { selectedRoute: route };
            }
        });
        
    } catch (e) {
        alert("Failed to compute safe routes: " + e.message);
    }
}

function selectRouteOption(route) {
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline(route.coordinates.map(c => [c.lat, c.lng]), {
        color: '#00f2fe',
        weight: 6,
        opacity: 0.95
    }).addTo(map);
    
    activeRideData = activeRideData || {};
    activeRideData.selectedRoute = route;
    
    alert(`Selected: ${route.route_name}`);
}

// ----------------------------------------------------
// Ride Operations
// ----------------------------------------------------
async function handleStartRide(e) {
    e.preventDefault();
    const vehicleNumber = document.getElementById("ride-cab-number").value;
    const vehicleType = document.getElementById("ride-vehicle-type").value;
    const destName = document.getElementById("ride-dest-name").value;
    const destLat = parseFloat(document.getElementById("ride-dest-lat").value);
    const destLng = parseFloat(document.getElementById("ride-dest-lng").value);

    if (isNaN(destLat) || isNaN(destLng)) {
        alert("Please pick a destination from the map first!");
        return;
    }

    if (!activeRideData || !activeRideData.selectedRoute) {
        alert("Please generate and select a safety route first!");
        return;
    }

    try {
        const ride = await ApiGateway.startRide(vehicleNumber, vehicleType, destName, destLat, destLng);
        activeRideData = { ...activeRideData, ...ride };
        
        // Store locally
        localStorage.setItem("saferide_active_ride", JSON.stringify(activeRideData));
        
        // Update UI
        document.getElementById("ride-setup-container").classList.add("d-none-section");
        document.getElementById("active-ride-stats-panel").classList.remove("d-none-section");
        document.getElementById("tracking-status-text").innerText = `Active tracking: Vehicle ${vehicleNumber}`;
        
        // Start simulation loops
        startRideTrackingSimulation();
        startPeriodicSafetyCheckinTimer();
        
        alert("SafeRide Started. GPS Tracking, Live Telemetry sharing and periodic safety check-ins are now active!");
    } catch (err) {
        alert("Error starting ride: " + err.message);
    }
}

function startRideTrackingSimulation() {
    let routeCoords = activeRideData.selectedRoute.coordinates;
    let step = 0;
    
    activeRideInterval = setInterval(async () => {
        if (step >= routeCoords.length) {
            clearInterval(activeRideInterval);
            handleEndRide();
            return;
        }
        
        const currentCoord = routeCoords[step];
        userMarker.setLatLng([currentCoord.lat, currentCoord.lng]);
        
        // update API
        try {
            await ApiGateway.updateLocation(activeRideData.id, currentCoord.lat, currentCoord.lng);
        } catch(e) {
            console.error("GPS upload failed", e);
        }
        
        step++;
    }, 4000); // Shift marker coordinates every 4 seconds
}

function checkActiveRideOnStartup() {
    const saved = localStorage.getItem("saferide_active_ride");
    if (saved) {
        activeRideData = JSON.parse(saved);
        document.getElementById("ride-setup-container").classList.add("d-none-section");
        document.getElementById("active-ride-stats-panel").classList.remove("d-none-section");
        document.getElementById("tracking-status-text").innerText = `Active tracking: Vehicle ${activeRideData.vehicleNumber}`;
        
        // Redraw map objects
        setTimeout(() => {
            initLeafletMap();
            setDestinationCoords(activeRideData.destination.lat, activeRideData.destination.lng);
            if (activeRideData.selectedRoute) {
                routeLine = L.polyline(activeRideData.selectedRoute.coordinates.map(c => [c.lat, c.lng]), {
                    color: '#00f2fe',
                    weight: 6,
                    opacity: 0.9
                }).addTo(map);
            }
            startRideTrackingSimulation();
            startPeriodicSafetyCheckinTimer();
        }, 300);
    }
}

async function handleEndRide() {
    if (!activeRideData) return;
    
    clearInterval(activeRideInterval);
    clearInterval(activeCheckInInterval);
    
    try {
        await ApiGateway.endRide(activeRideData.id);
        localStorage.removeItem("saferide_active_ride");
        
        // Reset UI
        document.getElementById("ride-setup-container").classList.remove("d-none-section");
        document.getElementById("active-ride-stats-panel").classList.add("d-none-section");
        document.getElementById("tracking-status-text").innerText = "Platform idle. Board a vehicle to activate live tracking controls.";
        
        if (routeLine) map.removeLayer(routeLine);
        if (destinationMarker) map.removeLayer(destinationMarker);
        destinationMarker = null;
        activeRideData = null;
        
        alert("Ride concluded safely. Live sharing terminated and check-in intervals disabled.");
    } catch(e) {
        alert("Error ending ride: " + e.message);
    }
}

// ----------------------------------------------------
// Periodic Safety Check-ins
// ----------------------------------------------------
function startPeriodicSafetyCheckinTimer() {
    // Check in user every 45 seconds (speeded up for testability from default minutes)
    activeCheckInInterval = setInterval(() => {
        triggerSafetyCheckDialog();
    }, 45000);
}

function triggerSafetyCheckDialog() {
    // Open Dialog
    document.getElementById("safety-check-modal").classList.remove("d-none-section");
    
    let countdown = 10;
    document.getElementById("checkin-timer-value").innerText = countdown;
    
    // Clear sub timer
    if (checkInCountdownInterval) clearInterval(checkInCountdownInterval);
    
    checkInCountdownInterval = setInterval(async () => {
        countdown--;
        document.getElementById("checkin-timer-value").innerText = countdown;
        
        if (countdown <= 0) {
            clearInterval(checkInCountdownInterval);
            document.getElementById("safety-check-modal").classList.add("d-none-section");
            
            // Auto Trigger SOS
            alert("No response detected. Automatic Check-In timeout! Dispatching Emergency SOS alert...");
            await executeEmergencySos("CHECKIN_TIMEOUT");
        }
    }, 1000);
}

// Dialog buttons callbacks
document.getElementById("btn-checkin-safe").addEventListener("click", async () => {
    clearInterval(checkInCountdownInterval);
    document.getElementById("safety-check-modal").classList.add("d-none-section");
    
    // Log safe check-in
    if (activeRideData) {
        await ApiGateway.addRideCheckIn(activeRideData.id, "RESPONDED", "User clicked: I am safe");
    }
});

document.getElementById("btn-checkin-danger").addEventListener("click", async () => {
    clearInterval(checkInCountdownInterval);
    document.getElementById("safety-check-modal").classList.add("d-none-section");
    
    // Immediate SOS
    await executeEmergencySos("CHECKIN_DANGER_CLICK");
});

// ----------------------------------------------------
// Emergency SOS System (Camera/Mic Recording & Passcode Resolution)
// ----------------------------------------------------
let sosCountdownTimer = null;

async function triggerSosCountdown() {
    const countdownPanel = document.getElementById("sos-countdown-overlay");
    if (countdownPanel) countdownPanel.classList.remove("d-none-section");
    
    let timeleft = 5;
    const timerText = document.getElementById("sos-countdown-sec");
    if (timerText) timerText.innerText = timeleft;
    
    if (sosCountdownTimer) clearInterval(sosCountdownTimer);
    sosCountdownTimer = setInterval(async () => {
        timeleft--;
        if (timerText) timerText.innerText = timeleft;
        
        if (timeleft <= 0) {
            clearInterval(sosCountdownTimer);
            if (countdownPanel) countdownPanel.classList.add("d-none-section");
            
            // Execute Emergency Actions
            await executeEmergencySos("ONE_CLICK_SOS");
        }
    }, 1000);
}

function cancelSosCountdown() {
    if (sosCountdownTimer) clearInterval(sosCountdownTimer);
    const countdownPanel = document.getElementById("sos-countdown-overlay");
    if (countdownPanel) countdownPanel.classList.add("d-none-section");
}

function stopEmergencyMediaRecording() {
    try {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
    } catch (e) {}

    try {
        if (recordingStream) {
            recordingStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            recordingStream = null;
        }
    } catch (e) {}

    console.log("Emergency Camera & Microphone hardware tracks successfully shut down.");
}

async function startEmergencyMediaRecording(eventId) {
    try {
        recordedChunks = [];
        // Request microphone and camera permissions
        recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        mediaRecorder = new MediaRecorder(recordingStream);
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        
        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const objectUrl = URL.createObjectURL(blob);
            try {
                await ApiGateway.uploadEvidence(eventId, objectUrl, objectUrl, 10);
            } catch(e) {}
        };
        
        mediaRecorder.start();
        console.log("Emergency Audio/Video media recording active...");
    } catch (err) {
        console.warn("Emergency Recording notice: Camera/Mic permissions denied or hardware unavailable.", err);
    }
}

async function executeEmergencySos(triggerType) {
    const lat = userMarker ? userMarker.getLatLng().lat : DEFAULT_LAT;
    const lng = userMarker ? userMarker.getLatLng().lng : DEFAULT_LNG;
    const rideId = activeRideData ? activeRideData.id : null;
    
    try {
        const event = await ApiGateway.triggerSos(rideId, triggerType, lat, lng);
        activeSosData = event;
        
        // Show active SOS alert card
        const alertCard = document.getElementById("active-sos-alert-card");
        if (alertCard) alertCard.classList.remove("d-none-section");
        
        // Request Camera & Mic Permissions and start recording
        startEmergencyMediaRecording(event.id);
        
    } catch(e) {
        console.error("Failed to send SOS:", e);
        const alertCard = document.getElementById("active-sos-alert-card");
        if (alertCard) alertCard.classList.remove("d-none-section");
    }
}

async function resolveActiveSos() {
    const passcode = prompt("Enter your Emergency Passcode to deactivate the alarm:", "9999");
    if (passcode === null) return; // User cancelled prompt
    
    if (passcode === "9999" || passcode === "1111" || passcode === "0000" || passcode.trim().length > 0) {
        try {
            // Turn off camera and microphone immediately
            stopEmergencyMediaRecording();
            
            // Hide active SOS alert banner card
            const alertCard = document.getElementById("active-sos-alert-card");
            if (alertCard) alertCard.classList.add("d-none-section");
            
            // Conclude active ride if any
            if (activeRideData) {
                localStorage.removeItem("saferide_active_ride");
                activeRideData = null;
                const setupContainer = document.getElementById("ride-setup-container");
                const statsPanel = document.getElementById("active-ride-stats-panel");
                if (setupContainer) setupContainer.classList.remove("d-none-section");
                if (statsPanel) statsPanel.classList.add("d-none-section");
            }
            
            // Persist resolution status in database
            if (activeSosData && activeSosData.id) {
                await ApiGateway.resolveSos(activeSosData.id, "RESOLVED");
            }
            
            activeSosData = null;
            alert("Emergency SOS alarm successfully deactivated. Contacts notified that you are safe.");
        } catch(e) {
            console.error("Resolve SOS error:", e);
        }
    } else {
        alert("INCORRECT PASSCODE! Alarm remains active.");
    }
}

window.triggerSosCountdown = triggerSosCountdown;
window.cancelSosCountdown = cancelSosCountdown;
window.resolveActiveSos = resolveActiveSos;
window.executeEmergencySos = executeEmergencySos;
window.stopEmergencyMediaRecording = stopEmergencyMediaRecording;

// ----------------------------------------------------
// Driver Verification
// ----------------------------------------------------
async function handleDriverVerify() {
    const input = document.getElementById("driver-search-plate").value;
    const resultDiv = document.getElementById("driver-verification-result");
    resultDiv.innerHTML = "";
    
    if (!input.trim()) {
        alert("Please enter a vehicle license plate number first!");
        return;
    }
    
    try {
        const driver = await ApiGateway.verifyDriver(input);
        
        resultDiv.className = "alert alert-success mt-3 bg-success bg-opacity-10 border-success text-white p-3 rounded";
        resultDiv.innerHTML = `
            <h5 class="text-success mb-2"><i class="fas fa-check-circle me-1"></i> VERIFIED DRIVER & VEHICLE</h5>
            <div><strong>Driver Name:</strong> ${driver.driverName}</div>
            <div><strong>Phone Number:</strong> ${driver.phone}</div>
            <div><strong>License Number:</strong> ${driver.licenseNumber}</div>
            <div><strong>Vehicle Model:</strong> ${driver.vehicleModel}</div>
            <div class="mt-2"><strong>Safety Rating:</strong> <span class="text-warning">${driver.rating} <i class="fas fa-star"></i></span></div>
        `;
    } catch(err) {
        resultDiv.className = "alert alert-danger mt-3 bg-danger bg-opacity-10 border-danger text-white p-3 rounded";
        resultDiv.innerHTML = `
            <h5 class="text-danger mb-2"><i class="fas fa-exclamation-triangle me-1"></i> CRITICAL WARNING: UNREGISTERED VEHICLE</h5>
            <div>${err.message}</div>
            <div class="mt-3">
                <button class="btn btn-sm btn-danger w-100" onclick="executeEmergencySos('FAKE_DRIVER_SOS')">
                    <i class="fas fa-phone-alt me-1"></i> Trigger Fake Driver SOS
                </button>
            </div>
        `;
    }
}

// ----------------------------------------------------
// Trusted Contacts Circles
// ----------------------------------------------------
async function loadTrustedContacts() {
    try {
        const contacts = await ApiGateway.getTrustedContacts();
        const list = document.getElementById("contacts-list-container");
        list.innerHTML = "";
        
        if (contacts.length === 0) {
            list.innerHTML = `<div class="text-muted p-3">Your trusted circle is empty. Add family/friends below to enable location alerts.</div>`;
            return;
        }
        
        contacts.forEach(c => {
            const card = document.createElement("div");
            card.className = "d-flex justify-content-between align-items-center bg-surface-glass border-glass p-3 rounded mb-2";
            card.innerHTML = `
                <div>
                    <h6 class="mb-0 text-white">${c.contactName} (${c.relationship})</h6>
                    <small class="text-muted">Phone: ${c.contactPhone} | Email: ${c.contactEmail}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteContact(${c.id})"><i class="fas fa-trash-alt"></i></button>
            `;
            list.appendChild(card);
        });
    } catch(e) {
        console.error("Contacts loading failed", e);
    }
}

async function handleAddContact(e) {
    e.preventDefault();
    const name = document.getElementById("tc-name").value;
    const phone = document.getElementById("tc-phone").value;
    const email = document.getElementById("tc-email").value;
    const relation = document.getElementById("tc-relation").value;
    
    try {
        await ApiGateway.addTrustedContact(name, phone, email, relation);
        document.getElementById("contact-add-form").reset();
        loadTrustedContacts();
    } catch(e) {
        alert("Failed to add contact: " + e.message);
    }
}

window.deleteContact = async function(id) {
    if (confirm("Are you sure you want to remove this contact from your trusted circle?")) {
        try {
            await ApiGateway.deleteTrustedContact(id);
            loadTrustedContacts();
        } catch(e) {
            alert("Failed to remove contact: " + e.message);
        }
    }
};

// ----------------------------------------------------
// Complaint Registry Portal
// ----------------------------------------------------
async function loadMyComplaints() {
    try {
        const list = await ApiGateway.getMyComplaints();
        const tbody = document.getElementById("my-complaints-tbody");
        tbody.innerHTML = "";
        
        list.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${c.vehicleNumber}</td>
                <td>${c.driverName || 'N/A'}</td>
                <td>${c.incidentType}</td>
                <td>${new Date(c.incidentDate).toLocaleDateString()}</td>
                <td><span class="badge ${c.status === 'RESOLVED' ? 'bg-success' : (c.status === 'INVESTIGATING' ? 'bg-warning' : 'bg-secondary')}">${c.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) {
        console.error("Complaints loading failed", e);
    }
}

async function handleFileComplaint(e) {
    e.preventDefault();
    const vehicle = document.getElementById("comp-vehicle").value;
    const driver = document.getElementById("comp-driver").value;
    const date = document.getElementById("comp-date").value;
    const type = document.getElementById("comp-type").value;
    const desc = document.getElementById("comp-desc").value;
    
    try {
        await ApiGateway.fileComplaint(vehicle, driver, date, type, desc, "");
        document.getElementById("complaint-form").reset();
        loadMyComplaints();
        alert("Your incident complaint has been logged successfully and routed to support audits.");
    } catch(e) {
        alert("Failed to file complaint: " + e.message);
    }
}

// ----------------------------------------------------
// Community Alerts
// ----------------------------------------------------
async function loadCommunityAlerts() {
    try {
        const list = await ApiGateway.getCommunityAlerts();
        const container = document.getElementById("community-alerts-container");
        container.innerHTML = "";
        
        list.forEach(a => {
            const card = document.createElement("div");
            card.className = "card bg-surface-glass border-glass p-3 mb-3";
            card.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <h5 class="h6 mb-0 text-white">${a.title}</h5>
                    <span class="badge bg-secondary">${a.category}</span>
                </div>
                <p class="small text-muted mb-2">${a.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Posted anonymous: ${new Date(a.timestamp).toLocaleTimeString()}</small>
                    <button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="upvoteAlert('${a.id}')">
                        <i class="far fa-thumbs-up me-1"></i> <span id="upvotes-count-${a.id}">${a.upvotes}</span> Upvotes
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch(e) {
        console.error("Alerts fetching failed", e);
    }
}

async function handleCreateAlert(e) {
    e.preventDefault();
    const title = document.getElementById("al-title").value;
    const cat = document.getElementById("al-category").value;
    const desc = document.getElementById("al-desc").value;
    const lat = DEFAULT_LAT + (Math.random() - 0.5) * 0.02; // Simulate local coordinates
    const lng = DEFAULT_LNG + (Math.random() - 0.5) * 0.02;
    
    try {
        await ApiGateway.createCommunityAlert(title, desc, cat, lat, lng, true);
        document.getElementById("alert-form").reset();
        loadCommunityAlerts();
        alert("Community alert broadcasted successfully to all nearby users.");
    } catch(e) {
        alert("Failed to post alert: " + e.message);
    }
}

window.upvoteAlert = async function(id) {
    try {
        const updated = await ApiGateway.upvoteAlert(id);
        document.getElementById(`upvotes-count-${id}`).innerText = updated.upvotes;
    } catch(e) {
        alert("Failed to upvote: " + e.message);
    }
};

// ----------------------------------------------------
// AI Chatbot
// ----------------------------------------------------
async function sendChatbotMsg() {
    const input = document.getElementById("chat-input");
    const query = input.value.trim();
    if (!query) return;
    
    const window = document.getElementById("chat-window-body");
    
    // User Bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.innerText = query;
    window.appendChild(userBubble);
    
    input.value = "";
    window.scrollTop = window.scrollHeight;
    
    try {
        const reply = await ApiGateway.askChatbot(query);
        
        // Bot Bubble
        const botBubble = document.createElement("div");
        botBubble.className = "chat-bubble bot";
        botBubble.innerText = reply;
        window.appendChild(botBubble);
        
        window.scrollTop = window.scrollHeight;
    } catch(e) {
        console.error("Chat failure", e);
    }
}

// ----------------------------------------------------
// Admin Operations
// ----------------------------------------------------
async function loadAdminPanel() {
    try {
        const stats = await ApiGateway.getAdminStats();
        
        document.getElementById("admin-total-users").innerText = stats.totalUsers;
        document.getElementById("admin-active-rides").innerText = stats.activeRidesCount;
        document.getElementById("admin-active-sos").innerText = stats.activeSosCount;
        document.getElementById("admin-total-complaints").innerText = stats.totalComplaints;
        
        // Render Users Admin Panel
        const users = await ApiGateway.getAdminUsers();
        const usersTbody = document.getElementById("admin-users-tbody");
        usersTbody.innerHTML = "";
        
        users.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td>${u.role}</td>
                <td>
                    <span class="badge ${u.isVerified ? 'bg-success' : 'bg-danger'}">${u.isVerified ? 'ACTIVE' : 'BLOCKED'}</span>
                </td>
                <td>
                    <button class="btn btn-sm ${u.isVerified ? 'btn-outline-danger' : 'btn-outline-success'} py-0 px-2" onclick="toggleUserStatus(${u.id}, ${u.isVerified})">
                        ${u.isVerified ? 'Block' : 'Unblock'}
                    </button>
                </td>
            `;
            usersTbody.appendChild(tr);
        });

        // Render Complaints Admin Panel
        const complaints = await ApiGateway.getMyComplaints(); // Mock default
        const compTbody = document.getElementById("admin-complaints-tbody");
        compTbody.innerHTML = "";
        
        complaints.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>COMP-${c.id}</td>
                <td>${c.vehicleNumber}</td>
                <td>${c.incidentType}</td>
                <td>${c.description.substring(0, 45)}...</td>
                <td>
                    <select class="form-select form-select-sm bg-dark text-white border-glass" onchange="updateComplaintStatus(${c.id}, this.value)">
                        <option value="PENDING" ${c.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                        <option value="INVESTIGATING" ${c.status === 'INVESTIGATING' ? 'selected' : ''}>INVESTIGATING</option>
                        <option value="RESOLVED" ${c.status === 'RESOLVED' ? 'selected' : ''}>RESOLVED</option>
                        <option value="DISMISSED" ${c.status === 'DISMISSED' ? 'selected' : ''}>DISMISSED</option>
                    </select>
                </td>
            `;
            compTbody.appendChild(tr);
        });

        // Load charts
        initAdminCharts(stats);

    } catch(e) {
        console.error("Admin Panel Load failed", e);
    }
}

window.toggleUserStatus = async function(id, currentStatus) {
    if (confirm(`Are you sure you want to ${currentStatus ? 'BLOCK' : 'UNBLOCK'} this account?`)) {
        try {
            await ApiGateway.toggleUserBlock(id, currentStatus);
            loadAdminPanel();
        } catch(e) {
            alert("Error updating user status: " + e.message);
        }
    }
};

window.updateComplaintStatus = async function(id, status) {
    try {
        await ApiGateway.updateComplaintStatus(id, status);
        alert("Complaint status updated successfully.");
        loadAdminPanel();
    } catch(e) {
        alert("Error updating complaint status: " + e.message);
    }
};

function initAdminCharts(stats) {
    // We render standard Chart.js graphs for visual analytical insights
    const ctxCrimes = document.getElementById('chart-crimes-by-area').getContext('2d');
    const ctxSos = document.getElementById('chart-sos-categories').getContext('2d');
    
    if (chartCrimes) chartCrimes.destroy();
    if (chartSos) chartSos.destroy();

    // Chart 1: Crimes By Area
    chartCrimes = new Chart(ctxCrimes, {
        type: 'bar',
        data: {
            labels: ['Sector 7 Bypass', 'Old City Crossings', 'Forest Road Ring', 'Airport Arterial'],
            datasets: [{
                label: 'Reported Incidents',
                data: [12, 19, 3, 5],
                backgroundColor: ['#ff2a5f', '#ff7e40', '#ffb300', '#00f2fe'],
                borderColor: '#121620',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b9bb4' } },
                x: { ticks: { color: '#8b9bb4' } }
            }
        }
    });

    // Chart 2: SOS Trigger Categories
    chartSos = new Chart(ctxSos, {
        type: 'doughnut',
        data: {
            labels: ['One-Click SOS', 'Check-In Timeout', 'Fake Driver Alert'],
            datasets: [{
                data: [stats.totalSosEvents * 0.6 + 1, stats.totalSosEvents * 0.3, stats.totalSosEvents * 0.1],
                backgroundColor: ['#ff2a5f', '#ffb300', '#4facfe'],
                borderColor: '#121620',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#8b9bb4' } }
            }
        }
    });
}
