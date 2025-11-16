from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from scanner import scan_target
from firewall import Firewall, Rule, evaluate_traffic
import uvicorn
import os

app = FastAPI()

# Serve static frontend
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

class ScanRequest(BaseModel):
    target: str
    scan_type: str = "tcp_connect"
    ports: str = "1-1024"

class SimulateRequest(BaseModel):
    traffic: list  # list of {src_ip, dst_ip, port, protocol}
    rules: list    # list of Rule-like dicts

@app.post("/api/scan")
async def api_scan(req: ScanRequest):
    try:
        results = scan_target(req.target, req.ports, req.scan_type)
        return {"target": req.target, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate")
async def api_simulate(req: SimulateRequest):
    fw = Firewall()
    # load rules in order
    for r in req.rules:
        fw.add_rule(Rule(**r))
    decisions = []
    for t in req.traffic:
        allow = fw.evaluate_single(t.get("src_ip"), t.get("dst_ip"), t.get("port"), t.get("protocol"))
        decisions.append({"traffic": t, "allowed": allow})
    return {"decisions": decisions}

@app.get("/")
async def root():
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
