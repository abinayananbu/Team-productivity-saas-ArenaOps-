🚀 Arena – Team Productivity & Automation SaaS

Arena is a multi-tenant team productivity and project management SaaS built with Django, Django REST Framework, and React (planned).
It supports organizations, role-based access, projects, tasks, subscriptions, and audit logs, similar to tools like ClickUp or Jira.

✨ Features
🏢 Organization Management

Multi-tenant architecture (data isolation per organization)

Subscription plans: Free, Pro, Enterprise

Organization-level access control

👥 User & Role Management

Custom user model (email-based login)

Roles:

OWNER – full control & billing

ADMIN – manage users & projects

MEMBER – work on tasks

Avatar support

📁 Project Management

Projects belong to organizations

Tag support for better categorization

Created-by tracking

✅ Task Management

Task status: TODO, IN_PROGRESS, DONE

Priority levels: LOW, MEDIUM, HIGH

Task assignment & deadlines

Optimized DB indexes for performance

🧾 Activity Logs

Audit trail for important actions

JSON metadata support

💳 Subscription & Billing (Ready)

Plan-based limits (users, projects)

Stripe subscription ID support (integration ready)

🛠 Tech Stack

Backend

Python

Django

Django REST Framework

PostgreSQL / MySQL (configurable)

Frontend (Planned)

React

Axios

Role-based UI rendering

Other

Stripe (Billing – upcoming)

JWT Authentication

Git & GitHub

📂 Project Structure
arena/
├── arena/              # Core project settings
├── api/                # Main app (models, views, serializers)
├── media/              # User uploaded files (ignored in git)
├── manage.py
├── requirements.txt
└── README.md

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/YOUR_USERNAME/arena-saas.git
cd arena-saas

2️⃣ Create Virtual Environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

3️⃣ Install Dependencies
pip install -r requirements.txt

4️⃣ Environment Variables

Create a .env file:

SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_NAME=arena_db
DATABASE_USER=root
DATABASE_PASSWORD=yourpassword
DATABASE_HOST=localhost
DATABASE_PORT=3306

5️⃣ Database Migration
python manage.py makemigrations
python manage.py migrate

6️⃣ Create Superuser
python manage.py createsuperuser

7️⃣ Run Server
python manage.py runserver


Open 👉 http://127.0.0.1:8000/

🔐 Role Permissions Overview
Action	OWNER	ADMIN	MEMBER
Manage Organization	✅	❌	❌
Billing	✅	❌	❌
Create Projects	✅	✅	❌
Delete Projects	✅	❌	❌
Create Tasks	✅	✅	✅
Assign Tasks	✅	✅	❌
📌 API Highlights

Secure multi-tenant filtering

Role-based permission classes

Optimized queries using DB indexes

🧠 Best Practices Followed

Custom user model

Email-based authentication

Organization-level data isolation

Clean, scalable model design

Production-ready permission system

🚧 Roadmap

 JWT Authentication

 Stripe payment integration

 React frontend

 Notifications

 Team chat

 Deployment (Docker + AWS)

🤝 Contributing

Pull requests are welcome.
For major changes, please open an issue first to discuss what you’d like to change.

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Anbu
Backend & Full-Stack Developer
🚀 Building real-world SaaS products
