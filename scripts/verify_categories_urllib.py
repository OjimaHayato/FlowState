import urllib.request
import urllib.parse
import json
import sys

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

def verify_crud():
    print("Starting CRUD verification (urllib)...")
    
    # 1. Create
    print("1. Creating category...")
    create_payload = {"name": "TestVerifyUrllib", "color_code": "#123456"}
    cat = request("POST", "/categories/", create_payload)
    if not cat:
        print("Create failed")
        return False
    cat_id = cat["id"]
    print(f"Created category ID: {cat_id}")

    # 2. Update
    print("2. Updating category...")
    update_payload = {"name": "TestUpdatedUrllib", "color_code": "#abcdef"}
    updated_cat = request("PUT", f"/categories/{cat_id}", update_payload)
    if not updated_cat:
        print("Update failed")
        return False
    if updated_cat["name"] != "TestUpdatedUrllib":
        print("Update verification failed: Name not updated")
        return False
    print("Update verified.")

    # 3. List
    print("3. Listing categories...")
    categories = request("GET", "/categories/")
    if not categories:
        print("List failed")
        return False
    found = any(c["id"] == cat_id and c["name"] == "TestUpdatedUrllib" for c in categories)
    if not found:
        print("List verification failed: Updated category not found")
        return False
    print("List verified.")

    # 4. Delete
    print("4. Deleting category...")
    delete_res_code = 0
    url = f"{BASE_URL}/categories/{cat_id}"
    req = urllib.request.Request(url, headers=HEADERS, method="DELETE")
    try:
        with urllib.request.urlopen(req) as response:
            delete_res_code = response.status
    except urllib.error.HTTPError as e:
         print(f"Delete HTTP Error: {e.code}")
         return False
    
    if delete_res_code != 204:
        print(f"Delete failed: Status {delete_res_code}")
        return False
    print("Delete verified.")

    # 5. List and Verify Delete
    print("5. Verifying deletion...")
    categories = request("GET", "/categories/")
    found = any(c["id"] == cat_id for c in categories)
    if found:
        print("Deletion verification failed: Category still exists")
        return False
    
    print("All verification steps passed!")
    return True

if __name__ == "__main__":
    if verify_crud():
        sys.exit(0)
    else:
        sys.exit(1)
