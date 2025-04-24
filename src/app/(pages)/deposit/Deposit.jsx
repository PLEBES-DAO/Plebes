import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import "./Deposit.css";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FaCheck } from "react-icons/fa";
import { useBioniqContext } from "../../../hooks/BioniqContext";
import "../../../components/homes/home-9/Munro.css";
import connectWalletGif from "../../../assets/img/dao/gif.gif";

const enableBlurIfNoWallet = false; // Poner en true para activar el efecto Blur cuando no hay wallet activada

// Tokens con logos y redes
const aggregatorTokens = {
  // USDC
  USDC: {
    logo: "/img/coins/usdc.svg",
    networks: [
      { aggregatorSymbol: "USDCARB", displayToken: "USDC", displayNetwork: "ARBITRUM" },
      { aggregatorSymbol: "USDCBASE", displayToken: "USDC", displayNetwork: "BASE" },
      { aggregatorSymbol: "USDC", displayToken: "USDC", displayNetwork: "ETHEREUM" },
      { aggregatorSymbol: "USDCMATIC", displayToken: "USDC", displayNetwork: "MATIC" },
      { aggregatorSymbol: "USDCNEAR", displayToken: "USDC", displayNetwork: "NEAR" },
      { aggregatorSymbol: "USDCOP", displayToken: "USDC", displayNetwork: "OPTIMISM" },
      { aggregatorSymbol: "USDCSOL", displayToken: "USDC", displayNetwork: "SOLANA" },
      { aggregatorSymbol: "USDCTRC20", displayToken: "USDC", displayNetwork: "TRON" },
    ],
  },

  // USDT
  USDT: {
    logo: "/img/coins/usdt.svg",
    networks: [
      { aggregatorSymbol: "USDTCARB", displayToken: "USDT", displayNetwork: "ARBITRUM" },
      { aggregatorSymbol: "USDTBASE", displayToken: "USDT", displayNetwork: "BASE" },
      { aggregatorSymbol: "USDTERC20", displayToken: "USDT", displayNetwork: "ETHEREUM" },
      { aggregatorSymbol: "USDTMATIC", displayToken: "USDT", displayNetwork: "MATIC" },
      { aggregatorSymbol: "USDTNEAR", displayToken: "USDT", displayNetwork: "NEAR" },
      { aggregatorSymbol: "USDTOP", displayToken: "USDT", displayNetwork: "OPTIMISM" },
      { aggregatorSymbol: "USDTCSOL", displayToken: "USDT", displayNetwork: "SOLANA" },
      { aggregatorSymbol: "USDTTRC20", displayToken: "USDT", displayNetwork: "TRON" },
    ],
  },

  // BTC
  BTC: {
    logo: "/img/coins/btc.svg",
    networks: [
      { aggregatorSymbol: "BTC", displayToken: "BTC", displayNetwork: "BITCOIN" },
      { aggregatorSymbol: "BTC-LIGHTNING", displayToken: "BTC", displayNetwork: "LIGHTNING" },
    ],
  },

  // ETH
  ETH: {
    logo: "/img/coins/eth.svg",
    networks: [
      { aggregatorSymbol: "ETHARB", displayToken: "ETH", displayNetwork: "MAINET" },
      { aggregatorSymbol: "ETHBASE", displayToken: "ETH", displayNetwork: "BASE" },
      { aggregatorSymbol: "ETH", displayToken: "ETH", displayNetwork: "ETHEREUM" },
      { aggregatorSymbol: "ETHOP", displayToken: "ETH", displayNetwork: "OPTIMISM" },
    ],
  },

  // ADA
  ADA: {
    logo: "/img/coins/ada.svg",
    networks: [
      { aggregatorSymbol: "ADA", displayToken: "ADA", displayNetwork: "MAINNET" },
    ],
  },

  // ALGO
  ALGO: {
    logo: "/img/coins/algo.svg",
    networks: [
      { aggregatorSymbol: "ALGO", displayToken: "ALGO", displayNetwork: "MAINNET" },
    ],
  },

  // APT
  APT: {
    logo: "/img/coinplebes/APT.svg",
    networks: [
      { aggregatorSymbol: "APT", displayToken: "APT", displayNetwork: "MAINNET" },
    ],
  },

  // ARB
  ARB: {
    logo: "/img/coinplebes/ARB.svg",
    networks: [
      { aggregatorSymbol: "ARB", displayToken: "ARB", displayNetwork: "MAINNET" },
    ],
  },

  // AVAX
  AVAX: {
    logo: "/img/coins/avax.svg",
    networks: [
      { aggregatorSymbol: "AVAX-C", displayToken: "AVAX", displayNetwork: "MAINNET" },
    ],
  },

  // BNB
  BNB: {
    logo: "/img/coins/bnb.svg",
    networks: [
      { aggregatorSymbol: "BNB-BSC", displayToken: "BNB", displayNetwork: "MAINNET" },
    ],
  },

  // BUSD
  BUSD: {
    logo: "/img/coinplebes/BUSD.svg",
    networks: [
      { aggregatorSymbol: "BUSD", displayToken: "BUSD", displayNetwork: "MAINNET" },
    ],
  },

  // DOGE
  DOGE: {
    logo: "/img/coins/doge.svg",
    networks: [
      { aggregatorSymbol: "DOGE", displayToken: "DOGE", displayNetwork: "MAINNET" },
    ],
  },

  // DOT
  DOT: {
    logo: "/img/coins/dot.svg",
    networks: [
      { aggregatorSymbol: "DOT", displayToken: "DOT", displayNetwork: "MAINNET" },
    ],
  },

  // ICP
  ICP: {
    logo: "/img/coins/icp.svg",
    networks: [
      { aggregatorSymbol: "ICP", displayToken: "ICP", displayNetwork: "MAINNET" },
    ],
  },

  // NEAR
  NEAR: {
    logo: "/img/coinplebes/NEAR.svg",
    networks: [
      { aggregatorSymbol: "NEAR", displayToken: "NEAR", displayNetwork: "MAINNET" },
    ],
  },

  // OP
  OP: {
    logo: "/img/coinplebes/OP.svg",
    networks: [
      { aggregatorSymbol: "OP", displayToken: "OP", displayNetwork: "MAINNET" },
    ],
  },

  // SOL
  SOL: {
    logo: "/img/coinplebes/SOL.svg",
    networks: [
      { aggregatorSymbol: "SOL", displayToken: "SOL", displayNetwork: "MAINNET" },
    ],
  },

  // SUI
  SUI: {
    logo: "/img/coinplebes/sui.svg",
    networks: [
      { aggregatorSymbol: "SUI", displayToken: "SUI", displayNetwork: "MAINNET" },
    ],
  },

  // TON
  TON: {
    logo: "/img/coinplebes/TON.svg",
    networks: [
      { aggregatorSymbol: "TON", displayToken: "TON", displayNetwork: "MAINNET" },
    ],
  },

  // XLM
  XLM: {
    logo: "/img/coinplebes/XLM.svg",
    networks: [
      { aggregatorSymbol: "XLM", displayToken: "XLM", displayNetwork: "MAINNET" },
    ],
  },

  // XRP
  XRP: {
    logo: "/img/coinplebes/XRP.svg",
    networks: [
      { aggregatorSymbol: "XRP", displayToken: "XRP", displayNetwork: "MAINNET" },
    ],
  },

  // WLD
  WLD: {
    logo: "/img/coinplebes/WLD.svg",
    networks: [
      { aggregatorSymbol: "WLD", displayToken: "WLD", displayNetwork: "MAINNET" },
    ],
  },
};

