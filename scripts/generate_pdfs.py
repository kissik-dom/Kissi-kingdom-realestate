"""Generate property PDFs organized by category, country, and property type."""
import json
import os
import asyncio

# We'll generate HTML and convert to PDF
from weasyprint import HTML

PDF_DIR = "/work/temp/pdfs"
os.makedirs(PDF_DIR, exist_ok=True)

CATEGORY_LABELS = {
    "ivy_league": "Ivy League & Ivy Plus Schools",
    "international": "International Top Cities",
    "minerals": "Precious Minerals",
    "wineries": "Wineries & Vineyards",
    "farms_large": "Large-Scale Farms",
    "farms_cattle": "Cattle Farms",
    "farms_specialty": "Specialty Fruit & Spice Farms",
    "nyc_commercial": "NYC & NJ Commercial",
    "nyc_apartments": "NYC & Brooklyn Apartments",
    "hbcu": "HBCU Properties",
    "arenas": "Arenas & Venues",
    "nba_nfl_land": "NBA/NFL City Land",
}

CSS = """
@page { size: A4 landscape; margin: 1.5cm; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9px; color: #1a1a2e; }
h1 { color: #c5972c; font-size: 18px; border-bottom: 2px solid #c5972c; padding-bottom: 5px; margin-bottom: 10px; }
h2 { color: #0f1d3a; font-size: 14px; margin: 15px 0 5px; }
.subtitle { color: #666; font-size: 11px; margin-bottom: 15px; }
.crown { font-size: 14px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
th { background: #0f1d3a; color: #c5972c; padding: 5px 4px; text-align: left; font-size: 8px; text-transform: uppercase; }
td { padding: 4px; border-bottom: 1px solid #e0e0e0; font-size: 8px; vertical-align: top; }
tr:nth-child(even) { background: #f8f8fc; }
.footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #c5972c; font-size: 8px; color: #666; text-align: center; }
.stats { background: #0f1d3a; color: white; padding: 8px 15px; border-radius: 5px; margin-bottom: 15px; display: flex; }
.stat { margin-right: 30px; }
.stat-num { color: #c5972c; font-weight: bold; font-size: 14px; }
.stat-label { font-size: 9px; }
"""

def format_price(prop):
    if prop.get("priceLabel"):
        return prop["priceLabel"]
    if prop.get("price"):
        p = prop["price"]
        if p >= 1_000_000:
            return f"${p/1_000_000:,.1f}M"
        elif p >= 1_000:
            return f"${p:,.0f}"
        return f"${p:,.2f}"
    return "Contact for Price"

def make_table_rows(props):
    rows = ""
    for i, p in enumerate(props[:500]):  # Max 500 per PDF
        rows += f"""<tr>
            <td>{i+1}</td>
            <td><b>{p.get('title', 'N/A')}</b></td>
            <td>{p.get('propertyType', 'N/A').title()}</td>
            <td>{format_price(p)}</td>
            <td>{p.get('country', 'N/A')}</td>
            <td>{p.get('city', 'N/A')}</td>
            <td>{p.get('state', '') or ''}</td>
            <td>{f"{p['acreage']:,.1f} ac" if p.get('acreage') else ''}</td>
            <td>{p.get('brokerName', '') or ''}</td>
            <td>{p.get('brokerEmail', '') or ''}</td>
            <td>{'✓' if p.get('isVerified') else '○'}</td>
        </tr>"""
    return rows

def make_html(title, subtitle, props, category_label=""):
    countries = len(set(p.get("country", "") for p in props))
    verified = sum(1 for p in props if p.get("isVerified"))
    
    return f"""<!DOCTYPE html>
<html>
<head><style>{CSS}</style></head>
<body>
<h1><span class="crown">👑</span> SOVEREIGN AUTHORITY OF THE ROYAL HOUSE OF KISSI™</h1>
<div class="subtitle">Global Real Estate Portfolio — {title}</div>

<div class="stats">
    <div class="stat"><span class="stat-num">{len(props):,}</span><br><span class="stat-label">Properties</span></div>
    <div class="stat"><span class="stat-num">{countries}</span><br><span class="stat-label">Countries</span></div>
    <div class="stat"><span class="stat-num">{verified}</span><br><span class="stat-label">Verified</span></div>
</div>

{f'<h2>{category_label}</h2>' if category_label else ''}
{f'<p>{subtitle}</p>' if subtitle else ''}

<table>
<thead>
<tr>
    <th>#</th><th>Property Name</th><th>Type</th><th>Price</th><th>Country</th><th>City</th><th>State</th><th>Acreage</th><th>Broker</th><th>Email</th><th>Verified</th>
</tr>
</thead>
<tbody>
{make_table_rows(props)}
</tbody>
</table>

<div class="footer">
    CONFIDENTIAL — Kissi Kingdom Global Real Estate Portfolio | Timothy Daniel, Esq., Ohio Bar No. 18978 | kissikingdomoffice@gmail.com
</div>
</body>
</html>"""

def generate_pdf(filename, html_content):
    path = os.path.join(PDF_DIR, filename)
    try:
        HTML(string=html_content).write_pdf(path)
        size = os.path.getsize(path)
        print(f"  ✓ {filename} ({size//1024}KB)")
        return path
    except Exception as e:
        print(f"  ✗ {filename}: {e}")
        return None

def main():
    with open("/tmp/properties.json") as f:
        all_props = json.load(f)
    
    print(f"Generating PDFs for {len(all_props)} properties...\n")
    
    pdfs = []
    
    # 1. Master catalog
    html = make_html("Complete Property Catalog", f"All {len(all_props):,} properties across all categories", all_props)
    p = generate_pdf("00_Master_Property_Catalog.pdf", html)
    if p: pdfs.append(p)
    
    # 2. By category
    by_cat = {}
    for prop in all_props:
        cat = prop.get("category", "unknown")
        by_cat.setdefault(cat, []).append(prop)
    
    for cat, props in sorted(by_cat.items()):
        label = CATEGORY_LABELS.get(cat, cat.replace("_", " ").title())
        safe_cat = cat.replace("/", "_").replace(" ", "_")
        html = make_html(label, f"{len(props)} properties", props, label)
        p = generate_pdf(f"01_Category_{safe_cat}.pdf", html)
        if p: pdfs.append(p)
    
    # 3. By country (for countries with 10+ properties)
    by_country = {}
    for prop in all_props:
        country = prop.get("country", "Unknown")
        by_country.setdefault(country, []).append(prop)
    
    for country, props in sorted(by_country.items()):
        if len(props) >= 5:
            safe = country.replace(" ", "_").replace("/", "_")[:30]
            html = make_html(f"Properties in {country}", f"{len(props)} properties", props)
            p = generate_pdf(f"02_Country_{safe}.pdf", html)
            if p: pdfs.append(p)
    
    # 4. By property type
    by_type = {}
    for prop in all_props:
        ptype = prop.get("propertyType", "Unknown")
        by_type.setdefault(ptype, []).append(prop)
    
    for ptype, props in sorted(by_type.items()):
        if len(props) >= 5:
            safe = ptype.replace(" ", "_").replace("/", "_")[:30]
            html = make_html(f"{ptype.title()} Properties", f"{len(props)} properties", props)
            p = generate_pdf(f"03_Type_{safe}.pdf", html)
            if p: pdfs.append(p)
    
    print(f"\n✅ Generated {len(pdfs)} PDFs in {PDF_DIR}")
    
    # Save list for upload
    with open("/tmp/pdf_list.json", "w") as f:
        json.dump(pdfs, f)

if __name__ == "__main__":
    main()
