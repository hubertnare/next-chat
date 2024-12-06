import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import ChatRoom from "../../components/index";

export default function Chat() {
    const router = useRouter();
    const SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "this is a secret"; // JWT Secret
    const [done, setDone] = useState("");
    const [username, setUsername] = useState("");
    const token = router.query.token; // Getting the token from the URL

    useEffect(() => {
        if (!router.isReady) return; // Ensure the router is ready

        if (!token) {
            console.error("Token not provided in the URL");
            router.push("/");
            return;
        }

        try {
            const payload = jwt.verify(token, SECRET); // Verify the token
            console.log("Payload:", payload); // Debugging payload

            // Fetch account data from Strapi
            async function fetchData() {
                try {
                    const response = await fetch(
                        `http://localhost:1337/api/accounts?filters[email][$eq]=${payload.email}`
                    );
                    const json = await response.json();

                    if (!json.data || json.data.length === 0) {
                        throw new Error("Account not found in Strapi");
                    }

                    const account = json.data[0];
                    if (!account.token) {
                        throw new Error("Token missing in Strapi response");
                    }

                    if (token !== account.token) {
                        throw new Error("Invalid token");
                    }

                    setUsername(account.username); // Set the username
                    setDone("done"); // Grant access
                } catch (err) {
                    console.error(err.message); // Log the error
                    router.push("/"); // Redirect to home on failure
                }
            }

            fetchData();
        } catch (err) {
            console.error("Token verification failed:", err.message); // Log token verification error
            router.push("/"); // Redirect to home
        }
    }, [token, router.isReady]); // Dependencies

    return (
        <div>
            {done !== "done" ? ( // Waiting for access to be granted
                <h1>Verifying token... Please wait</h1>
            ) : (
                <ChatRoom username={username} />
            )}
        </div>
    );
}