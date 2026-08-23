from deep_translator import GoogleTranslator


LANGUAGE_MARKERS = {
    "English": "en",
    "Hindi": "hi",
    "Bengali": "bn",
    "Tamil": "ta",
    "Telugu": "te",
    "Kannada": "kn",
    "Gujarati": "gu",
    "Marathi": "mr",
    "Punjabi": "pa",
    "Malayalam": "ml"
}

def translate_explanation(explanation: dict, target_lang: str) -> dict:
    """
    Translate the agricultural cards into the target language using deep-translator.
    """
    if not target_lang or target_lang.lower() == "english":
        return explanation
    
    lang_code = LANGUAGE_MARKERS.get(target_lang, "en")
    if lang_code == "en":
        return explanation
        
    translated_data = {}
    
    try:
        translator = GoogleTranslator(source='auto', target=lang_code)
    except Exception as e:
        print(f"Failed to initialize translator: {e}")
        return explanation
    
    for key, val in explanation.items():
        if isinstance(val, str):
            try:
                translated_data[key] = translator.translate(val)
            except Exception as e:
                print(f"Translation failed for {key}: {e}")
                translated_data[key] = val
        else:
            translated_data[key] = val
            
    return translated_data
