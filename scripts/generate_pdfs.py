"""Generate property catalog PDFs separated by category, country, city, and type."""

import json
import os
import sys
import subprocess
from collections import defaultdict

# Query properties from Convex dev database
def get_properties():
    """Load properties from pre-fetched JSON file."""
    with open("/tmp/properties.json") as f:
        return json.load(f)


CATEGORY_LABELS = {
    "ivy_league": "Ivy League Properties",
    "international": "International Cities",
    "minerals": "Precious Minerals & Mining Rights",
    "wineries": "Wineries & Vineyards",
    "farms_large": "Large Farms & Agricultural Land",
    "farms_cattle": "Cattle Farms & Ranches",
    "farms_specialty": "Specialty Farms",
    "nyc_commercial": "NYC Commercial Properties",
    "nyc_apartments": "NYC Apartment Complexes",
    "hbcu": "HBCU Properties",
    "arenas": "Arenas & Entertainment Venues",
    "nba_nfl_land": "NBA/NFL Adjacent Land",
}

def format_price(prop):
    if prop.get("priceLabel"):
        return prop["priceLabel"]
    if prop.get("price"):
        p = prop["price"]
        if p >= 1_000_000:
            return f"${p/1_000_000:.1f}M {prop.get('currency', 'USD')}"
        elif p >= 1_000:
            return f"${p/1_000:.0f}K {prop.get('currency', 'USD')}"
        return f"${p:,.0f} {prop.get('currency', 'USD')}"
    return "Contact for Price"

def generate_html(title, subtitle, properties):
    rows = ""
    for i, p in enumerate(properties):
        bg = "#f9f8f5" if i % 2 == 0 else "#ffffff"
        details = []
        if p.get("acreage"): details.append(f"{p['acreage']} acres")
        if p.get("squareFeet"): details.append(f"{p['squareFeet']:,} sq ft")
        if p.get("stories"): details.append(f"{p['stories']} stories")
        if p.get("bedrooms"): details.append(f"{p['bedrooms']} bed")
        if p.get("bathrooms"): details.append(f"{p['bathrooms']} bath")
        detail_str = " · ".join(details) if details else "—"
        
        status_colors = {
            "available": "#2e7d32",
            "pending": "#f9a825",
            "sold": "#c62828",
            "off_market": "#757575",
        }
        status = p.get("status", "available")
        status_color = status_colors.get(status, "#757575")
        
        rows += f"""
        <tr style="background: {bg};">
            <td style="padding: 10px 12px; border-bottom: 1px solid #e8e3d9; font-weight: 600; color: #0f1d3a; font-size: 11px; max-width: 200px;">{p.get('title', 'N/A')}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e8e3d9; font-size: 10px; color: #555;">{p.get('city', '')}, {p.get('country', '')}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e8e3d9; font-size: 10px; color: #555;">{p.get('propertyType', '').replace('_', ' ').title()}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e8e3d9; font-size: 10px; color: #555;">{detail_str}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e8e3d9; font-size: 11px; font-weight: 600; color: #c5972c;">{format_price(p)}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e8e3d9;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; color: white; background: {status_color}; text-transform: uppercase;">{status}</span>
            </td>
        </tr>
        """
    
    # Group by country for summary
    by_country = defaultdict(int)
    by_type = defaultdict(int)
    for p in properties:
        by_country[p.get("country", "Unknown")] += 1
        by_type[p.get("propertyType", "Unknown")] += 1
    
    country_summary = ", ".join(f"{c} ({n})" for c, n in sorted(by_country.items()))
    type_summary = ", ".join(f"{t.replace('_', ' ').title()} ({n})" for t, n in sorted(by_type.items()))
    
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@page {{
    size: A4 landscape;
    margin: 15mm 15mm 20mm 15mm;
    @bottom-center {{
        content: "CONFIDENTIAL — Kissi Kingdom Sovereign Wealth Fund  |  Page " counter(page) " of " counter(pages);
        font-size: 7px;
        color: #999;
        font-family: 'Inter', 'Roboto', sans-serif;
    }}
}}
body {{
    font-family: 'Inter', 'Roboto', sans-serif;
    margin: 0;
    color: #333;
    line-height: 1.4;
}}
.header {{
    background: linear-gradient(135deg, #0f1d3a 0%, #1a2d55 100%);
    padding: 25px 30px;
    margin: -15mm -15mm 20px -15mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
}}
.header-left {{
    display: flex;
    align-items: center;
    gap: 15px;
}}
.crown {{
    width: 45px;
    height: 45px;
    background: linear-gradient(180deg, #c5972c, #a67c1e);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
}}
.header h1 {{
    color: white;
    font-size: 18px;
    margin: 0;
    font-weight: 700;
}}
.header .sovereign {{
    color: #c5972c;
    font-size: 8px;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 3px;
}}
.header .meta {{
    text-align: right;
    color: #8899bb;
    font-size: 9px;
    line-height: 1.6;
}}
.subtitle {{
    font-size: 12px;
    color: #666;
    margin-bottom: 6px;
}}
.summary {{
    background: #f5f2ec;
    border: 1px solid #e0d8cc;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;
    display: flex;
    gap: 40px;
}}
.summary-item {{
    font-size: 9px;
    color: #666;
}}
.summary-item strong {{
    display: block;
    font-size: 20px;
    color: #0f1d3a;
    margin-bottom: 2px;
}}
.summary-detail {{
    font-size: 8px;
    color: #888;
    margin-top: 10px;
    line-height: 1.5;
}}
table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
}}
th {{
    background: #0f1d3a;
    color: #c5972c;
    padding: 10px 12px;
    text-align: left;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
}}
th:first-child {{ border-radius: 4px 0 0 0; }}
th:last-child {{ border-radius: 0 4px 0 0; }}
</style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="crown">👑</div>
            <div>
                <h1>{title}</h1>
                <div class="sovereign">SOVEREIGN AUTHORITY OF THE ROYAL HOUSE OF KISSI™</div>
            </div>
        </div>
        <div class="meta">
            Kissi Kingdom Global Portfolio<br>
            Generated: April 2026<br>
            Classification: CONFIDENTIAL
        </div>
    </div>

    <p class="subtitle">{subtitle}</p>

    <div class="summary">
        <div class="summary-item">
            <strong>{len(properties)}</strong>
            Properties Listed
        </div>
        <div class="summary-item">
            <strong>{len(by_country)}</strong>
            Countries
        </div>
        <div class="summary-item">
            <strong>{len(by_type)}</strong>
            Property Types
        </div>
        <div class="summary-detail">
            <b>Countries:</b> {country_summary}<br>
            <b>Types:</b> {type_summary}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 25%;">Property</th>
                <th style="width: 18%;">Location</th>
                <th style="width: 12%;">Type</th>
                <th style="width: 20%;">Details</th>
                <th style="width: 13%;">Price</th>
                <th style="width: 12%;">Status</th>
            </tr>
        </thead>
        <tbody>
            {rows}
        </tbody>
    </table>
