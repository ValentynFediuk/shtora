#!/usr/bin/env python3
"""
Script to setup Directus collections for SHTORA e-commerce
Uses only built-in libraries (urllib)
"""

import urllib.request
import urllib.error
import json
import ssl

BASE_URL = "http://localhost:8055"
EMAIL = "admin@shtora.ua"
PASSWORD = "admin123"

# Disable SSL verification for localhost
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

def make_request(url, data=None, method="GET", token=None):
    """Make HTTP request"""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return {"status": response.status, "data": json.loads(response.read().decode('utf-8'))}
    except urllib.error.HTTPError as e:
        return {"status": e.code, "data": json.loads(e.read().decode('utf-8'))}
    except Exception as e:
        return {"status": 0, "data": {"errors": [{"message": str(e)}]}}

def get_token():
    """Get authentication token"""
    result = make_request(f"{BASE_URL}/auth/login", {"email": EMAIL, "password": PASSWORD}, "POST")
    return result["data"]["data"]["access_token"]

def create_collection(token, name, icon, note):
    """Create a collection with UUID primary key"""
    data = {
        "collection": name,
        "meta": {"icon": icon, "note": note},
        "schema": {"name": name},
        "fields": [{
            "field": "id",
            "type": "uuid",
            "meta": {"hidden": True, "readonly": True, "interface": "input", "special": ["uuid"]},
            "schema": {"is_primary_key": True}
        }]
    }
    result = make_request(f"{BASE_URL}/collections", data, "POST", token)
    if result["status"] == 200:
        print(f"✓ Collection '{name}' created")
    else:
        msg = result["data"].get("errors", [{}])[0].get("message", "error")
        print(f"! Collection '{name}': {msg}")

def add_field(token, collection, field_data):
    """Add a field to collection"""
    result = make_request(f"{BASE_URL}/fields/{collection}", field_data, "POST", token)
    field_name = field_data.get("field", "unknown")
    if result["status"] == 200:
        print(f"  ✓ Field '{field_name}' added")
    else:
        err = result["data"].get("errors", [{}])[0].get("message", "error")
        if "already exists" in err:
            print(f"  - Field '{field_name}' exists")
        else:
            print(f"  ! Field '{field_name}': {err}")

def setup_categories(token):
    """Setup categories collection"""
    print("\n=== CATEGORIES ===")
    create_collection(token, "categories", "folder", "Категорії товарів")
    
    fields = [
        {"field": "slug", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_unique": True, "is_nullable": False}},
        {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False}},
        {"field": "description", "type": "text", "meta": {"interface": "input-multiline"}, "schema": {"is_nullable": True}},
        {"field": "image", "type": "uuid", "meta": {"interface": "file-image", "special": ["file"]}, "schema": {"is_nullable": True}},
        {"field": "parent", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}, "schema": {"is_nullable": True, "foreign_key_table": "categories", "foreign_key_column": "id"}},
        {"field": "products_count", "type": "integer", "meta": {"interface": "input", "default_value": 0}, "schema": {"is_nullable": False, "default_value": 0}},
    ]
    for field in fields:
        add_field(token, "categories", field)

