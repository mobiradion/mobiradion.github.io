import csv
import json
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
files = [
    ("HindiRadiosCSV.csv", "hindi-data.js", "HINDI_RADIOS"),
    ("PunjabiRadiosCSV.csv", "punjabi-data.js", "PUNJABI_RADIOS"),
    ("MarathiRadiosCSV.csv", "marathi-data.js", "MARATHI_RADIOS"),
    ("KannadaRadiosCSV.csv", "kannada-data.js", "KANNADA_RADIOS"),
    ("TeluguRadiosCSV.csv", "telugu-data.js", "TELUGU_RADIOS"),
    ("MalayalamRadiosCSV.csv", "malayalam-data.js", "MALAYALAM_RADIOS"),
    ("AirRadiosCSV.csv", "air-data.js", "AIR_RADIOS"),
]

for csv_name, js_name, var_name in files:
    csv_path = os.path.join(base_dir, csv_name)
    js_path = os.path.join(base_dir, js_name)
    with open(csv_path, encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))

    stations = []
    for row in rows:
        stations.append({
            "title": (row.get("Name") or row.get("name") or row.get("Title") or "").strip(),
            "streamUrl": (row.get("URL") or row.get("Url") or row.get("url") or row.get("StreamURL") or "").strip(),
            "description": (row.get("Description") or row.get("description") or row.get("Desc") or "").strip(),
            "image": (row.get("Image") or row.get("image") or row.get("Img") or "").strip(),
        })

    content = f"window.{var_name} = {json.dumps(stations, ensure_ascii=False, indent=2)};\n"
    with open(js_path, "w", encoding="utf-8") as handle:
        handle.write(content)

    print(f"Wrote {js_name} with {len(stations)} stations")
