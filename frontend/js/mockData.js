// SafeRide - Mock Database & Seed Data
// Simulates relational (MySQL) and document (MongoDB) storage in local browser storage.

const MOCK_DRIVERS = [
    { vehicleNumber: "MH12AB1234", driverName: "Rohan Sharma", phone: "+919876543211", licenseNumber: "DL-12345678", vehicleModel: "Maruti Suzuki Swift (White)", rating: 4.8, isActive: true },
    { vehicleNumber: "KA03MX8899", driverName: "Karan Singh", phone: "+919876543212", licenseNumber: "DL-87654321", vehicleModel: "Hyundai i12 (Silver)", rating: 4.6, isActive: true },
    { vehicleNumber: "DL01XY9900", driverName: "Amit Verma", phone: "+919876543213", licenseNumber: "DL-99001122", vehicleModel: "Toyota Etios (Yellow-Black Cab)", rating: 4.9, isActive: true },
    { vehicleNumber: "MH14ZZ7788", driverName: "Sanjay Patil", phone: "+919876543214", licenseNumber: "DL-11223344", vehicleModel: "Bajaj Auto Rickshaw", rating: 4.2, isActive: true }
];

const MOCK_POLICE_HOSPITALS = [
    { type: "police", name: "Central Police Station", lat: 18.5284, lng: 73.8447, phone: "112" },
    { type: "police", name: "Shivajinagar Police Station", lat: 18.5350, lng: 73.8520, phone: "112" },
    { type: "police", name: "Swargate Police Chowky", lat: 18.5080, lng: 73.8560, phone: "112" },
    { type: "hospital", name: "Sassoon General Hospital", lat: 18.5270, lng: 73.8630, phone: "020-26128000" },
    { type: "hospital", name: "Ruby Hall Clinic", lat: 18.5330, lng: 73.8730, phone: "020-66455100" },
    { type: "hospital", name: "Poona Hospital", lat: 18.5130, lng: 73.8420, phone: "020-66096000" },
    { type: "safe_zone", name: "Safe Transit Hub (Metro Square)", lat: 18.5204, lng: 73.8567, phone: "1091" }
];

const CRIME_ZONES = [
    { name: "Sector 7 Alleyways", lat: 18.5320, lng: 73.8400, radius: 800, crimeRating: 8.5 },
    { name: "Industrial Area Bypass", lat: 18.5120, lng: 73.8650, radius: 1200, crimeRating: 7.8 },
    { name: "Old City Slums Crossing", lat: 18.5450, lng: 73.8300, radius: 1000, crimeRating: 9.0 },
    { name: "Forest Road Outer Ring", lat: 18.5020, lng: 73.8180, radius: 1500, crimeRating: 8.0 }
];

