# 🤖 ExcuseGen

**ExcuseGen** is an AI-powered web application that generates realistic, customizable excuses for school, work, or personal situations. Instead of getting one generic response, users can personalize the generated excuses by selecting categories, tone, role, dates, and other details.

The project consists of a **React frontend** and a **Django REST Framework backend**, with AI integration to generate high-quality excuses.

---

## ✨ Features

### 🎯 AI Excuse Generation

Generate multiple unique excuses based on user input.

Users can customize:

* Excuse Category

  * Health
  * Family
  * Transportation
  * School
  * Work
  * Personal
  * Other

* Target

  * School
  * Work
  * Friends
  * Family
  * Custom

* Tone

  * Professional
  * Casual
  * Serious
  * Funny
  * Formal

* Author Role

  * Student
  * Employee
  * Parent
  * Teacher
  * Custom

Additional customization includes:

* Student/Employee name
* Date
* Extra details
* Number of excuses to generate

---

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Axios
* React Router
* Tailwind CSS

### Backend

* Django
* Django REST Framework
* JWT Authentication
* Google OAuth
* OpenAI API
* SQLite (Development)
* PostgreSQL (Production Ready)

---

## 📁 Project Structure

```
ExcuseGen/
│
├── backend/
│   ├── excusegen/
│   ├── api/
│   ├── users/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/excusegen.git
cd excusegen
```

---

## Backend Setup

Create a virtual environment.

```bash
python -m venv .venv
```

Activate it.

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run migrations.

```bash
python manage.py migrate
```

Start the backend.

```bash
python manage.py runserver
```

Backend runs on:

```
http://127.0.0.1:8000
```

---

## Frontend Setup

Install dependencies.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file for both frontend and backend.

Example backend variables:

```env
SECRET_KEY=your_secret_key

DEBUG=True

OPENAI_API_KEY=your_openai_key

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

DATABASE_URL=your_database_url
```

Frontend example:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📡 API Endpoints

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| POST   | `/api/excuses/generate/` | Generate AI excuses |
| POST   | `/api/auth/login/`       | User login          |
| POST   | `/api/auth/register/`    | Register user       |
| POST   | `/api/auth/google/`      | Google OAuth login  |
| GET    | `/api/user/`             | Get current user    |

---

## 🔒 Authentication

The project uses:

* JWT Authentication
* Google OAuth Login
* Protected API routes
* Secure token-based authentication

---

## 💡 Example Request

```json
{
  "category": "Health",
  "target": "School",
  "tone": "Professional",
  "role": "Student",
  "name": "John",
  "date": "2026-07-11",
  "details": "Food poisoning",
  "count": 5
}
```

---

## Example Response

```json
[
  {
    "text": "I wasn't able to attend class because I experienced severe food poisoning overnight..."
  },
  {
    "text": "Unfortunately, I became ill unexpectedly..."
  }
]
```

---

## 📸 Screenshots

You can add screenshots here once the UI is complete.

```
/screenshots
    home.png
    generator.png
    results.png
```

---

## 🧠 Future Improvements

* Save excuse history
* Favorite excuses
* AI rewrite option
* Multiple languages
* Email sharing
* PDF export
* Voice input
* More excuse templates
* Admin dashboard
* User statistics

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Aziz Axmedov**

Full-Stack Web Developer

If you enjoyed this project, consider giving it a ⭐ on GitHub!
