import subprocess
import sys

# Ensure required libraries are installed
try:
    import qrcode
    from PIL import Image
except ImportError:
    print("Required libraries ('qrcode' and/or 'pillow') not found. Installing them now...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "qrcode[pil]"])
    import qrcode
    from PIL import Image

def generate_static_qr():
    # The URL to encode
    url = "https://www.instagram.com/reel/DYXY80SshQG/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    
    # Configure QR Code parameters
    # version=None allows automatic sizing, error_correction=L is standard, box_size=10 is high res, border=4 is standard
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction allows logos or minor damage
        box_size=15,                                       # Size of each box (larger means higher resolution image)
        border=4,                                          # Standard white border size around the QR code
    )
    
    # Add data to the QR code
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create the QR Code image
    # Using a modern, clean dark charcoal (#1A1A1A) on a pure white background for premium aesthetic and high readability
    img = qr.make_image(fill_color="#1A1A1A", back_color="#FFFFFF")
    
    # Output file name
    output_filename = "instagram_reel_qr.png"
    img.save(output_filename)
    print(f"QR code successfully generated and saved as: '{output_filename}'")

if __name__ == "__main__":
    generate_static_qr()
