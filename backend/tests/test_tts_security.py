import unittest
import sys
import os
import json
from flask import Flask
from unittest.mock import patch

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.routes.tts import tts_bp

class TestTTSSecurity(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(tts_bp)
        self.client = self.app.test_client()

    @patch('backend.app.routes.tts.ELEVENLABS_API_KEY', 'fake_key')
    def test_voice_id_validation(self):
        # Invalid voiceId
        response = self.client.post('/api/tts/synthesize', json={
            'text': 'Hello',
            'voiceId': 'invalid/path/traversal'
        })
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data['error'], 'Invalid voiceId format')

    @patch('backend.app.routes.tts.ELEVENLABS_API_KEY', 'fake_key')
    def test_model_id_validation(self):
        # Invalid modelId
        response = self.client.post('/api/tts/synthesize', json={
            'text': 'Hello',
            'voiceId': 'valid123',
            'modelId': 'invalid/model/id'
        })
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data['error'], 'Invalid modelId format')

if __name__ == '__main__':
    unittest.main()
