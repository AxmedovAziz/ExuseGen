import smtplib
from email.message import EmailMessage

# Email details
sender_email = "aziz9259657@gmail.com"
receiver_email = "aziz9259658@gmail.com"
app_password = "aziz06160001"  # Gmail App Password

msg = EmailMessage()
msg.set_content("Hello, this is a test email from Python.")
msg["Subject"] = "Python Email Test"
msg["From"] = sender_email
msg["To"] = receiver_email

# Send email
with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
    server.login(sender_email, app_password)
    server.send_message(msg)

print("Email sent successfully!")
