import Navbar from "../../../components/headers/Navbar.jsx";
import PropTypes from 'prop-types';
import './page.css';
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
        {/* Overlay que se desvanece en hover */}
        <div className="absolute inset-0 bg-[#0c112c]/90 transition-opacity duration-300 group-hover:opacity-0"></div>
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
    return (
        <>
            <Navbar bLogin={login} setModalOpen={setModalOpen} />
            <section className="relative h-screen">
                <div className="p-10 h-full pt-24 grid grid-cols-1 md:grid-cols-4 gap-4 comics"
                     style={{ backgroundImage: "url('/img/background.png')" }}
                >
                    {/* DAO/GOV Card */}
                    <div className="h-full dao-section">
                        <CardWithImage imageIndex={0}>
                            <span className="comic-sans">DAO/GOV</span>
                        </CardWithImage>
                    </div>

                    {/* Holders, Precio, Tesorería, Staking */}
                    <div className="md:col-span-2 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Large Holders Card */}
                        <CardWithImage imageIndex={1} className="md:col-span-2">
                            <span className="comic-sans">Holders</span>
                        </CardWithImage>

                        {/* Precio Card */}
                        <CardWithImage imageIndex={2}>
                            <span className="comic-sans"> Precio </span>
                            </CardWithImage>

                        {/* Tesorería Card */}

                        <CardWithImage imageIndex={3} className="row-span-full">
                            <span className="comic-sans"> Tesorería </span>
                        </CardWithImage>

                        {/* Staking and Staking 2 */}
                        <div className="grid grid-cols-2 gap-4">
                            <CardWithImage imageIndex={4}>
                                <span className="comic-sans"> Staking </span>
                            </CardWithImage>
                            <CardWithImage imageIndex={4}>
                                <span className="comic-sans"> Staking 2 </span>
                            </CardWithImage>

                        </div>

                    </div>

                    {/* Holders and Precio Cards */}
                    <div className="md:col-span-1 h-full grid grid-cols-1 md:grid-cols-1 grid-rows-6 gap-4">
                        {/* Large Holders Card */}
                        <CardWithImage imageIndex={6} className="row-span-4">
                            <span className="comic-sans"> Holders </span>
                        </CardWithImage>

                        {/* Precio Card */}
                        <CardWithImage imageIndex={7} className="row-span-2">
                            <span className="comic-sans"> Precio </span>
                        </CardWithImage>
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