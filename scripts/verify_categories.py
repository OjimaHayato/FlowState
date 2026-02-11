import requests
import json
import sys

BASE_URL = "http://localhost:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwiZXhwIjoxNzczMjg5OTYyfQ.ECO-TrDSDOAr4g6Dm63G3q1Fi2J9VABiRYJ5fJD29QU"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

def verify_crud():
    print("Starting CRUD verification...")
    
    # 1. Create
    print("1. Creating category...")
    create_payload = {"name": "TestVerify", "color_code": "#123456"}
    res = requests.post(f"{BASE_URL}/categories/", json=create_payload, headers=HEADERS)
    if res.status_code != 200:
        print(f"Create failed: {res.text}")
        return False
    cat = res.json()
    cat_id = cat["id"]
    print(f"Created category ID: {cat_id}")

    # 2. Update
    print("2. Updating category...")
    update_payload = {"name": "TestUpdated", "color_code": "#abcdef"}
    res = requests.put(f"{BASE_URL}/categories/{cat_id}", json=update_payload, headers=HEADERS)
    if res.status_code != 200:
        print(f"Update failed: {res.text}")
        return False
    updated_cat = res.json()
    if updated_cat["name"] != "TestUpdated":
        print("Update verification failed: Name not updated")
        return False
    print("Update verified.")

    # 3. List and Check
    print("3. Listing categories...")
    res = requests.get(f"{BASE_URL}/categories/", headers=HEADERS)
    categories = res.json()
    found = any(c["id"] == cat_id and c["name"] == "TestUpdated" for c in categories)
    if not found:
        print("List verification failed: Updated category not found")
        return False
    print("List verified.")

    # 4. Delete
    print("4. Deleting category...")
    res = requests.delete(f"{BASE_URL}/categories/{cat_id}", headers=HEADERS)
    if res.status_code != 204:
        print(f"Delete failed: {res.status_code}")
        return False
    print("Delete verified.")

    # 5. List and Verify Delete
    print("5. Verifying deletion...")
    res = requests.get(f"{BASE_URL}/categories/", headers=HEADERS)
    categories = res.json()
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
