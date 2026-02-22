import requests
import os
import json
from urllib.parse import urlparse

# --- Config ---
INPUT_FILE = "zillow_results.json"   # your downloaded Apify output JSON
OUTPUT_DIR = "house_data"
PHOTOS_DIR = os.path.join(OUTPUT_DIR, "photos")
MAX_PHOTOS_PER_HOUSE = 5

os.makedirs(PHOTOS_DIR, exist_ok=True)

BASE_URL_TEMPLATE = "https://photos.zillowstatic.com/fp/{photoKey}-p_e.jpg"

def build_photo_urls(listing):
    """Extract up to MAX_PHOTOS_PER_HOUSE photo URLs from a listing."""
    carousel = listing.get("carouselPhotosComposable", {})
    
    # Prefer house-specific photos, fall back to community photos
    photo_data = carousel.get("photoData") or carousel.get("communityPhotoData") or []
    
    urls = []
    for item in photo_data[:MAX_PHOTOS_PER_HOUSE]:
        key = item.get("photoKey")
        if key:
            urls.append(BASE_URL_TEMPLATE.format(photoKey=key))
    
    # If no carousel data, fall back to the single imgSrc
    if not urls and listing.get("imgSrc"):
        urls.append(listing["imgSrc"])
    
    return urls

def download_photo(url, filepath):
    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(resp.content)
            return True
    except Exception as e:
        print(f"    Failed: {e}")
    return False

# Load your Apify output
with open(INPUT_FILE, "r") as f:
    listings = json.load(f)

print(f"Loaded {len(listings)} listings")

clean_data = []
skipped = 0

for i, listing in enumerate(listings):
    price = listing.get("unformattedPrice")
    lat_long = listing.get("latLong", {})
    lat = lat_long.get("latitude")
    lng = lat_long.get("longitude")

    # Skip listings missing critical fields
    if not price or not lat or not lng:
        skipped += 1
        continue

    photo_urls = build_photo_urls(listing)
    if not photo_urls:
        skipped += 1
        continue

    # Download photos
    local_photos = []
    for j, url in enumerate(photo_urls):
        ext = ".jpg"
        filename = f"house_{i:04d}_photo_{j}{ext}"
        filepath = os.path.join(PHOTOS_DIR, filename)
        if download_photo(url, filepath):
            local_photos.append(filename)

    if not local_photos:
        skipped += 1
        continue

    home_info = listing.get("hdpData", {}).get("homeInfo", {})

    clean_data.append({
        "id": i,
        "zpid": listing.get("zpid"),
        "address": listing.get("address"),
        "city": listing.get("addressCity"),
        "state": listing.get("addressState"),
        "zipcode": listing.get("addressZipcode"),
        "price": price,
        "bedrooms": listing.get("beds"),
        "bathrooms": listing.get("baths"),
        "sqft": listing.get("area"),
        "homeType": home_info.get("homeType"),
        "latitude": lat,
        "longitude": lng,
        "photos": local_photos,
        "detailUrl": listing.get("detailUrl"),
    })

    if (i + 1) % 50 == 0:
        print(f"  Processed {i+1}/{len(listings)} — saved {len(clean_data)} so far...")

# Save master dataset
out_path = os.path.join(OUTPUT_DIR, "houses.json")
with open(out_path, "w") as f:
    json.dump(clean_data, f, indent=2)

print(f"\nDone!")
print(f"  Saved: {len(clean_data)} houses")
print(f"  Skipped: {skipped} (missing price, location, or photos)")
print(f"  Dataset: {out_path}")
print(f"  Photos:  {PHOTOS_DIR}/")
