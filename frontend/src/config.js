// src/config.js
const API_URL =
    process.env.NODE_ENV === "production"
        ? "https://webnso-be.onrender.com" // dùng Render khi production
        : "http://localhost:3000"; // local khi dev

export default API_URL;
