# 🎬 Needflex

**Needflex** is a Netflix-inspired online movie streaming platform where you can explore and enjoy a wide variety of films directly from your browser – simple, fast, and completely free.
This project was developed with the purpose of learning and practicing modern frontend web development technologies.

## 🚀 Demo

**Needflex** is deployed and accessible at: [needflex.site](https://needflex.site)

## 🛠️ Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Vite**: A fast and modern build tool for projects.
- **Tailwind CSS**: A utility-first CSS framework for designing UI.
- **JavaScript**: The main programming language for the project.

## 📦 Installation and Running the Project

1. **Clone the repository:**

   ```bash
   git clone https://github.com/anhphapap/movie-web.git
   cd movie-web
   ```

2. **Create a `.env` file from the example:**

   ```bash
   cp .env.example .env
   ```

   To run the app properly, you need to configure some services in Firebase:

   - Enable **Authentication** with the following methods: **Email/Password** and **Google**
   - Create a **Cloud Firestore database**

   Then, fill in your Firebase credentials in the `.env` file.

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Access the application:**

   Open your browser and go to `http://localhost:5173` to view the app.

## 🌐 API Data Source

The application uses movie data from the public API provided by [Ophim](https://ophim17.cc/api-document).
