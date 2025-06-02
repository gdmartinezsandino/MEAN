# 📦 Project Setup Guide

This repository contains two applications:

* \`\` – Backend application (Node.js)
* \`\` – Frontend application (Angular)

Both apps use [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) with their own `.nvmrc` files.

---

## ✅ Prerequisites

Make sure you have the following installed:

* [**nvm**](https://github.com/nvm-sh/nvm) – Node Version Manager
* [**Angular CLI**](https://angular.io/cli) – For running the frontend
* [**npm**](https://www.npmjs.com/) – Installed with Node.js
* [**yarn**](https://yarnpkg.com/) – Install it using npm

---

## 🛠️ Initial Setup

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>
   ```

2. **Set up backend (**\`\`**):**

   ```bash
   cd server
   nvm use          # uses Node version from .nvmrc
   npm install
   ```

3. **Set up frontend (**\`\`**):**

   ```bash
   cd ../webapp
   nvm use          # uses Node version from .nvmrc
   yarn install
   ```

---

## 🚀 Running the Apps

### 🖥️ Backend (server)

From the `server/` directory:

```bash
npm run start
```

This will start the backend server on its configured port (check `.env.example` or config file if applicable).

---

### 🌐 Frontend (webapp)

From the `webapp/` directory:

```bash
ng serve
```

Then navigate to [http://localhost:4200](http://localhost:4200) to view the application.

---

## 🧪 Running Tests

### Backend

```bash
cd server
npm run test
```

### Frontend

```bash
cd webapp
ng test
```
