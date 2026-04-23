"""Parse web search results into structured properties and import to Convex."""
import json
import re
import subprocess
import time
import hashlib

def extract_properties_from_search(result):
    """Extract individual property listings from a search result."""
    text = result.get("results", "")
    category = result.get("category", "international")
    
    properties = []
    
    # Split by numbered items or URL patterns
    lines = text.split("\n")
    current_prop = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect new listing (numbered or URL)
        url_match = re.search(r'URL:\s*(https?://\S+)', line)
        price_match = re.search(r'\$[\d,]+(?:\.\d+)?(?:\s*[MmKk])?|\$[\d.]+\s*(?:million|Million|M)', line)
        
        if url_match:
            current_prop["listingUrl"] = url_match.group(1)
        
        if price_match:
            price_str = price_match.group(0)
            current_prop["priceLabel"] = price_str
            # Parse numeric price
            clean = re.sub(r'[^\d.MmKk]', '', price_str.replace(',', ''))
            try:
                if 'M' in clean or 'm' in clean or 'million' in line.lower():
                    num = float(re.sub(r'[MmKk]', '', clean))
                    current_prop["price"] = num * 1_000_000
                elif 'K' in clean or 'k' in clean:
                    num = float(re.sub(r'[MmKk]', '', clean))
                    current_prop["price"] = num * 1_000
                else:
                    current_prop["price"] = float(clean)
            except:
                pass
        
        # Extract property name from snippet
        if re.match(r'^\d+\.', line):
            # Save previous if exists
            if current_prop.get("title"):
                properties.append(current_prop)
            current_prop = {"category": category}
            # Extract title
            title = re.sub(r'^\d+\.\s*', '', line).strip()
            if title:
                current_prop["title"] = title[:200]
        
        # Extract location hints
        state_match = re.search(r'\b([A-Z]{2})\b', line)
        city_match = re.search(r'(?:in|near|at)\s+([A-Za-z\s]+?)(?:,|\.|$)', line)
        
        if "acres" in line.lower():
            acre_match = re.search(r'([\d,.]+)\s*(?:\+\s*)?acres', line.lower())
            if acre_match:
                try:
                    current_prop["acreage"] = float(acre_match.group(1).replace(',', ''))
                except:
                    pass
        
        if "bed" in line.lower():
            bed_match = re.search(r'(\d+)\s*bed', line.lower())
            if bed_match:
                current_prop["bedrooms"] = int(bed_match.group(1))
        
        if "bath" in line.lower():
            bath_match = re.search(r'(\d+)\s*bath', line.lower())
            if bath_match:
                current_prop["bathrooms"] = int(bath_match.group(1))
        
        if "sq ft" in line.lower() or "sqft" in line.lower():
            sqft_match = re.search(r'([\d,]+)\s*(?:sq\s*ft|sqft)', line.lower())
            if sqft_match:
                try:
                    current_prop["squareFeet"] = int(sqft_match.group(1).replace(',', ''))
                except:
                    pass
    
    # Don't forget the last one
    if current_prop.get("title"):
        properties.append(current_prop)
    
    return properties

# Category to property type mapping
CAT_TO_TYPE = {
    "ivy_league": "residential",
    "international": "residential",
    "minerals": "mining",
    "wineries": "winery",
    "farms_large": "farm",
    "farms_cattle": "ranch",
    "farms_specialty": "farm",
    "nyc_commercial": "commercial",
    "nyc_apartments": "apartment",
    "hbcu": "residential",
    "arenas": "entertainment",
    "nba_nfl_land": "land",
}

# Category location hints
CAT_LOCATIONS = {
    "ivy_league": {"country": "United States"},
    "nyc_commercial": {"country": "United States", "city": "New York"},
    "nyc_apartments": {"country": "United States", "city": "New York"},
    "hbcu": {"country": "United States"},
    "nba_nfl_land": {"country": "United States"},
    "arenas": {"country": "United States"},
}

