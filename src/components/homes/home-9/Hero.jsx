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
      
      {/* Bottom Carousel */}
      <div className="w-full absolute bottom-0 left-0 right-0 -z-5">
        <div className="relative px-0">
          <Swiper
            breakpoints={{
              100: { slidesPerView: 2 },
              575: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
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
            className="swiper !py-5 w-full"
            onSwiper={setSwiperInstance}
          >
            {historicState && historicState.length > 0 ? historicState.map((elm, i) => (
              <SwiperSlide key={i}>
                <article>
                  <div className="block overflow-hidden rounded-2.5xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-jacarta-700">
                    <figure className="relative card-image-wrapper">
                      <Link to={`/item/${elm.item.id}`}>
                        <Image
                          src={elm.item.content_url}
                          alt="item"
                          className="swiper-lazy h-[320px] w-full object-cover"
                          height="200"
                          width="300"
                        />
                        <div className="card-image-overlay"></div>
                      </Link>
                    </figure>
                    <div className="p-6">
                      <div className="flex flex-col items-start">
                        <div>
                          <Link to={`/item/${elm.item.id}`} className="flex items-center space-x-2">
                            <img
                              src="/img/ckBTC.svg"
                              alt="ckBTC Icon"
                              className="h-5 w-5"
                            />
                            <span className="font-display mb-1 text-lg leading-none text-jacarta-700 hover:text-accent dark:text-white munro-small-text">
                              {(formatNumberWithPattern(elm.metadata.amount) * btcPriceState).toFixed(3)} USD
                            </span>
                          </Link>
                          <a href="#" className="text-2xs text-accent munro-narrow-text mt-2">
                            {elm.metadata.buyer.length > 10 ?
                              `${elm.metadata.buyer.slice(0,5)}...${elm.metadata.buyer.slice(-5)}` :
                              elm.metadata.buyer
                            }
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
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="ml-auto mr-auto h-full max-w-[91rem] px-4 relative z-10">
        <div className="grid h-full grid-rows-2 grid-cols-2 gap-8">
          {/* Top Left - Logo Container */}
          <div className="flex py-32 items-center justify-center col-span-1 row-span-1">
            <div className="bg-black/30 p-8 rounded-2xl max-w-2xl w-full h-full">
              <img src={sumLogo} alt="Plebes DAO" className="w-full h-auto" />
            </div>
          </div>

          {/* Top Right - Text Content */}
          <div className="py-32 flex items-center justify-center col-span-1 row-span-1">
            <div className="bg-black/30 p-8 rounded-2xl max-w-2xl w-full h-full">
              <p className="text-white mt-7 text-xl mb-6 leading-tight font-inter drop-shadow-heavy text-justify" style={{ textAlign: 'justify' }}>
                Plebes is a multichain DAO refining non-plutocratic governance and funding 
                open-source, AI, creativity, and public goods through Bitcoin ordinal auctions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="http://plebes.xyz/auction"
                  className="bg-morado-translucido pixel-font text-lg py-3 px-8 rounded-lg text-center font-semibold text-white cursor-pointer transition-all duration-300 hover:bg-opacity-80"
                >
                  Auction
                </a>
                <Link
                  to="https://www.papermark.com/view/cm7npsir50005guzpwy90shui"
                  className="bg-morado-translucido pixel-font text-lg py-3 px-8 rounded-lg text-center font-semibold text-white cursor-pointer transition-all duration-300 hover:bg-opacity-80"
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
      </div>
    </section>
  );
}