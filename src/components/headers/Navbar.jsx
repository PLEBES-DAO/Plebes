import { useEffect, useState } from "react";
import Profile from "./component/Profile";
import Image from "../common/Image";
import { useBioniqContext } from "../../hooks/BioniqContext";
import { useNavigate } from "react-router-dom";
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory, e8sToDecimal } from '../homes/home-9/ckBTC_idl.js'; // Adjusted path
import { Principal } from '@dfinity/principal';
import '../homes/home-9/hero.css'; // Import styles

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

  // State for balance display
  const [icpBalance, setIcpBalance] = useState(null);
  const [displayBalance, setDisplayBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceIncreased, setBalanceIncreased] = useState(false);
  const [previousBalance, setPreviousBalance] = useState(null);

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileActionsOpen, setMobileActionsOpen] = useState(false);

  // Effect to handle scroll for sticky header
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

  // Effect to fetch ICP balance
  useEffect(() => {
    async function fetchIcpBalance() {
      setIsLoading(true); // Start loading
      try {
        const agent = new HttpAgent({ host: 'https://ic0.app' });
        const canisterId = 'ryjl3-tyaaa-aaaaa-aaaba-cai'; // ICP Ledger canister ID
        const walletAddress = 'ycv6x-taztk-nu75u-k4xkg-5jthb-x525x-4tfk7-b6ino-avbls-hcbkv-sqe';

        const icpActor = Actor.createActor(idlFactory, {
          agent,
          canisterId,
        });

        const balance = await icpActor.icrc1_balance_of({
          owner: Principal.fromText(walletAddress),
          subaccount: []
        });

        const balanceNumber = Number(balance);

        if (previousBalance !== null && balanceNumber > previousBalance) {
          setBalanceIncreased(true);
          setTimeout(() => setBalanceIncreased(false), 3000); // Reset pulse animation
        }

        setPreviousBalance(balanceNumber);
        setIcpBalance(e8sToDecimal(balanceNumber));
      } catch (error) {
        console.error("Error fetching ICP balance:", error);
        setIcpBalance(null); // Reset balance on error
      } finally {
        setIsLoading(false); // Finish loading
      }
    }

    fetchIcpBalance(); // Fetch initially

    const intervalId = setInterval(fetchIcpBalance, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [previousBalance]); // Rerun if previousBalance changes (which it does after fetch)

  // Effect for balance animation
  useEffect(() => {
    if (icpBalance === null || isLoading) {
        // If loading or balance is null, show 0 or loading state, don't animate
        setDisplayBalance(icpBalance);
        return;
    }

    const duration = 1500; // Animation duration
    const steps = 30; // Animation steps
    const intervalTime = duration / steps;
    let currentStep = 0;
    const startBalance = displayBalance !== null ? displayBalance : 0; // Start from current displayed or 0
    const difference = icpBalance - startBalance;

    // If the balance hasn't actually changed, don't animate
     if (difference === 0 && displayBalance !== null) {
         return;
     }

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Simple linear interpolation for smoother animation towards the target
      const animatedBalance = startBalance + difference * progress;

      // Add some randomness that decreases over time
      const randomFactor = (1 - progress) * 0.1; // Smaller random factor
      const randomValue = animatedBalance * (1 + (Math.random() - 0.5) * randomFactor);

      setDisplayBalance(randomValue);

      if (currentStep >= steps) {
        setDisplayBalance(icpBalance); // Ensure final value is accurate
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer); // Cleanup timer on unmount or if icpBalance changes
  }, [icpBalance, isLoading]); // Rerun animation if icpBalance changes or loading state finishes

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const toggleMobileActions = () => {
    setMobileActionsOpen((prev) => !prev);
  };

  // Balance Display JSX Fragment
  const BalanceDisplayElement = (
    <div className={`balance-display-mini bg-morado-translucido px-8 py-6 rounded-lg text-white text-center transition-all duration-300 ${balanceIncreased ? 'balance-increase-pulse' : ''} hidden lg:block`}>
      {isLoading && displayBalance === null ? (
        <div className="loading-animation-mini flex items-center">
          <div className="loading-spinner-mini mr-1"></div>
          <span className="text-xs munro-small-text">Loading...</span>
        </div>
      ) : (
        <div className="balance-value-mini flex items-center mt-2">
          <span className="pixel-font">
            {displayBalance !== null
              ? <>
                  <span className="text-xs "> Treasury:</span>
                  <span className="text-xs">{displayBalance.toFixed(4)}</span>
                  <img src="/src/assets/img/icp-pixelated-logo.webp" alt="ICP Logo" className="icp-logo ml-2 mb-2 inline align-middle" style={{ height: '32px' }} />
                </>
              : '0.0000'}
          </span>
        </div>
      )}
    </div>
  );

  // Mobile Balance + Logo Only
  const MobileBalance = (
    <div className="flex flex-col items-center justify-center bg-morado-translucido px-4 py-3 rounded-md text-white text-center lg:hidden">
      <div className="flex items-center justify-center">
        <span className="pixel-font text-xs">
          {isLoading && displayBalance === null ? (
            <span className="munro-small-text">...</span>
          ) : (
            displayBalance !== null ? displayBalance.toFixed(4) : '0.0000'
          )}
        </span>
        <img src="/src/assets/img/icp-pixelated-logo.webp" alt="ICP Logo" className="ml-1 mb-1 inline align-middle" style={{ height: '18px' }} />
      </div>
    </div>
  );

  return (
    <>
      <header
        className={`js-page-header fixed top-0 z-20 w-full backdrop-blur shadow-md transition-colors ${
          scrolled ? "js-page-header--is-sticky" : ""
        }`}
      >
        <div className="flex items-center px-6 py-6 xl:px-24">
          {/* Logo - Left Section */}
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

          {/* Treasury Balance Display - Desktop - Center Section */}
          <div className="flex-1 flex justify-center items-center ">
            <div className="hidden lg:block">
              {BalanceDisplayElement}
            </div>
          </div>

          {/* Menu / Actions - Right Section */}
          <div className="shrink-0 hidden lg:flex items-center">
            {/* Actions */}
            <div className="ml-8 flex xl:ml-12">
              {!isLoggedIn && (
                <>
                  {/* Social Icons */}
                  <a
                    href="https://x.com/PlebesXYZ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="white-translucent-button mr-4 h-10 w-10 flex items-center justify-center text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a
                    href="https://discord.gg/DPvQ2mgtDNm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="white-translucent-button mr-4 h-10 w-10 flex items-center justify-center text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.286a18.73 18.73 0 0 0-5.487 0 12.57 12.57 0 0 0-.617-1.287.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.206 13.206 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.347-1.22.645-1.873.877-.042.016-.062.065-.041.105.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.964 19.964 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/></svg>
                  </a>
                  {/* Login Button */}
                  <div onClick={async () => { await login(); }} className="white-translucent-button cursor-pointer rtl:ml-2 js-wallet group flex h-10 w-10 items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-4 w-4 fill-white"><path fill="none" d="M0 0h24v24H0z"/><path d="M22 6h-7a6 6 0 1 0 0 12h7v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2zm-7 2h8v8h-8a4 4 0 1 1 0-8zm0 3v2h3v-2h-3z"/></svg>
                  </div>
                  {/* Deposit Button */}
                  <button onClick={() => navigate("/deposit")} className="white-translucent-button ml-2 h-10 px-4 text-sm font-medium text-white transition-colors munro-small-text">Deposit</button>
                </>
              )}
              {isLoggedIn && (
                <div className="relative flex items-center">
                  {/* Social Icons */}
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="white-translucent-button mr-4 h-10 w-10 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="white-translucent-button mr-4 h-10 w-10 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.286a18.73 18.73 0 0 0-5.487 0 12.57 12.57 0 0 0-.617-1.287.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.206 13.206 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.347-1.22.645-1.873.877-.042.016-.062.065-.041.105.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.964 19.964 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/></svg>
                  </a>
                  {/* Profile Dropdown */}
                  <Profile wallets={wallets} balances={balances} setModalOpen={setModalOpen} isOpen={isDropdownOpen} toggleDropdown={toggleDropdown} />
                  {/* Deposit Button */}
                  <button onClick={() => navigate("/deposit")} className="white-translucent-button ml-2 h-10 px-4 text-sm font-medium text-white transition-colors munro-small-text">Deposit</button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Area */}
          <div className="ml-auto flex items-center lg:hidden">
            {/* Mobile Balance Display + Logo */}
            <div className="mr-2">
              {MobileBalance}
            </div>

            {/* Mobile Actions Hamburger Button & Dropdown */}
            <div className="relative">
              <button
                onClick={toggleMobileActions}
                className="flex h-10 w-10 items-center justify-center rounded-full focus:outline-none"
                aria-label="Toggle mobile actions menu"
                aria-expanded={isMobileActionsOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-6 w-6 fill-current text-white">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                </svg>
              </button>

              {isMobileActionsOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-morado-translucido rounded-md shadow-lg z-50 p-2">
                  <div className="flex flex-col space-y-2">
                    {!isLoggedIn && (
                      <>
                        <div onClick={async () => { await login(); toggleMobileActions(); }} className="white-translucent-button cursor-pointer flex h-10 items-center justify-center text-sm font-medium text-white transition-colors munro-small-text">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="h-4 w-4 fill-white mr-2"><path fill="none" d="M0 0h24v24H0z"/><path d="M22 6h-7a6 6 0 1 0 0 12h7v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2zm-7 2h8v8h-8a4 4 0 1 1 0-8zm0 3v2h3v-2h-3z"/></svg>
                          Login
                        </div>
                        <button onClick={() => { navigate("/deposit"); toggleMobileActions(); }} className="white-translucent-button h-10 px-4 text-sm font-medium text-white transition-colors munro-small-text">Deposit</button>
                        <div className="flex justify-around pt-2">
                          <a href="https://x.com/PlebesXYZ" target="_blank" rel="noopener noreferrer" className="white-translucent-button h-8 w-8 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </a>
                          <a href="https://discord.gg/DPvQ2mgtDNm" target="_blank" rel="noopener noreferrer" className="white-translucent-button h-8 w-8 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.286a18.73 18.73 0 0 0-5.487 0 12.57 12.57 0 0 0-.617-1.287.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.206 13.206 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.347-1.22.645-1.873.877-.042.016-.062.065-.041.105.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.964 19.964 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/></svg>
                          </a>
                        </div>
                      </>
                    )}
                    {isLoggedIn && (
                      <>
                        <Profile
                          wallets={wallets}
                          balances={balances}
                          setModalOpen={setModalOpen}
                          isOpen={isMobileActionsOpen}
                          toggleDropdown={toggleMobileActions}
                          isMobileContext={true}
                          onActionClick={toggleMobileActions}
                        />
                        <button onClick={() => { navigate("/deposit"); toggleMobileActions(); }} className="white-translucent-button h-10 px-4 text-sm font-medium text-white transition-colors munro-small-text mt-2">Deposit</button>
                        <div className="flex justify-around pt-2">
                          <a href="https://x.com/PlebesXYZ" target="_blank" rel="noopener noreferrer" className="white-translucent-button h-8 w-8 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </a>
                          <a href="https://discord.gg/DPvQ2mgtDNm" target="_blank" rel="noopener noreferrer" className="white-translucent-button h-8 w-8 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.286a18.73 18.73 0 0 0-5.487 0 12.57 12.57 0 0 0-.617-1.287.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.206 13.206 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.347-1.22.645-1.873.877-.042.016-.062.065-.041.105.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.964 19.964 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/></svg>
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay (Keep if used for other navigation) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex flex-col items-center justify-center lg:hidden">
          {/* Add mobile menu content here if needed, e.g., navigation links */}
          <button onClick={toggleMobileMenu} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
          {/* Example Mobile Links */}
          <a href="#auction" onClick={toggleMobileMenu} className="text-white text-2xl py-4">Auction</a>
          <a href="#whitepaper" onClick={toggleMobileMenu} className="text-white text-2xl py-4">Whitepaper</a>
          {/* You can add more links or content as required */}
        </div>
      )}
    </>
  );
}