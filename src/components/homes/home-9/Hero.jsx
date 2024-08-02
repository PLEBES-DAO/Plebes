import Image from "../../common/Image";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative h-screen sm:h-94">
      <picture className="pointer-events-none absolute -z-10 inset-0">
        <Image
          width={1920}
          height={1014}
          src="/img/Plebes2.png"
          alt="image"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      </picture>
      <div className="ml-auto mr-auto h-full max-w-[91rem] px-4 sm:h-4">
        <div className="grid h-full items-center gap-4 md:grid-cols-12">
          <div className="col-span-5 flex h-full flex-col items-center justify-center py-10 md:items-start lg:py-20">
            <h1 className="mb-6 text-center font-display text-5xl text-white md:text-left lg:text-6xl">
              DAO-enabled NFT platforms or the NFT marketplaces
            </h1>
            <p className="mb-8 max-w-md text-center text-lg text-white md:text-left">
              Every digital creation available through MakersPlace is an
              authentic and truly unique.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/collections"
                className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
              >
                Get Started
              </Link>
              <Link
                href="/collections"
                className="rounded-full bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="relative col-span-6 col-start-7 hidden h-full md:block">
          
       
          
          </div>
        </div>
      </div>
    </section>
  );
}
