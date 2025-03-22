import Navbar from "../../../components/headers/Navbar.jsx";
import PropTypes from 'prop-types';
import './page.css';
import './effects.css';
import {useNavigate} from "react-router-dom";

const cardImages = [
    'img/plebe-cards/plebe-dao.jpg',
    'img/plebe-cards/plebe-header.jpg',
    'img/plebe-cards/plebe-rainbow.jpg',
    'img/plebe-cards/plebe-treasury.jpg',
    'img/plebe-cards/plebe-greenhat.jpg',
    'img/plebe-cards/plebe-dfinity.jpg',
    'img/plebe-cards/plebe-redeyes.jpg',
    'img/plebe-cards/plebe-whiteface.jpg'
];

const CardWithImage = ({ imageIndex, children, className = "", onClick }) => (
    <div
        className={`section relative h-full shadow-md rounded-lg p-4 flex items-center justify-center cursor-pointer overflow-hidden group ${className}`}
        onClick={onClick}
        style={{ backgroundImage: `url('${cardImages[imageIndex]}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
        <div className="absolute inset-0 blue-overlay group-hover:opacity-0"></div>
        <div className="absolute inset-0 dark-overlay"></div>
        <div className="relative z-20 text-4xl font-bold text-white">
            {children}
        </div>
    </div>
);

CardWithImage.propTypes = {
    imageIndex: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func
};

export default function Homepage({ login, setModalOpen }) {
    const navigate = useNavigate();

    return (
        <>
            <Navbar bLogin={login} setModalOpen={setModalOpen} />
            <section className="relative h-screen">
                <div className="p-10 h-full pt-32 grid grid-cols-1 md:grid-cols-4 gap-4 comics"
                     style={{ backgroundImage: "url('/img/background.png')", backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundAttachment: "fixed", backgroundSize: "cover" }}
                >
                    {/* DAO/GOV Card */}
                    <div className="h-full dao-section" onClick={() => navigate("/dao")}>
                        <CardWithImage imageIndex={0}>
                            <span className="comic-sans"> DAO/GOV </span>
                        </CardWithImage>
                    </div>

                    {/* Grid principal */}
<div className="md:col-span-2 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Holders Card */}
    <CardWithImage imageIndex={1} className="md:col-span-2">
        <span className="comic-sans"> Holders </span>
    </CardWithImage>

    {/* Precio Card */}
    <CardWithImage imageIndex={2}>
        <span className="comic-sans"> Precio </span>
    </CardWithImage>

    {/* Tesorería Card */}
    <CardWithImage imageIndex={3} className="md:row-span-3">
        <span className="comic-sans"> Tesorería </span>
    </CardWithImage>

    {/* Staking Card */}
    <CardWithImage imageIndex={4} className="md:col-span-1">
        <span className="comic-sans"> Staking </span>
    </CardWithImage>

    {/* Deposit Card - Insertado dentro del grid */}
    <div className="h-full dao-section md:col-span-1" onClick={() => navigate("/deposit")}>
        <CardWithImage imageIndex={5}>
            <span className="comic-sans"> Deposit </span>
        </CardWithImage>
    </div>
</div>
                </div>
            </section>
        </>
    );
}

Homepage.propTypes = {
    login: PropTypes.bool.isRequired,
    setModalOpen: PropTypes.func.isRequired
};