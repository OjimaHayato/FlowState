"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // FormData for OAuth2 password grant type
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        try {
            const response = await api.post("/token", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const token = response.data.access_token;
            localStorage.setItem("token", token);
            router.push("/timer");
        } catch (err: any) {
            console.error(err);
            setError("Login failed. Please check your credentials.");
        }
    };

    const handleRegister = async () => {
        setError("");
        try {
            console.log("Attempting to register with API URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
            await api.post("/users/", {
                username,
                email: `${username}@example.com`, // Simplified for MVP
                password
            });
            // Auto login after register
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);
            const response = await api.post("/token", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            localStorage.setItem("token", response.data.access_token);
            router.push("/timer");
        } catch (err: any) {
            console.error(err);
            let errorMessage = "Registration failed. Please try again.";

            if (err.code === "ERR_NETWORK") {
                errorMessage = `Unable to connect to server. Trying to connect to: ${process.env.NEXT_PUBLIC_API_URL || "localhost:8000"}`;
            } else if (err.response) {
                errorMessage = err.response.data?.detail || errorMessage;
            }

            setError(errorMessage);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Flowstate</h1>
                    <p className="mt-2 text-neutral-400">Sign in to start your focus session</p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-700 bg-neutral-800 placeholder-neutral-500 text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-700 bg-neutral-800 placeholder-neutral-500 text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div className="flex gap-4">
                        <Button type="submit" className="w-full flex justify-center py-2 bg-indigo-600 hover:bg-indigo-700">
                            Sign in
                        </Button>
                        <Button type="button" onClick={handleRegister} variant="secondary" className="w-full flex justify-center py-2">
                            Register
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
