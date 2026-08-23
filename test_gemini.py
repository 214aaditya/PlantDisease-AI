import os
from dotenv import load_dotenv
import google.generativeai as genai
import traceback

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
print(f"Key loaded: {GEMINI_API_KEY[:5]}...")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message("Hello, how are you?")
    print("Response:", response.text)
except Exception as e:
    print("Exception occurred:")
    traceback.print_exc()
