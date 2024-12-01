import { statistis2 } from "../../../data/statictis";
import Image from "../../common/Image";

export default function Intro() {
  return (
    <section className="bg-gradient-to-r from-[transparent_33%] to-[#F5F8FA_33%] py-36 dark:to-[#101436_33%]">
      <div className="container">
        <div className="lg:flex lg:justify-between">
          <div className="relative lg:w-[45%]">
            <figure className="relative">
              <picture className="rounded-2.5xl">
                <Image
                  width={500}
                  height={500}
                  src="/Plebes_GIF.gif"
                  className="rounded-2.5xl"
                  alt="image"
                />
              </picture>
            </figure>
          </div>

          <div className="py-10 lg:w-[55%] lg:pl-24">
            <h2 className="mb-6 font-display text-3xl text-jacarta-700 dark:text-white">
              Daily Plebes, eternally interchangeables       </h2>
            <p className="mb-8 text-lg leading-normal dark:text-jacarta-300">
              Plebes merges the technology of ICP with the solidity of Bitcoin, creating an infinite and dynamic collection that allows the exchange of up to 7 interchangeable layers between each Plebe, including skins and clothing. Additionally, Plebes facilitates the incorporation of new members into the community through daily auctions, ensuring active participation from holders. In this way, each member has the opportunity to exercise their voice and vote in the decisions of the DAO.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
