import os
import json
import logging
import asyncio
from typing import List, Dict, Optional
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import httpx

# --- Configuration ---
ABUSEIPDB_KEY = os.getenv("ABUSEIPDB_KEY")
STATS_FILE = "forge_stats.json"

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mithril")

# --- App Initialization ---
app = FastAPI(title="Mithril", version="1.0", description="Silverline OPS Threat Intelligence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Persistence (The Ring Vault) ---
def load_stats() -> Dict:
    if not os.path.exists(STATS_FILE):
        return {"impurities_smelted": 0}
    try:
        with open(STATS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {"impurities_smelted": 0}

def save_stats(stats: Dict):
    try:
        with open(STATS_FILE, "w") as f:
            json.dump(stats, f)
    except Exception as e:
        logger.error(f"Failed to save stats: {e}")

# --- Threat Logic (The Smelting) ---

def is_internal_ip(ip: str) -> bool:
    """STRICTLY ignore internal/local traffic."""
    if ip.startswith("192.168."): return True
    if ip.startswith("10."): return True
    if ip.startswith("127."): return True
    if ip.startswith("224."): return True
    
    # 172.16-31 check
    if ip.startswith("172."):
        parts = ip.split(".")
        if len(parts) > 1 and parts[1].isdigit():
            second_octet = int(parts[1])
            if 16 <= second_octet <= 31:
                return True
                
    return False

def get_verdict(score: int, country: str, isp: str) -> dict:
    """
    CRITICAL: AbuseIPDB Score >= 80. (Action: 'BLOCK IMMEDIATELY')
    SUSPICIOUS: Score >= 20 OR Country is RU/CN/KP/IR. (Action: 'INVESTIGATE')
    FALSE POSITIVE: Score < 50 AND ISP contains 'Microsoft', 'Google', 'Amazon', or 'Cloudflare'. (Action: 'WHITELIST')
    CLEAN: Anything else. (Action: 'IGNORE')
    """
    isp_lower = isp.lower() if isp else ""
    big_tech = any(tech in isp_lower for tech in ['microsoft', 'google', 'amazon', 'cloudflare'])
    
    # 1. CRITICAL
    if score >= 80:
        return {"severity": "CRITICAL", "rec": "BLOCK IMMEDIATELY"}
    
    # 3. FALSE POSITIVE (Priority check before Suspicious for score < 50 cases?)
    # Requirement: Score < 50 AND ISP match.
    if score < 50 and big_tech:
        return {"severity": "FALSE_POSITIVE", "rec": "WHITELIST"}

    # 2. SUSPICIOUS
    rogue_nations = ['RU', 'CN', 'KP', 'IR']
    if score >= 20 or country in rogue_nations:
        return {"severity": "SUSPICIOUS", "rec": "INVESTIGATE"}
        
    # 4. CLEAN
    return {"severity": "CLEAN", "rec": "IGNORE"}

async def check_ip_reputation(client: httpx.AsyncClient, ip: str) -> dict:
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {
        "Key": ABUSEIPDB_KEY,
        "Accept": "application/json"
    }
    params = {
        "ipAddress": ip,
        "maxAgeInDays": 90
    }
    
    try:
        response = await client.get(url, headers=headers, params=params, timeout=10.0)
        
        if response.status_code == 429:
            logger.warning(f"Rate limited by AbuseIPDB for {ip}")
            return {"ip": ip, "error": "Rate Limit"}
            
        if response.status_code != 200:
            logger.error(f"AbuseIPDB error {response.status_code} for {ip}")
            return {"ip": ip, "error": f"API Error {response.status_code}"}
            
        data = response.json().get("data", {})
        score = data.get("abuseConfidenceScore", 0)
        country = data.get("countryCode", "UNKNOWN")
        isp = data.get("isp", "Unknown ISP")
        
        verdict = get_verdict(score, country, isp)
        
        return {
            "ip": ip,
            "country": country,
            "isp": isp,
            "score": score,
            "severity": verdict["severity"],
            "rec": verdict["rec"]
        }
        
    except Exception as e:
        logger.error(f"Exception checking {ip}: {e}")
        return {"ip": ip, "error": str(e)}

# --- Endpoints ---

@app.post("/upload")
async def upload_log(file: UploadFile = File(...)):
    if not ABUSEIPDB_KEY:
        raise HTTPException(status_code=500, detail="Server config error: Missing ABUSEIPDB_KEY")

    # 1. Parse CSV
    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {e}")
        
    # 2. Normalize Headers
    df.columns = df.columns.str.lower().str.strip()
    
    # Locate Source IP Column
    src_col = next((col for col in df.columns if 'src' in col or 'source' in col), None)
    if not src_col:
        raise HTTPException(status_code=400, detail="Could not find 'source' or 'src' column in CSV")
        
    # 3. Filter & Deduplicate
    unique_ips = df[src_col].dropna().unique()
    valid_ips = [ip for ip in unique_ips if not is_internal_ip(str(ip))]
    
    # Limit to 50 for MVP
    batch_ips = valid_ips[:50]
    
    results = []
    
    # 4. Enrich (The Smelting)
    async with httpx.AsyncClient() as client:
        tasks = [check_ip_reputation(client, ip) for ip in batch_ips]
        api_results = await asyncio.gather(*tasks)
        
    # Process results & Gamification
    stats = load_stats()
    impurities_found = 0
    
    for res in api_results:
        if "error" in res:
            continue
            
        # Count impurities
        if res["severity"] in ["CRITICAL", "SUSPICIOUS"]:
            impurities_found += 1
            
        results.append(res)
        
    # Update Stats
    stats["impurities_smelted"] += impurities_found
    save_stats(stats)
    
    # Sort: Critical first
    severity_order = {"CRITICAL": 0, "SUSPICIOUS": 1, "FALSE_POSITIVE": 2, "CLEAN": 3}
    results.sort(key=lambda x: severity_order.get(x.get("severity"), 99))
    
    return JSONResponse(content={
        "meta": {
            "processed": len(results),
            "impurities_found": impurities_found,
            "total_smelted": stats["impurities_smelted"]
        },
        "data": results
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
