import { useBioniqContext } from '../../../hooks/BioniqContext'
import { Link } from 'react-router-dom'

export default function Hero() {
  const { createAuction, cancelAuction } = useBioniqContext()

  return (
    <section className="relative h-screen">
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/img/background.png')" }}
      />
      <div className="ml-auto mr-auto h-full max-w-[91rem] px-4">
        <div className="grid h-full items-center gap-4 md:grid-cols-12">
          <div className="col-span-5 flex h-full flex-col items-center justify-center py-10 md:items-start lg:py-20">
            <h1 className="mb-6 text-center font-display text-5xl text-white md:text-left lg:text-6xl">
              Chihuahuas and frens for Public Goods
            </h1>
            <p className="mb-8 max-w-md text-center text-lg text-white md:text-left">
              Plebes is a DAO that promotes the use of Internet Computer Protocol by funding open-source technology, creative projects, and public goods through daily Reserved Ordinals auctions.
            </p>
            <div className='flex gap-3'>
              <a
                href="http://plebes.xyz/auction"
                className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
              >
                Auction
              </a>
              <Link
                to="/collections"
                className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
              >
                white paper
              </Link>
            </div>
          </div>
          <div className="relative col-span-6 col-start-7 hidden h-full md:block"></div>
        </div>
      </div>
    </section>
  )
}