def setup_products(token):
    """Setup products collection"""
    print("\n=== PRODUCTS ===")
    create_collection(token, "products", "shopping_cart", "Товари")
    
    fields = [
        {"field": "status", "type": "string", "meta": {"interface": "select-dropdown", "options": {"choices": [{"text": "Published", "value": "published"}, {"text": "Draft", "value": "draft"}, {"text": "Archived", "value": "archived"}]}, "default_value": "draft"}, "schema": {"default_value": "draft"}},
        {"field": "slug", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_unique": True, "is_nullable": False}},
        {"field": "name", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False}},
        {"field": "description", "type": "text", "meta": {"interface": "input-rich-text-html"}, "schema": {"is_nullable": True}},
        {"field": "price", "type": "decimal", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False, "numeric_precision": 10, "numeric_scale": 2}},
        {"field": "old_price", "type": "decimal", "meta": {"interface": "input"}, "schema": {"is_nullable": True, "numeric_precision": 10, "numeric_scale": 2}},
        {"field": "image", "type": "uuid", "meta": {"interface": "file-image", "special": ["file"]}, "schema": {"is_nullable": True}},
        {"field": "images", "type": "json", "meta": {"interface": "files", "special": ["files"]}, "schema": {"is_nullable": True}},
        {"field": "category", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"]}, "schema": {"is_nullable": True, "foreign_key_table": "categories", "foreign_key_column": "id"}},
        {"field": "sku", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False}},
        {"field": "material", "type": "string", "meta": {"interface": "input"}, "schema": {"is_nullable": True}},
        {"field": "color", "type": "string", "meta": {"interface": "input"}, "schema": {"is_nullable": True}},
        {"field": "width", "type": "integer", "meta": {"interface": "input"}, "schema": {"is_nullable": True}},
        {"field": "height", "type": "integer", "meta": {"interface": "input"}, "schema": {"is_nullable": True}},
        {"field": "in_stock", "type": "boolean", "meta": {"interface": "boolean", "default_value": True}, "schema": {"is_nullable": False, "default_value": True}},
        {"field": "is_new", "type": "boolean", "meta": {"interface": "boolean", "default_value": False}, "schema": {"is_nullable": False, "default_value": False}},
        {"field": "is_hit", "type": "boolean", "meta": {"interface": "boolean", "default_value": False}, "schema": {"is_nullable": False, "default_value": False}},
        {"field": "rating", "type": "decimal", "meta": {"interface": "input", "default_value": 0}, "schema": {"is_nullable": False, "default_value": 0, "numeric_precision": 3, "numeric_scale": 2}},
        {"field": "reviews_count", "type": "integer", "meta": {"interface": "input", "default_value": 0}, "schema": {"is_nullable": False, "default_value": 0}},
        {"field": "date_created", "type": "timestamp", "meta": {"interface": "datetime", "special": ["date-created"], "readonly": True, "hidden": True}, "schema": {"is_nullable": True}},
        {"field": "date_updated", "type": "timestamp", "meta": {"interface": "datetime", "special": ["date-updated"], "readonly": True, "hidden": True}, "schema": {"is_nullable": True}},
    ]
    for field in fields:
        add_field(token, "products", field)

def setup_orders(token):
    """Setup orders collection"""
    print("\n=== ORDERS ===")
    create_collection(token, "orders", "receipt", "Замовлення")
    
    fields = [
        {"field": "order_number", "type": "string", "meta": {"interface": "input", "readonly": True}, "schema": {"is_unique": True, "is_nullable": False}},
        {"field": "status", "type": "string", "meta": {"interface": "select-dropdown", "options": {"choices": [{"text": "Нове", "value": "new"}, {"text": "В обробці", "value": "processing"}, {"text": "Відправлено", "value": "shipped"}, {"text": "Доставлено", "value": "delivered"}, {"text": "Скасовано", "value": "cancelled"}]}, "default_value": "new"}, "schema": {"default_value": "new"}},
        {"field": "items", "type": "json", "meta": {"interface": "input-code", "options": {"language": "json"}}, "schema": {"is_nullable": False}},
        {"field": "subtotal", "type": "decimal", "meta": {"interface": "input"}, "schema": {"is_nullable": False, "numeric_precision": 10, "numeric_scale": 2}},
        {"field": "shipping", "type": "decimal", "meta": {"interface": "input", "default_value": 0}, "schema": {"is_nullable": False, "numeric_precision": 10, "numeric_scale": 2, "default_value": 0}},
        {"field": "discount", "type": "decimal", "meta": {"interface": "input", "default_value": 0}, "schema": {"is_nullable": False, "numeric_precision": 10, "numeric_scale": 2, "default_value": 0}},
        {"field": "total", "type": "decimal", "meta": {"interface": "input"}, "schema": {"is_nullable": False, "numeric_precision": 10, "numeric_scale": 2}},
        {"field": "customer_first_name", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False}},
        {"field": "customer_last_name", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False}},
        {"field": "customer_email", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False}},
        {"field": "customer_phone", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False}},
        {"field": "shipping_city", "type": "string", "meta": {"interface": "input"}, "schema": {"is_nullable": True}},
        {"field": "shipping_warehouse", "type": "string", "meta": {"interface": "input"}, "schema": {"is_nullable": True}},
        {"field": "payment_method", "type": "string", "meta": {"interface": "select-dropdown", "options": {"choices": [{"text": "Карткою онлайн", "value": "card"}, {"text": "При отриманні", "value": "cod"}]}}, "schema": {"is_nullable": False}},
        {"field": "payment_status", "type": "string", "meta": {"interface": "select-dropdown", "options": {"choices": [{"text": "Очікує оплати", "value": "pending"}, {"text": "Оплачено", "value": "paid"}, {"text": "Повернено", "value": "refunded"}]}, "default_value": "pending"}, "schema": {"default_value": "pending"}},
        {"field": "notes", "type": "text", "meta": {"interface": "input-multiline"}, "schema": {"is_nullable": True}},
        {"field": "date_created", "type": "timestamp", "meta": {"interface": "datetime", "special": ["date-created"], "readonly": True}, "schema": {"is_nullable": True}},
        {"field": "date_updated", "type": "timestamp", "meta": {"interface": "datetime", "special": ["date-updated"], "readonly": True, "hidden": True}, "schema": {"is_nullable": True}},
    ]
    for field in fields:
        add_field(token, "orders", field)

