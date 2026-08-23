import os
import uuid
from datetime import datetime
from config import ALLOWED_EXTENSIONS, OUTPUT_AUDIO_FOLDER

def allowed_file(filename: str) -> bool:
    """
    Check if the file extension is allowed.
    """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(filename: str) -> str:
    """
    Generate a unique filename using UUID to prevent collisions.
    """
    ext = filename.rsplit(".", 1)[1].lower()
    return f"{uuid.uuid4().hex}.{ext}"

def get_current_timestamp() -> dict:
    """
    Get current date and time formatted.
    """
    now = datetime.now()
    return {
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S")
    }

def clean_old_audio_files(max_files: int = 50):
    """
    Helper function to delete old audio files in output_audio directory
    to prevent excessive disk space consumption.
    """
    try:
        files = [
            os.path.join(OUTPUT_AUDIO_FOLDER, f)
            for f in os.listdir(OUTPUT_AUDIO_FOLDER)
            if f.endswith(".mp3")
        ]
        if len(files) > max_files:
            # Sort files by modification time (oldest first)
            files.sort(key=os.path.getmtime)
            for f in files[:-max_files]:
                if os.path.exists(f):
                    os.remove(f)
    except Exception as e:
        print(f"Error cleaning up audio files: {e}")