// "minimum deposit"
async function fetchMinDepositExample(symbol, network, isUSD) {
  // Placeholder: en producción se conectaría con el backend
  return isUSD ? "10 USD" : "0.01 " + symbol;
}


export const metadata = {
  title: "Deposit Page",
};

export default function AuctionPage({ login, setModalOpenT }) {
  return (
    <>
      <Navbar bLogin={login} setModalOpen={setModalOpenT} />
      <main>
        {/* Background with overlay */}
        <div 
          className="fixed inset-0 -z-10" 
          style={{ 
            backgroundImage: "url('/img/background.png')", 
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Semi-transparent overlay with #0d102d base color */}
          <div 
            className="absolute inset-0" 
            style={{ 
              backgroundColor: "#0d102d", 
              opacity: 0.90,
            }}
          ></div>
        </div>
        
        <TokenRow />
      </main>
    </>
  );
}

const TokenRow = () => {

  const { wallets, buy ,swapStep} = useBioniqContext();
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [selectedNetworkIndex, setSelectedNetworkIndex] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);
  const [useUsd, setUseUsd] = useState(false);
  const [minDeposit, setMinDeposit] = useState("");

  // Step en la caja derecha (1..5). 1 => "Connect wallet"
  const [rightStep, setRightStep] = useState(1);

  function mapStatusToStep(status) {
    if (!status) return 2; // step 2 => "Awaiting deposit"
    if (status === "waiting") return 2;    // awaiting deposit
    if (status === "confirming" || status === "exchanging" || status === "sending" || status === "verifying" )  return 3;  // receiving tokens
    if (status === "finished" && swapStep > 0) return 4;   // swapping tokens
    if (status === "finished") return 5; // sending / balance updated
    return 2;
  }

  // Al montar, si hay tx existente, la recuperamos
  useEffect(() => {
    const fetchUserTransactions = async () => {
      if (!wallets?.ckBTC?.walletAddressForDisplay) return;
      try {
        const response = await fetch(
          `https://api.plebes.xyz/user-transactions/${wallets.ckBTC.walletAddressForDisplay}`
        );
        const data = await response.json();
        const transaction = data.transactions[0];
        if (transaction) {
          setApiResponse(transaction);
          setPolling(true);
          setStatus(transaction.details.status || "");
        }
      } catch (error) {
        console.error("Failed to fetch user transactions", error);
      }
    };
    fetchUserTransactions();
  }, [wallets]);

  // Polling
  useEffect(() => {
    if (polling) {
      const intv = setInterval(async () => {
        try {
          if (!wallets?.ckBTC?.walletAddressForDisplay) return;
          const res = await fetch(
            `https://api.plebes.xyz/user-transactions/${wallets.ckBTC.walletAddressForDisplay}`
          );
          const data = await res.json();
          const transaction = data.transactions[0];
          if (transaction) {
            if (transaction.details.status === "finished") {
              setPolling(false);
              await buy();
              handleDeleteExchange();
            }
            setApiResponse(transaction);
            setStatus(transaction.details.status);
          }
        } catch (err) {
          console.error("Failed to poll transaction", err);
          setPolling(false);
        }
      }, 1000);
      setPollInterval(intv);
    } else if (pollInterval) {
      clearInterval(pollInterval);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [polling, pollInterval, buy, wallets]);

  // Actualiza el step de la derecha
  useEffect(() => {
    // step #1 => connect wallet
    // si no hay wallet conectada => rightStep = 1
    if (!wallets?.ckBTC?.walletAddressForDisplay) {
      setRightStep(1);
      return;
    }

    const st = mapStatusToStep(status);
    setRightStep(st);
  }, [status, wallets]);

  // Actualiza minDeposit
  useEffect(() => {
    const doFetchMin = async () => {
      const tokenObj = aggregatorTokens[selectedToken];
      if (!tokenObj) return;
      const netOption = tokenObj.networks[selectedNetworkIndex];
      if (!netOption) return;
      const result = await fetchMinDepositExample(
        netOption.displayToken,
        netOption.displayNetwork,
        useUsd
      );
      setMinDeposit(result);
    };
    doFetchMin();
  }, [selectedToken, selectedNetworkIndex, useUsd]);

  async function handleCreateExchange() {
    if (!wallets?.ckBTC?.walletPrincipal) {
      console.error("No ckBTC wallet found");
      return;
    }
    const tokenObj = aggregatorTokens[selectedToken];
    if (!tokenObj) {
      console.error("Invalid selected token");
      return;
    }
    const netOption = tokenObj.networks[selectedNetworkIndex];
    if (!netOption) {
      console.error("Invalid network selection");
      return;
    }
    const aggregatorSymbol = netOption.displayToken;
    const aggregatorNetwork = netOption.displayNetwork;

    const depositAddress = AccountIdentifier.fromPrincipal({
      principal: wallets.ckBTC.walletPrincipal,
    }).toHex();

    const payload = {
      route: {
        from: { symbol: aggregatorSymbol, network: aggregatorNetwork },
        to: { symbol: "icp", network: "mainnet" },
      },
      amount: parseFloat(amount) || 0,
      estimation: useUsd ? "usd" : "direct",
      rate: "floating",
      address: depositAddress,
      user_id: wallets.ckBTC.walletAddressForDisplay,
    };

    try {
      setLoading(true);
      const response = await fetch("https://api.plebes.xyz/create-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.details?.err) {
        throw new Error(data.details.err);
      }
      setApiResponse(data);
      setPolling(true);
      setStatus("waiting");
      setHasFetched(true);
    } catch (error) {
      console.error("Error create-exchange:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExchange() {
    if (!wallets?.ckBTC?.walletAddressForDisplay) return;
    try {
      setLoading(true);
      const resp = await fetch(
        `https://api.plebes.xyz/delete-transaction/${wallets.ckBTC.walletAddressForDisplay}`,
        { method: "GET" }
      );
      if (resp.ok) {
        setApiResponse(null);
        setPolling(false);
        setStatus("");
      }
    } catch (err) {
      console.error("Error deleting transaction", err);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  const isError = hasFetched ? !apiResponse?.details?.deposit?.address : false;

  // Logo de token actual
  const tokenObj = aggregatorTokens[selectedToken];
  const tokenLogo = tokenObj?.logo || "";
  console.log("logo now",tokenLogo)

  // Blur si no hay wallet conectada
  const leftBoxBlur =
    enableBlurIfNoWallet && !wallets?.ckBTC?.walletAddressForDisplay
      ? "blur(3px)"
      : "none";

  return (
    <section className="relative h-screen">
      <div className="flex justify-center mx-4 pt-32 mb-4">
        <div 
          className="px-6 py-3 rounded-lg text-white munro-small-text text-center"
          style={{
            backgroundColor: wallets?.ckBTC?.walletAddressForDisplay ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)',
            border: wallets?.ckBTC?.walletAddressForDisplay ? '2px solid #16a34a' : '2px solid #dc2626',
            minWidth: '300px'
          }}
        >
          {wallets?.ckBTC?.walletAddressForDisplay
            ? `Wallet connected: ${wallets.ckBTC.walletAddressForDisplay}`
            : "Account not detected. Please log in."}
        </div>
      </div>

      <div className="mx-4 text-center md:text-left">
        <span className="text-white munro-regular-heading">Multichain deposit</span>
      </div>

      <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-120px)]">
        <div
          className="w-full lg:w-1/2 flex justify-start items-start mx-4 px-4"
          style={{ filter: leftBoxBlur }}
        >
          <div className="timeline-container w-full">
            <div className="timeline-item flex">
              <div className="flex flex-col items-center">
                <div className={`circle munro-small ${rightStep >= 1 ? 'active' : ''}`}>1</div>
                <div className="line" style={{ height: "8rem" }}></div>
                <div className={`circle munro-small ${rightStep >= 2 ? 'active' : ''}`}>2</div>
                <div className="line" style={{ height: "5.5rem" }}></div>
                <div className={`circle munro-small ${rightStep >= 3 ? 'active' : ''}`}>3</div>
                <div className="line" style={{ height: "1.5rem" }}></div>
                <div className={`circle munro-small ${rightStep >= 4 ? 'active' : ''}`}>4</div>
              </div>

              {/* Form */}
              <div className="ml-8 flex-1">
                {/* Select token+network */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                        Select Token
                      </label>
                      {/* Wrap select and image in a relative container */}
                      <div className="relative flex items-center">
                        <select
                          value={selectedToken}
                          onChange={(e) => {
                            setSelectedToken(e.target.value);
                            setSelectedNetworkIndex(0);
                          }}
                          // Change padding to right padding for the image
                          className="w-1/2 md:w-48 p-2 pr-8 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 munro-small appearance-none" // Changed pl-8 to pr-8
                        >
                          {Object.keys(aggregatorTokens).map((tk) => (
                            <option key={tk} value={tk}>
                              {tk}
                            </option>
                          ))}
                        </select>
                        {tokenLogo && (
                          <img
                            src={tokenLogo}
                            alt="Token Logo"
                            // Adjusted classes for absolute positioning on the right
                            className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none" // Changed left-2 to right-8
                          />
                        )}
                        
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                        Select Network
                      </label>
                      <select
                        value={selectedNetworkIndex}
                        onChange={(e) => setSelectedNetworkIndex(Number(e.target.value))}
                        className="w-1/2 md:w-48 p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 munro-small"
                      >
                        {tokenObj?.networks.map((opt, idx) => (
                          <option key={idx} value={idx}>
                            {opt.displayNetwork}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Amount + toggle USD */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                    {useUsd ? "Amount (USD)" : "Amount (Token)"}
                  </label>

                  {/* Contenedor relativo para poder posicionar el botón con absolute */}
                  <div className="relative inline-block">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="
        w-32
        p-2
        pr-10
        border
        border-jacarta-600
        rounded-lg
        bg-jacarta-800
        focus:ring-accent
        focus:border-accent
        text-jacarta-100
        dark:bg-jacarta-600
        munro-small
      "
                      placeholder={useUsd ? "0.00 USD" : "0.00"}
                    />

                    {/* Botón con ícono posicionado dentro del input */}
                    <button
                      onClick={() => setUseUsd(!useUsd)}
                      className="
        absolute
        top-1/2
        -translate-y-1/2
        right-2
        p-1
        bg-accent
        text-white
        rounded
        munro-narrow
      "
                    >
                      {/* Ícono de intercambio (Heroicons 'switch-vertical') */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 8l4-4m0 0l4 4m-4-4v12m6 0l4 4m0 0l4-4m-4 4V4"
                        />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-1 munro-small-text">
                    Minimum deposit: {minDeposit || "0.00"}
                  </p>
                </div>


                {/* Start button */}
                <div className="mb-8">
                  <button
                    onClick={handleCreateExchange}
                    className="pitch-deck-button px-4 py-2 text-white rounded-lg shadow hover:bg-accent-dark focus:ring-2 focus:ring-offset-2 focus:ring-accent munro-narrow"
                    disabled={loading || !wallets?.ckBTC?.walletAddressForDisplay}
                  >
                    {loading ? "Processing..." : "Start"}
                  </button>
                </div>

                {/* Deposit Info and QR Code */}
                <div className="flex gap-8 items-start"> {/* New flex container */}
                  {/* QR Code (Conditionally Rendered) */}
                  {apiResponse?.details?.deposit?.address && (
                    <div className="flex flex-col items-center flex-shrink-0 w-48"> {/* Container for QR */}
                       <label className="block text-sm font-medium text-jacarta-500 mb-2 dark:text-jacarta-100 munro-small-text text-center">
                         Scan to Deposit
                       </label>
                      <QRCodeSVG
                        value={apiResponse.details.deposit.address}
                        size={180} // Adjusted size
                        className="bg-white p-2 rounded-lg" // Added background for visibility
                      />
                      {/* Status Display */}
                      {status && (
                         <div className="mt-2 text-center"> 
                           <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100 munro-small-heading text-sm">
                             Status:
                           </span>
                           <span className="text-jacarta-100 munro-small-text text-sm capitalize">
                             {status}
                           </span>
                         </div>
                       )}
                    </div>
                  )}

                  {/* Input Fields Container */}
                  <div className="flex-grow"> {/* Takes remaining space */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                        Deposit to this wallet
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={
                            apiResponse?.details?.deposit?.address || "0x1234567890abcdef"
                          }
                          readOnly
                          className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12 munro-small"
                        />
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              apiResponse?.details?.deposit?.address ||
                              "0x1234567890abcdef"
                            )
                          }
                          className="pitch-deck-button absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-white rounded-md text-sm munro-narrow"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {apiResponse?.details?.deposit?.extra_id && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                          Memo
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={apiResponse.details.deposit.extra_id}
                            readOnly
                            className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12 munro-small"
                          />
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(apiResponse.details.deposit.extra_id)
                            }
                            className="pitch-deck-button absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-white rounded-md text-sm munro-narrow"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                        Deposit this quantity
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={
                            apiResponse?.details?.deposit?.amount
                              ? `${apiResponse.details.deposit.amount} on ${aggregatorTokens[selectedToken]?.networks?.[selectedNetworkIndex]?.displayNetwork
                              }`
                              : "0.00"
                          }
                          readOnly
                          className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12 munro-small"
                        />
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              apiResponse?.details?.deposit?.amount || "0.00"
                            )
                          }
                          className="pitch-deck-button absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-white rounded-md text-sm munro-narrow"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* StealthEX ID Input (Conditionally Rendered) */}
                    {apiResponse?.details?.id && (
                      <div className="mt-4"> {/* Added margin-top */} 
                        <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                          StealthEX ID
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={apiResponse.details.id}
                            readOnly
                            className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12 munro-small"
                          />
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(apiResponse.details.id)
                            }
                            className="pitch-deck-button absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-white rounded-md text-sm munro-narrow"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div> {/* End of flex container */}
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor de la derecha 5-step progress. #1 => Connect wallet */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start items-center p-8">
          <div className="w-full max-w-md bg-jacarta-800 rounded-lg shadow-lg p-8 min-h-[600px]">
            <div className="relative w-full h-40">
              <div className="absolute w-full flex justify-between items-center px-12">
                <div className="h-1 bg-white absolute left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>
                {[1, 2, 3, 4, 5].map((num) => {
                  const isActive = rightStep >= num;
                  return (
                    <div
                      key={num}
                      className={`w-12 h-12 text-lg font-bold rounded-full flex items-center justify-center z-10 transition-colors duration-300 munro-small ${isActive ? "bg-accent text-white" : "bg-white text-jacarta-800"
                        }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-24 text-center text-white">
              {rightStep === 1 && (
                <div>
                  <h3 className="text-3xl font-bold mb-6 munro-small-heading">Connect Wallet</h3>
                  <div className="flex justify-center mb-6">
                    <img src={connectWalletGif} alt="Connect Wallet" className="w-48 h-48 rounded-lg" />
                  </div>
                  <p className="text-xl munro-small-text">Unlock multichain deposits</p>
                </div>
              )}
              {rightStep === 2 && (
                <div>
                  <h3 className="text-3xl font-bold mb-6 munro-regular-heading">Awaiting deposit</h3>
                  <p className="text-xl munro-small-text">Send the specified amount to continue</p>
                </div>
              )}
              {rightStep === 3 && (
                <div>
                  <h3 className="text-3xl font-bold mb-6 munro-regular-heading">Receiving tokens</h3>
                  <p className="text-xl munro-small-text">Your deposit is being processed</p>
                </div>
              )}
              {rightStep === 4 && (
                <div>
                  <h3 className="text-3xl font-bold mb-6 munro-regular-heading">
                    Swapping tokens to ckBTC
                  </h3>
                  <p className="text-xl munro-small-text">Converting your tokens</p>
                </div>
              )}
              {rightStep === 5 && (
                <div>
                  {status === "finished" ? (
                    <>
                      <h3 className="text-3xl font-bold mb-6 munro-regular-heading">Balance updated</h3>
                      <p className="text-xl munro-small-text">Check your wallet for new ckBTC</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold mb-6 munro-regular-heading">Sending ckBTC</h3>
                      <p className="text-xl munro-small-text">Finalizing your transaction</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Details / QR 
      {!isError && apiResponse?.details && (
        <div>
          <div className="mt-6 p-4 bg-jacarta-800 rounded-lg shadow-sm dark:bg-jacarta-700 relative">
            <h2 className="text-lg font-medium text-jacarta-100 mb-4 munro-regular-heading">
              Exchange Details
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="pitch-deck-button absolute top-4 right-4 text-white hover:text-red-300 munro-narrow"
            >
              X
            </button>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center gap-2">
                <QRCodeSVG
                  value={apiResponse.details.deposit.address}
                  size={300}
                />
                <span className="block text-jacarta-100 break-all munro-small-text">
                  {apiResponse.details.deposit.address}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100 munro-small-heading">
                  Deposit Amount:
                </span>
                <span className="text-jacarta-100 munro-small-text">
                  {apiResponse.details.deposit.amount}{" "}
                  {apiResponse.details.deposit.symbol?.toUpperCase() || ""}
                </span>
              </div>
              {apiResponse.details.id && (
                <div className="flex flex-col items-center">
                  <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100 munro-small-heading">
                    StealthEX ID:
                  </span>
                  <span className="text-jacarta-100 munro-small-text">{apiResponse.details.id}</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100 munro-small-heading">
                  Status:
                </span>
                <span className="text-jacarta-100 munro-small-text">{status}</span>
              </div>
            </div>
          </div>
          <SwapSteps />
        </div>
      )}
        */}

      {isError && (
        <div className="mt-6 p-4 bg-red-800 rounded-lg shadow-sm">
          <p className="text-red-100 munro-small-text">
            <strong>Error:</strong> Failed to retrieve exchange details. Please try again.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center mt-4">
          <div className="spinner-border animate-spin text-accent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <span className="ml-2 text-jacarta-100 munro-small-text">{status}</span>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4 munro-regular-heading">
              Are you sure you want to delete this exchange details?
            </h3>
            <p className="text-gray-600 mb-4 munro-small-text">
              If you already deposited, wait for the deposit to go through, or you
              will need to manually convert your funds.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="pitch-deck-button px-4 py-2 text-white rounded-lg hover:bg-gray-300 munro-narrow"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExchange}
                className="pitch-deck-button px-4 py-2 text-white rounded-lg hover:bg-red-600 munro-narrow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

function SwapSteps({ tokenName = "ICP" }) {
  const { swapStep, setSwapStep } = useBioniqContext();

  useEffect(() => { }, [swapStep]);

  const steps = [
    { id: 1, title: `Approve ${tokenName}` },
    { id: 2, title: `Deposit ${tokenName}` },
    { id: 3, title: `Swap ${tokenName} for ckBTC` },
    { id: 4, title: "Withdraw ckBTC" },
    { id: 5, title: "Finished" },
  ];

  if (swapStep === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md mx-auto p-6 bg-jacarta-800 rounded-lg shadow-lg">
        <h2 className="text-lg font-medium text-white mb-4 munro-regular-heading">Swap Details</h2>
        <p className="text-sm text-jacarta-300 mb-6 munro-small-text">
          If you have sufficient balance in the swap pool, you may be able to swap
          directly without needing to deposit.
        </p>
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center space-x-4 p-3 rounded-lg bg-jacarta-700"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full munro-small ${step.id <= swapStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-gray-300"
                  }`}
              >
                {step.id < swapStep ? <FaCheck /> : step.id}
              </div>
              <div className="flex items-center space-x-2">
                <p
                  className={`text-sm font-medium munro-narrow-text ${step.id <= swapStep ? "text-white" : "text-jacarta-400"
                    }`}
                >
                  {step.title}
                </p>
                {step.id === swapStep && (
                  <div className="swiper-lazy-preloader animate-spin-slow"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSwapStep(0)}
          className="pitch-deck-button mt-6 px-4 py-2 text-white rounded-lg hover:bg-red-600 munro-narrow"
        >
          Close
        </button>
      </div>
    </div>
  );
}