
import { useEffect } from "react";

const cardImages = [
    
];

const CardWithImage = ({ imageIndex, children, className = "", onClick }) => (
    <div
        className={`section relative h-full shadow-md rounded-lg p-4 flex items-center justify-center cursor-pointer overflow-hidden group ${className}`}
        onClick={onClick}
    >
        <Image
            src={cardImages[imageIndex]}
            alt="Card background"
            fill
            className="object-cover transition-all duration-300 grayscale group-hover:grayscale-0"
            sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Overlay that fades out on hover */}
        <div className="absolute inset-0 bg-[#0c112c]/90 transition-opacity duration-300 group-hover:opacity-0"></div>
        <div className="relative z-20 text-4xl font-bold text-white">
            {children}
        </div>
    </div>
);

export default function Highlights() {
    const router = useRouter();

    useEffect(() => {
        const sections = document.querySelectorAll(".section");
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.5}s`;
            section.classList.add("animate-fadeIn");
        });
    }, []);

    const handleNavigateToProfile = () => {
        const daoSection = document.querySelector(".dao-section");
        if (daoSection) {
            daoSection.classList.add("animate-fadeOut");
        }
        setTimeout(() => {
            router.push("/theProfile");
        }, 300);
    };

    return (
        <div className="h-full p-4">
            <style jsx>{`
                .comic-sans {
                    font-family: "Comic Sans MS", cursive, sans-serif;
                }
                @keyframes fadeInDarken {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    0% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
                .section {
                    opacity: 0;
                    animation: fadeInDarken 0.5s ease-in-out forwards;
                    transition: all 0.3s ease-in-out;
                }
                .section:hover {
                    transform: scale(1.02);
                }
                .animate-fadeOut {
                    animation: fadeOut 0.3s ease-in-out forwards;
                }
            `}</style>

            <div className="h-full grid grid-cols-1 md:grid-cols-4 gap-4 comics">
                <div className="h-full dao-section">
                    <CardWithImage imageIndex={0} onClick={handleNavigateToProfile}>
                        <span className="comic-sans"> DAO/GOV </span>
                    </CardWithImage>
                </div>

                <div className="md:col-span-2 h-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CardWithImage imageIndex={1} className="md:col-span-2">
                        Holders
                    </CardWithImage>
                    <CardWithImage imageIndex={2}>
                        Precio
                    </CardWithImage>
                    <CardWithImage imageIndex={3} className="row-span-2">
                        Tesorería
                    </CardWithImage>
                    <div className="grid grid-cols-2 gap-4">
                        <CardWithImage imageIndex={4}>
                            Staking
                        </CardWithImage>
                        <CardWithImage imageIndex={5}>
                            Staking 2
                        </CardWithImage>
                    </div>
                </div>

                <div className="md:col-span-1 h-full grid grid-cols-1 md:grid-cols-1 grid-rows-6 gap-4">
                    <CardWithImage imageIndex={6} className="row-span-4">
                        Holders
                    </CardWithImage>
                    <CardWithImage imageIndex={7} className="row-span-2">
                        Precio
                    </CardWithImage>
                </div>
            </div>
        </div>
    );
}