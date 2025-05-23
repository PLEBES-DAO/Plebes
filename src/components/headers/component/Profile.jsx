"use client";
import CopyToClipboard from "../../../../utlis/AddClipboard";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import tippy from "tippy.js";
const languages = ["English", "Español", "Deutsch"];
import { useAuth } from "../../../AuthPlug";
import { useBioniqContext } from "../../../hooks/BioniqContext";
import { formatNumberWithPattern } from "../../../utils/index";
import { useNavigate } from "react-router-dom";

export default function Profile({ wallets, balances, setModalOpen }) {
  const navigate = useNavigate();
  const { logout, toDecimalAmounts, ckBTCTotal,convertBtcToUsd } = useBioniqContext();
  const [active1Language, setActiveLanguage] = useState(languages[0]);
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility
  const [ckBTCUSD,setCkBTCUSD] = useState(null);

  useEffect(() => {
    // 1) Define an async function inside the effect
    const convertBalance = async () => {
      try {
        // e.g. parse the ckBTC balance as a number
        const ckBtcBalance = formatNumberWithPattern(balances[1].available.fullAmount);
  
        // 2) Await the async conversion
        const usdVal = await convertBtcToUsd(ckBtcBalance);
  
        // 3) Format the result
        const usdValString = usdVal.toFixed(2);
  
        console.log("usdValString", usdValString);
  
        // 4) Update state
        setCkBTCUSD(usdValString);
      } catch (err) {
        console.error("Error converting ckBTC to USD:", err);
      }
    };
  
    // 5) Call that async function if balances exist
    if (balances && balances[1]) {
      convertBalance();
    }
  }, [balances, ckBTCTotal]); // <- dependencies
  

  useEffect(() => {
    tippy("[data-tippy-content]");
    new CopyToClipboard();
  }, []);

  const toggleDropdown = () => {
    setIsOpen(prevState => !prevState); // Toggle dropdown visibility using previous state
  };

  console.log("wallets",wallets)
  return (
    <div className="js-nav-dropdown group-dropdown relative">
      {/* Button to trigger dropdown */}
      <button
        className="dropdown-toggle group ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-accent dark:hover:bg-accent"
        id="profileDropdown"
        aria-expanded={isOpen ? "true" : "false"} // Set aria-expanded based on state
        onClick={toggleDropdown} // Toggle dropdown on click
        aria-label="profile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M11 14.062V20h2v-5.938c3.946.492 7 3.858 7 7.938H4a8.001 8.001 0 0 1 7-7.938zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div
        className={`dropdown-menu ${isOpen ? 'block' : 'hidden'} absolute z-10 min-w-[14rem] whitespace-nowrap rounded-xl bg-white transition-all will-change-transform before:absolute before:-top-3 before:h-3 before:w-full dark:bg-jacarta-800 lg:opacity-100 lg:py-4 lg:px-2  lg:shadow-2xl`}
        style={{
          top: "100%", // Keeps the dropdown below the button
          right: "20px", // Avoid overlapping the header on the right
        }}
        aria-labelledby="profileDropdown"
      >
        <button
          className="js-copy-clipboard my-4 flex select-none items-center whitespace-nowrap px-5 font-display leading-none text-jacarta-700 dark:text-white"
          data-tippy-content="Copy"
        >
          <span className="max-w-[10rem] overflow-hidden text-ellipsis">
            <img
              src="/img/BTC.svg"
              alt="BTC"
              className="inline-block h-4 w-4 mr-2"
            />
            {wallets && wallets.BTC.walletAddress}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="ml-1 mb-px h-4 w-4 fill-jacarta-500 dark:fill-jacarta-300"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z" />
          </svg>
        </button>
        <button
          className="js-copy-clipboard my-4 flex select-none items-center whitespace-nowrap px-5 font-display leading-none text-jacarta-700 dark:text-white"
          data-tippy-content="Copy"
        >
          <span className="max-w-[10rem] overflow-hidden text-ellipsis">
            <img
              src="/img/ckBTC.svg"
              alt="BTC"
              className="inline-block h-4 w-4 mr-2"
            />
            {wallets && wallets.ckBTC.walletAddressForDisplay}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="ml-1 mb-px h-4 w-4 fill-jacarta-500 dark:fill-jacarta-300"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z" />
          </svg>
        </button>
        <div className="mx-5 mb-6 rounded-lg border border-jacarta-100 p-4 dark:border-jacarta-600">
          <span className="text-sm font-medium tracking-tight dark:text-jacarta-200">
            Balance
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green">
              <img
                src="/img/ckBTC.svg"
                alt="ckBTC"
                className="inline-block h-4 w-4 mr-2"
              />
              {balances && balances[1] && formatNumberWithPattern(balances[1].available.fullAmount)} ckBTC
            </span>
            <span className="text-md text-jacarta-700 dark:text-jacarta-300">
              {ckBTCUSD && `≈ ${ckBTCUSD} USD`}
            </span>
          </div>
        </div>
        <div
          onClick={() => { navigate("/profile") }}
          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M11 14.062V20h2v-5.938c3.946.492 7 3.858 7 7.938H4a8.001 8.001 0 0 1 7-7.938zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"></path>
          </svg>
          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
            My Profile
          </span>
        </div>
        <div
          onClick={() => { setModalOpen(true) }}
          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M20 7h-2.586l-1.707-1.707A.997.997 0 0 0 15 5H5c-1.1 0-2 .9-2 2v12a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 7h9.586L16 8.414V19H5V7zm12 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path>
          </svg>
          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
            Withdrawal ckBTC
          </span>
        </div>

        <Link
          onClick={() => {
            logout();
          }}
          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z" />
          </svg>
          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
            Logout
          </span>
        </Link>
      </div>
    </div>
  );
}