// Helper to initialize local storage mock databases
function initMockDb() {
    const defaultUsers = [
        { id: 1, name: "Sudhanshu", email: "sudhanshu@example.com", password: "password123", phone: "+919876543200", emergencyPasscode: "9999", isVerified: true, role: "ROLE_USER", createdAt: new Date().toISOString() },
        { id: 2, name: "Admin Officer", email: "admin@saferide.ai", password: "adminpassword", phone: "+919988776655", emergencyPasscode: "1111", isVerified: true, role: "ROLE_ADMIN", createdAt: new Date().toISOString() }
    ];
    
    const rawUsers = localStorage.getItem("saferide_users");
    let users = null;
    try { users = JSON.parse(rawUsers); } catch(e) {}
    
    if (!users || !Array.isArray(users) || users.length === 0) {
        localStorage.setItem("saferide_users", JSON.stringify(defaultUsers));
    } else {
        // Enforce user 1 as Sudhanshu
        const user1 = users.find(u => u.email === "sudhanshu@example.com" || u.id === 1);
        if (user1) {
            user1.name = "Sudhanshu";
            user1.email = "sudhanshu@example.com";
            localStorage.setItem("saferide_users", JSON.stringify(users));
        } else {
            users.unshift(defaultUsers[0]);
            localStorage.setItem("saferide_users", JSON.stringify(users));
        }
    }
    
    if (!localStorage.getItem("saferide_trusted_contacts")) {
        const defaultContacts = [
            { id: 1, userId: 1, contactName: "Anil Sharma (Father)", contactPhone: "+919876543209", contactEmail: "father@example.com", relationship: "Parent" },
            { id: 2, userId: 1, contactName: "Neha Verma (Friend)", contactPhone: "+919876543208", contactEmail: "friend@example.com", relationship: "Friend" }
        ];
        localStorage.setItem("saferide_trusted_contacts", JSON.stringify(defaultContacts));
    }

    if (!localStorage.getItem("saferide_complaints")) {
        const defaultComplaints = [
            { id: 1, userId: 1, vehicleNumber: "MH14ZZ7788", driverName: "Sanjay Patil", incidentDate: new Date(Date.now() - 86400000 * 2).toISOString(), incidentType: "Reckless Behavior", description: "Driver was speeding excessively and using mobile phone while driving. Ignored requests to slow down.", evidenceUrl: "", status: "RESOLVED", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 2, userId: 1, vehicleNumber: "MH12AB1234", driverName: "Rohan Sharma", incidentDate: new Date(Date.now() - 86400000 * 5).toISOString(), incidentType: "Harassment", description: "Driver passed inappropriate comments and took multiple unannounced routes.", evidenceUrl: "", status: "INVESTIGATING", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() }
        ];
        localStorage.setItem("saferide_complaints", JSON.stringify(defaultComplaints));
    }

    if (!localStorage.getItem("saferide_rides")) {
        const defaultRides = [
            { id: "ride_1", userId: 1, vehicleNumber: "KA03MX8899", vehicleType: "CAB", status: "COMPLETED", startTime: new Date(Date.now() - 3600000 * 2).toISOString(), endTime: new Date(Date.now() - 3600000 * 1.5).toISOString(), destination: { name: "Central Railway Station", lat: 18.5204, lng: 73.8567 }, routeSafetyScore: 94.2, checkIns: [{ timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(), status: "RESPONDED", message: "User responded safe" }], locationHistory: [] }
        ];
        localStorage.setItem("saferide_rides", JSON.stringify(defaultRides));
    }

    if (!localStorage.getItem("saferide_emergency_events")) {
        const defaultSOS = [
            { id: "sos_1", userId: 1, rideId: "ride_1", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), status: "RESOLVED", resolvedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(), triggerType: "ONE_CLICK_SOS", gpsLocation: { lat: 18.5284, lng: 73.8447 }, evidence: { audioUrl: "", videoUrl: "", recordingDurationSec: 15 }, notificationsSent: [{ type: "SMS", recipient: "+919876543209", status: "SENT" }, { type: "POLICE_ALERT", recipient: "Nearest PCR", status: "SENT" }] }
        ];
        localStorage.setItem("saferide_emergency_events", JSON.stringify(defaultSOS));
    }

    if (!localStorage.getItem("saferide_alerts")) {
        const defaultAlerts = [
            { id: "alert_1", title: "Defective Street Lights", description: "The street lights are off for a 200m stretch. Dark and isolated.", category: "BAD_LIGHTING", latitude: 18.5340, longitude: 73.8410, isAnonymous: true, upvotes: 18, timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
            { id: "alert_2", title: "Suspicious Loitering Group", description: "A group of rowdy individuals gathering near the closed subway. Catcalling reported.", category: "HARASSMENT", latitude: 18.5130, longitude: 73.8640, isAnonymous: true, upvotes: 24, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() }
        ];
        localStorage.setItem("saferide_alerts", JSON.stringify(defaultAlerts));
    }
}

// Invoke Database Initialization
initMockDb();
