import { useState, useEffect } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory, e8sToDecimal } from './ckBTC_idl.js'; // Asegúrate de tener el IDL del contrato ckBTC
import { useBioniqContext } from '../../../hooks/BioniqContext';
import { Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import './hero.css'
export default function Hero() {
  const [icpBalance, setIcpBalance] = useState(null);
  const [displayBalance, setDisplayBalance] = useState(null);

  useEffect(() => {
    async function fetchIcpBalance() {
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
      setIcpBalance(e8sToDecimal(balanceNumber));
    }

    fetchIcpBalance();
  }, []);

  // Efecto para la animación cuando icpBalance cambia
  useEffect(() => {
    if (icpBalance === null) return;

    const duration = 1500; // 3 segundos
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

  return (
      <section className="relative h-screen">
        <div
            className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/img/background.png')" }}
        />
        <div className="ml-auto mr-auto h-full max-w-[91rem] px-4">
          <div className="grid h-full items-center gap-4 md:grid-cols-12">
            {/* Text Content */}
            <div className="col-span-5 flex h-full flex-col items-center justify-center py-10 md:items-start lg:py-20">
              <h1 className="mx-5 mb-6 text-center font-display text-5xl text-white md:text-left lg:text-6xl">
                Chihuahuas and frens for Public Goods
              </h1>
              <p className="mx-5 mb-8 max-w-md text-center text-lg text-white md:text-left">
                Plebes is a DAO that promotes the use of Internet Computer Protocol by funding open-source technology, creative projects, and public goods through daily Reserved Ordinals auctions.
              </p>
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <a
                href="http://plebes.xyz/auction"
                className="rounded-full bg-accent py-3 px-6 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark sm:px-8"
              >
                Auction
              </a>
              <a
                href="https://www.papermark.io/view/cm7npsir50005guzpwy90shui"
                className="rounded-full bg-accent py-3 px-6 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark sm:px-8"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pitch Deck
              </a>
              <a
                className="rounded-full bg-accent py-3 px-6 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark sm:px-8"
                target="_blank"
                rel="noopener noreferrer"
              >
                Whitepaper (Soon)
              </a>
            </div>
            </div>

            {/* Stats Block */}
            <div className="relative col-span-6 col-start-7 hidden h-full md:flex items-center justify-center">
              <div className="bg-morado-translucido p-6 rounded-lg shadow-lg text-white text-center w-full max-w-md">
                <div className="mt-6">
                  <h3 className="text-3xl">Current ICP on treasury</h3>
                  <p className="text-3xl font-bold">
                    {displayBalance !== null 
                      ? `${displayBalance.toFixed(8)} ICP` 
                      : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}