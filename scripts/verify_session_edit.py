import urllib.request
import urllib.parse
import json
import sys
import time

BASE_URL = "http://localhost:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwiZXhwIjoxNzczMjg5OTYyfQ.ECO-TrDSDOAr4g6Dm63G3q1Fi2J9VABiRYJ5fJD29QU"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    if data:
        data = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 204:
                return None
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")
        print(e.read().decode("utf-8"))
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def verify_session_edit():
    print("Starting Session Edit verification...")

    # 1. Create a session to edit
    print("1. Creating dummy session...")
    create_payload = {
        "duration_minutes": 30,
        "status": "COMPLETED",
        "note": "Original Note",
        "category_id": None
    }
    session = request("POST", "/sessions/", create_payload)
    if not session:
        print("Create session failed")
        return False
    session_id = session["id"]
    print(f"Created session ID: {session_id}")

    # 2. Update the session
    print("2. Updating session...")
    update_payload = {
        "note": "Updated Note",
        "duration_minutes": 45,
        "category_id": None # Keeping same for now, or could change
    }
    updated_session = request("PUT", f"/sessions/{session_id}", update_payload)
    if not updated_session:
        print("Update session failed")
        return False
    
    if updated_session["note"] != "Updated Note":
        print("Update verification failed: Note not updated")
        return False
    if updated_session["duration_minutes"] != 45:
        print("Update verification failed: Duration not updated")
        return False
    
    print("Update verified.")

    # 3. Verify in Dashboard Data (mock check by getting session list)
    print("3. Verifying persistence...")
    sessions = request("GET", "/sessions/")
    found = any(s["id"] == session_id and s["note"] == "Updated Note" for s in sessions)
    if not found:
        print("Persistence verification failed")
        return False
    
    print("All verification steps passed!")
    return True

if __name__ == "__main__":
    if verify_session_edit():
        sys.exit(0)
    else:
        sys.exit(1)
