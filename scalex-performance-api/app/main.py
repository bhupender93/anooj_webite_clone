from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from performance_data import PERFORMANCE_CHART_RESPONSES

app = FastAPI()

# ✅ CORS for GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can lock this down later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/chart/{chart_id}")
async def chart_endpoint(chart_id: str, request: Request):
    payload = await request.json()

    # Log payload for parity/debug
    print(f"[Chart API] chart_id={chart_id}")
    print(f"[Payload] {payload}")

    response = PERFORMANCE_CHART_RESPONSES.get(chart_id)

    if not response:
        return {
            "success": False,
            "error": f"Chart '{chart_id}' not found"
        }

    return response
