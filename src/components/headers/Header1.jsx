"use client";
import React, { useEffect, useState } from "react";
import Profile from "./component/Profile";
import Image from "../common/Image";
import { useBioniqContext } from "../../hooks/BioniqContext";
import { useNavigate } from "react-router-dom";

export default function Header1({ bLogin, setModalOpen }) {
  const navigate = useNavigate();
  const {
    login,
    logout,
    userConnection,
    reloadInscriptions,
    reloadWallets,
    liveBioniqWalletApi,
    isLoggedIn,
    wallets,
    ckBTCTotal,
    balances
  } = useBioniqContext();

  useEffect(() => {
    console.log("header reload", isLoggedIn, wallets, ckBTCTotal);
  }, [isLoggedIn, wallets, balances]);

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState); // Toggle dropdown visibility using previous state
  };

  return (
    <>
      <header
        className={`js-page-header fixed top-0 z-20 w-full backdrop-blur transition-colors ${
          scrolled ? "js-page-header--is-sticky" : ""
        }`}
      >
        <div className="flex items-center px-6 py-6 xl:px-24">
          {/* Logo */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              console.log("Logo clicked, navigating to home");
              navigate("/");
            }}
            className="shrink-0 cursor-pointer logo-container"
            style={{ position: "relative", zIndex: 50, pointerEvents: "auto" }}
          >
            <picture className="dark:hidden">
              <Image
                width={130}
                height={28}
                src="/img/plebes1b.svg"
                className="max-h-7 dark:hidden"
                alt="Xhibiter | NFT Marketplace"
              />
            </picture>
            <picture className="hidden dark:block">
              <Image
                width={130}
                height={28}
                src="/img/plebes1w.svg"
                className="hidden max-h-7 dark:block"
                alt="Xhibiter | NFT Marketplace"
              />
            </picture>
          </div>

          {/* Menu / Actions */}
          <div className="lg:visible fixed inset-0 z-10 ml-auto rtl:mr-auto rtl:ml-0 items-center bg-white opacity-0 dark:bg-jacarta-800 lg:relative lg:inset-auto lg:flex lg:bg-transparent lg:opacity-100 dark:lg:bg-transparent">
            {/* Actions */}
            <div className="ml-8 hidden lg:flex xl:ml-12">
              {!isLoggedIn && (
                <div
                  onClick={async () => {
                    await login();
                  }}
                  className="cursor-pointer rtl:ml-2 js-wallet group flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:fill-white"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M22 6h-7a6 6 0 1 0 0 12h7v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2zm-7 2h8v8h-8a4 4 0 1 1 0-8zm0 3v2h3v-2h-3z" />
                  </svg>
                </div>
              )}

              {/* Profile Dropdown */}
              {isLoggedIn && (
                <div className="relative">
                  <Profile wallets={wallets} balances={balances} setModalOpen={setModalOpen} isOpen={isDropdownOpen} toggleDropdown={toggleDropdown} />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="lg:hidden ml-auto p-2"
            onClick={toggleMobileMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="text-gray-700 dark:text-white"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          {/* Mobile Menu Actions */}
          <div className="ml-auto flex lg:hidden rtl:ml-0 rtl:mr-auto z-50">
            {/* Mobile Profile */}
            {!isLoggedIn && (
              <div
                onClick={async () => {
                  await login();
                }}
                className="cursor-pointer rtl:ml-2 js-wallet group flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:fill-white"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M22 6h-7a6 6 0 1 0 0 12h7v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2zm-7 2h8v8h-8a4 4 0 1 1 0-8zm0 3v2h3v-2h-3z" />
                </svg>
              </div>
            )}

            {/* Mobile Profile */}
            {isLoggedIn && (
              <div className="relative">
                <Profile wallets={wallets} balances={balances} setModalOpen={setModalOpen} isOpen={isDropdownOpen} toggleDropdown={toggleDropdown} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-40">
          {/* Add the mobile menu items here */}
        </div>
      )}
    </>
  );
}
