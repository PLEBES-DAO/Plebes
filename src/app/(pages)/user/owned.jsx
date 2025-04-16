import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import Owned from "../../../components/pages/user/Owned";
import { useNavigate } from 'react-router-dom';


import { useEffect, useState } from "react";

export default function OwnedPage({ login, inscriptions, loading, setModalOpen }) {
    const navigate = useNavigate();
    useEffect(() => {
        console.log("in profile",loading,inscriptions)
        if (!loading && !inscriptions) {
            navigate("/")
        }
    }, [inscriptions,loading])

    return (
        <>
            <Navbar bLogin={login} setModalOpen={setModalOpen} />
            <main>
                <Owned inscriptions={inscriptions} />
            </main>
            <Footer1 />
        </>
    );
}
