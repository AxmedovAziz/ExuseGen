import requests
import random
import sys

sys.stdout.reconfigure(encoding='utf-8')


def generate_text(
    reason,
    reason_category=None,
    target=None,
    author_role=None,
    student_name=None,
    date=None,
    tone="professional",
    details=None
):

    url = "https://text.pollinations.ai"

    prompt = f"""
ROLE:
You are an assistant that writes realistic excuses.

TASK:
Generate 5 different believable excuse messages.

CONTEXT:
Reason: {reason}
Category: {reason_category}
Target: {target}
Written by: {author_role}
Student name: {student_name}
Date: {date}
Tone: {tone}
Extra details: {details}

RULES:
- Keep excuses realistic
- Keep them short (2-4 sentences)
- Do not exaggerate
- Make them sound natural

OUTPUT:
Generate 5 different excuse messages.
Number them 1 to 5.
"""

    data = {
        "messages": [
            {"role": "system", "content": "You write believable excuses."},
            {"role": "user", "content": prompt}
        ],
        "model": "openai",
        "seed": random.randint(1, 999999999),
        "jsonMode": False,
        "private": True,
        "stream": False
    }

    resp = requests.post(url, json=data)

    if resp.status_code == 200:
        return resp.text
    else:
        raise Exception(f"Error {resp.status_code}: {resp.text}")
    
# text = generate_text(
#     reason="doctor appointment",
#     reason_category="leave early",
#     target="school",
#     author_role="parent: Kholida Khamidova",
#     student_name="Michael Johnson",
#     date="March 8",
#     tone="formal"
# )

# print(text)





import re

def validate_feedback(feedback_type, rating, feedback_text, email=None):
    """
    Validates feedback and prepares it to send to Telegram bot or backend.
    Returns dict if valid, raises Exception if invalid.
    """

    # Allowed feedback types
    allowed_types = ["suggestion", "bug", "improvement", "feature", "other"]
    if feedback_type not in allowed_types:
        raise ValueError("Invalid feedback type.")

    # Rating should be between 0 and 5
    if not (0 <= rating <= 5):
        raise ValueError("Rating must be between 0 and 5.")

    # Feedback text length
    if not (5 <= len(feedback_text) <= 500):
        raise ValueError("Feedback text must be between 5 and 500 characters.")

    # Optional email validation
    if email:
        email_regex = r"[^@]+@[^@]+\.[^@]+"
        if not re.match(email_regex, email):
            raise ValueError("Invalid email format.")

    # If everything is valid, return a dict
    return {
        "type": feedback_type,
        "rating": rating,
        "feedback": feedback_text,
        "email": email or "Anonymous"
    }