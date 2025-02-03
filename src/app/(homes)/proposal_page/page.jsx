import Navbar from "../../../components/headers/Navbar.jsx";
import React, { useEffect, useState } from "react";
import './page.css';

export default function ProposalPage() {
    const [messages, setMessages] = useState([]);

    // Función para obtener mensajes de Discord
    const fetchMessages = async () => {
        const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
        
        try {
            const response = await fetch(`http://localhost:3001/messages/${CHANNEL_ID}`);
            if (!response.ok) {
                throw new Error(`Error fetching messages: ${response.status}`);
            }
 
            const data = await response.json();
            setMessages(data.map(msg => msg.content)); // Almacena solo el contenido de los mensajes
        } catch (error) {
            console.error(error);
        }
    };

    // Llama a la función al montar el componente
    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <>
            <Navbar />
            <section className="relative h-screen comic-sans">
                <div className="p-10 h-full pt-28 grid grid-cols-1 md:grid-cols-3 gap-4 comics"
                     style={{
                         backgroundImage: "url('/img/background.png')",
                         backgroundRepeat: "no-repeat",
                         backgroundPosition: "center center",
                         backgroundAttachment: "fixed",
                         backgroundSize: "cover",
                     }}
                >
                    <div className="absolute mt-20 inset-0 p-4">
                        <div
                            className="w-full h-full rounded-2xl shadow-lg flex" 
                            style={{
                                background: "rgba(255, 255, 255, 0.83)", // Fondo translúcido
                                backdropFilter: "blur(10px)", // Efecto de desenfoque
                                WebkitBackdropFilter: "blur(10px)",
                            }}
                        >
                            {/* Columna izquierda para el título */}
                            <div className="w-1/2 p-4">
                                <h1 className="text-3xl font-bold text-black">Proposal title</h1>
                            </div>

                            {/* Columna derecha para mostrar los mensajes */}
                            <div className="w-1/2 p-4">
                                <div className="flex flex-col gap-4">
                                    {messages.length > 0 ? (
                                        messages.map((msg, index) => (
                                            <div key={index} className="bg-gray-200 p-4 rounded-lg shadow">
                                                {msg}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-gray-200 p-4 rounded-lg shadow">No messages found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}