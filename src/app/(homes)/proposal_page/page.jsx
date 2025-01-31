import Navbar from "../../../components/headers/Navbar.jsx";
import React from "react";
import { useState, useRef } from "react";
import './page.css';

export default function ProposalPage() {
    return (
        <>
            <Navbar/>
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
                    sexossdasd
                </div>
            </section>
        </>
    )
}