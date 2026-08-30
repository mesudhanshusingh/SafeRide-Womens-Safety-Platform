# SafeRide - Python Flask/FastAPI Microservice App
# Exposes AI/ML prediction services over REST API.

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from model_predictor import SafetyRiskPredictor, SafetyChatbot

app = FastAPI(
    title="SafeRide ML Service",
    description="Microservice for safety risk calculation, route safety scores, and chatbot logic.",
    version="1.0.0"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class RiskAnalysisRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    hour: int = Field(20, ge=0, le=23, description="Hour of travel (0-23)")
    driver_rating: float = Field(5.0, ge=1.0, le=5.0)
    sudden_braking_rate: float = Field(0.0, ge=0.0)
    speed_violations: float = Field(0.0, ge=0.0)
    weather: str = Field("clear")

class RouteRecommendationRequest(BaseModel):
    start_latitude: float = Field(..., ge=-90.0, le=90.0)
    start_longitude: float = Field(..., ge=-180.0, le=180.0)
    end_latitude: float = Field(..., ge=-90.0, le=90.0)
    end_longitude: float = Field(..., ge=-180.0, le=180.0)

class ChatRequest(BaseModel):
    query: str

# 1. Health Check
@app.get("/health")
def health_check():
    return {"status": "UP", "message": "SafeRide Microservice is running."}

# 2. Risk Score Calculation
@app.post("/api/ai/risk-analysis")
def get_risk_analysis(req: RiskAnalysisRequest):
    try:
        result = SafetyRiskPredictor.calculate_risk(
            lat=req.latitude,
            lng=req.longitude,
            hour=req.hour,
            driver_rating=req.driver_rating,
            sudden_braking_rate=req.sudden_braking_rate,
            speed_violations=req.speed_violations,
            weather=req.weather
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Safe Route Recommendations
@app.post("/api/ai/safe-route")
def get_safe_route(req: RouteRecommendationRequest):
    try:
        routes = SafetyRiskPredictor.recommend_safe_route(
            start_lat=req.start_latitude,
            start_lng=req.start_longitude,
            end_lat=req.end_latitude,
            end_lng=req.end_longitude
        )
        return {"routes": routes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Safety Chatbot Guidance
@app.post("/api/ai/chat")
def get_chat_response(req: ChatRequest):
    try:
        response = SafetyChatbot.get_response(req.query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
