import Image from '../../common/Image'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative h-screen sm:h-full">
      <picture className="pointer-events-none absolute -z-10 inset-0">
        <Image
          width={1920}
          height={1014}
          src="/img/Plebes2.png"
          alt="image"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
         <Image
          width={2020}
          height={2000}
          src="/img/Plebes2.png"
          alt="image"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      </picture>
      <div className="ml-auto mr-auto h-full max-w-[91rem] px-4 sm:h-4">
        <div className="grid h-full items-center gap-4 md:grid-cols-12">
          <div className="col-span-5 flex h-full flex-col items-center justify-center py-10 md:items-start lg:py-20">
            <h1 className="mb-6 text-center font-display text-5xl text-white md:text-left lg:text-6xl">
              Chihuahuas and frens for Public Goods*
            </h1>
            <p className="mb-8 max-w-md text-center text-lg text-white md:text-left">
              Plebes is a non-governance token DAO that promotes the use of
              Internet Computer by funding open-source technology, creative
              projects, and public goods through weekly reverse Ordinals
              auctions.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/collections"
                className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
              >
                Bid
              </Link>
            </div>
          </div>
          <div className="relative col-span-6 col-start-7 hidden h-full md:block"></div>
        </div>
      </div>
    </section>
  )
}
