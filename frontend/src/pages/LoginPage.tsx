import { useState } from "react";

import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {

    const {
        login,
        loading
    } = useAuth();

    const [email, setEmail]
    = useState("");

    const [password, setPassword]
    = useState("");

    async function handleLogin() {

        const success = 
        await login(email, password);

        if (!success) {
            alert("Invalid credentials");
            return;
        }

        window.location.href = "/"
    }

    return (

        <div
        className="
        min-h-screen
        
        bg-black
        text-white

        flex
        items-center
        justify-center
        "
        >

            <div
            className="
            w-full
            max-w-md
            
            bg-zinc-900

            p-8

            rounded-2x1

            border
            border-zinc-800
            "
            >
                <h1 
                className="
                text-4x1
                font-bold
                
                mb-8
                "
                >
                    PIU Randomizer
                </h1>

                <div className="space-y-4">

                    <input
                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={
                        e=>setEmail(
                            e.target.value
                        )
                    }

                    className="
                    w-full
                    
                    bg-zinc-800
                    
                    p-3
                    
                    rounded-x1
                    "
                    />

                    <input
                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={
                        e => setPassword(
                            e.target.value
                        )
                    }

                    className="
                    w-full
                    
                    bg-zinc-800
                    
                    p-3
                    
                    rounded-x1
                    "
                    />

                    <button
                    onClick={handleLogin}

                    disabled={loading}

                    className="
                    w-full
                    
                    bg-blue-600
                    
                    p-3
                    
                    rounded-x1
                    
                    font-bold
                    "
                    >
                        {
                            loading
                            ? "Loading..."
                            : "login"
                        }
                    </button>

                </div>

            </div>

        </div>
    );
}