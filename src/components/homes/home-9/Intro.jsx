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
                src="/img/plebes/PBNEW001.png"
                className="rounded-2.5xl"
                alt="image"
              />
              </picture>
            </figure>
          </div>

          <div className="py-10 lg:w-[55%] lg:pl-24">
            <h2 className="mb-6 font-display text-3xl text-jacarta-700 dark:text-white">
            1 Plebe, every day, forever            </h2>
            <p className="mb-8 text-lg leading-normal dark:text-jacarta-300">
            Digital art that will be permanently on the Bitcoin blockchain, leveraging ICP as a Layer 2. Inscribing a Plebe immutable on Bitcoin that makes you part of a governance mechanism, giving the owner both voice and vote in the decisions of the Plebes DAO
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
