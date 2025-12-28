#!/usr/bin/env python3
import urllib.request
import json

BASE_URL = "https://shtora-production.up.railway.app"

# Get token
data = json.dumps({"email": "admin@shtora.ua", "password": "admin123"}).encode()
req = urllib.request.Request(f"{BASE_URL}/auth/login", data=data, headers={"Content-Type": "application/json"}, method="POST")
resp = urllib.request.urlopen(req)
token = json.loads(resp.read())["data"]["access_token"]
print("Token OK")

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Create Public role
role_data = json.dumps({
    "name": "Public",
    "icon": "public", 
    "description": "Public access role",
    "admin_access": False,
    "app_access": False
}).encode()

req = urllib.request.Request(f"{BASE_URL}/roles", data=role_data, headers=headers, method="POST")
try:
    resp = urllib.request.urlopen(req)
    role = json.loads(resp.read())
    public_role_id = role["data"]["id"]
    print(f"Public role created: {public_role_id}")
except urllib.error.HTTPError as e:
    error = json.loads(e.read())
    print(f"Role error: {error}")
    public_role_id = None

# Always use null for anonymous/public access
public_role_id = None
print("Using null role for anonymous permissions")

# Add permissions
collections = ["categories", "products", "reviews", "directus_files"]
for coll in collections:
    perm_data = json.dumps({
        "role": None,
        "collection": coll,
        "action": "read",
        "permissions": {},
        "validation": {},
        "presets": None,
        "fields": ["*"]
    }).encode()
    
    req = urllib.request.Request(f"{BASE_URL}/permissions", data=perm_data, headers=headers, method="POST")
    try:
        resp = urllib.request.urlopen(req)
        print(f"OK: Public read for '{coll}'")
    except urllib.error.HTTPError as e:
        error = json.loads(e.read())
        print(f"Error {coll}: {error.get('errors', [{}])[0].get('message', 'unknown')}")

print("\nDone!")
