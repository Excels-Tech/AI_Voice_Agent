import asyncio, os, json, base64, math
from dotenv import load_dotenv
import websockets

MODEL = os.environ.get('OPENAI_REALTIME_MODEL', 'gpt-4o-realtime-preview')

async def run(duration_ms):
    load_dotenv()
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        print('no key set')
        return
    uri = f'wss://api.openai.com/v1/realtime?model={MODEL}'
    headers = [
        ('Authorization', f'Bearer {api_key}'),
        ('OpenAI-Beta', 'realtime=v1'),
    ]
    async with websockets.connect(uri, additional_headers=headers) as ws:
        await ws.send(json.dumps({'type':'session.update','session':{'instructions':'test long audio','modalities':['text','audio'],'input_audio_format':'pcm16'}}))
        sample_rate = 24000
        sample_count = int(sample_rate * duration_ms / 1000)
        arr = bytearray()
        for i in range(sample_count):
            t = i / sample_rate
            sample = int(math.sin(2 * math.pi * 440 * t) * 32767)
            arr += sample.to_bytes(2, byteorder='little', signed=True)
        audio_b64 = base64.b64encode(arr).decode('ascii')
        await ws.send(json.dumps({'type':'conversation.item.create','item':{'type':'message','role':'user','content':[{'type':'input_audio','audio':audio_b64}]}}))
        await ws.send(json.dumps({'type':'response.create','response':{'modalities':['text'],'conversation':'auto'}}))
        while True:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=5)
                print('recv', msg)
            except asyncio.TimeoutError:
                print('timeout waiting for message')
                break

asyncio.run(run(25000))
