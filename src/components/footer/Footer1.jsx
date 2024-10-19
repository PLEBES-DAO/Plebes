import Socials from './Socials'
import MarketplaceLinks from './MarketplaceLinks'
import CompanyLinks from './CompanyLinks'
import MyAccountKink from './MyAccountLink'
import Image from '../common/Image'
import { Link } from 'react-router-dom'

export default function Footer1() {
  return (
    <footer className="page-footer bg-white dark:bg-jacarta-900">
      <div className="container">
        <div className="grid grid-cols-6 gap-x-7 gap-y-14 pt-24 pb-12 md:grid-cols-12">
          <div className="col-span-full sm:col-span-3 md:col-span-4">
            <Link href="/" className="mb-6 inline-block">
              <Image
                width={130}
                height={28}
                src="/img/plebes1b.svg"
                className="max-h-7 dark:hidden"
                alt="Xhibiter | NFT Marketplace"
              />
            </Link>
            <p className="mb-12 dark:text-jacarta-300">
            Plebes funds open-source, creative projects, and public goods via daily Reserved Ordinals auctions.
            </p>
            <div className="flex space-x-5">
              <Socials />
            </div>
          </div>
        
        </div>
        <div className="flex flex-col items-center justify-between space-y-2 py-8 sm:flex-row sm:space-y-0">
          <ul className="flex flex-wrap space-x-4 text-sm dark:text-jacarta-400">
            <li>
              <a href="#" className="hover:text-accent">
                Terms and conditions
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-accent">
                Privacy policy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
