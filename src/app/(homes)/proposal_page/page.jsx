import Navbar from "../../../components/headers/Navbar.jsx";
import React from "react";
import './page.css';

export default function ProposalPage() {
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
                    <div className="absolute mt-20 inset-0 p-10">
                        <div
                            className="w-full h-full rounded-2xl shadow-lg flex items-center justify-center"
                            style={{
                                background: "rgba(255, 255, 255, 0.25)", // Fondo translúcido
                                backdropFilter: "blur(10px)", // Efecto de desenfoque
                                WebkitBackdropFilter: "blur(10px)",
                            }}
                        >
                            {/* Contenido dentro del contenedor */}
                            <h1 className="text-3xl font-bold text-white">Contenido de ProposalPage</h1>
                            <p className="text-white mt-4">
                                Este contenedor tiene un fondo transparente con efecto blur.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}