import styles from "../styles/Home.module.css";
import { useState } from "react";
import jwt from "jsonwebtoken";

export default function Home() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !user) {
      setError("Both username and email are required!");
      return;
    }

    const SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "this is a secret"; // Use env variable
    const account = { email };

    try {
      const token = jwt.sign(account, SECRET, { expiresIn: "1h" }); // Token with expiration
      const message = `http://localhost:3000/chat/${token}`;
      const mailData = { email, message };
      const strapiData = {
        data: { username: user, email, token },
      };

      // Send data to Strapi API
      const strapiResponse = await fetch("http://localhost:1337/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(strapiData),
      });

      if (!strapiResponse.ok) {
        const errorMsg = await strapiResponse.json();
        throw new Error(`Strapi API Error: ${errorMsg.message}`);
      }

      // Send email data
      const emailResponse = await fetch("/api/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mailData),
      });

      if (!emailResponse.ok) {
        const errorMsg = await emailResponse.json();
        throw new Error(`Email API Error: ${errorMsg.message}`);
      }

      // Success Feedback
      setSuccess("Account created successfully!");
      setError("");
    } catch (err) {
      setError(err.message);
      setSuccess("");
    } finally {
      setEmail("");
      setUser("");
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.main} onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <label htmlFor="user">Username: </label>
        <input
          type="text"
          id="user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          required
        />
        <br />
        <label htmlFor="email">Email: </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}