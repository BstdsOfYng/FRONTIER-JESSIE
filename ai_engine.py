import google.generativeai as genai
import json
import logging
import os
from typing import Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIEngine:
    """
    Uses Gemini AI to analyze CI logs and propose code fixes.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY must be provided or set in environment.")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    def generate_fix(self, logs: str, diffs: str) -> Dict[str, str]:
        """
        Analyzes logs and diffs to produce a structured fix.
        """
        prompt = (
            "You are an expert software engineer. Analyze the following CI failure logs and file diffs. "
            "Provide a fix that resolves the issue.\n\n"
            f"CI LOGS:\n{logs}\n\n"
            f"FILE DIFFS:\n{diffs}\n\n"
            "You MUST respond exclusively in valid JSON format with the following keys:\n"
            "- 'file_path': The path to the file that needs to be modified.\n"
            "- 'original_code': The exact block of code that needs to be replaced.\n"
            "- 'replacement_code': The corrected block of code.\n\n"
            "Do not include markdown formatting like ```json ... ``` in your response. "
            "Output ONLY the JSON object."
        )

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Basic cleaning in case AI still uses markdown blocks
            if text.startswith("```json"):
                text = text.replace("```json", "", 1).replace("```", "", -1).strip()
            elif text.startswith("```"):
                text = text.replace("```", "", 2).strip()

            fix = json.loads(text)
            
            # Validation of required keys
            required_keys = {'file_path', 'original_code', 'replacement_code'}
            if not required_keys.issubset(fix.keys()):
                raise KeyError(f"AI response missing required keys: {required_keys - fix.keys()}")
            
            return fix

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI JSON response: {e}")
            raise RuntimeError("AI Engine produced invalid JSON.")
        except Exception as e:
            logger.error(f"AI Engine error: {e}")
            raise
