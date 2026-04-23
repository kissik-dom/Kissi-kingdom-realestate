"""Import 2,189 properties from Yumba's PDFs into Convex database."""
import json
import subprocess
import re
import time

def parse_price(price_str):
    """Extract numeric price from string like '$1,200,000' or '€1,200,000'."""
    if not price_str:
        return None, None, "USD"
    clean = re.sub(r'[^\d.,]', '', price_str.replace(',', ''))
    try:
        val = float(clean)
        return val, price_str, "EUR" if "€" in price_str else "USD"
    except:
        return None, price_str, "USD"

def parse_acreage(acreage_str):
    """Extract numeric acreage from string like '6.29 acres'."""
    if not acreage_str:
        return None
    match = re.search(r'([\d,.]+)', acreage_str.replace(',', ''))
    if match:
        try:
            return float(match.group(1))
        except:
            return None
    return None

TYPE_TO_CATEGORY = {
    "Ocean View": "international",
    "Luxury": "international",
    "Commercial": "nyc_commercial",
    "Farmland": "farms_large",
    "Winery": "wineries",
    "Large Properties": "farms_large",
    "Land": "nba_nfl_land",
}

TYPE_TO_PROPERTY_TYPE = {
    "Ocean View": "residential",
    "Luxury": "residential",
    "Commercial": "commercial",
    "Farmland": "farm",
    "Winery": "winery",
    "Large Properties": "land",
    "Land": "land",
}

def run_bulk_create(batch):
    """Send a batch of properties to Convex bulkCreate."""
    payload = json.dumps({"properties": batch})
    result = subprocess.run(
        ["bunx", "convex", "run", "--no-push", "properties:bulkCreate", payload],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        cwd="/work/viktor-spaces/kissi-kingdom-hub"
    )
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[:300]}")
        return 0
    try:
        return int(result.stdout.strip())
    except:
        return len(batch)

def main():
    with open("/work/temp/all_properties_complete.json") as f:
        data = json.load(f)
    
    all_props = []
    
    # Process global_db properties
    for p in data["global_db"]["properties"]:
        price_num, price_label, currency = parse_price(p.get("price", ""))
        ptype = p.get("type", "Unknown")
        category = TYPE_TO_CATEGORY.get(ptype, "international")
        prop_type = TYPE_TO_PROPERTY_TYPE.get(ptype, "residential")
        
        prop = {
            "title": p.get("property_name", "Unknown Property"),
            "description": f"{ptype} property in {p.get('city', '')}, {p.get('country', '')}. {p.get('property_name', '')}.",
            "currency": currency,
            "country": p.get("country", "Unknown"),
            "city": p.get("city", "") or p.get("state_region", "") or "Unknown",
            "state": p.get("state_region", "") or None,
            "category": category,
            "propertyType": prop_type,
            "subcategory": ptype,
            "status": "available",
            "isVerified": True,
            "brokerName": p.get("broker") or None,
            "brokerEmail": p.get("email") or None,
            "brokerPhone": p.get("whatsapp") or None,
            "listingUrl": p.get("website") or None,
        }
        if price_num:
            prop["price"] = price_num
        if price_label:
            prop["priceLabel"] = price_label
        
        # Remove None values (Convex doesn't like null for optional fields without explicit v.optional)
        prop = {k: v for k, v in prop.items() if v is not None}
        all_props.append(prop)
    
    # Process ocean_view properties
    for p in data["ocean_view"]["properties"]:
        price_num, price_label, currency = parse_price(p.get("price", ""))
        acreage = parse_acreage(p.get("acreage", ""))
        
        desc = p.get("notes", "") or f"Ocean view property in {p.get('city', '')}, {p.get('country', '')}."
        
        prop = {
            "title": p.get("property_name", "Unknown Property"),
            "description": desc,
            "currency": currency,
            "country": p.get("country", "Unknown"),
            "city": p.get("city", "") or p.get("state_region", "") or "Unknown",
            "state": p.get("state_region", "") or None,
            "category": "international",
            "propertyType": "residential",
            "subcategory": "Ocean View",
            "status": "available",
            "isVerified": True,
            "brokerName": p.get("broker") or None,
            "brokerEmail": p.get("email") or None,
            "brokerPhone": p.get("whatsapp") or None,
            "brokerCompany": p.get("broker") or None,
            "listingUrl": p.get("website") or None,
        }
        if price_num:
            prop["price"] = price_num
        if price_label:
            prop["priceLabel"] = price_label
        if acreage:
            prop["acreage"] = acreage
        
        prop = {k: v for k, v in prop.items() if v is not None}
        all_props.append(prop)
    
    print(f"Importing {len(all_props)} properties in batches of 50...")
    
    total_imported = 0
    batch_size = 50
    for i in range(0, len(all_props), batch_size):
        batch = all_props[i:i+batch_size]
        count = run_bulk_create(batch)
        total_imported += count
        print(f"  Batch {i//batch_size + 1}: {count} imported (total: {total_imported})")
        time.sleep(0.5)  # small delay between batches
    
    print(f"\n✅ Successfully imported {total_imported}/{len(all_props)} properties from PDFs")

if __name__ == "__main__":
    main()
