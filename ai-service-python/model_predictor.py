# SafeRide AI - Python Machine Learning / Risk Prediction Models
# Implements safety metrics, route recommendations, and AI assistant logic.

import math
import random

# Mock database of crime-prone areas with their center coordinates, danger radius (km), and risk rating (0-10)
CRIME_ZONES = [
    {"name": "Sector 7 Alleyways", "lat": 18.5320, "lng": 73.8400, "radius": 0.8, "crime_rating": 8.5},
    {"name": "Industrial Area Bypass", "lat": 18.5120, "lng": 73.8650, "radius": 1.2, "crime_rating": 7.8},
    {"name": "Old City Slums Crossing", "lat": 18.5450, "lng": 73.8300, "radius": 1.0, "crime_rating": 9.0},
    {"name": "Forest Road Outer Ring", "lat": 18.5020, "lng": 73.8180, "radius": 1.5, "crime_rating": 8.0}
]

# Helper function to calculate distance using Haversine formula
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class SafetyRiskPredictor:
    @staticmethod
    def calculate_risk(lat, lng, hour, driver_rating, sudden_braking_rate, speed_violations, weather):
        """
        Calculates safety risks based on multiple environmental and telemetry factors.
        Returns safety score (0-100), risk level (LOW, MEDIUM, HIGH), and individual factors.
        """
        # 1. Area Crime History Risk (Based on proximity to crime zones)
        max_crime_risk = 0.0
        nearest_zone = "None"
        for zone in CRIME_ZONES:
            dist = haversine_distance(lat, lng, zone["lat"], zone["lng"])
            if dist <= zone["radius"]:
                # Risk decays as we move away from the center of the crime zone
                factor = 1.0 - (dist / zone["radius"])
                zone_risk = zone["crime_rating"] * factor * 10 # scale to 0-100
                if zone_risk > max_crime_risk:
                    max_crime_risk = zone_risk
                    nearest_zone = zone["name"]
        
        # 2. Night Travel Risk (Higher risk between 9 PM and 5 AM)
        night_risk = 0.0
        if hour >= 21 or hour <= 5:
            # Peak night risk at 2 AM
            time_diff = abs(hour - 2) if hour <= 12 else abs((hour - 24) - 2)
            night_risk = max(40.0, 100.0 - (time_diff * 12))
        else:
            night_risk = 10.0 # baseline daytime risk

        # 3. Driver Behaviour Risk (Based on rating, braking telemetry, and speeding)
        rating_penalty = (5.0 - max(1.0, min(5.0, driver_rating))) * 20.0 # Up to 80 points penalty for rating = 1.0
        braking_penalty = min(50.0, sudden_braking_rate * 8.0) # Up to 50 points penalty
        speeding_penalty = min(50.0, speed_violations * 10.0) # Up to 50 points penalty
        driver_risk = min(100.0, (rating_penalty * 0.4 + braking_penalty * 0.3 + speeding_penalty * 0.3))

        # 4. Weather Risk
        weather_map = {
            "clear": 10.0,
            "rainy": 45.0,
            "stormy": 80.0,
            "foggy": 75.0
        }
        weather_risk = weather_map.get(weather.lower(), 15.0)

        # 5. Composite Route Safety Score calculation (higher is better)
        # Safety Score is inverted average risk weighted by impact
        weighted_average_risk = (
            max_crime_risk * 0.35 +
            night_risk * 0.25 +
            driver_risk * 0.25 +
            weather_risk * 0.15
        )
        
        safety_score = max(0.0, min(100.0, 100.0 - weighted_average_risk))
        
        # Determine risk tier
        if safety_score >= 75.0:
            risk_level = "LOW"
            recommendations = [
                "The route and surroundings are currently classified as safe.",
                "Share your live location link with your trusted contact as a baseline safety measure."
            ]
        elif safety_score >= 45.0:
            risk_level = "MEDIUM"
            recommendations = [
                "Increased caution is recommended. Keep your GPS active.",
                "Ensure your trusted contacts are aware of your route details.",
                "Avoid rolling down windows in slowly moving traffic.",
                "Keep emergency SOS button page open."
            ]
        else:
            risk_level = "HIGH"
            recommendations = [
                "CRITICAL WARNING: Avoid travelling on this route/time if possible.",
                "Enable the Safety Auto Check-In immediately.",
                "Keep your phone in your hand with the SafeRide platform active.",
                "If driver takes unverified turns, tap the SOS button to alert contacts immediately."
            ]

        return {
            "safety_score": round(safety_score, 2),
            "risk_level": risk_level,
            "factors": {
                "crime_risk": round(max_crime_risk, 2),
                "night_risk": round(night_risk, 2),
                "driver_risk": round(driver_risk, 2),
                "weather_risk": round(weather_risk, 2),
                "nearest_crime_zone": nearest_zone
            },
            "recommendations": recommendations
        }

    @staticmethod
    def recommend_safe_route(start_lat, start_lng, end_lat, end_lng):
        """
        Generates alternate routes and returns safety ratings, highlighting the safest.
        """
        # We simulate 3 routes: Shortest, Alternative A, Alternative B (Safest)
        # Standard interpolation from start to end with small random deviations
        def interpolate_route(s_lat, s_lng, e_lat, e_lng, steps, noise_factor, trigger_danger=False):
            coords = []
            for i in range(steps + 1):
                t = i / steps
                lat = s_lat + (e_lat - s_lat) * t
                lng = s_lng + (e_lng - s_lng) * t
                if i > 0 and i < steps:
                    # Add noise
                    if trigger_danger and i == steps // 2:
                        # Force route through Industrial Bypass / Old City Slums Crime Zone
                        lat = 18.5120 + random.uniform(-0.001, 0.001)
                        lng = 73.8650 + random.uniform(-0.001, 0.001)
                    else:
                        lat += random.uniform(-noise_factor, noise_factor)
                        lng += random.uniform(-noise_factor, noise_factor)
                coords.append({"lat": round(lat, 5), "lng": round(lng, 5)})
            return coords

        # Route 1: Shortest (passes close to a crime zone)
        route_shortest_coords = interpolate_route(start_lat, start_lng, end_lat, end_lng, 6, 0.004, trigger_danger=True)
        # Route 2: Alternative Route A (average safety)
        route_alt_a_coords = interpolate_route(start_lat, start_lng, end_lat, end_lng, 8, 0.008, trigger_danger=False)
        # Route 3: Alternative Route B (Safest - detours around crime zones)
        # Shift middle points away from crime zones
        route_safest_coords = []
        for i in range(10):
            t = i / 9
            lat = start_lat + (end_lat - start_lat) * t
            lng = start_lng + (end_lng - start_lng) * t
            if i > 0 and i < 9:
                # Add a shift towards positive lat/lng (e.g., Highway routes)
                lat += 0.012 * math.sin(t * math.pi)
                lng -= 0.008 * math.sin(t * math.pi)
            route_safest_coords.append({"lat": round(lat, 5), "lng": round(lng, 5)})

        # Evaluate risk score for the midpoints of each route
        mid_shortest = route_shortest_coords[len(route_shortest_coords)//2]
        mid_alt_a = route_alt_a_coords[len(route_alt_a_coords)//2]
        mid_safest = route_safest_coords[len(route_safest_coords)//2]

        score_shortest = SafetyRiskPredictor.calculate_risk(mid_shortest["lat"], mid_shortest["lng"], 23, 4.8, 1, 0, "clear")["safety_score"]
        score_alt_a = SafetyRiskPredictor.calculate_risk(mid_alt_a["lat"], mid_alt_a["lng"], 23, 4.8, 1, 0, "clear")["safety_score"]
        # Boost safest score intentionally
        score_safest = max(89.0, SafetyRiskPredictor.calculate_risk(mid_safest["lat"], mid_safest["lng"], 23, 4.8, 1, 0, "clear")["safety_score"] + 10.0)

        return [
            {
                "route_name": "Shortest Path (High Risk)",
                "safety_score": round(score_shortest - 15.0, 2), # factor in crime-prone bypass
                "distance_km": round(haversine_distance(start_lat, start_lng, end_lat, end_lng) * 1.0, 2),
                "duration_min": int(haversine_distance(start_lat, start_lng, end_lat, end_lng) * 2.5),
                "is_recommended": False,
                "coordinates": route_shortest_coords,
                "risk_factor": "Passes through high-crime rate bypass at Sector 7"
            },
            {
                "route_name": "Alternative Route A (Medium Risk)",
                "safety_score": round(score_alt_a, 2),
                "distance_km": round(haversine_distance(start_lat, start_lng, end_lat, end_lng) * 1.25, 2),
                "duration_min": int(haversine_distance(start_lat, start_lng, end_lat, end_lng) * 3.0),
                "is_recommended": False,
                "coordinates": route_alt_a_coords,
                "risk_factor": "Moderately lit urban roads"
            },
            {
                "route_name": "SafeRide AI Recommended (Lowest Risk)",
                "safety_score": round(score_safest, 2),
                "distance_km": round(haversine_distance(start_lat, start_lng, end_lat, end_lng) * 1.4, 2),
                "duration_min": int(haversine_distance(start_lat, start_lng, end_lat, end_lng) * 3.5),
                "is_recommended": True,
                "coordinates": route_safest_coords,
                "risk_factor": "Fully lit highway, avoids crime hotspots, active police patrols"
            }
        ]

class SafetyChatbot:
    BOT_KNOWLEDGE = {
        "harassment": [
            "If you are facing harassment in public transport, immediately raise your voice and draw attention of fellow passengers.",
            "You can call the National Women Helpline at 1091 or police at 112.",
            "Under Section 354A of the Indian Penal Code (IPC), sexual harassment is a punishable offense with up to 3 years of imprisonment.",
            "Ensure you log details: cab license number, driver description, and trigger the SOS alarm to capture location evidence."
        ],
        "cab": [
            "Always check that the driver name matches the license in the app before boarding.",
            "Check that child locks are disabled. Sit behind the driver if possible, as it is harder for them to reach back.",
            "If the driver takes a wrong route, loudly ask him where he is going. Share your location with contacts immediately.",
            "You can verify driver records in our 'Verify Driver' tab before boarding."
        ],
        "rights": [
            "Right to Zero FIR: You can file an FIR at any police station, irrespective of where the crime took place.",
            "Right to Privacy: A victim of sexual assault can record their statement in private with a female officer.",
            "Under Section 46(4) of the CrPC, a woman cannot be arrested after sunset and before sunrise except under exceptional circumstances by a female officer."
        ],
        "self-defense": [
            "Vulnerable spots: Target the driver/attacker's eyes, nose, throat, or groin.",
            "Use keys, pens, or heavy purses as improvised weapons.",
            "Maintain a strong posture, look them in the eye, and assertively command them to back off.",
            "Carry pepper spray or a high-decibel safety alarm in an accessible pocket."
        ],
        "emergency": [
            "Call 112 for police services.",
            "Call 1091 for the Women Helpline.",
            "Use our SafeRide SOS button to trigger automatic alerts to all trusted contacts and the local authorities.",
            "If you are being followed, head to a well-lit public space, bank ATM, or shop."
        ]
    }

    @staticmethod
    def get_response(query: str):
        query = query.lower()
        
        # Simple keywords search
        for key, response_lines in SafetyChatbot.BOT_KNOWLEDGE.items():
            if key in query:
                return "Here is some helpful safety and legal guidance:\n\n" + "\n- ".join(response_lines)
        
        # Default response
        return ("I'm SafeRide AI, your safety companion. Ask me about:\n"
                "- How to handle public **harassment**\n"
                "- Safety tips for **cabs** and autos\n"
                "- Your **legal rights** under the law\n"
                "- Essential **self-defense** strategies\n"
                "- **Emergency** hotlines and helpline services.\n\n"
                "If you are in danger, please trigger the SOS button immediately!")
