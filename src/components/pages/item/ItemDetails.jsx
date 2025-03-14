import Tabs from "./Tabs";
import { allItems } from "../../../data/item";
import Image from "../../common/Image";
import { Link } from "react-router-dom";
import Timer from "./Timer";
import BidOffers from "./BidOffers";
import { useEffect } from "react";
import { useBioniqContext } from "../../../hooks/BioniqContext";

export default function ItemDetails({ id, setModalOpen }) {
  const { liveAuction, liveAuctionBidders } = useBioniqContext();
  const item = allItems.filter((elm) => elm.id == id)[0] || allItems[0];
  useEffect(() => {

  }, [liveAuction, liveAuctionBidders])
  console.log("live auction in item details", liveAuction)
 


  function convertToUnixTimestamp(data) {
    const { year, month, day, hour, minute, second, millisecond, timezone } = data;

    // Create a new Date object with the provided values
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));

    // Convert to the specified timezone using toLocaleString and then back to Unix time
    const localeDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));

    // Return Unix timestamp in seconds
    return date;
  }



  if(!liveAuction){
    return (
      <>
        <section className="relative pt-12 pb-24 lg:py-24">
          <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
            <Image
              width={1920}
              height={789}
              src="/img/gradient_light.jpg"
              alt="gradient"
              className="h-full w-full"
            />
          </picture>
          <div className="container">
            {/* Item */}
            <div className="md:flex md:flex-wrap">
              {/* Image */}
              <figure className="mb-8 md:w-2/5 md:flex-shrink-0 md:flex-grow-0 md:basis-auto lg:w-1/2">
                <Image
                  width={540}
                  height={670}
                  src={'img/plebes_wait.png'}
                  alt="item"
                  className="cursor-pointer rounded-2.5xl w-[100%]"
                  data-bs-toggle="modal"
                  data-bs-target="#imageModal"
                />
  
                {/* Modal */}
                {/* <div
                  className="modal fade"
                  id="imageModal"
                  tabIndex="-1"
                  aria-hidden="true"
                >
                  <div className="modal-dialog !my-0 flex h-full items-center justify-center p-4">
                    <Image
                      width={787}
                      height={984}
                      src={liveAuction.contentUrl}
                      alt="item"
                    />
                  </div>
  
                  <button
                    type="button"
                    className="btn-close absolute top-6 right-6"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-6 w-6 fill-white"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                    </svg>
                  </button>
                </div> */}
                {/* end modal */}
              </figure>
  
              {/* Details */}
              <div className="md:w-3/5 md:basis-auto md:pl-8 lg:w-1/2 lg:pl-[3.75rem]">
                {/* Collection / Likes / Actions */}
                <div className="mb-3 flex">
                  {/* Collection */}
                  <div className="flex items-center">
                    <Link
                      href={`/collections`}
                      className="mr-2 text-sm font-bold text-accent"
                    >
                      {"Plebes"}
                    </Link>
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green dark:border-jacarta-600"
                      data-tippy-content="Verified Collection"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="h-[.875rem] w-[.875rem] fill-white"
                      >
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                      </svg>
                    </span>
                  </div>
  
                  {/* Likes / Actions */}
                  <div className="ml-auto flex space-x-2">
                 
  
                    {/* Actions */}
                
                  </div>
                </div>
  
                {/* <h1 className="mb-4 font-display text-4xl font-semibold text-jacarta-700 dark:text-white">
                  {liveAuction.collectionId ? liveAuction.collectionId : "Plebes"}
                </h1> */}
  
                <div className="mb-8 flex items-center space-x-4 whitespace-nowrap">
                  <div className="flex items-center">
                  </div>
  
                </div>
  
                <p className="mb-10 dark:text-jacarta-300">
                  Wait for the next auction, coming soon!
                </p>
  
                {/* Creator / Owner */}
                {/* <BidOffers liveAuctionBidders={liveAuctionBidders} /> */}
  
                {/* Bid */}
                <div className="rounded-2lg border border-jacarta-100 bg-white p-8 dark:border-jacarta-600 dark:bg-jacarta-700">
                  <div className="mb-8 sm:flex sm:flex-wrap">
                    {/* Highest bid */}
  
  
                    {/* Countdown */}
                    {/* <div className="mt-4 dark:border-jacarta-600 sm:mt-0 sm:w-1/2 sm:border-l sm:border-jacarta-100 sm:pl-4 lg:pl-8">
                      <span className="js-countdown-ends-label text-sm text-jacarta-400 dark:text-jacarta-300">
                        Auction ends in
                      </span>
                      { liveAuction && <Timer timerStamp={liveAuction.auction_expiry} /> }
                    </div> */}
                  </div>
  
                  <a
                    href="#"
                    className="inline-block w-full dis rounded-full bg-grey py-3 px-8 text-center font-semibold text-white transition-all"
                  >
                    Place Bid
                  </a>
                </div>
                {/* end bid */}
              </div>
              {/* end details */}
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="relative pt-12 pb-24 lg:py-24">
        <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
          <Image
            width={1920}
            height={789}
            src="/img/gradient_light.jpg"
            alt="gradient"
            className="h-full w-full"
          />
        </picture>
        <div className="container">
          {/* Item */}
          <div className="md:flex md:flex-wrap">
            {/* Image */}
            <figure className="mb-8 md:w-2/5 md:flex-shrink-0 md:flex-grow-0 md:basis-auto lg:w-1/2">
              <Image
                width={540}
                height={670}
                src={liveAuction.content_url}
                alt="item"
                className="cursor-pointer rounded-2.5xl w-[100%]"
                data-bs-toggle="modal"
                data-bs-target="#imageModal"
              />

              {/* Modal */}
              {/* <div
                className="modal fade"
                id="imageModal"
                tabIndex="-1"
                aria-hidden="true"
              >
                <div className="modal-dialog !my-0 flex h-full items-center justify-center p-4">
                  <Image
                    width={787}
                    height={984}
                    src={liveAuction.contentUrl}
                    alt="item"
                  />
                </div>

                <button
                  type="button"
                  className="btn-close absolute top-6 right-6"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-6 w-6 fill-white"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                  </svg>
                </button>
              </div> */}
              {/* end modal */}
            </figure>

            {/* Details */}
            <div className="md:w-3/5 md:basis-auto md:pl-8 lg:w-1/2 lg:pl-[3.75rem]">
              {/* Collection / Likes / Actions */}
              <div className="mb-3 flex">
                {/* Collection */}
                <div className="flex items-center">
                  <Link
                    href={`/collections`}
                    className="mr-2 text-sm font-bold text-accent"
                  >
                    {"Plebes"}
                  </Link>
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green dark:border-jacarta-600"
                    data-tippy-content="Verified Collection"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-[.875rem] w-[.875rem] fill-white"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                    </svg>
                  </span>
                </div>

                {/* Likes / Actions */}
                <div className="ml-auto flex space-x-2">
               

                  {/* Actions */}
              
                </div>
              </div>

              <h1 className="mb-4 font-display text-4xl font-semibold text-jacarta-700 dark:text-white">
                {liveAuction.collectionId ? liveAuction.collectionId : "Plebes"}
              </h1>

              <div className="mb-8 flex items-center space-x-4 whitespace-nowrap">
                <div className="flex items-center">
                </div>

              </div>

              <p className="mb-10 dark:text-jacarta-300">
                The Plebe of the day! Place your bids! The round starts at just $5!
              </p>

              {/* Creator / Owner */}
              <BidOffers liveAuctionBidders={liveAuctionBidders} />

              {/* Bid */}
              <div className="rounded-2lg border border-jacarta-100 bg-white p-8 dark:border-jacarta-600 dark:bg-jacarta-700">
                <div className="mb-8 sm:flex sm:flex-wrap">
                  {/* Highest bid */}


                  {/* Countdown */}
                  <div className="mt-4 dark:border-jacarta-600 sm:mt-0 sm:w-1/2 sm:border-l sm:border-jacarta-100 sm:pl-4 lg:pl-8">
                    <span className="js-countdown-ends-label text-sm text-jacarta-400 dark:text-jacarta-300">
                      Auction ends in
                    </span>
                    { liveAuction && <Timer timerStamp={liveAuction.auction_expiry} /> }
                  </div>
                </div>

                <a
                  href="#"
                  onClick={() => setModalOpen(true)}
                  className="inline-block w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                >
                  Place Bid
                </a>
              </div>
              {/* end bid */}
            </div>
            {/* end details */}
          </div>
        </div>
      </section>
    </>
  );
}
