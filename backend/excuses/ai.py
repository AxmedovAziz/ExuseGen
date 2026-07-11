import requests
import json
import re

TOKEN = "REDACTED"  # ⚠️ regenerate this
ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "deepseek/deepseek-chat"  # cheaper + good


def parse_excuses(text):
    parts = re.split(r"\n?\d+\.\s*", text)
    return [p.strip() for p in parts if p.strip()]


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
    prompt = f"""
Generate 5 realistic excuse messages.

Reason: {reason}
Category: {reason_category}
Target: {target}
Written by: {author_role}
Student: {student_name}
Date: {date}
Tone: {tone}
Details: {details}

Return ONLY JSON:
{{
  "excuses": ["...", "...", "...", "...", "..."]
}}
"""

    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "Return only JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 400
    }

    response = requests.post(ENDPOINT, headers=headers, json=data)

    if response.status_code != 200:
        raise Exception(response.text)

    raw = response.json()["choices"][0]["message"]["content"]

    try:
        clean = re.sub(r"```json|```", "", raw).strip()
        return json.loads(clean)
    except:
        return {"excuses": parse_excuses(raw)}