import logging
import os
from marketing_campaign_brief import generate_marketing_brief, generate_ad_copy, detect_ai_action
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json 

# Initialize Flask app and CORS
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.logger.setLevel(logging.ERROR)

# Define the route for the index page
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')  # Render the index.html template

# Define the route for processing messages
@app.route('/generate', methods=['POST'])
def generate_route():
    # Check if request body is empty
    if not request.data:
        return jsonify({"error": "Request body is empty. Requires user prompt:"}), 400

    prompt = request.json["prompt"]
    response = detect_ai_action(prompt=prompt)  # Process the user's message using the worker module

    # Return the bot's response as JSON
    return jsonify({
        "response": response
    }), 200

# Define the route for processing messages
@app.route('/generate-ad-copy', methods=['POST'])
def generate_ad_copy_route():
    # Check if request body is empty
    if not request.data:
        return jsonify({"error": "Request body is empty. Requires user prompt:"}), 400

    prompt = request.json["prompt"]
    response = generate_ad_copy()  # Process the user's message using the worker module

    response_json = json.loads(response)

    # Return the bot's response as JSON
    return jsonify({
        "response": response_json
    }), 200

# Define the route for processing messages
@app.route('/detect-ai-action', methods=['POST'])
def detect_ai_action_route():
    # Check if request body is empty
    if not request.data:
        return jsonify({"error": "Request body is empty. Requires user prompt:"}), 400

    prompt = request.json["prompt"]
    response = detect_ai_action(prompt=prompt)  # Process the user's message using the worker module

    response_json = json.loads(response)

    # Return the bot's response as JSON
    return jsonify({
        "response": response_json
    }), 200


# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=8100, host='0.0.0.0')
