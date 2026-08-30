// SafeRide AI - MongoDB Setup & Collection Configurations
// Used for high-volume logs, telemetry, active GPS, chat histories, and emergency events.

db = db.getSiblingDB('saferide_mongo');

// 1. Rides Collection (Telemetry track of location updates and check-ins)
db.createCollection('rides');
db.rides.createIndex({ "userId": 1 });
db.rides.createIndex({ "status": 1 });
db.rides.createIndex({ "startTime": -1 });

// Example schema structure for 'rides':
/*
{
  "_id": ObjectId("..."),
  "userId": 12345,
  "vehicleNumber": "MH12AB1234",
  "vehicleType": "CAB", // CAB, AUTO, BUS, WALKING
  "status": "ACTIVE", // ACTIVE, COMPLETED, SUSPENDED, SOS_TRIGGERED
  "startTime": ISODate("2026-07-13T19:00:00Z"),
  "endTime": null,
  "destination": {
    "name": "Central Railway Station",
    "lat": 18.5204,
    "lng": 73.8567
  },
  "routeSafetyScore": 88.5,
  "checkIns": [
    { "timestamp": ISODate("2026-07-13T19:05:00Z"), "status": "RESPONDED", "message": "User checked safe" },
    { "timestamp": ISODate("2026-07-13T19:10:00Z"), "status": "TIMEOUT", "message": "No response - auto alert" }
  ],
  "locationHistory": [
    { "lat": 18.5304, "lng": 73.8467, "timestamp": ISODate("2026-07-13T19:01:00Z") },
    { "lat": 18.5254, "lng": 73.8517, "timestamp": ISODate("2026-07-13T19:03:00Z") }
  ]
}
*/

// 2. Emergency Events Collection (Log for triggered SOS alarms)
db.createCollection('emergency_events');
db.emergency_events.createIndex({ "userId": 1 });
db.emergency_events.createIndex({ "rideId": 1 });
db.emergency_events.createIndex({ "timestamp": -1 });

// Example schema structure for 'emergency_events':
/*
{
  "_id": ObjectId("..."),
  "userId": 12345,
  "rideId": "mongo_ride_id_123",
  "timestamp": ISODate("2026-07-13T19:10:15Z"),
  "status": "ACTIVE", // ACTIVE, RESOLVED, FALSE_ALARM
  "resolvedAt": null,
  "triggerType": "ONE_CLICK_SOS", // ONE_CLICK_SOS, CHECKIN_TIMEOUT, PASSCODE_SOS, FAKE_DRIVER_SOS
  "gpsLocation": {
    "lat": 18.5254,
    "lng": 73.8517
  },
  "evidence": {
    "audioUrl": "/uploads/evidence/audio_12345_20260713.wav",
    "videoUrl": "/uploads/evidence/video_12345_20260713.mp4",
    "recordingDurationSec": 30
  },
  "notificationsSent": [
    { "type": "SMS", "recipient": "+919876543210", "status": "SENT" },
    { "type": "EMAIL", "recipient": "family@example.com", "status": "SENT" },
    { "type": "POLICE_ALERT", "recipient": "Pune Central Police HQ", "status": "SENT" }
  ]
}
*/

// 3. Chat Histories Collection (AI chatbot queries and responses)
db.createCollection('chat_histories');
db.chat_histories.createIndex({ "userId": 1 });
db.chat_histories.createIndex({ "timestamp": -1 });

// Example schema structure for 'chat_histories':
/*
{
  "_id": ObjectId("..."),
  "userId": 12345,
  "messages": [
    { "sender": "USER", "text": "What are my legal rights if a cab driver misbehaves?", "timestamp": ISODate("2026-07-13T19:11:00Z") },
    { "sender": "AI", "text": "Under Section 354 of the IPC, you have the right to file a complaint for harassment. You can ask him to stop, call 112 immediately, or trigger our SOS tool.", "timestamp": ISODate("2026-07-13T19:11:02Z") }
  ]
}
*/

// 4. Community Alerts Collection (Location-based anonymous safety warnings)
db.createCollection('community_alerts');
db.community_alerts.createIndex({ "location": "2dsphere" });
db.community_alerts.createIndex({ "timestamp": -1 });

// Example schema structure for 'community_alerts':
/*
{
  "_id": ObjectId("..."),
  "title": "Poorly Lit Alley",
  "description": "The streetlights on Main 4th Cross are not working. Group of teenagers loitering nearby.",
  "category": "UNSAFE_AREA", // HARASSMENT, UNSAFE_AREA, SUSPICIOUS_ACTIVITY, BAD_LIGHTING
  "location": {
    "type": "Point",
    "coordinates": [73.8567, 18.5204] // [longitude, latitude]
  },
  "isAnonymous": true,
  "upvotes": 12,
  "timestamp": ISODate("2026-07-13T18:30:00Z")
}
*/

print('MongoDB collections initialized and indexes created.');
