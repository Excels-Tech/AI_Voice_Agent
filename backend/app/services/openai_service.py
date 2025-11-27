from typing import List, Dict, Any, Optional
import asyncio
from openai import OpenAI

from app.core.config import settings

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class OpenAIService:
    """Service for OpenAI API interactions."""

    VALID_TTS_VOICES = {
        "nova",
        "shimmer",
        "echo",
        "onyx",
        "fable",
        "alloy",
        "ash",
        "sage",
        "coral",
    }
    DEFAULT_TTS_VOICE = "nova"
    
    def __init__(self):
        self.client = client

    def _prefer_fast_model(self, model: Optional[str]) -> str:
        """Pick a low-latency model when callers request heavier defaults."""
        if not model:
            return settings.OPENAI_MODEL or "gpt-4o-mini"
        slug = model.lower()
        slow_aliases = {
            "gpt-4",
            "gpt-4.1",
            "gpt-4-0125-preview",
            "gpt-4-turbo",
            "gpt-4.1-mini",
        }
        if slug in slow_aliases:
            return "gpt-4o-mini"
        return model

    def _normalize_voice(self, voice: Optional[str]) -> str:
        """Return a valid OpenAI TTS voice slug, falling back to default."""
        candidate = (voice or self.DEFAULT_TTS_VOICE).strip().lower()
        if candidate in self.VALID_TTS_VOICES:
            return candidate
        return self.DEFAULT_TTS_VOICE
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = settings.OPENAI_MODEL or "gpt-4o-mini",
        temperature: float = 0.6,
        max_tokens: int = 320,
        functions: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """Generate chat completion without blocking the event loop."""
        try:
            params = {
                "model": self._prefer_fast_model(model),
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "timeout": 20,
            }

            if functions:
                params["functions"] = functions
                params["function_call"] = "auto"

            response = await asyncio.to_thread(self.client.chat.completions.create, **params)

            return {
                "content": response.choices[0].message.content,
                "function_call": getattr(response.choices[0].message, "function_call", None),
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
            }
        except Exception as e:
            print(f"OpenAI chat completion error: {e}")
            raise
    
    async def text_to_speech(
        self,
        text: str,
        voice: Optional[str] = None,
        model: str = "tts-1",
    ) -> bytes:
        """Convert text to speech."""
        normalized_voice = self._normalize_voice(voice)
        try:
            response = await asyncio.to_thread(
                self.client.audio.speech.create,
                model=model,
                voice=normalized_voice,
                input=text,
                timeout=20,
            )
            return response.content
        except Exception as e:
            print(f"OpenAI TTS error: {e}")
            raise
    
    async def speech_to_text(
        self,
        audio_file: bytes,
        language: Optional[str] = None,
        file_extension: str = ".wav",
    ) -> Dict[str, Any]:
        """Transcribe audio to text using Whisper."""
        try:
            # Guard tiny payloads to avoid OpenAI 400s
            if not audio_file or len(audio_file) < 512:
                raise ValueError("Audio too short to transcribe")

            if not file_extension.startswith("."):
                file_extension = f".{file_extension}"

            import tempfile
            import os

            with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as temp_file:
                temp_file.write(audio_file)
                temp_file_path = temp_file.name

            def _transcribe(path: str):
                with open(path, "rb") as audio:
                    params = {
                        "model": "whisper-1",
                        "file": audio,
                    }
                    if language:
                        params["language"] = language
                    return self.client.audio.transcriptions.create(**params)

            response = await asyncio.to_thread(_transcribe, temp_file_path)
            os.unlink(temp_file_path)

            return {
                "text": response.text,
            }
        except Exception as e:
            print(f"OpenAI STT error: {e}")
            raise
    
    async def create_embeddings(
        self,
        texts: List[str],
        model: str = "text-embedding-3-small",
    ) -> List[List[float]]:
        """Create embeddings for texts."""
        try:
            response = self.client.embeddings.create(
                model=model,
                input=texts,
            )
            
            return [item.embedding for item in response.data]
        except Exception as e:
            print(f"OpenAI embeddings error: {e}")
            raise
    
    async def analyze_sentiment(
        self,
        text: str,
    ) -> Dict[str, Any]:
        """Analyze sentiment of text."""
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a sentiment analysis expert. Analyze the sentiment of the following text and respond with: positive, neutral, or negative, and a confidence score between 0 and 1.",
                },
                {
                    "role": "user",
                    "content": f"Analyze the sentiment of this text: {text}",
                }
            ]
            
            response = await self.chat_completion(
                messages=messages,
                model="gpt-3.5-turbo",
                temperature=0.3,
                max_tokens=50,
            )
            
            # Parse response
            content = response["content"].lower()
            
            if "positive" in content:
                sentiment = "positive"
                score = 0.8
            elif "negative" in content:
                sentiment = "negative"
                score = 0.2
            else:
                sentiment = "neutral"
                score = 0.5
            
            return {
                "sentiment": sentiment,
                "score": score,
                "raw_response": response["content"],
            }
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            return {
                "sentiment": "neutral",
                "score": 0.5,
                "error": str(e),
            }
    
    async def summarize_conversation(
        self,
        transcript: List[Dict[str, str]],
    ) -> str:
        """Summarize a conversation transcript."""
        try:
            # Format transcript
            transcript_text = "\n".join([
                f"{msg['speaker']}: {msg['text']}"
                for msg in transcript
            ])
            
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert at summarizing conversations. Provide a concise summary of the key points, outcomes, and action items.",
                },
                {
                    "role": "user",
                    "content": f"Summarize this conversation:\n\n{transcript_text}",
                }
            ]
            
            response = await self.chat_completion(
                messages=messages,
                model="gpt-4",
                temperature=0.5,
                max_tokens=300,
            )
            
            return response["content"]
        except Exception as e:
            print(f"Conversation summarization error: {e}")
            return "Summary unavailable"


# Create singleton instance
openai_service = OpenAIService()
