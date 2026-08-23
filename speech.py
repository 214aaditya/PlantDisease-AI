import os
import time
from gtts import gTTS
from config import OUTPUT_AUDIO_FOLDER
from utils.helper import clean_old_audio_files

def generate_speech(text: str, lang: str = 'en') -> str:
    """
    Generate speech audio file from text using gTTS.
    """
    
    clean_old_audio_files(max_files=10)
    
    filename = f"speech_{int(time.time())}.mp3"
    filepath = os.path.join(OUTPUT_AUDIO_FOLDER, filename)
    
    try:
        tts = gTTS(text=text, lang=lang)
        tts.save(filepath)
    except Exception as e:
        print(f"Error generating speech audio: {e}")
        
    return filename
