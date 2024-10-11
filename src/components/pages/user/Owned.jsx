"use client";
import { useritems } from "../../../data/item";
import React, { useEffect, useState } from "react";
import Filter from "./Filter";
import tippy from "tippy.js";

import { collections3 } from "../../../data/collections";
import Activity from "./Activity";
import {Link} from "react-router-dom";
import Image from "../../common/Image";

export default function Owned() {
  const [allItems, setAllItems] = useState(useritems);
  useEffect(() => {
    tippy("[data-tippy-content]");
  }, []);
  const addLike = (id) => {
    const items = [...allItems];
    const item = items.filter((elm) => elm.id == id)[0];
    const indexToReplace = items.findIndex((item) => item.id === id);
    if (!item.liked) {
      item.liked = true;
      item.likes += 1;
      items[indexToReplace] = item;
      setAllItems(items);
    } else {
      item.liked = false;
      item.likes -= 1;
      items[indexToReplace] = item;
      setAllItems(items);
    }
  };
  return (
    <section className="relative py-24 pt-20">
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
        {/* Tabs Nav */}
        <ul
          className="nav nav-tabs scrollbar-custom mb-12 flex items-center justify-start overflow-x-auto overflow-y-hidden border-b border-jacarta-100 pb-px dark:border-jacarta-600 md:justify-center"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <button
              className="nav-link relative flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white"
              id="owned-tab"
              data-bs-toggle="tab"
              data-bs-target="#owned"
              type="button"
              role="tab"
              aria-controls="owned"
              aria-selected="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="mr-1 h-5 w-5 fill-current"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm9 8h3l-4 4-4-4h3V9h2v4z" />
              </svg>
              <span className="font-display text-base font-medium">Owned</span>
            </button>
          </li>
        </ul>

        <div className="tab-content">
     

          {/* Owned Tab */}
          <div
            className="tab-pane fade"
            id="owned"
            role="tabpanel"
            aria-labelledby="owned-tab"
          >
            {/* Filters */}
            <Filter />
            {/* end filters */}

            {/* Grid */}
            <div className="grid grid-cols-1 gap-[1.875rem] md:grid-cols-2 lg:grid-cols-4">
              {allItems
                .filter((elm) => elm.type == "owned")
                .map((elm, i) => (
                  <article key={i}>
                    <div className="block rounded-2.5xl border border-jacarta-100 bg-white p-[1.1875rem] transition-shadow hover:shadow-lg dark:border-jacarta-700 dark:bg-jacarta-700">
                      <figure className="relative">
                        <Link href={`/item/${elm.id}`}>
                          <Image
                            width={230}
                            height={230}
                            src={elm.imageSrc}
                            alt="item 5"
                            className="w-full rounded-[0.625rem]"
                            loading="lazy"
                          />
                        </Link>
                        <div className="absolute top-3 right-3 flex items-center space-x-1 rounded-md bg-white p-2 dark:bg-jacarta-700">
                          <span
                            onClick={() => addLike(elm.id)}
                            className={`js-likes relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0 ${
                              elm.liked ? "js-likes--active" : ""
                            }`}
                            data-tippy-content="Favorite"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="h-4 w-4 fill-jacarta-500 hover:fill-red dark:fill-jacarta-200 dark:hover:fill-red"
                            >
                              <path fill="none" d="M0 0H24V24H0z" />
                              <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" />
                            </svg>
                          </span>
                          <span className="text-sm dark:text-jacarta-200">
                            {elm.likes}
                          </span>
                        </div>
                        <div className="absolute left-3 -bottom-3">
                          <div className="flex -space-x-2">
                            <a href="#">
                              <Image
                                width={24}
                                height={24}
                                src={elm.creatorAvatar}
                                alt="creator"
                                className="h-6 w-6 rounded-full border-2 border-white hover:border-accent dark:border-jacarta-600 dark:hover:border-accent"
                                data-tippy-content="Creator: Sussygirl"
                              />
                            </a>
                            <a href="#">
                              <Image
                                width={24}
                                height={24}
                                src={elm.ownerAvatar}
                                alt="owner"
                                className="h-6 w-6 rounded-full border-2 border-white hover:border-accent dark:border-jacarta-600 dark:hover:border-accent"
                                data-tippy-content="Owner: Sussygirl"
                              />
                            </a>
                          </div>
                        </div>
                      </figure>
                      <div className="mt-7 flex items-center justify-between">
                        <Link href={`/item/${elm.id}`}>
                          <span className="font-display text-base text-jacarta-700 hover:text-accent dark:text-white">
                            {elm.title}
                          </span>
                        </Link>
                        <div className="dropup rounded-full hover:bg-jacarta-100 dark:hover:bg-jacarta-600">
                          <a
                            href="#"
                            className="dropdown-toggle inline-flex h-8 w-8 items-center justify-center text-sm"
                            role="button"
                            id="itemActions"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <svg
                              width="16"
                              height="4"
                              viewBox="0 0 16 4"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="fill-jacarta-500 dark:fill-jacarta-200"
                            >
                              <circle cx="2" cy="2" r="2" />
                              <circle cx="8" cy="2" r="2" />
                              <circle cx="14" cy="2" r="2" />
                            </svg>
                          </a>
                          <div
                            className="dropdown-menu dropdown-menu-end z-10 hidden min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                            aria-labelledby="itemActions"
                          >
                            <button className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              New bid
                            </button>
                            <hr className="my-2 mx-4 h-px border-0 bg-jacarta-100 dark:bg-jacarta-600" />
                            <button className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Refresh Metadata
                            </button>
                            <button className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Share
                            </button>
                            <button className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Report
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="mr-1 text-jacarta-700 dark:text-jacarta-200">
                          {elm.price}
                        </span>
                        <span className="text-jacarta-500 dark:text-jacarta-300">
                          {elm.bidCount}
                        </span>
                      </div>

                      <div className="mt-8 flex items-center justify-between">
                        <button
                          className="font-display text-sm font-semibold text-accent"
                          data-bs-toggle="modal"
                          data-bs-target="#buyNowModal"
                        >
                          Buy now
                        </button>
                        <Link
                          href={`/item/${elm.id}`}
                          className="group flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="mr-1 mb-[3px] h-4 w-4 fill-jacarta-500 group-hover:fill-accent dark:fill-jacarta-200"
                          >
                            <path fill="none" d="M0 0H24V24H0z" />
                            <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12h2c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8C9.25 4 6.824 5.387 5.385 7.5H8v2H2v-6h2V6c1.824-2.43 4.729-4 8-4zm1 5v4.585l3.243 3.243-1.415 1.415L11 12.413V7h2z" />
                          </svg>
                          <span className="font-display text-sm font-semibold group-hover:text-accent dark:text-jacarta-200">
                            View History
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
            {/* end grid */}
          </div>
          {/* end owned tab */}

      
        

       
          {/* end activity tab */}
        </div>
      </div>
    </section>
  );
}
