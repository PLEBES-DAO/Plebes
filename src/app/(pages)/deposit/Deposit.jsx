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
import copyIcon from "../../../assets/img/copy_icon.svg";
import checkMark from "../../../assets/img/check-mark.svg";

// Swapzone API configuration
const SWAPZONE_API_BASE_URL = "https://api.swapzone.io/v1";
const SWAPZONE_API_KEY = "48c2Gt5Iq"; // Will be replaced with actual API key later

// Configure your callback URLs for production
const CALLBACK_BASE_URL = "https://api.plebes.xyz";  
const CALLBACK_URLS = {
  standard: `${CALLBACK_BASE_URL}/callback`,
  success: `${CALLBACK_BASE_URL}/callback/success`,
  failure: `${CALLBACK_BASE_URL}/callback/failure`
};

// Helper function to generate a unique reference ID for transactions
const generateUniqueId = () => {
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

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

// "minimum deposit" - use dynamic values when available
function getMinimumDeposit(symbol, minValue) {
  // If we have a dynamic minValue from the API, use it
  if (minValue) {
    return `Minimum ${minValue} ${symbol}`;
  }
  
  // Fallback to hardcoded values
  const minimumValues = {
    "SOL": "Minimum 0.8 SOL",
    "TON": "Minimum 32 TON",
    "DOT": "Minimum 25 DOT",
    "XLM": "Minimum 370 XLM",
    "XRP": "Minimum 45.3 XRP"
  };

  return minimumValues[symbol] || `Minimum 0.01 ${symbol}`;
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
  const [selectedToken, setSelectedToken] = useState("DOT");
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
  const [currentSection, setCurrentSection] = useState(1);
  const [copiedField, setCopiedField] = useState(null);
  const [rightStep, setRightStep] = useState(1);
  const [minAmounts, setMinAmounts] = useState({});
  const [errorMessage, setErrorMessage] = useState(""); // New state for detailed error messages

  // Function to handle copy to clipboard
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // For compatibility, ensure useUsd is always false
  useEffect(() => {
    if (useUsd) {
      setUseUsd(false);
    }
  }, [useUsd]);

  function mapStatusToStep(status) {
    if (!status) return 2; // step 2 => "Awaiting deposit"
    if (status === "waiting" || status === "overdue") return 2;    // awaiting deposit
    if (status === "confirming" || status === "exchanging") return 3;  // receiving tokens
    if (status === "sending" && swapStep > 0) return 4;   // swapping tokens
    if (status === "finished") return 5; // sending / balance updated
    if (status === "failed" || status === "refunded") return 2; // Error states - go back to deposit
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
          // Si hay una transacción existente, saltamos a la sección de depósito
          setCurrentSection(3);
        }
      } catch (error) {
        console.error("Failed to fetch user transactions", error);
      }
    };
    fetchUserTransactions();
  }, [wallets]);

  // Update the polling useEffect for transaction status
  useEffect(() => {
    if (polling && apiResponse?.details?.id) {
      const intv = setInterval(async () => {
        try {
          const transactionUrl = `${SWAPZONE_API_BASE_URL}/exchange/transaction?id=${apiResponse.details.id}`;
          
          const res = await fetch(
            transactionUrl,
            { 
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": SWAPZONE_API_KEY
              }
            }
          );
          
          const data = await res.json();
          
          if (data && !data.error) {
            // Actualizar con el status correcto (según documentación)
            const currentStatus = data.status || "waiting";
            
            setApiResponse(prev => ({
              ...prev,
              details: {
                ...prev.details,
                status: currentStatus
              }
            }));
            
            setStatus(currentStatus);
            
            // Si la transacción está finalizada, detener polling
            if (currentStatus === "finished") {
              console.log("Transaction completed successfully");
              setPolling(false);
              await buy();
              handleDeleteExchange();
            }
          }
        } catch (err) {
          console.error("Failed to poll transaction:", err);
        }
      }, 5000);
      
      setPollInterval(intv);
    }
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [polling, apiResponse?.details?.id]);

  // Actualiza el step de la derecha
  useEffect(() => {
    // step #1 => connect wallet
    // si no hay wallet conectada => rightStep = 1
    if (!wallets?.ckBTC?.walletAddressForDisplay) {
      setRightStep(1);
      return;
    }

    // Mostramos el step según la sección actual si no hay status
    if (!status) {
      setRightStep(currentSection);
      return;
    }

    const st = mapStatusToStep(status);
    setRightStep(st);
  }, [status, wallets, currentSection]);

  // Actualiza minDeposit
  useEffect(() => {
    const tokenObj = aggregatorTokens[selectedToken];
    if (!tokenObj) return;
    const netOption = tokenObj.networks[selectedNetworkIndex];
    if (!netOption) return;

    const minValue = getMinimumDeposit(netOption.displayToken, netOption.minAmount);
    setMinDeposit(minValue);
  }, [selectedToken, selectedNetworkIndex]);

  // Función para avanzar a la siguiente sección
  const handleNextSection = () => {
    setCurrentSection(prev => Math.min(prev + 1, 3));
  };

  // Función para retroceder a la sección anterior
  const handlePrevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
  };

  // Add this function to fetch minimum amounts for token/network combinations
  const fetchMinimumAmount = async (token, network) => {
    try {
      if (!token || !network) return;
      
      const fromCurrency = network.displayToken.toLowerCase();
      const toCurrency = "icp";
      
      const rateUrl = `${SWAPZONE_API_BASE_URL}/exchange/get-rate?from=${fromCurrency}&to=${toCurrency}&amount=1&rateType=floating`;
      
      const rateResponse = await fetch(rateUrl, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": SWAPZONE_API_KEY
        }
      });
      
      const rateData = await rateResponse.json();
      
      if (!rateData.error && rateData.minAmount) {
        // Store the minAmount for this token
        setMinAmounts(prev => ({
          ...prev,
          [`${fromCurrency}`]: rateData.minAmount
        }));
        
        // Update the displayed minimum deposit text
        const updatedMinDeposit = getMinimumDeposit(network.displayToken, rateData.minAmount);
        setMinDeposit(updatedMinDeposit);
      }
    } catch (error) {
      console.error("Error fetching minimum amount:", error);
    }
  };

  async function handleCreateExchange() {
    console.log("handleCreateExchange started");
    
    // Reset error message
    setErrorMessage("");
    
    if (!wallets?.ckBTC?.walletPrincipal) {
      console.error("No ckBTC wallet found");
      setErrorMessage("No ckBTC wallet found. Please connect your wallet.");
      return;
    }
    
    const tokenObj = aggregatorTokens[selectedToken];
    if (!tokenObj) {
      setErrorMessage("Invalid token selection. Please try again.");
      return;
    }
    
    const netOption = tokenObj.networks[selectedNetworkIndex];
    if (!netOption) {
      setErrorMessage("Invalid network selection. Please try again.");
      return;
    }
    
    const amountToUse = parseFloat(amount) || 0;
    const fromCurrency = netOption.displayToken.toLowerCase();
    const toCurrency = "icp";
    
    try {
      setLoading(true);
      
      // Step 1: Get rate from Swapzone API
      console.log("Getting rate from Swapzone API...");
      const rateUrl = `${SWAPZONE_API_BASE_URL}/exchange/get-rate?from=${fromCurrency}&to=${toCurrency}&amount=${amountToUse}&rateType=floating`;
      console.log("Rate URL:", rateUrl);
      
      const headers = { 
        "Content-Type": "application/json",
        "x-api-key": SWAPZONE_API_KEY
      };
      console.log("Rate request headers:", JSON.stringify(headers));
      
      const rateResponse = await fetch(rateUrl, {
        method: "GET",
        headers: headers
      });
      
      console.log("Rate response status:", rateResponse.status, rateResponse.statusText);
      const rateResponseHeaders = {};
      rateResponse.headers.forEach((value, name) => {
        rateResponseHeaders[name] = value;
      });
      console.log("Rate response headers:", rateResponseHeaders);
      
      // Parse rate response as JSON directly
      let rateData;
      try {
        rateData = await rateResponse.json();
        console.log("Rate response received:", rateData);
      } catch (parseError) {
        console.error("Error parsing rate response:", parseError);
        throw new Error(`Failed to parse rate response: ${parseError.message}`);
      }
      
      // Check for errors in rate response
      if (rateData.error) {
        throw new Error(rateData.message || "Failed to get rate from Swapzone");
      }
      
      // Add a small delay between rate and transaction creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get deposit address from wallet
      const depositAddress = AccountIdentifier.fromPrincipal({
        principal: wallets.ckBTC.walletPrincipal,
      }).toHex();
      console.log("Deposit address from wallet:", depositAddress);
      
      // Step 2: Create transaction with Swapzone
      console.log("Creating transaction with Swapzone API...");
      
      const transactionPayload = {
        from: fromCurrency,
        to: toCurrency,
        amount: rateData.amountFrom, // Use exactly the amount from rate response
        addressTo: depositAddress,
        refundAddress: depositAddress,
        rateType: "floating",
        adapter: rateData.adapter,
        fromNetwork: rateData.fromNetwork,
        toNetwork: rateData.toNetwork,
        quotaId: rateData.quotaId
      };
      console.log("Transaction payload:", JSON.stringify(transactionPayload));
      
      const transactionResponse = await fetch(`${SWAPZONE_API_BASE_URL}/exchange/create-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SWAPZONE_API_KEY
        },
        body: JSON.stringify(transactionPayload)
      });
      
      console.log("Transaction response status:", transactionResponse.status, transactionResponse.statusText);
      
      // IMPORTANT: Only parse the response body ONCE
      let transactionData;
      try {
        // Use json() directly - don't call text() first
        transactionData = await transactionResponse.json();
        console.log("Transaction response data:", transactionData);
      } catch (parseError) {
        console.error("Error parsing transaction response:", parseError);
        throw new Error(`Failed to parse transaction response: ${parseError.message}`);
      }
      
      // Handle API error
      if (transactionData.error) {
        throw new Error(transactionData.message || "Failed to create transaction");
      }
      
      // Update state with transaction data
      setApiResponse({
        details: {
          id: transactionData.id,
          deposit: {
            address: transactionData.depositAddress || transactionData.address,
            amount: transactionData.amount || amountToUse,
            extra_id: transactionData.memo || null
          },
          status: "waiting"
        }
      });
      
      setPolling(true);
      setStatus("waiting");
      setHasFetched(true);
      setCurrentSection(3);
    } catch (error) {
      console.error("Error in create-exchange process:", error);
      
      let userErrorMsg = "Failed to create transaction.";
      
      if (error.message) {
        // Check for specific error patterns
        if (error.message.includes("Empty response")) {
          userErrorMsg = "The exchange service returned an empty response. This could be a temporary issue. Please try again with a different amount or token.";
        } else {
          userErrorMsg += ` Error: ${error.message}`;
        }
      }
      
      setStatus("error");
      setHasFetched(true);
      setErrorMessage(userErrorMsg);
    } finally {
      setLoading(false);
      console.log("handleCreateExchange finished");
    }
  }

  async function handleDeleteExchange() {
    if (!apiResponse?.details?.id) return;
    
    try {
      setLoading(true);
      
      // If we have a transaction ID and Swapzone supports cancellation, we would call it here
      // For now, we'll just clear the UI state as Swapzone might not support explicit cancellation
      
      console.log("Clearing local transaction state");
      setApiResponse(null);
      setPolling(false);
      setStatus("");
      setCurrentSection(1);
    } catch (err) {
      console.error("Error during transaction cleanup:", err);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  const isError = hasFetched ? !apiResponse?.details?.deposit?.address : false;

  // Logo de token actual
  const tokenObj = aggregatorTokens[selectedToken];
  const tokenLogo = tokenObj?.logo || "";

  // Blur si no hay wallet conectada
  const leftBoxBlur =
      enableBlurIfNoWallet && !wallets?.ckBTC?.walletAddressForDisplay
          ? "blur(3px)"
          : "none";

  // Log deposit details only when they change
  useEffect(() => {
    if (apiResponse?.details?.deposit) {
      console.log("Rendering Deposit Details - apiResponse:", apiResponse, "status:", status);
      console.log("Deposit Address:", apiResponse.details.deposit.address);
      if (apiResponse.details.deposit.extra_id) {
        console.log("Deposit Memo (extra_id):", apiResponse.details.deposit.extra_id);
      }
    }
  }, [apiResponse, status]);

  // Renderiza la sección de selección de token y red
  const renderTokenSelection = () => (
      <>
        <div className="mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <label className="block text-xl font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                Select Token
              </label>
              <div className="relative flex items-center">
                <select
                    value={selectedToken}
                    onChange={(e) => {
                      const newToken = e.target.value;
                      setSelectedToken(newToken);
                      setSelectedNetworkIndex(0);
                      // Fetch min amount when token changes
                      const tokenObj = aggregatorTokens[newToken];
                      if (tokenObj && tokenObj.networks.length > 0) {
                        fetchMinimumAmount(newToken, tokenObj.networks[0]);
                      }
                    }}
                    className="w-full p-2 pr-8 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 munro-small appearance-none"
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
                        className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    />
                )}
              </div>
            </div>
            <div className="w-full">
              <label className="block text-xl font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                Select Network
              </label>
              <select
                  value={selectedNetworkIndex}
                  onChange={(e) => {
                    const newIndex = Number(e.target.value);
                    setSelectedNetworkIndex(newIndex);
                    // Fetch min amount when network changes
                    const tokenObj = aggregatorTokens[selectedToken];
                    if (tokenObj && tokenObj.networks[newIndex]) {
                      fetchMinimumAmount(selectedToken, tokenObj.networks[newIndex]);
                    }
                  }}
                  className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 munro-small"
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
        <div className="flex justify-center mb-8 text-lg">
          <button
              onClick={() => {
                console.log("Next button clicked, moving to section 2");
                setCurrentSection(2);
              }}
              className="pitch-deck-button px-8 py-2 text-white rounded-lg shadow hover:bg-accent-dark focus:ring-2 focus:ring-offset-2 focus:ring-accent munro-narrow"
              disabled={!wallets?.ckBTC?.walletAddressForDisplay}
          >
            Next
          </button>
        </div>
      </>
  );

  // Renderiza la sección de entrada de cantidad
  const renderAmountInput = () => (
      <>
        <div className="mb-8">
          <div className="w-full">
            <label className="block text-lg font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
              Amount (Token)
            </label>
            <div className="relative">
              <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="
              w-full
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
                  placeholder="0.00"
              />
            </div>
            <div>
              <p className="text-md md:text-base font-medium text-accent mt-2 munro-small-text">
                {minDeposit}
              </p>
            </div>
          </div>
        </div>
        <div className="mb-8 flex space-x-4 justify-center">
          <button
              onClick={() => {
                console.log("Back button clicked, moving to section 1");
                setCurrentSection(1);
              }}
              className="px-4 py-2 text-white rounded-lg shadow bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 munro-narrow"
          >
            Back
          </button>
          <button
              onClick={handleCreateExchange}
              className="pitch-deck-button px-4 py-2 text-white rounded-lg shadow hover:bg-accent-dark focus:ring-2 focus:ring-offset-2 focus:ring-accent munro-narrow"
              disabled={loading || !amount}
          >
            {loading ? "Processing..." : "Start Deposit"}
          </button>
        </div>
        
        {/* Display error message if there is one */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-red-800 text-white munro-small-text">
            {errorMessage}
          </div>
        )}
      </>
  );

  // Renderiza la sección de información de depósito
  const renderDepositInfo = () => (
      <div className="w-full">
        {/* Two-column grid on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 w-full">
          {/* Left column - QR code section */}
          <div className="flex flex-col items-center justify-start w-full">
            {apiResponse?.details?.deposit?.address && (
                <>
                  <label className="block text-xl font-medium text-jacarta-500 mb-2 dark:text-jacarta-100 munro-small-text text-center">
                    Scan to deposit
                  </label>
                  <QRCodeSVG
                      value={apiResponse.details.deposit.address}
                      size={180}
                      className="bg-white p-2 rounded-lg"
                  />
                  {status && (
                      <div className="mt-2 text-center">
                  <span className="block font-semibold text-jacarta-500 dark:text-jacarta-100 munro-small-heading text-lg">
                    Status:
                  </span>
                        <span className="text-jacarta-100 munro-small-text text-lg capitalize">
                    {status}
                  </span>
                      </div>
                  )}
                </>
            )}
          </div>

          {/* Right column - Input fields */}
          <div className="flex flex-col w-full">
            <div className="mb-4">
              <label className="block text-lg text-center font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                Deposit to this wallet
              </label>
              <div className="relative">
                <input
                    type="text"
                    value={
                        apiResponse?.details?.deposit?.address || "Awaiting address..."
                    }
                    readOnly
                    className="text-md w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12 munro-small"
                />
                {apiResponse?.details?.deposit?.address && (
                    <button
                        onClick={() => handleCopy(apiResponse?.details?.deposit?.address, "address")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 focus:outline-none flex items-center justify-center w-9 h-9"
                    >
                      {copiedField === "address" ? (
                          <img src={checkMark} alt="Copied" className="w-5 h-5" />
                      ) : (
                          <img src={copyIcon} alt="Copy" className="w-5 h-5" />
                      )}
                    </button>
                )}
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
                        className="text-md w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12 munro-small"
                    />
                    <button
                        onClick={() => handleCopy(apiResponse.details.deposit.extra_id, "memo")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 focus:outline-none flex items-center justify-center w-9 h-9"
                    >
                      {copiedField === "memo" ? (
                          <img src={checkMark} alt="Copied" className="w-5 h-5" />
                      ) : (
                          <img src={copyIcon} alt="Copy" className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
            )}

            <div>
              <label className="block text-lg text-center font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                Deposit this quantity
              </label>
              <div className="relative">
                <input
                    type="text"
                    value={
                      apiResponse?.details?.deposit?.amount
                          ? `${apiResponse.details.deposit.amount} on ${aggregatorTokens[selectedToken]?.networks?.[selectedNetworkIndex]?.displayNetwork
                          }`
                          : "Awaiting amount..."
                    }
                    readOnly
                    className="text-md w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12 munro-small"
                />
                {apiResponse?.details?.deposit?.amount && (
                    <button
                        onClick={() => handleCopy(apiResponse?.details?.deposit?.amount || "0.00", "amount")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 focus:outline-none flex items-center justify-center w-9 h-9"
                    >
                      {copiedField === "amount" ? (
                          <img src={checkMark} alt="Copied" className="w-5 h-5" />
                      ) : (
                          <img src={copyIcon} alt="Copy" className="w-5 h-5" />
                      )}
                    </button>
                )}
              </div>
            </div>

            {apiResponse?.details?.id && (
                <div className="mt-4">
                  <label className="block text-lg text-center font-medium text-jacarta-500 mb-1 dark:text-jacarta-100 munro-small-text">
                    StealthEX ID
                  </label>
                  <div className="relative">
                    <input
                        type="text"
                        value={apiResponse.details.id}
                        readOnly
                        className="text-md w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 pr-12 munro-small"
                    />
                    <button
                        onClick={() => handleCopy(apiResponse.details.id, "id")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 focus:outline-none flex items-center justify-center w-9 h-9"
                    >
                      {copiedField === "id" ? (
                          <img src={checkMark} alt="Copied" className="w-5 h-5" />
                      ) : (
                          <img src={copyIcon} alt="Copy" className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Cancel button - centered below the grid */}
        <div className="flex justify-center text-md mt-8 mb-4">
          <button
              onClick={handleDeleteExchange}
              className="bg-white text-jacarta-700 px-6 py-2 rounded-lg font-medium munro-narrow focus:outline-none"
          >
            Cancel Deposit
          </button>
        </div>
      </div>
  );

  // Add this useEffect after the other useEffects
  useEffect(() => {
    // Fetch minimum amount when component mounts
    if (tokenObj && tokenObj.networks[selectedNetworkIndex]) {
      fetchMinimumAmount(selectedToken, tokenObj.networks[selectedNetworkIndex]);
    }
  }, []);  // Empty dependency array so it only runs once

  return (
      <section className="relative h-screen">
        <div className="mx-4 text-center pt-24 md:pt-32">
          <span className="text-white text-2xl md:text-5xl munro-regular-heading">Multichain deposit</span>
        </div>

        <div className="w-full flex flex-col justify-start items-center p-4">
          <div className="w-full max-w-md bg-jacarta-800 rounded-lg shadow-lg p-4 min-h-[600px]">
            <div className="relative w-full ">
              <div className="absolute w-full flex justify-between items-center px-12">
                {/* Removed step circles and numbers */}
              </div>
            </div>

            <div className="text-center text-white">
              {rightStep === 1 && (
                  <div>
                    <h3 className="text-xl md:text-3xl font-bold mb-6 munro-small-heading">Connect Wallet</h3>
                    <div className="flex justify-center mb-6">
                      <img src={connectWalletGif} alt="Connect Wallet" className="w-24 h-24 md:w-48 md:h-48 rounded-lg" />
                    </div>
                    <p className="text-xl md:text-2xl munro-small-text">Unlock multichain deposits</p>
                  </div>
              )}
              {rightStep === 2 && (
                  <div>
                    <h3 className="text-3xl font-bold mb-6 munro-regular-heading">Choose amount</h3>
                    <div className="flex justify-center mb-6">
                      <img src={connectWalletGif} alt="Connect Wallet" className="w-24 h-24 md:w-48 md:h-48 rounded-lg" />
                    </div>
                    <p className="text-xl munro-small-text">Specify the amount you want to deposit</p>
                  </div>
              )}
              {rightStep === 3 && (
                  <div>
                    <h3 className="text-3xl font-bold mb-6 munro-regular-heading">Awaiting deposit</h3>
                    <p className="text-xl munro-small-text">Send the specified amount to continue</p>
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
          <div
              className="px-6 mt-4 py-3 rounded-lg text-white munro-small-text text-center lg:w-1/2"
              style={{
                backgroundColor: wallets?.ckBTC?.walletAddressForDisplay ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)',
                border: wallets?.ckBTC?.walletAddressForDisplay ? '2px solid #16a34a' : '2px solid #dc2626',
                minWidth: '300px',
                maxWidth: '300px'
              }}
          >
            {wallets?.ckBTC?.walletAddressForDisplay
                ? `Wallet connected`
                : "Account not detected. Please log in."}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-120px)] justify-center">
          <div
              className="w-full lg:w-1/2 flex justify-center items-center px-4"
              style={{ filter: leftBoxBlur }}
          >
            <div className="w-full max-w-[300px]">
              {/* Form */}
              <div className="w-full">
                {currentSection === 1 && renderTokenSelection()}
                {currentSection === 2 && renderAmountInput()}
                {currentSection === 3 && renderDepositInfo()}

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
              </div>
            </div>
          </div>

          {/* Contenedor de la derecha 5-step progress. #1 => Connect wallet */}

        </div>

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