def infer_location(prop, query):
    """Try to infer country/city from the query and property data."""
    country = "United States"
    city = ""
    
    # Check query for location
    location_hints = {
        "London": ("United Kingdom", "London"),
        "Paris": ("France", "Paris"),
        "Monaco": ("Monaco", "Monaco"),
        "Milan": ("Italy", "Milan"),
        "Italy": ("Italy", ""),
        "Tokyo": ("Japan", "Tokyo"),
        "Japan": ("Japan", ""),
        "Singapore": ("Singapore", "Singapore"),
        "Philippines": ("Philippines", ""),
        "Cebu": ("Philippines", "Cebu"),
        "Dubai": ("United Arab Emirates", "Dubai"),
        "Seoul": ("South Korea", "Seoul"),
        "Colombia": ("Colombia", ""),
        "Myanmar": ("Myanmar", ""),
        "Sri Lanka": ("Sri Lanka", ""),
        "South Africa": ("South Africa", ""),
        "Botswana": ("Botswana", ""),
        "Australia": ("Australia", ""),
        "Queensland": ("Australia", "Queensland"),
        "Argentina": ("Argentina", ""),
        "Mendoza": ("Argentina", "Mendoza"),
        "Patagonia": ("Argentina", "Patagonia"),
        "Brazil": ("Brazil", ""),
        "Bordeaux": ("France", "Bordeaux"),
        "Tuscany": ("Italy", "Tuscany"),
        "Barossa": ("Australia", "Barossa Valley"),
        "Napa": ("United States", "Napa Valley"),
        "Willamette": ("United States", "Willamette Valley"),
        "Madagascar": ("Madagascar", ""),
        "India": ("India", ""),
        "Cambridge": ("United States", "Cambridge"),
        "New Haven": ("United States", "New Haven"),
        "Princeton": ("United States", "Princeton"),
        "Providence": ("United States", "Providence"),
        "Hanover": ("United States", "Hanover"),
        "Ithaca": ("United States", "Ithaca"),
        "Philadelphia": ("United States", "Philadelphia"),
        "Manhattan": ("United States", "New York"),
        "Brooklyn": ("United States", "Brooklyn"),
        "NYC": ("United States", "New York"),
        "New York": ("United States", "New York"),
        "Jersey City": ("United States", "Jersey City"),
        "New Jersey": ("United States", "New Jersey"),
        "Atlanta": ("United States", "Atlanta"),
        "Washington DC": ("United States", "Washington DC"),
        "Hampton": ("United States", "Hampton"),
        "Dallas": ("United States", "Dallas"),
        "Los Angeles": ("United States", "Los Angeles"),
        "Denver": ("United States", "Denver"),
        "Phoenix": ("United States", "Phoenix"),
        "Montana": ("United States", "Montana"),
        "Wyoming": ("United States", "Wyoming"),
        "Texas": ("United States", "Texas"),
        "Colorado": ("United States", "Colorado"),
        "Nebraska": ("United States", "Nebraska"),
        "Arizona": ("United States", "Arizona"),
        "Nevada": ("United States", "Nevada"),
        "Oregon": ("United States", "Oregon"),
    }
    
    for hint, (c, ci) in location_hints.items():
        if hint.lower() in query.lower():
            country = c
            if ci:
                city = ci
            break
    
    return country, city or "Various"

def run_bulk_create(batch):
    """Send a batch of properties to Convex."""
    payload = json.dumps({"properties": batch})
    result = subprocess.run(
        ["bunx", "convex", "run", "--no-push", "properties:bulkCreate", payload],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        cwd="/work/viktor-spaces/kissi-kingdom-hub"
    )
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[:200]}")
        return 0
    try:
        return int(result.stdout.strip())
    except:
        return len(batch)

def main():
    with open("/work/temp/property_search_results.json") as f:
        search_results = json.load(f)
    
    all_properties = []
    seen_titles = set()
    
    for sr in search_results:
        raw_props = extract_properties_from_search(sr)
        category = sr["category"]
        query = sr["query"]
        
        for rp in raw_props:
            title = rp.get("title", "").strip()
            if not title or len(title) < 5:
                continue
            
            # Dedupe
            title_hash = hashlib.md5(title.lower().encode()).hexdigest()
            if title_hash in seen_titles:
                continue
            seen_titles.add(title_hash)
            
            country, city = infer_location(rp, query)
            
            prop = {
                "title": title,
                "description": f"Property listing found via web search. Category: {category.replace('_', ' ').title()}. {title}",
                "currency": "USD",
                "country": country,
                "city": city,
                "category": category,
                "propertyType": CAT_TO_TYPE.get(category, "residential"),
                "status": "available",
                "isVerified": False,  # Not yet verified
            }
            
            if rp.get("price"):
                prop["price"] = rp["price"]
            if rp.get("priceLabel"):
                prop["priceLabel"] = rp["priceLabel"]
            if rp.get("listingUrl"):
                prop["listingUrl"] = rp["listingUrl"]
            if rp.get("acreage"):
                prop["acreage"] = rp["acreage"]
            if rp.get("bedrooms"):
                prop["bedrooms"] = rp["bedrooms"]
            if rp.get("bathrooms"):
                prop["bathrooms"] = rp["bathrooms"]
            if rp.get("squareFeet"):
                prop["squareFeet"] = rp["squareFeet"]
            
            all_properties.append(prop)
    
    print(f"Extracted {len(all_properties)} unique properties from web search")
    
    # Count by category
    by_cat = {}
    for p in all_properties:
        by_cat[p["category"]] = by_cat.get(p["category"], 0) + 1
    for c, n in sorted(by_cat.items()):
        print(f"  {c}: {n}")
    
    if not all_properties:
        print("No properties to import!")
        return
    
    # Import in batches
    total = 0
    batch_size = 50
    for i in range(0, len(all_properties), batch_size):
        batch = all_properties[i:i+batch_size]
        count = run_bulk_create(batch)
        total += count
        print(f"  Imported batch {i//batch_size + 1}: {count} (total: {total})")
        time.sleep(0.3)
    
    print(f"\n✅ Imported {total} web-scraped properties")

if __name__ == "__main__":
    main()
