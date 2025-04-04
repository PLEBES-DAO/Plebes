import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import "./Deposit.css";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FaCheck } from "react-icons/fa";
import { useBioniqContext } from "../../../hooks/BioniqContext";

const enableBlurIfNoWallet = false; // Poner en true para activar el efecto Blur cuando no hay wallet activada

// Tokens con logos y redes
const aggregatorTokens = {
  // USDC
  USDC: {
    logo: "/img/coins/usdc.svg",
    networks: [
      { aggregatorSymbol: "USDCARB", displayToken: "USDC", displayNetwork: "Arbitrum" },
      { aggregatorSymbol: "USDCBASE", displayToken: "USDC", displayNetwork: "Base" },
      { aggregatorSymbol: "USDC", displayToken: "USDC", displayNetwork: "eth" },
      { aggregatorSymbol: "USDCMATIC", displayToken: "USDC", displayNetwork: "matic" },
      { aggregatorSymbol: "USDCNEAR", displayToken: "USDC", displayNetwork: "Near" },
      { aggregatorSymbol: "USDCOP", displayToken: "USDC", displayNetwork: "Optimism" },
      { aggregatorSymbol: "USDCSOL", displayToken: "USDC", displayNetwork: "sol" },
      { aggregatorSymbol: "USDCTRC20", displayToken: "USDC", displayNetwork: "trx" },
    ],
  },

  // USDT
  USDT: {
    logo: "/img/coins/usdt.svg",
    networks: [
      { aggregatorSymbol: "USDTCARB", displayToken: "USDT", displayNetwork: "Arbitrum" },
      { aggregatorSymbol: "USDTBASE", displayToken: "USDT", displayNetwork: "base" },
      { aggregatorSymbol: "USDTERC20", displayToken: "USDT", displayNetwork: "eth" },
      { aggregatorSymbol: "USDTMATIC", displayToken: "USDT", displayNetwork: "matic" },
      { aggregatorSymbol: "USDTNEAR", displayToken: "USDT", displayNetwork: "Near" },
      { aggregatorSymbol: "USDTOP", displayToken: "USDT", displayNetwork: "Optimism" },
      { aggregatorSymbol: "USDTCSOL", displayToken: "USDT", displayNetwork: "sol" },
      { aggregatorSymbol: "USDTTRC20", displayToken: "USDT", displayNetwork: "trx" },
    ],
  },

  // BTC
  BTC: {
    logo: "/img/coins/btc.svg",
    networks: [
      { aggregatorSymbol: "BTC", displayToken: "BTC", displayNetwork: "Bitcoin" },
      { aggregatorSymbol: "BTC-LIGHTNING", displayToken: "BTC", displayNetwork: "Lightning" },
    ],
  },

  // ETH
  ETH: {
    logo: "/img/coins/eth.svg",
    networks: [
      { aggregatorSymbol: "ETHARB", displayToken: "ETH", displayNetwork: "mainnet" },
      { aggregatorSymbol: "ETHBASE", displayToken: "ETH", displayNetwork: "Base" },
      { aggregatorSymbol: "ETH", displayToken: "ETH", displayNetwork: "Ethereum" },
      { aggregatorSymbol: "ETHOP", displayToken: "ETH", displayNetwork: "Optimism" },
    ],
  },

  // ADA
  ADA: {
    logo: "/img/coins/ada.svg",
    networks: [
      { aggregatorSymbol: "ADA", displayToken: "ADA", displayNetwork: "mainnet" },
    ],
  },

  // ALGO
  ALGO: {
    logo: "/img/coins/algo.svg",
    networks: [
      { aggregatorSymbol: "ALGO", displayToken: "ALGO", displayNetwork: "mainnet" },
    ],
  },

  // APT
  APT: {
    logo: "/img/coinplebes/APT.svg",
    networks: [
      { aggregatorSymbol: "APT", displayToken: "APT", displayNetwork: "mainnet" },
    ],
  },

  // ARB
  ARB: {
    logo: "/img/coinplebes/ARB.svg",
    networks: [
      { aggregatorSymbol: "ARB", displayToken: "ARB", displayNetwork: "mainnet" },
    ],
  },

  // AVAX
  AVAX: {
    logo: "/img/coins/avax.svg",
    networks: [
      { aggregatorSymbol: "AVAX-C", displayToken: "AVAX", displayNetwork: "mainnet" },
    ],
  },

  // BNB
  BNB: {
    logo: "/img/coins/bnb.svg",
    networks: [
      { aggregatorSymbol: "BNB-BSC", displayToken: "BNB", displayNetwork: "mainnet" },
    ],
  },

  // BUSD
  BUSD: {
    logo: "/img/coinplebes/BUSD.svg",
    networks: [
      { aggregatorSymbol: "BUSD", displayToken: "BUSD", displayNetwork: "mainnet" },
    ],
  },

  // DOGE
  DOGE: {
    logo: "/img/coins/doge.svg",
    networks: [
      { aggregatorSymbol: "DOGE", displayToken: "DOGE", displayNetwork: "mainnet" },
    ],
  },

  // DOT
  DOT: {
    logo: "/img/coins/dot.svg",
    networks: [
      { aggregatorSymbol: "DOT", displayToken: "DOT", displayNetwork: "mainnet" },
    ],
  },

  // ICP
  ICP: {
    logo: "/img/coins/icp.svg",
    networks: [
      { aggregatorSymbol: "ICP", displayToken: "ICP", displayNetwork: "mainnet" },
    ],
  },

  // NEAR
  NEAR: {
    logo: "/img/coinplebes/NEAR.svg",
    networks: [
      { aggregatorSymbol: "NEAR", displayToken: "NEAR", displayNetwork: "mainnet" },
    ],
  },

  // OP
  OP: {
    logo: "/img/coinplebes/OP.svg",
    networks: [
      { aggregatorSymbol: "OP", displayToken: "OP", displayNetwork: "mainnet" },
    ],
  },

  // SOL
  SOL: {
    logo: "/img/coinplebes/SOL.svg",
    networks: [
      { aggregatorSymbol: "SOL", displayToken: "SOL", displayNetwork: "mainnet" },
    ],
  },

  // SUI
  SUI: {
    logo: "/img/coinplebes/sui.svg",
    networks: [
      { aggregatorSymbol: "SUI", displayToken: "SUI", displayNetwork: "mainnet" },
    ],
  },

  // TON
  TON: {
    logo: "/img/coinplebes/TON.svg",
    networks: [
      { aggregatorSymbol: "TON", displayToken: "TON", displayNetwork: "mainnet" },
    ],
  },

  // XLM
  XLM: {
    logo: "/img/coinplebes/XLM.svg",
    networks: [
      { aggregatorSymbol: "XLM", displayToken: "XLM", displayNetwork: "mainnet" },
    ],
  },

  // XRP
  XRP: {
    logo: "/img/coinplebes/XRP.svg",
    networks: [
      { aggregatorSymbol: "XRP", displayToken: "XRP", displayNetwork: "mainnet" },
    ],
  },

  // WLD
  WLD: {
    logo: "/img/coinplebes/WLD.svg",
    networks: [
      { aggregatorSymbol: "WLD", displayToken: "WLD", displayNetwork: "mainnet" },
    ],
  },
};

