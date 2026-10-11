# 💰 Expense Tracker API & Web App

A self-contained, full-stack personal finance tracker built with Node.js, Express, and MongoDB. The application provides secure user authentication, complete expense tracking (CRUD), and real-time category spending analytics.

---

## ✨ Features

- **User Authentication:** Secure sign-up and login using `bcryptjs` for password hashing and JSON Web Tokens (JWT) for session management.
- **Data Isolation:** Protected routes ensure each user only accesses, creates, modifies, and deletes their own records.
- **Expense CRUD:** Add, retrieve, update, and remove expenses categorized by type (Food, Travel, Rent, Shopping, Bills, Other).
- **Spending Analytics:** MongoDB Aggregation Pipeline calculates overall total spent and broken-down spending totals per category.
- **Minimalist Frontend:** Served statically via Express with vanilla JavaScript (`fetch` API) and responsive styling.

---

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Database & ODM:** MongoDB, Mongoose
- **Security & Auth:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (DOM + Fetch API)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/](https://github.com/)<YOUR_GITHUB_USERNAME>/expense-tracker.git
   cd expense-tracker