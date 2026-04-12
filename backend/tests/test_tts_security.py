import unittest
from unittest.mock import patch
import os
from backend.app import create_app

class TTSSecurityTestCase(unittest.TestCase):
    def setUp(self):
        # Ensure we have an API key set so the test doesn't fail early
        os.environ['ELEVENLABS_API_KEY'] = 'test-api-key'

        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def tearDown(self):
        # Clean up the environment variable
        if 'ELEVENLABS_API_KEY' in os.environ:
            del os.environ['ELEVENLABS_API_KEY']

    @patch('backend.app.routes.tts.requests.post')
    def test_synthesize_speech_valid_input(self, mock_post):
        # Mock the external API response
        mock_post.return_value.ok = True
        mock_post.return_value.content = b'test audio data'
        mock_post.return_value.status_code = 200

        payload = {
            'text': 'Hello world',
            'voiceId': 'valid_voice_id',
            'modelId': 'valid_model_id'
        }

        response = self.client.post('/api/tts/synthesize', json=payload)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b'test audio data')
        # Check that post was called
        self.assertTrue(mock_post.called)

    @patch('backend.app.routes.tts.requests.post')
    def test_synthesize_speech_ssrf_path_traversal(self, mock_post):
        # This payload attempts to manipulate the voiceId with path traversal
        payload = {
            'text': 'Hello world',
            'voiceId': '../malicious_endpoint'
        }

        response = self.client.post('/api/tts/synthesize', json=payload)

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data.get('error'), 'Invalid voiceId format')

        # Verify that we prevented the external API call
        mock_post.assert_not_called()

    @patch('backend.app.routes.tts.requests.post')
    def test_synthesize_speech_ssrf_model_id(self, mock_post):
        # This payload attempts to manipulate the modelId
        payload = {
            'text': 'Hello world',
            'modelId': 'injecting_data;&&'
        }

        response = self.client.post('/api/tts/synthesize', json=payload)

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data.get('error'), 'Invalid modelId format')

        # Verify that we prevented the external API call
        mock_post.assert_not_called()

    @patch('backend.app.routes.tts.requests.post')
    def test_synthesize_speech_missing_text(self, mock_post):
        # Payload missing text entirely
        payload = {
            'voiceId': 'valid_voice_id'
        }

        response = self.client.post('/api/tts/synthesize', json=payload)

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data.get('error'), 'No text provided')

        # Verify that we prevented the external API call
        mock_post.assert_not_called()

if __name__ == '__main__':
    unittest.main()
