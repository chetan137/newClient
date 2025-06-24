

## 📁 Folder Structure
main/
├── client/ → Frontend (React/Vite)
└── server/ → Backend (Node.js/Express)




### 1️⃣ Start Frontend (React)

Open terminal:

```bash
cd main/client
npm install
npm run dev
The frontend should now run on: http://localhost:5173

2️⃣ Start Backend (Node.js/Express)
Open a second terminal:


cd main
npm install
npm start
The backend server will run on: http://localhost:5000 (or your configured port)

🔐 Environment Variables (.env)
Create a .env file inside the main/server folder and add the following keys:


Edit
SESSION_SECRET=your_session_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.gnb2eff.mongodb.net/

JWT_SECRET=your_jwt_secret

MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_OTP_TEMPLATE_ID=your_template_id

🛠️ Dependencies
Frontend:
React

Vite

Backend:
Express

Mongoose

Nodemailer

JWT

MSG91 (for OTP)

✅ Tips
Ensure MongoDB and MSG91 credentials are valid

Keep your .env file secure and never upload it to GitHub

For collaboration, add contributors via GitHub settings > Collaborators

