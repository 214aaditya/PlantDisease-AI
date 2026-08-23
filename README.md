# PlantDisease-AI

PlantDisease-AI is an intelligent plant disease detection and care system powered by AI. It analyzes plant leaves to detect diseases and provides actionable care instructions, utilizing advanced machine learning models and conversational AI for seamless interaction.

## Features

- **Plant Disease Detection:** Predicts plant diseases based on uploaded images of leaves.
- **AI Explanation & Care Guide:** Generates detailed insights, causes, and treatment methods.
- **Multilingual Support:** Translates insights and care instructions.
- **Voice Assistance:** Converts text instructions to speech for accessibility.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/debanjan-mondal-2005/PlantCare-AI.git
   ```

2. Set up the virtual environment and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Rename `.env.example` to `.env` and fill in any required API keys (e.g., Gemini AI).

4. Run the application:
   ```bash
   python app.py
   ```
   Or use the `start.bat` / `start.py` script provided.

## Directory Structure

- `app.py`: Main entry point for the web application.
- `predict.py`: Handles model inference for disease detection.
- `explain.py`, `speech.py`, `translate.py`: Helper modules for AI explanations, TTS, and translations.
- `model/`: Directory storing trained models (ignored by default).
- `uploads/`, `output_audio/`: Storage directories for user media.
- `static/`, `templates/`: Web frontend assets and HTML files.

## Acknowledgements

Developed by Debanjan Mondal.
