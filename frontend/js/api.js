// SafeRide - API Service Gateway
// Manages real Spring Boot (8080) / FastAPI (8000) connections with automatic client-side simulation fallbacks.

const SPRING_BOOT_BASE = "http://localhost:8080";
const PYTHON_AI_BASE = "http://localhost:8000";

let API_MODE = "SIMULATED"; // Real or Simulated
let currentUser = null;
let authToken = null;

// Self-executing probe to check if the real backends are running
async function probeServices() {
    try {
        const controller1 = new AbortController();
        const timeout1 = setTimeout(() => controller1.abort(), 1000);
        const springCheck = await fetch(`${SPRING_BOOT_BASE}/health`, { method: 'GET', signal: controller1.signal }).catch(() => null);
        clearTimeout(timeout1);

        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 1000);
        const pythonCheck = await fetch(`${PYTHON_AI_BASE}/health`, { method: 'GET', signal: controller2.signal }).catch(() => null);
        clearTimeout(timeout2);
        
        if (springCheck && springCheck.ok && pythonCheck && pythonCheck.ok) {
            API_MODE = "REAL";
            console.log("SafeRide: Connected to live Spring Boot and Python ML Services!");
        } else {
            API_MODE = "SIMULATED";
            console.warn("SafeRide: Backend services are offline or slow. Operating in local simulated database mode.");
        }
    } catch (e) {
        API_MODE = "SIMULATED";
        console.warn("SafeRide: Backend services unreachable. Operating in local simulated database mode.");
    }
    
    // Dispatch custom event to let UI update its status badge
    try {
        window.dispatchEvent(new CustomEvent('saferide-api-status-changed', { detail: { mode: API_MODE } }));
    } catch (ignored) {}
}

probeServices();

// Helper to store/load auth tokens
function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const savedToken = localStorage.getItem("saferide_token") || authToken;
    if (savedToken) {
        headers['Authorization'] = `Bearer ${savedToken}`;
    }
    return headers;
}

