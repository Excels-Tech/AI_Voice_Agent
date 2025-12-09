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
            error_str = str(e)
            print(f"OpenAI chat completion error: {e}")
            
            # Handle specific OpenAI errors gracefully
            if "insufficient_quota" in error_str or "exceeded your current quota" in error_str:
                raise ValueError("OpenAI quota exceeded. Please check your billing details.")
            else:
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
            error_str = str(e)
            print(f"OpenAI TTS error: {e}")
            
            # Handle specific OpenAI errors gracefully
            if "insufficient_quota" in error_str or "exceeded your current quota" in error_str:
                raise ValueError("OpenAI quota exceeded. Please check your billing details.")
            else:
                raise
    
    async def speech_to_text(
        self,
        audio_file: bytes,
        language: Optional[str] = None,
        file_extension: str = ".wav",
    ) -> Dict[str, Any]:
        """Transcribe audio to text using Whisper."""
        try:
            # Enhanced audio validation
            if not audio_file or len(audio_file) < 1024:  # Minimum size check
                raise ValueError("Audio too short to transcribe")
            
            # Check for reasonable maximum size (50MB)
            if len(audio_file) > 50 * 1024 * 1024:
                raise ValueError("Audio file too large")
                
            # Basic audio data validation - check it's not just empty/null bytes
            if audio_file.count(b'\x00') == len(audio_file):
                raise ValueError("Audio data appears to be empty or corrupted")
                
            # Check for minimal audio content (at least some variation in bytes)
            unique_bytes = len(set(audio_file[:min(1024, len(audio_file))]))
            if unique_bytes < 5:  # Too uniform, likely not real audio
                raise ValueError("Audio data appears to be invalid or corrupted")

            if not file_extension.startswith("."):
                file_extension = f".{file_extension}"
            
            # Ensure valid file extension for OpenAI Whisper
            valid_extensions = {".flac", ".m4a", ".mp3", ".mp4", ".mpeg", ".mpga", ".oga", ".ogg", ".wav", ".webm"}
            if file_extension not in valid_extensions:
                file_extension = ".wav"  # Default fallback
                print(f"Warning: Invalid audio extension, defaulting to .wav")
            
            # Force WAV for WebM files due to codec compatibility issues
            if file_extension == ".webm":
                file_extension = ".wav"
                print(f"Info: Converting WebM to WAV for better compatibility")

            import tempfile
            import os

            with tempfile.NamedTemporaryFile(suffix=file_extension, delete=False) as temp_file:
                temp_file.write(audio_file)
                temp_file_path = temp_file.name

            def _transcribe(path: str):
                # Additional file size check after writing
                file_size = os.path.getsize(path)
                if file_size < 1024:
                    raise ValueError("Written audio file too small")
                    
                with open(path, "rb") as audio:
                    params = {
                        "model": "whisper-1",
                        "file": audio,
                    }
                    if language and language != "auto":
                        params["language"] = language
                    return self.client.audio.transcriptions.create(**params)

            response = await asyncio.to_thread(_transcribe, temp_file_path)
            
            # Clean up temp file
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors

            return {
                "text": response.text,
            }
        except Exception as e:
            error_str = str(e)
            
            # Enhanced logging for debugging
            print(f"OpenAI STT error: {e}")
            print(f"Audio file size: {len(audio_file) if audio_file else 'None'} bytes")
            print(f"File extension: {file_extension}")
            if hasattr(e, 'response') and hasattr(e.response, 'text'):
                print(f"OpenAI response details: {e.response.text}")
            
            # Handle specific OpenAI errors gracefully
            if "insufficient_quota" in error_str or "exceeded your current quota" in error_str:
                raise ValueError("OpenAI quota exceeded. Please check your billing details.")
            elif "Invalid file format" in error_str or "invalid_file_format" in error_str:
                raise ValueError(f"Invalid audio format. File extension: {file_extension}, Size: {len(audio_file)} bytes")
            elif "Audio too short" in error_str or "minimum duration" in error_str:
                raise ValueError("Audio segment too short to transcribe")
            elif "corrupted" in error_str.lower() or "invalid" in error_str.lower():
                raise ValueError("Audio data appears to be corrupted or invalid")
            else:
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
