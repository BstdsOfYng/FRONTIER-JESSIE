import logging
from flask import Flask, request, jsonify
from typing import Callable

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebhookHandler:
    """
    Handles GitHub webhooks, specifically filtering for failed workflow runs.
    """
    def __init__(self, on_failure_callback: Callable[[dict], None]):
        self.app = Flask(__name__)
        self.on_failure_callback = on_failure_callback
        self._setup_routes()

    def _setup_routes(self):
        @self.app.route('/webhook', methods=['POST'])
        def handle_webhook():
            event = request.headers.get('X-GitHub-Event')
            payload = request.json

            if not event or not payload:
                return jsonify({"error": "Missing event or payload"}), 400

            if event == 'workflow_run':
                return self._process_workflow_run(payload)

            return jsonify({"status": "ignored", "event": event}), 200

    def _process_workflow_run(self, payload: dict):
        """
        Filters for 'failure' conclusions in workflow_run events.
        """
        conclusion = payload.get('workflow_run', {}).get('conclusion')
        
        if conclusion == 'failure':
            logger.info(f"Failure detected in workflow run: {payload['workflow_run']['id']}")
            try:
                # Trigger the healing process asynchronously or via callback
                self.on_failure_callback(payload)
                return jsonify({"status": "healing_initiated"}), 202
            except Exception as e:
                logger.error(f"Error triggering healing process: {e}")
                return jsonify({"error": "Internal processing error"}), 500
        
        return jsonify({"status": "success or neutral", "conclusion": conclusion}), 200

    def run(self, host='0.0.0.0', port=5000):
        self.app.run(host=host, port=port)
