import requests

BASE_URL = "http://127.0.0.1:8000/api/excuses/feedback/"

# CREATE
data = {
    "feedbacktype": " Improvement",
    "feedbacktext": "Login fails",
    "rating": 4,
    "email": "user@example.com"
}

# r = requests.post(BASE_URL, json=data)

# print("Status Code:", r.status_code)   # <- check this
# print("Response Text:", r.text)        # <- raw response

# try:
#     print("JSON:", r.json())
# except Exception as e:
#     print("Error parsing JSON:", e)

# # GET ALL
# r = requests.get(BASE_URL)
# print("GET ALL:", r.json())

# # GET ONE
# r = requests.get(BASE_URL + "1/")
# print("GET ONE:", r.json())

# # UPDATE
# update_data = {"feedbacktype": "Suggestion", "feedbacktext": "Add dark mode", "rating": 5, "email": "user@example.com"}
# r = requests.put(BASE_URL + "1/", json=update_data)
# print("UPDATE:", r.json())

# # DELETE
BASE_URL = "http://127.0.0.1:8000/api/excuses/feedback/"
r = requests.delete(BASE_URL + "1/")
print("Status Code:", r.status_code)   # <- check this
print("Response Text:", r.text)        # <- raw response

try:
    print("JSON:", r.json())
except Exception as e:
    print("Error parsing JSON:", e)


# soo here is my feed back page i want you to make fetch request to backend by reading this py code and dlete the email input just save users email outomaticly 