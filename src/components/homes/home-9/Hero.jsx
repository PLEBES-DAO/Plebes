import { useBioniqContext } from '../../../hooks/BioniqContext';
import { Link } from 'react-router-dom';

export default function Hero() {
  const { createAuction, cancelAuction } = useBioniqContext();

  return (
    <section className="relative h-screen">
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/img/background.png')" }}
      />
      <div className="ml-auto mr-auto h-full max-w-[91rem] px-4">
        <div className="grid h-full items-center gap-4 md:grid-cols-12">
          <div className="col-span-5 flex h-full flex-col items-center justify-center py-10 md:items-start lg:py-20">
            <h1 className="mb-6 text-center font-display text-4xl text-white md:text-left lg:text-6xl">
              Chihuahuas and frens for Public Goods
            </h1>
            <p className="mb-8 max-w-md text-center text-lg text-white md:text-left">
              Plebes is a multichain DAO, with its core on the Internet Computer Protocol (ICP), driving Web3 adoption through support for open-source technology, AI initiatives, creative projects, and public goods via daily Bitcoin ordinal auctions.
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
          <div className="relative col-span-6 col-start-7 hidden h-full md:block"></div>
        </div>
      </div>
    </section>
  );
}