// “minimum deposit”
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
        <TokenRow />
      </main>
      <Footer1 />
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

  // Step en la caja derecha (1..5). 1 => “Connect wallet”
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
    <section className="relative  lg:py-24">
      <div className="mx-4 mb-4 text-white">
        {wallets?.ckBTC?.walletAddressForDisplay
          ? `Wallet connected: ${wallets.ckBTC.walletAddressForDisplay}`
          : "Account not detected. Please log in."}
      </div>

      <div className="mx-4">
        <span className="text-white">Multichain deposit</span>
        <hr className="border-white" />
      </div>

      <div className="flex flex-col lg:flex-row w-full">
        <div
          className="w-full lg:w-1/2 flex justify-start items-start mx-4 px-4"
          style={{ filter: leftBoxBlur }}
        >
          <div className="timeline-container w-full">
            <div className="timeline-item flex">
            <div className="hidden md:flex flex-col items-center">
            <div className="circle">1</div>
                <div className="line"></div>
                <div className="circle">2</div>
                <div className="line" style={{ height: "5.5rem" }}></div>
                <div className="circle">3</div>
                <div className="line" style={{ height: "1.5rem" }}></div>
                <div className="circle">4</div>
              </div>

              {/* Form */}
              <div className="md w-md: ml-8 flex-1">
                {/* Select token+network */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100">
                        Select Token
                      </label>
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedToken}
                          onChange={(e) => {
                            setSelectedToken(e.target.value);
                            setSelectedNetworkIndex(0);
                          }}
                          className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600"
                        >
                          {Object.keys(aggregatorTokens).map((tk) => (
                            <option key={tk} value={tk}>
                              {tk}
                            </option>
                          ))}
                        </select>
                        {tokenLogo && (
                          <img src={tokenLogo} alt={selectedToken} className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100">
                        Select Network
                      </label>
                      <select
                        value={selectedNetworkIndex}
                        onChange={(e) => setSelectedNetworkIndex(Number(e.target.value))}
                        className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600"
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
                  <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100">
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
      "
                    >
                      {/* Ícono de intercambio (Heroicons ‘switch-vertical’) */}
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

                  <p className="text-xs text-gray-400 mt-1">
                    Minimum deposit: {minDeposit || "0.00"}
                  </p>
                </div>


                {/* Start button */}
                <div className="mb-8">
                  <button
                    onClick={handleCreateExchange}
                    className="px-4 py-2 bg-accent text-white rounded-lg shadow hover:bg-accent-dark focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    disabled={loading || !wallets?.ckBTC?.walletAddressForDisplay}
                  >
                    {loading ? "Processing..." : "Start"}
                  </button>
                </div>

                {/* Deposit Info */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100">
                      Deposit to this wallet
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={
                          apiResponse?.details?.deposit?.address || "0x1234567890abcdef"
                        }
                        readOnly
                        className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12"
                      />
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            apiResponse?.details?.deposit?.address ||
                            "0x1234567890abcdef"
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-accent hover:bg-accent-dark text-white rounded-md text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>


                  {apiResponse?.details?.deposit?.extra_id && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100">
                        Memo
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={apiResponse.details.deposit.extra_id}
                          readOnly
                          className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12"
                        />
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(apiResponse.details.deposit.extra_id)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-accent hover:bg-accent-dark text-white rounded-md text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-jacarta-500 mb-1 dark:text-jacarta-100">
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
                        className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12"
                      />
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            apiResponse?.details?.deposit?.amount || "0.00"
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-accent hover:bg-accent-dark text-white rounded-md text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor de la derecha 5-step progress. #1 => Connect wallet */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start items-center p-8">
          <div className="w-full max-w-md bg-jacarta-800 rounded-lg shadow-lg p-8 min-h-[800px]">
            <div className="relative w-full h-40">
              <div className="absolute w-full flex justify-between items-center px-12">
                <div className="h-1 bg-white absolute left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>
                {[1, 2, 3, 4, 5].map((num) => {
                  const isActive = rightStep >= num;
                  return (
                    <div
                      key={num}
                      className={`w-12 h-12 text-lg font-bold rounded-full flex items-center justify-center z-10 transition-colors duration-300 ${isActive ? "bg-accent text-white" : "bg-white text-jacarta-800"
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
                  <h3 className="text-3xl font-bold mb-6">Connect Wallet</h3>
                  <p className="text-xl">Unlock multichain deposits</p>
                </div>
              )}
              {rightStep === 2 && (
                <div>
                  <h3 className="text-3xl font-bold mb-6">Awaiting deposit</h3>
                  <p className="text-xl">Send the specified amount to continue</p>
                </div>
              )}
              {rightStep === 3 && (
                <div>
                  <h3 className="text-3xl font-bold mb-6">Receiving tokens</h3>
                  <p className="text-xl">Your deposit is being processed</p>
                </div>
              )}
              {rightStep === 4 && (
                <div>
                  <h3 className="text-3xl font-bold mb-6">
                    Swapping tokens to ckBTC
                  </h3>
                  <p className="text-xl">Converting your tokens</p>
                </div>
              )}
              {rightStep === 5 && (
                <div>
                  {status === "finished" ? (
                    <>
                      <h3 className="text-3xl font-bold mb-6">Balance updated</h3>
                      <p className="text-xl">Check your wallet for new ckBTC</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold mb-6">Sending ckBTC</h3>
                      <p className="text-xl">Finalizing your transaction</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Details / QR */}
      {!isError && apiResponse?.details && (
        <div>
          <div className="mt-6 p-4 bg-jacarta-800 rounded-lg shadow-sm dark:bg-jacarta-700 relative">
            <h2 className="text-lg font-medium text-jacarta-100 mb-4">
              Exchange Details
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
            >
              X
            </button>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col items-center gap-2">
                <QRCodeSVG
                  value={apiResponse.details.deposit.address}
                  size={300}
                />
                <span className="block text-jacarta-100 break-all">
                  {apiResponse.details.deposit.address}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100">
                  Deposit Amount:
                </span>
                <span className="text-jacarta-100">
                  {apiResponse.details.deposit.amount}{" "}
                  {apiResponse.details.deposit.symbol?.toUpperCase() || ""}
                </span>
              </div>
              {apiResponse.details.id && (
                <div className="flex flex-col items-center">
                  <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100">
                    StealthEX ID:
                  </span>
                  <span className="text-jacarta-100">{apiResponse.details.id}</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100">
                  Status:
                </span>
                <span className="text-jacarta-100">{status}</span>
              </div>
            </div>
          </div>
          <SwapSteps />
        </div>
      )}

      {isError && (
        <div className="mt-6 p-4 bg-red-800 rounded-lg shadow-sm">
          <p className="text-red-100">
            <strong>Error:</strong> Failed to retrieve exchange details. Please try again.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center mt-4">
          <div className="spinner-border animate-spin text-accent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <span className="ml-2 text-jacarta-100">{status}</span>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Are you sure you want to delete this exchange details?
            </h3>
            <p className="text-gray-600 mb-4">
              If you already deposited, wait for the deposit to go through, or you
              will need to manually convert your funds.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExchange}
                className="px-4 py-2 bg-red-500 text-gray-800 rounded-lg hover:bg-red-600"
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
        <h2 className="text-lg font-medium text-white mb-4">Swap Details</h2>
        <p className="text-sm text-jacarta-300 mb-6">
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
                className={`flex items-center justify-center w-8 h-8 rounded-full ${step.id <= swapStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-gray-300"
                  }`}
              >
                {step.id < swapStep ? <FaCheck /> : step.id}
              </div>
              <div className="flex items-center space-x-2">
                <p
                  className={`text-sm font-medium ${step.id <= swapStep ? "text-white" : "text-jacarta-400"
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
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}