def setup_reviews(token):
    """Setup reviews collection"""
    print("\n=== REVIEWS ===")
    create_collection(token, "reviews", "star", "Відгуки")
    
    fields = [
        {"field": "product", "type": "uuid", "meta": {"interface": "select-dropdown-m2o", "special": ["m2o"], "required": True}, "schema": {"is_nullable": False, "foreign_key_table": "products", "foreign_key_column": "id"}},
        {"field": "author", "type": "string", "meta": {"interface": "input", "required": True}, "schema": {"is_nullable": False}},
        {"field": "rating", "type": "integer", "meta": {"interface": "select-dropdown", "options": {"choices": [{"text": "1", "value": 1}, {"text": "2", "value": 2}, {"text": "3", "value": 3}, {"text": "4", "value": 4}, {"text": "5", "value": 5}]}, "required": True}, "schema": {"is_nullable": False}},
        {"field": "text", "type": "text", "meta": {"interface": "input-multiline"}, "schema": {"is_nullable": True}},
        {"field": "is_verified", "type": "boolean", "meta": {"interface": "boolean", "default_value": False}, "schema": {"is_nullable": False, "default_value": False}},
        {"field": "date_created", "type": "timestamp", "meta": {"interface": "datetime", "special": ["date-created"], "readonly": True}, "schema": {"is_nullable": True}},
    ]
    for field in fields:
        add_field(token, "reviews", field)

def setup_public_permissions(token):
    """Setup public read permissions"""
    print("\n=== PUBLIC PERMISSIONS ===")
    
    # Get public role ID
    result = make_request(f"{BASE_URL}/roles", None, "GET", token)
    roles = result["data"].get("data", [])
    public_role = None
    for role in roles:
        if role.get("name") == "Public":
            public_role = role.get("id")
            break
    
    if not public_role:
        print("! Public role not found")
        return
    
    # Add read permissions
    for collection in ["categories", "products", "reviews", "directus_files"]:
        data = {
            "role": public_role,
            "collection": collection,
            "action": "read",
            "permissions": {},
            "validation": {},
            "presets": {},
            "fields": ["*"]
        }
        result = make_request(f"{BASE_URL}/permissions", data, "POST", token)
        if result["status"] == 200:
            print(f"✓ Public read for '{collection}'")
        else:
            err = result["data"].get("errors", [{}])[0].get("message", "error")
            print(f"! {collection}: {err}")

def main():
    print("=" * 50)
    print("SHTORA Directus Setup")
    print("=" * 50)
    
    print("\nGetting token...")
    token = get_token()
    print("✓ Token OK")
    
    setup_categories(token)
    setup_products(token)
    setup_orders(token)
    setup_reviews(token)
    setup_public_permissions(token)
    
    print("\n" + "=" * 50)
    print("Setup complete!")
    print("=" * 50)
    print("\nDirectus: http://localhost:8055")
    print("Login: admin@shtora.ua / admin123")

if __name__ == "__main__":
    main()