</body>
</html>"""


def main():
    print("Fetching properties from Convex...")
    properties = get_properties()
    print(f"Found {len(properties)} properties")
    
    if not properties:
        print("No properties found! Generating from seed data structure instead.")
        return
    
    output_dir = "/work/viktor-spaces/kissi-kingdom-hub/tmp/pdfs"
    os.makedirs(output_dir, exist_ok=True)
    
    # Group by category
    by_category = defaultdict(list)
    for p in properties:
        by_category[p.get("category", "unknown")].append(p)
    
    from weasyprint import HTML
    
    generated = []
    
    for cat_key, cat_props in sorted(by_category.items()):
        cat_label = CATEGORY_LABELS.get(cat_key, cat_key.replace("_", " ").title())
        
        # Group within category by country
        by_country = defaultdict(list)
        for p in cat_props:
            by_country[p.get("country", "Unknown")].append(p)
        
        # Generate main category PDF
        filename = f"{cat_key}_all.pdf"
        filepath = os.path.join(output_dir, filename)
        subtitle = f"Complete listing of all {cat_label} properties across {len(by_country)} countries"
        html_str = generate_html(cat_label, subtitle, cat_props)
        HTML(string=html_str).write_pdf(filepath)
        generated.append((cat_label, filename, len(cat_props)))
        print(f"  ✓ {filename} — {len(cat_props)} properties")
        
        # Generate per-country PDFs within category (only if multiple countries)
        if len(by_country) > 1:
            for country, country_props in sorted(by_country.items()):
                safe_country = country.replace(" ", "_").lower()
                filename = f"{cat_key}_{safe_country}.pdf"
                filepath = os.path.join(output_dir, filename)
                subtitle = f"{cat_label} — {country} ({len(country_props)} properties)"
                html_str = generate_html(f"{cat_label}: {country}", subtitle, country_props)
                HTML(string=html_str).write_pdf(filepath)
                print(f"    ✓ {filename} — {len(country_props)} properties")
    
    print(f"\n✅ Generated {len(os.listdir(output_dir))} PDFs in {output_dir}")
    
    # Generate master catalog
    filename = "master_portfolio_catalog.pdf"
    filepath = os.path.join(output_dir, filename)
    subtitle = f"Complete Kissi Kingdom portfolio — {len(properties)} properties across all categories"
    html_str = generate_html("Master Portfolio Catalog", subtitle, properties)
    HTML(string=html_str).write_pdf(filepath)
    print(f"  ✓ {filename} — {len(properties)} properties (MASTER)")


if __name__ == "__main__":
    main()
