import { useState, useEffect } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory, e8sToDecimal } from './ckBTC_idl.js'; // Asegúrate de tener el IDL del contrato ckBTC
import { useBioniqContext } from '../../../hooks/BioniqContext';
import { Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import './hero.css'
import './Munro.css'
// Import sum.svg logo
import sumLogo from '../../../assets/img/dao/sum.svg';
import icpLogo from '../../../assets/img/hero/icp_icon.png';
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import required modules
import { Navigation, Pagination, EffectCoverflow, Autoplay } from "swiper/modules";
import Image from "../../common/Image";
import { formatNumberWithPattern } from "../../../utils";

export default function Hero() {
  const { historicState, btcPriceState } = useBioniqContext();
  const [icpBalance, setIcpBalance] = useState(null);
  const [displayBalance, setDisplayBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceIncreased, setBalanceIncreased] = useState(false);
  const [previousBalance, setPreviousBalance] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    async function fetchIcpBalance() {
      try {
        const agent = new HttpAgent({ host: 'https://ic0.app' });
        const canisterId = 'ryjl3-tyaaa-aaaaa-aaaba-cai'; // ICP Ledger canister ID
        const walletAddress = 'ycv6x-taztk-nu75u-k4xkg-5jthb-x525x-4tfk7-b6ino-avbls-hcbkv-sqe';

        const icpActor = Actor.createActor(idlFactory, {
          agent,
          canisterId,
        });

        const balance = await icpActor.icrc1_balance_of({
          owner: Principal.fromText(walletAddress),
          subaccount: []
        });
        
        const balanceNumber = Number(balance);
        
        // Check if balance increased
        if (previousBalance !== null && balanceNumber > previousBalance) {
          setBalanceIncreased(true);
          setTimeout(() => setBalanceIncreased(false), 3000);
        }
        
        setPreviousBalance(balanceNumber);
        setIcpBalance(e8sToDecimal(balanceNumber));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching ICP balance:", error);
        setIsLoading(false);
      }
    }

    fetchIcpBalance();
    
    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(fetchIcpBalance, 30000);
    
    return () => clearInterval(intervalId);
  }, [previousBalance]);

  // Efecto para la animación cuando icpBalance cambia
  useEffect(() => {
    if (icpBalance === null) return;

    const duration = 1500; // 1.5 segundos
    const steps = 30; // Número de actualizaciones por segundo
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step === steps) {
        setDisplayBalance(icpBalance);
        clearInterval(timer);
      } else {
        // Genera un número aleatorio que se va acercando al valor final
        const randomFactor = 1 - (step / steps);
        const randomValue = icpBalance * (1 + (Math.random() - 0.5) * randomFactor);
        setDisplayBalance(randomValue);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [icpBalance]);

  console.log('Historic State:', historicState); // Added log for debugging

  // Function to go to the next slide
  const goToNextSlide = () => {
    console.log("Attempting to go to next slide..."); // Log function call
    if (swiperInstance) {
      console.log("Swiper instance found, calling slideNext()"); // Log instance found
      swiperInstance.slideNext();
    } else {
      console.log("Swiper instance NOT found."); // Log instance not found
    }
  };

  // Function to go to the previous slide
  const goToPrevSlide = () => {
    console.log("Attempting to go to previous slide..."); // Log function call
    if (swiperInstance) {
      console.log("Swiper instance found, calling slidePrev()"); // Log instance found
      swiperInstance.slidePrev();
    } else {
      console.log("Swiper instance NOT found."); // Log instance not found
    }
  };

  return (
      <section className="relative h-screen">
        <div
            className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/img/background.png')" }}
        />
        
        {/* CoverFlow Slider - Full Width */}
        <div className="w-full absolute bottom-0 left-0 right-0 -z-5">
          <div className="relative px-0">
         
            <Swiper
              breakpoints={{
                100: {
                  slidesPerView: 1,
                },
                575: {
                  slidesPerView: 2,
                },
                992: {
                  slidesPerView: 3,
                },
                1200: {
                  slidesPerView: 4,
                },
                1400: {
                  slidesPerView: 5,
                },
              }}
              slidesPerGroupAuto
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={historicState && historicState.length > 0}
              loop={false}
              coverflowEffect={{
                rotate: 30,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={{
                clickable: true,
              }}
              modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              className="swiper coverflow-slider !py-5 w-full"
              onSwiper={(swiper) => {
                setSwiperInstance(swiper);
              }}
            >
              {historicState && historicState.length > 0 ? historicState.map((elm, i) => (
                <SwiperSlide key={i}>
                  <article>
                    <div className="block overflow-hidden rounded-2.5xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-jacarta-700">
                      <figure className="relative">
                        <Link to={`/item/${elm.item.id}`}>
                          <Image
                            src={elm.item.content_url}
                            alt="item"
                            className="swiper-lazy h-[320px] w-full object-cover"
                            height="200"
                            width="300"
                          />
                        </Link>
                      </figure>
                      <div className="p-6">
                        <div className="flex">
                          <div>
                            <Link to={`/item/${elm.item.id}`} className="block">
                              <span className="font-display text-lg leading-none text-jacarta-700 hover:text-accent dark:text-white flex items-center munro-small-text">
                                <img
                                  src="/img/ckBTC.svg"
                                  alt="ckBTC Icon"
                                  className="ml-2 h-5 w-5"
                                />
                                {" "+(formatNumberWithPattern(elm.metadata.amount) * btcPriceState).toFixed(3)} USD              
                              </span>
                            </Link>
                            <a href="#" className="text-2xs text-accent munro-narrow-text">
                              {elm.metadata.buyer.slice(0, 5)}...{elm.metadata.buyer.slice(-5)}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              )) : (
                <SwiperSlide>
                  <article>
                    <div className="block overflow-hidden rounded-2.5xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-jacarta-700">
                      <div className="p-6 text-center">
                        <p className="text-lg munro-regular-text">No historical transactions available</p>
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              )}
            </Swiper>

            {/* Remove the navigation buttons */}
            {/*
            <div className="snbp7-hero swiper-button-prev group absolute top-1/2 left-4 z-10 -mt-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white p-3 text-base shadow-white-volume">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="fill-jacarta-700 group-hover:fill-accent"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z" />
              </svg>
            </div>
            <div className="snbn7-hero swiper-button-next group absolute top-1/2 right-4 z-10 -mt-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white p-3 text-base shadow-white-volume">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="fill-jacarta-700 group-hover:fill-accent"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
              </svg>
            </div>
            */}
          </div>
        </div>
        
        <div className="ml-auto mr-auto h-full max-w-[91rem] px-4 relative z-10">
          <div className="grid h-full items-center gap-4 md:grid-cols-12">
            {/* Text Content */}
            <div className="col-span-5 flex h-full flex-col items-center justify-center py-10 md:items-start lg:py-20">
              <div className="mx-4 mb-6">
                <img src={sumLogo} alt="Plebes Logo" className="w-full max-w-md" />
              </div>
              <p className="mx-5 mb-8 w-full text-center text-4xl text-white md:text-left munro-regular-text">
 Plebes is a multichain DAO refining non-plutocratic governance and funding open-source, AI, creativity, and public goods through Bitcoin ordinal auctions.
              </p>
              <div className="flex gap-3 mb-8">
                <a
                    href="http://plebes.xyz/auction"
                    className="pitch-deck-button text-xl mx-5 py-3 px-8 text-center font-semibold text-white transition-all munro-narrow"
                >
                  Auction
                </a>
                <Link
                    to="/collections"
                    className="pitch-deck-button text-xl py-3 px-8 text-center font-semibold text-white transition-all munro-narrow"
                >
                  Whitepaper
                </Link>
              </div>
            </div>

            {/* Stats Block */}
            <div className="relative col-span-6 col-start-7 hidden h-full md:flex items-center justify-center">
              <div className={`stats-card bg-morado-translucido p-8 rounded-lg shadow-lg text-white text-center w-full max-w-md transition-all duration-300 ${balanceIncreased ? 'balance-increase-pulse' : ''}`}>
                <h3 className="text-3xl font-bold mb-4 munro-regular-heading">Treasury Balance</h3>
                
                {isLoading ? (
                  <div className="loading-animation">
                    <div className="loading-spinner"></div>
                    <p className="mt-2 munro-small-text">Fetching balance...</p>
                  </div>
                ) : (
                  <div className="balance-display">
                    <div className="flex justify-center items-center">
                      <span className="icp-icon">
                      </span>
                      <p className="text-3xl font-light tracking-wider munro-regular-text">
                        {displayBalance !== null 
                          ? displayBalance.toFixed(8)
                          : '0.00000000'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}