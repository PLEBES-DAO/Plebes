import { useState, useEffect } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory, e8sToDecimal } from './ckBTC_idl.js';
import { useBioniqContext } from '../../../hooks/BioniqContext';
import { Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import './hero.css';
import './Munro.css';
import sumLogo from '../../../assets/img/dao/sum.svg';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
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
        const canisterId = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
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
    const intervalId = setInterval(fetchIcpBalance, 30000);
    return () => clearInterval(intervalId);
  }, [previousBalance]);

  useEffect(() => {
    if (icpBalance === null) return;

    const duration = 1500;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step === steps) {
        setDisplayBalance(icpBalance);
        clearInterval(timer);
      } else {
        const randomFactor = 1 - (step / steps);
        const randomValue = icpBalance * (1 + (Math.random() - 0.5) * randomFactor);
        setDisplayBalance(randomValue);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [icpBalance]);

  return (
      <section className="relative h-screen">
        <div
            className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/img/background.png')" }}
        />

        {/* Main Content Grid */}
        <div className="ml-auto mr-auto h-full max-w-[91rem] px-4 relative z-10">
          <div className="grid h-full grid-cols-1 grid-rows-1 md:grid-cols-2 md:grid-rows-2 gap-8 relative">
            {/* Top Left - Logo Container */}
            <div className="flex flex-col h-full col-span-1 row-span-1 items-center justify-center py-10 mt-12
          relative z-20">
              {/* Imagen solo para mobile, con margen */}
              <div className="mx-4 block md:hidden">
                <img src={sumLogo} alt="Plebes DAO" className="w-full max-w-md" />
              </div>
              {/* Imagen solo para md+, sin margen */}
              <div className="pb-24 pt-12 mb-24 hidden md:flex md:items-center md:justify-center h-full">
                <img src={sumLogo} alt="Plebes DAO" className="w-full max-w-xl" />
              </div>
              {/* Mobile text */}
              <p className="mx-5 drop-shadow-heavy mb-8 w-full text-center text-white text-xl md:hidden munro-regular-text mt-24" style={{ textShadow: '4px 4px 12px rgba(0, 0, 0, 0.85)' }}>
                Plebes is a multichain DAO refining non-plutocratic governance and funding open-source, AI, creativity, and public goods through Bitcoin ordinal auctions.
              </p>
              {/* Mobile buttons */}
              <div className="flex gap-3 mb-8 md:hidden">
                <a
                    href="http://plebes.xyz/auction"
                    className="bg-morado-translucido munro-small-text text-lg py-3 px-8 rounded-lg text-center font-semibold text-white cursor-pointer transition-all duration-300 hover:bg-opacity-80"
                >
                  Auction
                </a>
                <Link
                    to="https://www.papermark.com/view/cm7npsir50005guzpwy90shui"
                    className="bg-morado-translucido munro-small-text text-lg py-3 px-8 rounded-lg text-center font-semibold text-white cursor-pointer transition-all duration-300 hover:bg-opacity-80"
                >
                  Pitch Deck
                </Link>
              </div>
            </div>

            {/* Top Right - Text Content */}
            <div className="hidden md:flex items-center justify-center col-span-1 row-span-1 relative z-20">
              <div className="bg-black/30 p-8 rounded-2xl max-w-2xl w-full  flex-col items-center justify-center">
                {/* Desktop text */}
                <p className="text-white munro-regular-text mb-6 leading-tight text-2xl lg:text-4xl drop-shadow-heavy text-right" style={{ textShadow: '4px 4px 12px rgba(0, 0, 0, 0.85)' }}>
                  Plebes is a multichain DAO refining non-plutocratic governance and funding
                  open-source, AI, creativity, and public goods through Bitcoin ordinal auctions.
                </p>
                {/* Desktop buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                      href="http://plebes.xyz/auction"
                      className="bg-morado-translucido munro-small-text text-lg py-3 px-8 rounded-lg text-center font-semibold text-white cursor-pointer transition-all duration-300 hover:bg-opacity-80"
                  >
                    Auction
                  </a>
                  <Link
                      to="https://www.papermark.com/view/cm7npsir50005guzpwy90shui"
                      className="bg-morado-translucido munro-small-text text-lg py-3 px-8 rounded-lg text-center font-semibold text-white cursor-pointer transition-all duration-300 hover:bg-opacity-80"
                  >
                    Pitch Deck
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Left - Empty */}
            <div className="col-span-1 row-span-1"></div>

            {/* Bottom Right - Empty */}
            <div className="col-span-1 row-span-1"></div>
          </div>

          {/* Bottom Carousel - Ahora con position: absolute en lugar de fixed */}
          <div className="w-full absolute bottom-0 left-0 right-0 z-10">
            <div className="relative px-0">
              <Swiper
                  breakpoints={{
                    100: { slidesPerView: 2 },
                    575: { slidesPerView: 3 },
                    992: { slidesPerView: 4 },
                    1200: { slidesPerView: 5 },
                    1400: { slidesPerView: 5 },
                  }}
                  slidesPerGroupAuto
                  spaceBetween={24}
                  grabCursor={true}
                  centeredSlides={historicState && historicState.length > 0}
                  loop={true}
                  freeMode={true}
                  speed={4000}
                  autoplay={{
                    delay: 0,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                  }}
                  modules={[Navigation, Pagination, Autoplay]}
                  className="swiper !py-3 w-full"
                  onSwiper={setSwiperInstance}
              >
                {historicState && historicState.length > 0 ? historicState.map((elm, i) => (
                    <SwiperSlide key={i}>
                      <article>
                        <div className="block overflow-hidden rounded-2.5xl bg-white shadow-none transition-shadow hover:shadow-none dark:bg-jacarta-700 flex flex-col items-center">
                          <figure className="relative card-image-wrapper w-full flex justify-center">
                            <Link to={`/item/${elm.item.id}`}>
                              <Image
                                  src={elm.item.content_url}
                                  alt="item"
                                  className="swiper-lazy w-full object-cover"
                                  width="300"
                              />
                              <div className="card-image-overlay"></div>
                            </Link>
                          </figure>
                          <div className="py-4 px-2 w-full flex flex-col items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                          <span className="flex items-center gap-2 text-lg font-display munro-small-text text-jacarta-700 dark:text-white">
                            <img src="/img/ckBTC.svg" alt="ckBTC Icon" className="h-5 w-5" />
                            {(formatNumberWithPattern(elm.metadata.amount) * btcPriceState).toFixed(3)} USD
                          </span>
                              <span className="text-xs text-accent munro-narrow-text">
                            {elm.metadata.buyer.length > 10 ?
                                `${elm.metadata.buyer.slice(0,5)}...${elm.metadata.buyer.slice(-5)}` :
                                elm.metadata.buyer
                            }
                          </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </SwiperSlide>
                )) : (
                    <SwiperSlide>
                      <article>
                        <div className="block overflow-hidden rounded-2.5xl bg-white shadow-none transition-shadow hover:shadow-none dark:bg-jacarta-700 flex flex-col items-center">
                          <div className="p-6 text-center">
                            <p className="text-lg munro-regular-text">No historical transactions available</p>
                          </div>
                        </div>
                      </article>
                    </SwiperSlide>
                )}
              </Swiper>
            </div>
          </div>
        </div>
      </section>
  );
}