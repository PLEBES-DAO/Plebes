import { useEffect, useState } from "react";
import Profile from "./component/Profile";
import Image from "../common/Image";
import { useBioniqContext } from "../hooks/BioniqContext";
import { useNavigate } from "react-router-dom";
import BalanceDisplay from "./homes/home-9/BalanceDisplay";

export default function Navbar({ bLogin, setModalOpen }) {
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
    balances,
  } = useBioniqContext();

  useEffect(() => {
    console.log("header reload", isLoggedIn, wallets, ckBTCTotal);
  }, [isLoggedIn, wallets, balances]);

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  return (
    <>
      <header
        className={`js-page-header fixed top-0 z-20 w-full backdrop-blur shadow-md transition-colors ${
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
                alt="Plebes DAO"
              />
            </picture>
            <picture className="hidden dark:block">
              <Image
                width={130}
                height={28}
                src="/img/plebes1w.svg"
                className="hidden max-h-7 dark:block"
                alt="Plebes DAO"
              />
            </picture>
          </div>

          {/* Treasury Balance Display */}
          <div className="mx-auto">
            <BalanceDisplay />
          </div>

          {/* Menu / Actions */}
          <div className="lg:visible fixed inset-0 z-10 ml-auto rtl:mr-auto rtl:ml-0 items-center bg-white opacity-0 dark:bg-jacarta-800 lg:relative lg:inset-auto lg:flex lg:bg-transparent lg:opacity-100 dark:lg:bg-transparent">
            {/* Actions */}
            <div className="ml-8 hidden lg:flex xl:ml-12">
  {!isLoggedIn && (
    <>
      <a 
          href="https://x.com/PlebesXYZ" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pitch-deck-button mr-4 h-10 w-10 flex items-center justify-center text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a 
          href="https://discord.gg/DPvQ2mgtDNm" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pitch-deck-button mr-4 h-10 w-10 flex items-center justify-center text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.286a18.73 18.73 0 0 0-5.487 0 12.57 12.57 0 0 0-.617-1.287.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.206 13.206 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.347-1.22.645-1.873.877-.042.016-.062.065-.041.105.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.964 19.964 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
        </svg>
      </a>
      <div
        onClick={async () => {
          await login();
        }}
        className="pitch-deck-button cursor-pointer rtl:ml-2 js-wallet group flex h-10 w-10 items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className="h-4 w-4 fill-white"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M22 6h-7a6 6 0 1 0 0 12h7v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2zm-7 2h8v8h-8a4 4 0 1 1 0-8zm0 3v2h3v-2h-3z" />
        </svg>
      </div>
      <button
        onClick={() => navigate("/deposit")}
        className="pitch-deck-button ml-2 h-10 px-4 text-sm font-medium text-white transition-colors munro-small-text"
      >
      Deposit
      </button>
    </>
  )}

  {isLoggedIn && (
    <div className="relative flex items-center">
      <a 
          href="https://x.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pitch-deck-button mr-4 h-10 w-10 flex items-center justify-center text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a 
          href="https://discord.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pitch-deck-button mr-4 h-10 w-10 flex items-center justify-center text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.286a18.73 18.73 0 0 0-5.487 0 12.57 12.57 0 0 0-.617-1.287.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.206 13.206 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.347-1.22.645-1.873.877-.042.016-.062.065-.041.105.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.964 19.964 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
        </svg>
      </a>
      <Profile
        wallets={wallets}
        balances={balances}
        setModalOpen={setModalOpen}
        isOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
      />
      <button
        onClick={() => navigate("/deposit")}
        className="pitch-deck-button ml-2 h-10 px-4 text-sm font-medium text-white transition-colors munro-small-text"
      >
      Deposit
      </button>
    </div>
  )}
</div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button className="lg:hidden ml-auto p-2" onClick={toggleMobileMenu}>
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

          {/* Mobile Balance Display */}
          <div className="lg:hidden mr-2">
            <BalanceDisplay />
          </div>

          {/* Mobile Menu Actions */}
          <div className="ml-auto flex lg:hidden space-x-2 rtl:ml-0 rtl:mr-auto z-50">
            {!isLoggedIn && (
              <>
                <div
                  onClick={async () => {
                    await login();
                  }}
                  className="pitch-deck-button cursor-pointer rtl:ml-2 js-wallet group flex h-10 w-10 items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-4 w-4 fill-white"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M22 6h-7a6 6 0 1 0 0 12h7v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2zm-7 2h8v8h-8a4 4 0 1 1 0-8zm0 3v2h3v-2h-3z" />
                  </svg>
                </div>
                <button
                    onClick={() => navigate("/deposit")}
                    className="pitch-deck-button ml-2 h-10 px-4 text-sm font-medium text-white transition-colors munro-small-text"
                >
                Deposit
                </button>
                <a 
                    href="https://x.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pitch-deck-button ml-2 h-10 w-10 flex items-center justify-center text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                    href="https://discord.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pitch-deck-button ml-2 h-10 w-10 flex items-center justify-center text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.286a18.73 18.73 0 0 0-5.487 0 12.57 12.57 0 0 0-.617-1.287.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.206 13.206 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.347-1.22.645-1.873.877-.042.016-.062.065-.041.105.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.964 19.964 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                  </svg>
                </a>
              </>
            )}

            {isLoggedIn && (
              <>
                <div className="relative">
                  <Profile
                    wallets={wallets}
                    balances={balances}
                    setModalOpen={setModalOpen}
                    isOpen={isDropdownOpen}
                    toggleDropdown={toggleDropdown}
                  />
                </div>
                <button
                  onClick={() => navigate("/deposit")}
                  className="pitch-deck-button ml-2 h-10 px-4 text-sm font-medium text-white transition-colors munro-small-text"
                >
                Deposit
                </button>
                <a 
                    href="https://x.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pitch-deck-button ml-2 h-10 w-10 flex items-center justify-center text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                    href="https://discord.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pitch-deck-button ml-2 h-10 w-10 flex items-center justify-center text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.286a18.73 18.73 0 0 0-5.487 0 12.57 12.57 0 0 0-.617-1.287.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.206 13.206 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.347-1.22.645-1.873.877-.042.016-.062.065-.041.105.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.964 19.964 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                  </svg>
                </a>
              </>
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