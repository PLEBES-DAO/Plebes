import Footer1 from "../../../components/footer/Footer1";
import Header1 from "../../../components/headers/Header1";
import Owned from "../../../components/pages/user/Owned";
import { useNavigate } from 'react-router-dom';


import { useEffect, useState } from "react";


export const metadata = {
    title: "Home 9 || Xhibiter | NFT Marketplace Nextjs Template",
};
export default function OwnedPage({ login, inscriptions, loading }) {
    const navigate = useNavigate();
    useEffect(() => {
        console.log("in profile",loading,inscriptions)
        if (!loading && !inscriptions) {
            navigate("/")
        }
    }, [inscriptions,loading])

    return (
        <>
            <Header1 bLogin={login} />
            <main>
                <Owned inscriptions={inscriptions} />
            </main>
            <Footer1 />
        </>
    );
}