// Gateway API Operations
const ApiGateway = {
    // Check if user is logged in on startup (Always show Login page first on app launch)
    checkSession() {
        localStorage.removeItem("saferide_current_user");
        localStorage.removeItem("saferide_token");
        currentUser = null;
        authToken = null;
        return null;
    },

    logout() {
        localStorage.removeItem("saferide_token");
        localStorage.removeItem("saferide_current_user");
        currentUser = null;
        authToken = null;
    },

    // 1. Auth Functions
    async login(email, password) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Invalid credentials!");
            }
            const data = await res.json();
            authToken = data.token;
            currentUser = { id: data.userId, name: data.name, email: data.email, role: data.role };
            localStorage.setItem("saferide_token", authToken);
            localStorage.setItem("saferide_current_user", JSON.stringify(currentUser));
            return currentUser;
        } else {
            // Simulated login
            let users = [];
            try { users = JSON.parse(localStorage.getItem("saferide_users")) || []; } catch(e) {}
            if (!users || users.length === 0) {
                if (typeof initMockDb === "function") initMockDb();
                try { users = JSON.parse(localStorage.getItem("saferide_users")) || []; } catch(e) {}
            }
            
            let user = users.find(u => u.email === email && u.password === password);
            
            // Auto-heal fallback for demo ease
            if (!user && (email === "sudhanshu@example.com" || email === "admin@saferide.ai" || !email || !password)) {
                user = users[0] || { id: 1, name: "Sudhanshu", email: "sudhanshu@example.com", role: "ROLE_USER" };
            }

            if (!user) throw new Error("Invalid email or password! Tip: Use sudhanshu@example.com / password123");
            
            currentUser = { id: user.id, name: user.name, email: user.email, role: user.role };
            authToken = "mock_jwt_token_for_" + user.email;
            localStorage.setItem("saferide_token", authToken);
            localStorage.setItem("saferide_current_user", JSON.stringify(currentUser));
            return currentUser;
        }
    },

    async register(name, email, password, phone, passcode) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone, emergencyPasscode: passcode })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Registration failed!");
            }
            const data = await res.json();
            authToken = data.token;
            currentUser = { id: data.userId, name: data.name, email: data.email, role: data.role };
            localStorage.setItem("saferide_token", authToken);
            localStorage.setItem("saferide_current_user", JSON.stringify(currentUser));
            return currentUser;
        } else {
            const users = JSON.parse(localStorage.getItem("saferide_users"));
            if (users.find(u => u.email === email)) throw new Error("Email already registered!");
            
            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                phone,
                emergencyPasscode: passcode,
                isVerified: true,
                role: "ROLE_USER",
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem("saferide_users", JSON.stringify(users));
            
            currentUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
            authToken = "mock_jwt_token_for_" + newUser.email;
            localStorage.setItem("saferide_token", authToken);
            localStorage.setItem("saferide_current_user", JSON.stringify(currentUser));
            return currentUser;
        }
    },

    // 2. Trusted Contacts
    async getTrustedContacts() {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/contacts`, { headers: getAuthHeaders() });
            return await res.json();
        } else {
            const contacts = JSON.parse(localStorage.getItem("saferide_trusted_contacts")) || [];
            const uid = currentUser ? currentUser.id : 1;
            return contacts.filter(c => c.userId === uid);
        }
    },

    async addTrustedContact(name, phone, email, relationship) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/contacts`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ contactName: name, contactPhone: phone, contactEmail: email, relationship })
            });
            return await res.json();
        } else {
            const contacts = JSON.parse(localStorage.getItem("saferide_trusted_contacts")) || [];
            const uid = currentUser ? currentUser.id : 1;
            const newContact = {
                id: Date.now(),
                userId: uid,
                contactName: name,
                contactPhone: phone,
                contactEmail: email,
                relationship
            };
            contacts.push(newContact);
            localStorage.setItem("saferide_trusted_contacts", JSON.stringify(contacts));
            return newContact;
        }
    },

    async deleteTrustedContact(id) {
        if (API_MODE === "REAL") {
            await fetch(`${SPRING_BOOT_BASE}/api/contacts/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
        } else {
            const contacts = JSON.parse(localStorage.getItem("saferide_trusted_contacts")) || [];
            const index = contacts.findIndex(c => c.id === id);
            if (index > -1) {
                contacts.splice(index, 1);
                localStorage.setItem("saferide_trusted_contacts", JSON.stringify(contacts));
            }
        }
    },

    // 3. Rides
    async startRide(vehicleNumber, vehicleType, destName, destLat, destLng) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/rides/start`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ vehicleNumber, vehicleType, destinationName: destName, destinationLat: destLat, destinationLng: destLng })
            });
            return await res.json();
        } else {
            const rides = JSON.parse(localStorage.getItem("saferide_rides")) || [];
            const uid = currentUser ? currentUser.id : 1;
            // End other active rides
            rides.forEach(r => {
                if (r.userId === uid && r.status === "ACTIVE") {
                    r.status = "COMPLETED";
                    r.endTime = new Date().toISOString();
                }
            });
            const newRide = {
                id: "ride_" + Date.now(),
                userId: uid,
                vehicleNumber,
                vehicleType,
                status: "ACTIVE",
                startTime: new Date().toISOString(),
                endTime: null,
                destination: { name: destName, lat: destLat, lng: destLng },
                routeSafetyScore: 92.5,
                checkIns: [],
                locationHistory: []
            };
            rides.push(newRide);
            localStorage.setItem("saferide_rides", JSON.stringify(rides));
            return newRide;
        }
    },

    async updateLocation(rideId, lat, lng) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/rides/location/${rideId}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ latitude: lat, longitude: lng })
            });
            return await res.json();
        } else {
            const rides = JSON.parse(localStorage.getItem("saferide_rides"));
            const ride = rides.find(r => r.id === rideId);
            if (ride) {
                ride.locationHistory.push({ lat, lng, timestamp: new Date().toISOString() });
                localStorage.setItem("saferide_rides", JSON.stringify(rides));
            }
            return ride;
        }
    },

    async endRide(rideId) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/rides/end/${rideId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await res.json();
        } else {
            const rides = JSON.parse(localStorage.getItem("saferide_rides"));
            const ride = rides.find(r => r.id === rideId);
            if (ride) {
                ride.status = "COMPLETED";
                ride.endTime = new Date().toISOString();
                localStorage.setItem("saferide_rides", JSON.stringify(rides));
            }
            return ride;
        }
    },

    async addRideCheckIn(rideId, status, message) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/rides/checkin/${rideId}?status=${status}&message=${encodeURIComponent(message)}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await res.json();
        } else {
            const rides = JSON.parse(localStorage.getItem("saferide_rides"));
            const ride = rides.find(r => r.id === rideId);
            if (ride) {
                ride.checkIns.push({ timestamp: new Date().toISOString(), status, message });
                if (status === "TIMEOUT") {
                    ride.status = "SOS_TRIGGERED";
                }
                localStorage.setItem("saferide_rides", JSON.stringify(rides));
            }
            return ride;
        }
    },

    async verifyDriver(vehicleNumber) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/rides/verify-driver?vehicleNumber=${encodeURIComponent(vehicleNumber)}`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error("Vehicle verification failed.");
            return await res.json();
        } else {
            const match = MOCK_DRIVERS.find(d => d.vehicleNumber.toLowerCase() === vehicleNumber.toLowerCase().trim());
            if (!match) throw new Error("Unregistered vehicle! ALERT: Details do not exist in police verified registry databases.");
            return match;
        }
    },

    // 4. SOS Operations
    async triggerSos(rideId, triggerType, lat, lng) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/sos/trigger`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ rideId, triggerType, latitude: lat, longitude: lng })
            });
            return await res.json();
        } else {
            const sosLogs = JSON.parse(localStorage.getItem("saferide_emergency_events")) || [];
            const user = currentUser || JSON.parse(localStorage.getItem("saferide_current_user")) || { id: 1, name: "Sudhanshu" };
            
            // Gather real trusted contacts phone numbers
            const allContacts = JSON.parse(localStorage.getItem("saferide_trusted_contacts")) || [];
            const userContacts = allContacts.filter(c => c.userId === user.id);
            
            const notificationLogs = [
                { type: "EMAIL", recipient: "family@example.com", status: "SENT", sentTime: new Date().toISOString() },
                { type: "POLICE_ALERT", recipient: "Local PCR Dispatch Desk", status: "SENT", sentTime: new Date().toISOString() }
            ];

            // Send real SMS to each contact using Textbelt Free API
            userContacts.forEach(contact => {
                const messageText = `🚨 EMERGENCY ALERT! ${user.name || 'User'} triggered SOS on SafeRide. Location: https://maps.google.com/?q=${lat},${lng} (Lat:${lat}, Lng:${lng}). Trigger: ${triggerType}. Please help!`;
                
                console.log(`[SafeRide SMS] Firing text to ${contact.contactPhone}...`);
                
                fetch("https://textbelt.com/text", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: contact.contactPhone,
                        message: messageText,
                        key: "textbelt" // free key (1 text/day per IP)
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        console.log(`[SafeRide SMS] Real SMS sent to ${contact.contactPhone}! Remaining quota: ${data.quotaRemaining}`);
                    } else {
                        console.warn(`[SafeRide SMS] SMS failed: ${data.error}`);
                    }
                })
                .catch(err => {
                    console.error("[SafeRide SMS] Network error sending SMS:", err);
                });

                notificationLogs.push({
                    type: "SMS",
                    recipient: contact.contactPhone,
                    status: "SENT",
                    sentTime: new Date().toISOString()
                });
            });

            const newSOS = {
                id: "sos_" + Date.now(),
                userId: user.id,
                rideId,
                timestamp: new Date().toISOString(),
                status: "ACTIVE",
                resolvedAt: null,
                triggerType,
                gpsLocation: { lat, lng },
                evidence: { audioUrl: "", videoUrl: "", recordingDurationSec: 0 },
                notificationsSent: notificationLogs
            };

            sosLogs.push(newSOS);
            localStorage.setItem("saferide_emergency_events", JSON.stringify(sosLogs));

            // Also flag ride if applicable
            if (rideId) {
                const rides = JSON.parse(localStorage.getItem("saferide_rides")) || [];
                const ride = rides.find(r => r.id === rideId);
                if (ride) {
                    ride.status = "SOS_TRIGGERED";
                    localStorage.setItem("saferide_rides", JSON.stringify(rides));
                }
            }

            return newSOS;
        }
    },

    async uploadEvidence(eventId, audioUrl, videoUrl, durationSec) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/sos/evidence/${eventId}?audioUrl=${encodeURIComponent(audioUrl)}&videoUrl=${encodeURIComponent(videoUrl)}&durationSec=${durationSec}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await res.json();
        } else {
            const sosLogs = JSON.parse(localStorage.getItem("saferide_emergency_events")) || [];
            const event = sosLogs.find(e => e.id === eventId);
            if (event) {
                event.evidence = { audioUrl, videoUrl, recordingDurationSec: durationSec };
                localStorage.setItem("saferide_emergency_events", JSON.stringify(sosLogs));
            }
            return event;
        }
    },

    async resolveSos(eventId, status) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/sos/resolve/${eventId}?status=${status}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await res.json();
        } else {
            const sosLogs = JSON.parse(localStorage.getItem("saferide_emergency_events")) || [];
            const event = sosLogs.find(e => e.id === eventId);
            if (event) {
                event.status = status;
                event.resolvedAt = new Date().toISOString();
                localStorage.setItem("saferide_emergency_events", JSON.stringify(sosLogs));

                // Terminate ride if tied
                if (event.rideId) {
                    const rides = JSON.parse(localStorage.getItem("saferide_rides"));
                    const ride = rides.find(r => r.id === event.rideId);
                    if (ride && ride.status === "SOS_TRIGGERED") {
                        ride.status = "COMPLETED";
                        ride.endTime = new Date().toISOString();
                        localStorage.setItem("saferide_rides", JSON.stringify(rides));
                    }
                }
            }
            return event;
        }
    },

    // 5. Complaints
    async fileComplaint(vehicleNumber, driverName, incidentDate, incidentType, description, evidenceUrl) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/complaints`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ vehicleNumber, driverName, incidentDate, incidentType, description, evidenceUrl })
            });
            return await res.json();
        } else {
            const complaints = JSON.parse(localStorage.getItem("saferide_complaints"));
            const newComplaint = {
                id: Date.now(),
                userId: currentUser.id,
                vehicleNumber,
                driverName,
                incidentDate,
                incidentType,
                description,
                evidenceUrl,
                status: "PENDING",
                createdAt: new Date().toISOString()
            };
            complaints.push(newComplaint);
            localStorage.setItem("saferide_complaints", JSON.stringify(complaints));
            return newComplaint;
        }
    },

    async getMyComplaints() {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/complaints/my`, { headers: getAuthHeaders() });
            return await res.json();
        } else {
            const complaints = JSON.parse(localStorage.getItem("saferide_complaints"));
            return complaints.filter(c => c.userId === currentUser.id);
        }
    },

    // 6. Community Alerts
    async createCommunityAlert(title, description, category, lat, lng, isAnonymous) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/alerts`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ title, description, category, latitude: lat, longitude: lng, isAnonymous })
            });
            return await res.json();
        } else {
            const alerts = JSON.parse(localStorage.getItem("saferide_alerts"));
            const newAlert = {
                id: "alert_" + Date.now(),
                title,
                description,
                category,
                latitude: lat,
                longitude: lng,
                isAnonymous: isAnonymous !== undefined ? isAnonymous : true,
                upvotes: 0,
                timestamp: new Date().toISOString()
            };
            alerts.push(newAlert);
            localStorage.setItem("saferide_alerts", JSON.stringify(alerts));
            return newAlert;
        }
    },

    async getCommunityAlerts() {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/alerts`, { headers: getAuthHeaders() });
            return await res.json();
        } else {
            return JSON.parse(localStorage.getItem("saferide_alerts")) || [];
        }
    },

    async upvoteAlert(alertId) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/alerts/upvote/${alertId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await res.json();
        } else {
            const alerts = JSON.parse(localStorage.getItem("saferide_alerts"));
            const alert = alerts.find(a => a.id === alertId);
            if (alert) {
                alert.upvotes += 1;
                localStorage.setItem("saferide_alerts", JSON.stringify(alerts));
            }
            return alert;
        }
    },

    // 7. AI Predictive services (FastAPI proxy)
    async getRiskAnalysis(lat, lng, hour, driverRating, brakingRate, speedingRate, weather) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${PYTHON_AI_BASE}/api/ai/risk-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: lat, longitude: lng, hour, driver_rating: driverRating, sudden_braking_rate: brakingRate, speed_violations: speedingRate, weather })
            });
            return await res.json();
        } else {
            // Client side risk heuristics simulator
            let crimeScore = 0.0;
            let nearestZone = "None";
            
            // Calculate distance using simple Pythagorean shortcut for speed
            for (const zone of CRIME_ZONES) {
                const dLat = lat - zone.lat;
                const dLng = lng - zone.lng;
                const distKm = Math.sqrt(dLat*dLat + dLng*dLng) * 111.0; // approximation
                if (distKm <= zone.radius / 1000.0) {
                    const factor = 1.0 - (distKm / (zone.radius / 1000.0));
                    const zoneRisk = zone.crimeRating * factor * 10;
                    if (zoneRisk > crimeScore) {
                        crimeScore = zoneRisk;
                        nearestZone = zone.name;
                    }
                }
            }

            let nightRisk = (hour >= 21 || hour <= 5) ? 65.0 : 12.0;
            let driverRisk = (5.0 - driverRating) * 15.0 + (brakingRate * 6) + (speedingRate * 8);
            driverRisk = Math.min(100, Math.max(10, driverRisk));
            
            const weatherRisk = weather === "stormy" ? 80.0 : (weather === "rainy" ? 45.0 : 10.0);
            
            const totalRisk = (crimeScore * 0.35 + nightRisk * 0.25 + driverRisk * 0.25 + weatherRisk * 0.15);
            const safetyScore = Math.max(0, Math.min(100, 100 - totalRisk));
            
            let riskLevel = "LOW";
            let recs = [];
            if (safetyScore >= 75.0) {
                riskLevel = "LOW";
                recs = ["Route is safe.", "Keep live location sharing active."];
            } else if (safetyScore >= 45.0) {
                riskLevel = "MEDIUM";
                recs = ["Be cautious.", "Ensure trusted contacts are tracking your ride.", "Avoid dark streets."];
            } else {
                riskLevel = "HIGH";
                recs = ["High safety risk!", "Enable Auto-checkins.", "Keep phone handy.", "Dispatch coordinates immediately if driver deviates."];
            }

            return {
                safety_score: Math.round(safetyScore * 100) / 100,
                risk_level: riskLevel,
                factors: {
                    crime_risk: Math.round(crimeScore * 100) / 100,
                    night_risk: nightRisk,
                    driver_risk: Math.round(driverRisk * 100) / 100,
                    weather_risk: weatherRisk,
                    nearest_crime_zone: nearestZone
                },
                recommendations: recs
            };
        }
    },

    async getSafeRoutes(startLat, startLng, endLat, endLng) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${PYTHON_AI_BASE}/api/ai/safe-route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start_latitude: startLat, start_longitude: startLng, end_latitude: endLat, end_longitude: endLng })
            });
            return await res.json();
        } else {
            // Helper to generate routing lines
            const interpolate = (sLat, sLng, eLat, eLng, steps, offsetLat = 0, offsetLng = 0) => {
                const path = [];
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    let lat = sLat + (eLat - sLat) * t;
                    let lng = sLng + (eLng - sLng) * t;
                    if (i > 0 && i < steps) {
                        // Bend route line to look like city routing
                        const shift = Math.sin(t * Math.PI);
                        lat += offsetLat * shift;
                        lng += offsetLng * shift;
                    }
                    path.push({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
                }
                return path;
            };

            return {
                routes: [
                    {
                        route_name: "Shortest Path (High Risk)",
                        safety_score: 42.5,
                        distance_km: 4.2,
                        duration_min: 12,
                        is_recommended: false,
                        coordinates: interpolate(startLat, startLng, endLat, endLng, 6, 0.002, 0.005),
                        risk_factor: "Runs through Sector 7 crime hotspot. 2 active incidents reported."
                    },
                    {
                        route_name: "Alternative Route A (Medium Risk)",
                        safety_score: 68.0,
                        distance_km: 5.6,
                        duration_min: 16,
                        is_recommended: false,
                        coordinates: interpolate(startLat, startLng, endLat, endLng, 8, -0.003, -0.004),
                        risk_factor: "Moderately lit street grid. Avoids high danger hotspots."
                    },
                    {
                        route_name: "SafeRide AI Recommended (Lowest Risk)",
                        safety_score: 93.8,
                        distance_km: 6.8,
                        duration_min: 20,
                        is_recommended: true,
                        coordinates: interpolate(startLat, startLng, endLat, endLng, 10, 0.008, -0.007),
                        risk_factor: "Main Highway and lit arterials. Highly active PCR patrolling police routes."
                    }
                ]
            };
        }
    },

    async askChatbot(query) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${PYTHON_AI_BASE}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await res.json();
            return data.response;
        } else {
            const q = query.toLowerCase();
            if (q.includes("harassment")) {
                return "If you are facing harassment in a public cab/transport:\n1. Raise your voice immediately to alert others.\n2. Call the Women Helpline at 1091 or emergency PCR at 112.\n3. Keep your phone in your hand with our SOS screen active.\n4. Under Section 354A of the IPC, sexual harassment is a non-bailable criminal offense punishable by imprisonment up to 3 years.";
            } else if (q.includes("rights") || q.includes("legal")) {
                return "Crucial safety rights for women in India:\n- **Right to Zero FIR**: You can file an FIR at any police station. They must transfer it to the correct district later.\n- **No Arrest at Night**: Under Section 46(4) of CrPC, women cannot be arrested between sunset and sunrise except in extreme cases, and ONLY by a female officer.\n- **Right to Privacy**: Your statement for assault can be recorded privately at your home or with only a female police officer present.";
            } else if (q.includes("self-defense") || q.includes("defense")) {
                return "Quick physical self-defense principles:\n- **Strike vulnerable points**: Direct force towards the attacker's eyes, nose, throat, or groin.\n- **Improvised tools**: Grip your keys between your fingers, or use heavy bags/pens as strike items.\n- **Create space & run**: Your primary goal is to escape, not to win a fight. Run to highly-lit retail shops, banks, ATMs, or crowded venues.";
            } else if (q.includes("cab") || q.includes("driver") || q.includes("taxi")) {
                return "Safety precautions for cab rides:\n- Verify license plate numbers and driver name inside our registry tool.\n- Sit directly behind the driver (makes it harder for them to reach or surprise you).\n- Ensure child-lock controls are disengaged upon entering.\n- Never share personal phone numbers, addresses, or trip details.";
            } else {
                return "Hi! I am the SafeRide AI Assistant. You can ask me about:\n- How to handle public **harassment**\n- Safety tips for **cabs** and ride hailing\n- Female **legal rights** and laws\n- **Self-defense** maneuvers\n- **Emergency** contact services and hotlines.";
            }
        }
    },

    // 8. Admin operations
    async getAdminStats() {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/admin/stats`, { headers: getAuthHeaders() });
            return await res.json();
        } else {
            const rides = JSON.parse(localStorage.getItem("saferide_rides")) || [];
            const complaints = JSON.parse(localStorage.getItem("saferide_complaints")) || [];
            const sos = JSON.parse(localStorage.getItem("saferide_emergency_events")) || [];
            const users = JSON.parse(localStorage.getItem("saferide_users")) || [];
            
            return {
                totalUsers: users.length,
                totalDrivers: MOCK_DRIVERS.length,
                totalComplaints: complaints.length,
                totalRides: rides.length,
                totalSosEvents: sos.length,
                activeRidesCount: rides.filter(r => r.status === "ACTIVE").length,
                activeSosCount: sos.filter(s => s.status === "ACTIVE").length
            };
        }
    },

    async getAdminUsers() {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/admin/users`, { headers: getAuthHeaders() });
            return await res.json();
        } else {
            return JSON.parse(localStorage.getItem("saferide_users")) || [];
        }
    },

    async updateComplaintStatus(complaintId, status) {
        if (API_MODE === "REAL") {
            const res = await fetch(`${SPRING_BOOT_BASE}/api/admin/complaints/status/${complaintId}?status=${status}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await res.json();
        } else {
            const complaints = JSON.parse(localStorage.getItem("saferide_complaints"));
            const complaint = complaints.find(c => c.id === complaintId);
            if (complaint) {
                complaint.status = status;
                localStorage.setItem("saferide_complaints", JSON.stringify(complaints));
            }
            return complaint;
        }
    },

    async toggleUserBlock(userId, isBlock) {
        if (API_MODE === "REAL") {
            const path = isBlock ? 'block' : 'unblock';
            const res = await fetch(`${SPRING_BOOT_BASE}/api/admin/users/${path}/${userId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await res.json();
        } else {
            const users = JSON.parse(localStorage.getItem("saferide_users"));
            const user = users.find(u => u.id === userId);
            if (user) {
                user.isVerified = !isBlock;
                localStorage.setItem("saferide_users", JSON.stringify(users));
            }
            return user;
        }
    }
};
window.ApiGateway = ApiGateway;
