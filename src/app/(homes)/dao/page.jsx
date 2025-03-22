import Navbar from "../../../components/headers/Navbar.jsx";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importación de useNavigate
import './page.css';
import '../launchpad/effects.css'; // Añadir esta importación

export default function Profile() {
    const navigate = useNavigate(); // Hook para navegación

    const handleForumItemClick = (e) => {
        navigate('/proposal_page');
    };

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
                    {/* Primera columna */}
                    <div className="section rounded-xl flex items-center justify-center pink-gradient w-full max-h-full overflow-hidden">
                        <div
                            className="text-black sm:w-full md:col-span-1 rounded-xl shadow-lg p-6 overflow-y-auto max-h-[85vh]"
                        >
                            <div className="flex flex-col">

                                <div
                                    className="relative w-40 h-40 rounded-full bg-gray-300 overflow-hidden mb-4 cursor-pointer shadow-lg"
                                >
                                    <label htmlFor="image-upload" className="cursor-pointer w-full h-full">
                                        <img
                                            id="uploaded-image"
                                            src="/img/default-avatar.png"
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </label>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    document.getElementById('uploaded-image').src = event.target.result;
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="text-white">Resumen de Profile</div>
                                <div className="text-white">Poder de Voto</div>
                                <div className="text-white">Nivel</div>
                                <div className="text-white">Niveles</div>
                                <div className="text-white">Cantidad de perritos</div>
                                <div className="text-white">Valor de USD en Cartera</div>
                            </div>
                            <button
                                style={{
                                    backgroundColor: '#EC4899',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    marginTop: '1rem',
                                    width: '100%',
                                    transition: 'background-color 0.3s ease',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#D91D7F'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#EC4899'}
                            >
                                Staking
                            </button>
                        </div>
                    </div>

                    {/* Segunda columna (ahora abarca las 3 columnas) */}
                    <div className="section flex flex-col items-center justify-center bg-white w-full md:col-span-2 rounded-xl p-3 max-h-full overflow-hidden">
                        <div className="flex flex-col justify-center items-center bg-jacarta-900 w-full m-2 h-[15vh] rounded-lg flex-shrink-0 p-4">
                            <h6 className="text-white text-4xl"> Welcome to PLEBES</h6>
                            <p className="text-white">
                                Here are the most chingonas proposal please vote for them but first buy a plebe
                            </p>
                        </div>
                        <hr className="flex-shrink-0" />
                        <div className="flex-1 overflow-y-auto text-black w-full mt-2 max-h-[70vh]">
                            {/* Cuadros del foro */}
                            {[1, 2, 3, 4, 5].map((index) => (
                                <div
                                    key={index}
                                    className="block w-full"
                                    onClick={(e) => handleForumItemClick(e)}
                                >
                                    <div className="w-full p-3 bg-white border rounded-lg shadow-sm mb-3 cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold">Título Genérico {index}</h3>
                                            <div className="flex gap-2">
                                                <div className="flex items-center">
                                                    <span className="text-green-500 text-2xl font-medium">
                                                        {Math.floor(Math.random() * 30) + 10}
                                                    </span>
                                                    <span className="text-gray-400 text-sm ml-1">—</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-red-500 text-2xl font-medium">
                                                        {Math.floor(Math.random() * 5) + 1}
                                                    </span>
                                                    <span className="text-gray-400 text-xs ml-1">↑</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 text-2xl font-medium">
                                                        {Math.floor(Math.random() * 20) + 20}
                                                    </span>
                                                    <span className="text-gray-400 text-sm ml-1">addresses</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block px-2 py-1 text-sm bg-green text-green-700 rounded">
                                                ACTIVE
                                            </span>
                                            <span className="text-sm text-gray-600">12/18/2024</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Descripción del recuadro {index}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
}