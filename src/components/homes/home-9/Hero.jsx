
import { useState, useEffect } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from './ckBTC_idl.js'; // Asegúrate de tener el IDL del contrato ckBTC
import { useBioniqContext } from '../../../hooks/BioniqContext';
import { Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';

export default function Hero() {
  const [ckBTCSaldo, setCkBTCSaldo] = useState(null);

  useEffect(() => {
    async function fetchCkBTCSaldo() {
      const agent = new HttpAgent({ host: 'https://ic0.app' });
      const canisterId = 'mxzaz-hqaaa-aaaar-qaada-cai';
      const walletAddress = 'ycv6x-taztk-nu75u-k4xkg-5jthb-x525x-4tfk7-b6ino-avbls-hcbkv-sqe';

      const ckBTCActor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
      });

      const balance = await ckBTCActor.icrc1_balance_of({
        owner: Principal.fromText(walletAddress),
        subaccount: []
      });
      setCkBTCSaldo(balance.toString());
    }

    fetchCkBTCSaldo();
  }, []);

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
              <div className="flex gap-3">
                <a
                    href="http://plebes.xyz/auction"
                    className="rounded-full mx-5 bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                >
                  Auction
                </a>
                <Link
                    to="/collections"
                    className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                >
                  Whitepaper
                </Link>
              </div>
            </div>

            {/* Stats Block */}
            <div className="relative col-span-6 col-start-7 hidden h-full md:flex items-center justify-center">
              <div className="bg-accent-lighter p-6 rounded-lg shadow-lg text-white text-center w-full max-w-md rounded-lg">

                <div className="mt-6">
                  <h3 className="text-3xl font-bold">ckBTC Balance</h3>
                  <p className="text-lg">{ckBTCSaldo !== null ? `${ckBTCSaldo} ckBTC` : 'Loading...'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}