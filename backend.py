import os
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Replace with your own method of securely loading the API key
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),  # This is the default and can be omitted
)

@app.route("/analyze_screenshot", methods=["POST"])
def analyze_screenshot():
    """
    Expects JSON data with keys: 'base64Screenshot' and 'goal'.
    Returns JSON with the off-task confidence score from OpenAI.
    """
    data = request.get_json(force=True)
    base64_screenshot = data.get("base64Screenshot", "")
    goal = data.get("goal", "")

    # Construct the prompt
    prompt = f"Given to you is a screenshot of the user’s current activity on Chrome. Your job is to determine the current productiveness of the user based off of the content they are viewing, and more specifically the relevance to their stated goal in this work/study session: “{goal}”. Consider how the webpage could lead to productivity: for example, being on Google Drive could be used for essay writing or for messing around. Youtube can be used for educational content or for video game walkthroughs. For websites with multiple uses, give the user the benefit of the doubt unless it is clear that they are misusing the site. You must be harsh, but not overly harsh. Take for example if the user’s goal is to study calculus and the screenshot shows them watching a video about F1 or texting about video games on Instagram, you may be confident in your assertion that the content on screen is unproductive and irrelevant. However, if the contents of the webpage are vaguely related in some way to the user's goal, then you must exercise a lesser level of confidence. You must return a number from 1-100 representing the percentage of confidence you have that the user is off task. Reply with only that number and nothing else.".strip()

    try:
        # Call OpenAI's ChatCompletion API
        response = client.chat.completions.create(
            model="gpt-4o",  # or "gpt-3.5-turbo", depending on availability
            messages= [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": prompt,
                },
                {
                    "type": "image_url",
                    "image_url": {"url": base64_screenshot},
                },
            ],
        }
    ],
            temperature=0.0,
            max_tokens=10  # We only need a short numeric answer
        )

        # Extract the response text
        if response.choices and len(response.choices) > 0:
            result = response.choices[0].message.content.strip()
        else:
            return jsonify({"error": "No valid response from OpenAI"}), 500

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/validate_reason", methods=["POST"])
def validate_reason():
    """
    Expects JSON data with keys: 'base64Screenshot' and 'goal'.
    Returns JSON with the off-task confidence score from OpenAI.
    """
    data = request.get_json(force=True)
    base64_screenshot = data.get("base64Screenshot", "")
    goal = data.get("goal", "")
    reason = data.get("reason", "")

    # Construct the prompt
    prompt = f"Given to you is a screenshot of the user’s current activity on Chrome. It has been determined that the based off of the user's current web activity in relation to their stated goal '{goal}', they may be off task and acting unproductive. This is the reasoning that they gave: '{reason}' It is your job is to determine the current productiveness of the user based off of the content they are viewing, more specifically the relevance to their stated goal in this work/study session and the reason which they gave for using the website. Consider how the webpage could lead to productivity: for example, being on Google Drive could be used for essay writing or for messing around. Youtube can be used for educational content or for video game walkthroughs. For websites with multiple uses, give the user the benefit of the doubt unless it is clear that they are misusing the site. You must be harsh, but not overly harsh. Take for example if the user’s goal is to study calculus and the screenshot shows them watching a video about F1 or texting about video games on Instagram, you may be confident in your assertion that the content on screen is unproductive and irrelevant. However, if the contents of the webpage are definitely related in some way to the user's goal, then you must exercise a lesser level of confidence. You must reply with either pass or fail, depending on whether you believe that they have a valid and productive reason to be on this page. Reply with only that word and nothing else.".strip()

    try:
        # Call OpenAI's ChatCompletion API
        response = client.chat.completions.create(
            model="gpt-4o",  # or "gpt-3.5-turbo", depending on availability
            messages= [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": prompt,
                },
                {
                    "type": "image_url",
                    "image_url": {"url": base64_screenshot},
                },
            ],
        }
    ],
            temperature=0.0,
            max_tokens=10  # We only need a short numeric answer
        )

        # Extract the response text
        if response.choices and len(response.choices) > 0:
            result = response.choices[0].message.content.strip()
        else:
            return jsonify({"error": "No valid response from OpenAI"}), 500

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Run in debug mode for development
    app.run(debug=True, host="0.0.0.0", port=8080)
