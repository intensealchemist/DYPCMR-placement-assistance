import os
from PIL import Image

assets_dir = r"d:\GH\DYPCMR-placement-assistance\mobile\assets"

files = [f for f in os.listdir(assets_dir) if f.endswith('.png')]

print(f"Checking {len(files)} files in {assets_dir}...")

for filename in files:
    filepath = os.path.join(assets_dir, filename)
    try:
        with Image.open(filepath) as img:
            print(f"Processing {filename}: Format={img.format}, Mode={img.mode}")
            
            # If it's not actually a PNG, convert and save it
            if img.format != 'PNG':
                print(f"  -> Converting {filename} from {img.format} to PNG...")
                # RGBA for transparency support if needed, though JPEGs usually RGB
                img = img.convert("RGBA") 
                img.save(filepath, "PNG")
                print(f"  -> Saved {filename} as PNG.")
            else:
                print(f"  -> {filename} is already a valid PNG.")
                
    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("Done.")
