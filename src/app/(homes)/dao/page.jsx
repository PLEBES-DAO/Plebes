import Navbar from "../../../components/headers/Navbar.jsx";
import React from "react";
import { useState, useRef } from "react";
import './page.css';
export default function Profile() {

    return (
        <>
            <Navbar />
            <section className="relative h-screen comic-sans ">
                <div className="p-10 h-full pt-24 grid grid-cols-1 md:grid-cols-3 gap-4 comics "
                     style={{
                         backgroundImage: "url('/img/background.png')",
                         backgroundRepeat: "no-repeat",
                         backgroundPosition: "center center",
                         backgroundAttachment: "fixed",
                         backgroundSize: "cover",
                     }}
                >
                    {/* Primera columna */}
                    <div className="rounded-xl flex items-center justify-center pink-gradient border h-full w-full">
                        <div
                            className="text-black sm:w-full md:col-span-1 rounded-xl shadow-lg p-6 backdrop-blur-sm hover:shadow-xl transition-shadow bg-gradient-to-br from-pink-300/90 via-pink-400/80 to-pink-500/70 border border-pink-200/20 animate-[fadeIn_0.6s_ease-in] overflow-y-auto"
                        >
                            <div className="flex flex-col">
                                <div className="flex flex-col items-center">
                                    <div
                                        className="relative w-60 h-60 rounded-full bg-gray-300 overflow-hidden mb-4 cursor-pointer shadow-lg"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"

                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                <div className="text-white">Resumen de Profile</div>
                                <hr className="border-pink-200/30" />
                                <div className="text-white">Poder de Voto</div>
                                <hr className="border-pink-200/30" />
                                <div className="text-white">Nivel</div>
                                <hr className="border-pink-200/30" />
                                <div className="text-white">Niveles</div>
                                <hr className="border-pink-200/30" />
                                <div className="text-white">Cantidad de perritos</div>
                                <hr className="border-pink-200/30" />
                                <div className="text-white">Valor de USD en Cartera</div>
                            </div>
                            <button
                                style={{
                                    backgroundColor: '#EC4899', // bg-pink-600
                                    color: 'white',
                                    padding: '0.5rem 1rem', // py-2 px-4
                                    borderRadius: '0.375rem', // rounded
                                    marginTop: '1rem', // mt-4
                                    width: '100%',
                                    transition: 'background-color 0.3s ease', // transition-colors
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // shadow-md
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#D91D7F'} // hover:bg-pink-700
                                onMouseOut={(e) => e.target.style.backgroundColor = '#EC4899'} // bg-pink-600
                            >
                                Staking
                            </button>
                        </div>
                    </div>

                    {/* Segunda columna (ahora abarca las 3 columnas) */}
                    <div className="flex flex-col items-center justify-center bg-white w-full md:col-span-2 rounded-xl p-3">
                        <div className="flex flex-col justify-center items-center bg-jacarta-900 w-full m-2 h-[15vh] rounded-lg flex-shrink-0">                           
                            <h6 className="text-black text-4xl">Forum header</h6>
                            <p className="text-black">
                                Voy a necesitar lo que deseas que diga exactamente cada página
                            </p>
                        </div>
                        <hr className="flex-shrink-0" />
                        <div className="flex-1 overflow-y-auto text-black w-full mt-2">
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