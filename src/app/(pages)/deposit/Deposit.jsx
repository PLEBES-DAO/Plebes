import Footer1 from "../../../components/footer/Footer1";
import Navbar from "../../../components/headers/Navbar.jsx";
import SwapInterface from "../../../components/swap/SwapInterface";
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
const SWAPZONE_API_KEY = "J4NlziyLk"; // Will be replaced with actual API key later

// Configure your callback URLs for production
const CALLBACK_BASE_URL = "https://api.plebes.xyz";  
const CALLBACK_URLS = {
  standard: `${CALLBACK_BASE_URL}/callback`,
  success: `${CALLBACK_BASE_URL}/callback/success`,
  failure: `${CALLBACK_BASE_URL}/callback/failure`
};

// Helper function to fetch supported currencies from Swapzone API
const fetchSupportedCurrencies = async () => {
  try {
    const response = await fetch(`${SWAPZONE_API_BASE_URL}/exchange/currencies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SWAPZONE_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
};

// Helper function to map API currencies to aggregatorTokens format
const mapApiCurrenciesToTokens = (currencies) => {
  // Group currencies by their base token (without network specifics)
  const groupedCurrencies = {};
  
  currencies.forEach(currency => {
    // Convert ticker to uppercase for consistency with existing code
    const baseTicker = currency.ticker.toUpperCase().split(/[^A-Z0-9]/, 1)[0];
    
    if (!groupedCurrencies[baseTicker]) {
      groupedCurrencies[baseTicker] = {
        logo: `/img/coinplebes/${baseTicker}.svg`, // Default path - may need fallback handling
        networks: []
      };
    }
    
    // Add network to the token
    groupedCurrencies[baseTicker].networks.push({
      aggregatorSymbol: currency.ticker.toUpperCase(),
      displayToken: baseTicker,
      displayNetwork: currency.network || 'MAINNET',
      minAmount: null // This will be populated later with API data
    });
  });
  
  return groupedCurrencies;
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
    { aggregatorSymbol: "USDCARB", displayToken: "USDC", displayNetwork: "ARB" },
    { aggregatorSymbol: "USDCBASE", displayToken: "USDC", displayNetwork: "BASE" },
    { aggregatorSymbol: "USDC", displayToken: "USDC", displayNetwork: "ETH" },
    { aggregatorSymbol: "USDCMATIC", displayToken: "USDC", displayNetwork: "POLYGON" },
   // { aggregatorSymbol: "USDCNEAR", displayToken: "USDC", displayNetwork: "NEAR" },
    { aggregatorSymbol: "USDCOP", displayToken: "USDC", displayNetwork: "OP" },
    { aggregatorSymbol: "USDCSOL", displayToken: "USDC", displayNetwork: "SOL" },
   // { aggregatorSymbol: "usdctrc20", displayToken: "USDC", displayNetwork: "TRX" },
    ],
  },

  // USDT
  USDT: {
     logo: "/img/coins/usdt.svg",
     networks: [
       { aggregatorSymbol: "USDTARB", displayToken: "USDT", displayNetwork: "ARB" },
       { aggregatorSymbol: "USDTBASE", displayToken: "USDT", displayNetwork: "BASE" },
       { aggregatorSymbol: "usdterc20", displayToken: "USDT", displayNetwork: "ETH" },
       { aggregatorSymbol: "usdtmatic", displayToken: "USDT", displayNetwork: "POLYGON" },
       { aggregatorSymbol: "usdtnear", displayToken: "USDT", displayNetwork: "NEAR" },
       { aggregatorSymbol: "USDTOP", displayToken: "USDT", displayNetwork: "OP" },
       { aggregatorSymbol: "usdtsol", displayToken: "USDT", displayNetwork: "SOL" },
       { aggregatorSymbol: "usdt", displayToken: "USDT", displayNetwork: "TRX" },
     ],
   },

  // BTC
  BTC: {
      logo: "/img/coins/btc.svg",
      networks: [
        { aggregatorSymbol: "BTC", displayToken: "BTC", displayNetwork: "BTC", defaultAmount: 0.05 },
      ],
    },

  // ETH
  ETH: {
    logo: "/img/coins/eth.svg",
    networks: [
      { aggregatorSymbol: "etharbitrum", displayToken: "ETH", displayNetwork: "ARB" },
      { aggregatorSymbol: "ETHBASE", displayToken: "ETH", displayNetwork: "BASE" },
      { aggregatorSymbol: "ETH", displayToken: "ETH", displayNetwork: "ETH" },
      { aggregatorSymbol: "ethoptimism", displayToken: "ETH", displayNetwork: "OP" },
    ],
  },

  // ADA
  ADA: {
    logo: "/img/coins/ada.svg",
    networks: [
      { aggregatorSymbol: "ADA", displayToken: "ADA", displayNetwork: "ADA", defaultAmount: 2000 },
    ],
  },

  // ALGO
  ALGO: {
     logo: "/img/coins/algo.svg",
     networks: [
       { aggregatorSymbol: "algo", displayToken: "ALGO", displayNetwork: "ALGO", defaultAmount: 500 },
     ],
   },

  // APT
  APT: {
    logo: "/img/coinplebes/APT.svg",
    networks: [
      { aggregatorSymbol: "apt", displayToken: "APT", displayNetwork: "APT", defaultAmount: 28 },
    ],
  },

  // ARB
  ARB: {
    logo: "/img/coinplebes/ARB.svg",
    networks: [
      { aggregatorSymbol: "arb", displayToken: "ARB", displayNetwork: "ARB", defaultAmount: 400, smartContract: "0x912CE59144191C1204E64559FE8253a0e49E6548" },
    ],
  },

  // AVAX
  AVAX: {
    logo: "/img/coins/avax.svg",
    networks: [
      { aggregatorSymbol: "avaxc", displayToken: "AVAX-C", displayNetwork: "AVAX-C" },
    ],
  },

  // BNB
  BNB: {
    logo: "/img/coins/bnb.svg",
    networks: [
      { aggregatorSymbol: "bnbbep20", displayToken: "BNB", displayNetwork: "BSC", defaultAmount: 10 },
    ],
  },

  // BUSD
  BUSD: {
    logo: "/img/coinplebes/BUSD.svg",
    networks: [
      { aggregatorSymbol: "BUSD", displayToken: "BUSD", displayNetwork: "MAINNET" },
      { aggregatorSymbol: "busdbep20", displayToken: "BUSD", displayNetwork: "BSC", defaultAmount: 300, smartContract: "0xe9e7cea3dedca5984780bafc599bd69add087d56" },
    ],
  },

  // DOGE
  DOGE: {
    logo: "/img/coins/doge.svg",
    networks: [
      { aggregatorSymbol: "doge", displayToken: "DOGE", displayNetwork: "DOGE", defaultAmount: 40000 },
    ],
  },

  // LTC
  LTC: {
    logo: "/img/coinplebes/LTC.svg", 
    networks: [
      { aggregatorSymbol: "ltc", displayToken: "LTC", displayNetwork: "LTC" },
    ],
  },

  // DOT
  DOT: {
    logo: "/img/coins/dot.svg",
    networks: [
      { aggregatorSymbol: "dot", displayToken: "DOT", displayNetwork: "DOT", defaultAmount: 6 },
    ],
  },

  // ICP
  ICP: {
     logo: "/img/coins/icp.svg",
     networks: [
       { aggregatorSymbol: "ICP", displayToken: "ICP", displayNetwork: "ICP" },
     ],
   },

  // NEAR
  NEAR: {
     logo: "/img/coinplebes/NEAR.svg",
     networks: [
       { aggregatorSymbol: "NEAR", displayToken: "NEAR", displayNetwork: "NEAR" },
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
      { aggregatorSymbol: "SOL", displayToken: "SOL", displayNetwork: "SOLANA" },
    ],
  },

  // SUI
  SUI: {
   logo: "/img/coinplebes/sui.svg",
   networks: [
   { aggregatorSymbol: "sui", displayToken: "SUI", displayNetwork: "SUI", defaultAmount: 200, smartContract: null },
   ],
   },

  // TON
  TON: {
    logo: "/img/coinplebes/TON.svg",
    networks: [
      { aggregatorSymbol: "ton", displayToken: "TON", displayNetwork: "TON", defaultAmount: 2000, smartContract: null },
    ],
  },

  // XLM
  XLM: {
    logo: "/img/coinplebes/XLM.svg",
    networks: [
      { aggregatorSymbol: "xlm", displayToken: "XLM", displayNetwork: "XLM", defaultAmount: 1500 },
    ],
  },

  // XRP
  XRP: {
    logo: "/img/coinplebes/XRP.svg",
    networks: [
      { aggregatorSymbol: "xrp", displayToken: "XRP", displayNetwork: "XRP" },
    ],
  },

  // WLD
  WLD: {
    logo: "/img/coinplebes/WLD.svg",
    networks: [
      { aggregatorSymbol: "WLD", displayToken: "WLD", displayNetwork: "ETHEREUM" },
      { aggregatorSymbol: "WLDOP", displayToken: "WLD", displayNetwork: "OPTIMISM", defaultAmount: 95, smartContract: "0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1" },
    ],
  },
};

// Only show these tokens in the dropdown
const allowedTokens = ["BTC", "ETH", "DOGE", "NEAR", "WLD", "ADA", "DOT", "BNB", "ALGO", "APT", "ARB", "SOL", "SUI", "TON", "XLM", "XRP", "AVAX", "OP", "USDT", "USDC"];

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
    "XRP": "Minimum 45.3 XRP",
    "DOGE": "Minimum 15.97 DOGE", // Updated based on API error message
    "WLD": "Minimum 20.68 WLD" // Updated based on API error message
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

  const { wallets, buy, swapStep, icpBalance } = useBioniqContext();
  
  // Tab state for switching between Deposit and Swap
  const [activeTab, setActiveTab] = useState("deposit");
  
  const [selectedToken, setSelectedToken] = useState("BTC");
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
  const [supportedCurrencies, setSupportedCurrencies] = useState([]); // State for supported currencies from API
  const [showCurrenciesModal, setShowCurrenciesModal] = useState(false); // State for showing currencies modal
  const [adapterTryCount, setAdapterTryCount] = useState(0); // Counter for adapter retry attempts
  const [transactionProgress, setTransactionProgress] = useState(0); // Progress indicator (0-100)
  const [icpBalanceValue, setIcpBalanceValue] = useState(null); // Estado para el balance de ICP
  const [loadingIcpBalance, setLoadingIcpBalance] = useState(false); // Estado para mostrar loading del balance

  // State for dynamic tokens mapped from API data
  const [dynamicTokens, setDynamicTokens] = useState({});
  
  // Use dynamic tokens if available, but always include static tokens like BNB
  const availableTokens = Object.keys(dynamicTokens).length > 0 ? 
    { ...dynamicTokens, ...aggregatorTokens } : 
    aggregatorTokens;

  // Only show these tokens in the dropdown
  const allowedTokens = ["BTC", "ETH", "DOGE", "NEAR", "WLD", "ADA", "DOT", "BNB", "ALGO", "APT", "ARB", "SUI", "TON", "XLM", "XRP", "AVAX", "SOL", "OP", "USDT", "USDC"];

  // Status display labels for better UX
  const statusLabels = {
    "waiting": "Awaiting deposit",
    "overdue": "Deposit overdue - please deposit soon",
    "confirming": "Deposit received, confirming on blockchain",
    "exchanging": "Converting your tokens",
    "sending": "Sending ICP to your wallet",
    "finished": "Transaction complete!",
    "failed": "Transaction failed",
    "refunded": "Deposit refunded"
  };

  // Convert status to progress percentage
  const getProgressFromStatus = (status) => {
    switch(status) {
      case "waiting": return 20;
      case "overdue": return 20;
      case "confirming": return 40;
      case "exchanging": return 60;
      case "sending": return 80;
      case "finished": return 100;
      case "failed": case "refunded": return 0;
      default: return 0;
    }
  };

  // Function to handle copy to clipboard
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);

    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Fetch supported currencies from API on component mount
  useEffect(() => {
    const getCurrencies = async () => {
      try {
        const currencies = await fetchSupportedCurrencies();
        if (currencies && currencies.length > 0) {
          setSupportedCurrencies(currencies);
          
          // Map currencies to the format needed for UI
          const mappedTokens = mapApiCurrenciesToTokens(currencies);
          
          // Merge with existing static tokens, preferring API data but keeping static data as fallback
          // This ensures we maintain compatibility with existing code
          setDynamicTokens({
            ...mappedTokens
          });
        }
      } catch (error) {
        // console.error("Failed to fetch supported currencies:", error);
      }
    };
    
    getCurrencies();
  }, []);

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
       // console.error("Failed to fetch user transactions", error);
      }
    };
    fetchUserTransactions();
  }, [wallets]);

  // Update transaction progress when status changes
  useEffect(() => {
    setTransactionProgress(getProgressFromStatus(status));
  }, [status]);

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
              setPolling(false);
              await buy();
              handleDeleteExchange();
            }
          }
        } catch (err) {
        //  console.error("Failed to poll transaction:", err);
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

  // useEffect para cargar el balance de ICP
  useEffect(() => {
    const loadIcpBalance = async () => {
      if (!wallets?.ckBTC?.credentials?.identity || !icpBalance) return;
      
      setLoadingIcpBalance(true);
      try {
        const balance = await icpBalance();
        setIcpBalanceValue(balance);
      } catch (error) {
        setIcpBalanceValue(null);
      } finally {
        setLoadingIcpBalance(false);
      }
    };

    loadIcpBalance();
  }, [wallets, icpBalance]);

  // Actualiza minDeposit
  useEffect(() => {
    const tokenObj = availableTokens[selectedToken];
    if (!tokenObj) return;
    const netOption = tokenObj.networks[selectedNetworkIndex];
    if (!netOption) return;

    // Use API-fetched minimum amount if available, otherwise use getMinimumDeposit fallback
    const apiMinAmount = minAmounts[selectedToken]; // Use selectedToken as key instead of netOption.displayToken
    const minValue = apiMinAmount ? 
      `Minimum ${apiMinAmount} ${selectedToken}` : 
      getMinimumDeposit(selectedToken, netOption.minAmount); // Also use selectedToken here
    setMinDeposit(minValue);

  }, [selectedToken, selectedNetworkIndex, minAmounts]);

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
      
      const fromCurrency = network.aggregatorSymbol || network.displayToken.toLowerCase();
      const toCurrency = "icp";
      
      // For Bitcoin, try with the preferred adapters
      let adapterParam = '';
      if (fromCurrency.toLowerCase() === 'btc') {
        // Use the first adapter for minimum checks - changehero generally works well
        adapterParam = '&adapter=changehero';
      }
      
      const url = `${SWAPZONE_API_BASE_URL}/exchange/get-rate?from=${fromCurrency}&to=${toCurrency}&amount=1&rateType=floating${adapterParam}`;
      
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SWAPZONE_API_KEY
        }
      });
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        
        // Try to extract minimum amount from error message patterns like "Try amount between X and Y"
        if (data.message && typeof data.message === 'string') {
          const amountBetweenMatch = data.message.match(/try amount between ([\d.]+) and/i);
          const amountMoreThanMatch = data.message.match(/try amount more than ([\d.]+)/i); // New pattern for "more than X"
          const minimumMatch = data.message.match(/minimum[:\s]+([\d.]+)/i);
          
          let extractedMinAmount = null;
          
          if (amountBetweenMatch && amountBetweenMatch[1]) {
            extractedMinAmount = parseFloat(amountBetweenMatch[1]);
          } else if (amountMoreThanMatch && amountMoreThanMatch[1]) {
            extractedMinAmount = parseFloat(amountMoreThanMatch[1]);
          } else if (minimumMatch && minimumMatch[1]) {
            extractedMinAmount = parseFloat(minimumMatch[1]);
          }
          
          if (extractedMinAmount && extractedMinAmount > 0) {
            
            // Update state with the extracted minimum amount
            setMinAmounts(prev => ({
              ...prev,
              [token]: extractedMinAmount.toString() // Use token parameter as key (which is selectedToken)
            }));
            
            // Auto-fill the minimum amount if the input is empty or less than minimum
            if (!amount || parseFloat(amount) < extractedMinAmount) {
              setAmount(extractedMinAmount.toString());
            }
            
            return; // Successfully extracted minimum from error message
          }
        }
        
        return; // Could not extract minimum amount from error
      }
      
      // Get the minimum amount from the response
      const minAmount = data.minAmount || 0;
      
      if (minAmount > 0) {        
        // Use the exact API value without formatting
        const formattedMinAmount = minAmount.toString();
        
        // Update state with the minimum amount
        setMinAmounts(prev => ({
          ...prev,
          [token]: formattedMinAmount // Use token parameter as key (which is selectedToken)
        }));
        
        // Auto-fill the minimum amount if the input is empty or less than minimum
        if (!amount || parseFloat(amount) < minAmount) {
          setAmount(formattedMinAmount);
        }
      }
    } catch (error) {
    //  console.error("Error fetching minimum amount:", error);
    }
  };

  async function handleCreateExchange(retryCount = 0) {
    
    // NEW ADDRESS FLOW:
    // - addressReceive in API payload = user's ICP wallet (where they want to receive ICP)
    // - addressDeposit from API response = where user sends their source currency (ETH, BTC, SOL, etc.)
    // This eliminates the need for users to have wallets for every source currency
    
    // Ensure retryCount is always a number
    let currentRetryCount = typeof retryCount === 'number' ? retryCount : 0;
    
    // Only reset error message and adapter try count on initial call (not retries)
    if (currentRetryCount === 0) {
      setErrorMessage("");
      setAdapterTryCount(0);
    }
    
    if (!wallets?.ckBTC?.walletPrincipal) {
    //  console.error("No ckBTC wallet found");
      setErrorMessage("No ckBTC wallet found. Please connect your wallet.");
      return;
    }
    
    const tokenObj = availableTokens[selectedToken];
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
    
    // Use API data if available for more accurate currency names
    const fromCurrency = netOption.aggregatorSymbol || netOption.displayToken;
    const toCurrency = "icp";
    
    // Check for valid amount
    if (!amountToUse || amountToUse <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }
    
    // Declare rateData in broader scope to avoid reference errors
    let rateData = null;
    
    try {
      setLoading(true);
      
      
      // For Bitcoin, use a specific adapter based on currentRetryCount
      let adapterParam = '';
      if (fromCurrency.toLowerCase() === 'btc') {
        const btcAdapters = ['changehero', 'changeangel', 'changenow'];
        const currentIndex = currentRetryCount % btcAdapters.length;
        const selectedAdapter = btcAdapters[currentIndex];
        adapterParam = `&adapter=${selectedAdapter}`;
      }
      
      const rateUrl = `${SWAPZONE_API_BASE_URL}/exchange/get-rate?from=${fromCurrency}&to=${toCurrency}&amount=${amountToUse}&rateType=floating${adapterParam}`;
      
      const headers = { 
        "Content-Type": "application/json",
        "x-api-key": SWAPZONE_API_KEY
      };
      
      const rateResponse = await fetch(rateUrl, {
        method: "GET",
        headers: headers
      });
      
      const rateResponseHeaders = {};
      rateResponse.headers.forEach((value, name) => {
        rateResponseHeaders[name] = value;
      });
      
      // Parse rate response as JSON
      try {
        rateData = await rateResponse.json();        
        
      } catch (parseError) {
        throw new Error(`Failed to parse rate response: ${parseError.message}`);
      }
      
      // Check for errors in rate response
      if (rateData.error) {
        // If using Bitcoin and we have multiple adapters to try
        if (fromCurrency.toLowerCase() === 'btc' && currentRetryCount < 2) {
          const nextRetryCount = currentRetryCount + 1;
          setAdapterTryCount(nextRetryCount); // Update state for UI feedback
         // console.log(`Retrying with next BTC adapter (attempt ${nextRetryCount + 1})`);
          handleCreateExchange(nextRetryCount); // Recursive call with incremented retryCount
          return;
        }
        throw new Error(rateData.message || "Failed to get rate from Swapzone");
      }
      
      // Get the RECEIVE address from user's wallet (where they want ICP sent)
      const receiveAddress = AccountIdentifier.fromPrincipal({
        principal: wallets.ckBTC.walletPrincipal,
      }).toHex();
      
      
      
      // Step 2: Create transaction with Swapzone API
      // console.log("Creating transaction with Swapzone API...");
      
      // Build the transaction payload
      const transactionPayload = {
        from: fromCurrency.toLowerCase(), // What they're sending (ETH, BTC, etc.)
        to: toCurrency.toLowerCase(), // What they want (ICP)
        amountDeposit: rateData.amountFrom.toString(), // Amount to deposit
        addressReceive: receiveAddress, // WHERE TO SEND ICP (user's wallet)
        rateType: "floating",
        fromNetwork: rateData.fromNetwork,
        toNetwork: rateData.toNetwork,
        quotaId: rateData.quotaId
      };
      
      // Add adapter if we have one
      if (adapterParam) {
        transactionPayload.adapter = adapterParam.replace(/&adapter=/, '');
        // console.log(`Using adapter: ${transactionPayload.adapter}`);
      }
      
      // Check if we're using SideShift adapter (either from explicit adapter param or from rate data)
      const isSideShiftAdapter = 
        (transactionPayload.adapter && transactionPayload.adapter.toLowerCase().includes('sideshift')) ||
        (rateData.adapter && rateData.adapter.toLowerCase().includes('sideshift'));
        
      // console.log(`Adapter check: ${rateData.adapter}, isSideShift: ${isSideShiftAdapter}`);
      
      // For refund address, we can only provide one for currencies where we have actual wallet support
      // Only add refund address for BTC since we have BTC wallet integration
      if (!isSideShiftAdapter && fromCurrency.toLowerCase() === 'btc' && wallets.BTC?.walletAddressForDisplay) {
        transactionPayload.refundAddress = wallets.BTC.walletAddressForDisplay;
        // console.log("Added BTC refund address:", wallets.BTC.walletAddressForDisplay);
      }
      
      // console.log("Transaction payload:", JSON.stringify(transactionPayload));
      
      const transactionResponse = await fetch(`${SWAPZONE_API_BASE_URL}/exchange/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SWAPZONE_API_KEY
        },
        body: JSON.stringify(transactionPayload)
      });
      
      // console.log("Transaction response status:", transactionResponse.status, transactionResponse.statusText);
      
      // Get response text for debugging in case of error
      const responseText = await transactionResponse.text();
      // console.log("Raw transaction response:", responseText);
      
      // Parse the response as JSON (if possible)
      let transactionData;
      try {
        transactionData = JSON.parse(responseText);
      //  console.log("Transaction data parsed:", JSON.stringify(transactionData));
      } catch (parseError) {
      //  console.error("Error parsing transaction response:", parseError);
        throw new Error(`Failed to parse transaction response: ${parseError.message}`);
      }
      
      // Handle API error
      if (transactionData.error) {
        let errorMessage = transactionData.message || "Failed to create transaction";
        // Check if this is a StealthEx error and we can retry with a different adapter
        if (fromCurrency.toLowerCase() === 'btc' && 
            errorMessage.includes('stealthex') && 
            (errorMessage.includes('422') || errorMessage.includes('createOrder')) && 
            currentRetryCount < 2) {
          const nextRetryCount = currentRetryCount + 1;
          setAdapterTryCount(nextRetryCount); // Update state for UI feedback
          setLoading(false); // Reset loading state before retry
          setTimeout(() => handleCreateExchange(nextRetryCount), 1000); // Small delay before retry
          return;
        }
        
        // Format error message to be more user-friendly
        if (errorMessage.includes('Invalid address')) {
          if (fromCurrency.toLowerCase() === 'eth') {
            errorMessage = `Address format issue. The exchange service may not support ICP as a destination for ETH deposits. Please try a different token or contact support.`;
          } else {
            errorMessage = `The ICP receive address format may not be compatible with this exchange service. Please try again or contact support.`;
          }
        } else if (fromCurrency.toLowerCase() === 'btc') {
          if (errorMessage.includes('minimum') || errorMessage.includes('min amount')) {
            // Get the minimum amount from the error message if possible
            const minAmountMatch = errorMessage.match(/([0-9.]+)\s*BTC/i);
            const minAmount = minAmountMatch ? minAmountMatch[1] : minAmounts[selectedToken] || '?';
            errorMessage = `The amount ${amountToUse} BTC is below the minimum required (${minAmount} BTC). Please increase your amount.`;
          } else if (errorMessage.includes('maximum')) {
            errorMessage = `The amount ${amountToUse} BTC is above the maximum allowed. Please decrease your amount.`;
          } else if (errorMessage.includes('422') && errorMessage.includes('stealthex')) {
            errorMessage = `StealthEx cannot process this Bitcoin transaction. This may be due to address format issues or temporary service problems. The amount ${amountToUse} BTC appears valid (minimum: ${rateData?.minAmount || '0.0003'} BTC). Please try again or contact support.`;
          } else if (errorMessage.includes('stealthex') && errorMessage.includes('createOrder')) {
            errorMessage = `StealthEx is having issues processing Bitcoin transactions. Please try again in a few minutes, or contact support if the problem persists.`;
          } else if (errorMessage.includes('500') || errorMessage.includes('unavailable')) {
            errorMessage = `The exchange service is temporarily unavailable. Please try again in a few minutes.`;
          }
        } else if (fromCurrency.toLowerCase() === 'avaxc') {
          // Format error message to be more user-friendly for AVAX
          if (errorMessage.includes('minimum') || errorMessage.includes('min amount')) {
            const minAmountMatch = errorMessage.match(/([0-9.]+)\s*AVAX/i);
            const minAmount = minAmountMatch ? minAmountMatch[1] : rateData?.minAmount || '?';
            errorMessage = `The amount ${amountToUse} AVAX is below the minimum required (${minAmount} AVAX). Please increase your amount.`;
          } else if (errorMessage.includes('maximum')) {
            errorMessage = `The amount ${amountToUse} AVAX is above the maximum allowed. Please decrease your amount.`;
          } else if (errorMessage.includes('Invalid address')) {
            errorMessage = `AVAX address format error. The current wallet address format may not be compatible with AVAX transactions. Please ensure you have an AVAX-compatible wallet connected.`;
          } else if (errorMessage.includes('simpleswap') && (errorMessage.includes('400') || errorMessage.includes('createOrder'))) {
            errorMessage = `SimpleSwap cannot process this AVAX transaction. This may be due to address format incompatibility or amount restrictions. The minimum is usually around ${rateData?.minAmount || '1'} AVAX. Please try a different amount or contact support.`;
          } else if (errorMessage.includes('500') || errorMessage.includes('unavailable')) {
            errorMessage = `The AVAX exchange service is temporarily unavailable. Please try again in a few minutes.`;
          }
        } else if (fromCurrency.toLowerCase() === 'ton') {
          // Format error message to be more user-friendly for TON
          if (errorMessage.includes('minimum') || errorMessage.includes('min amount')) {
            const minAmountMatch = errorMessage.match(/([0-9.]+)\s*TON/i);
            const minAmount = minAmountMatch ? minAmountMatch[1] : minAmounts[selectedToken] || '?';
            errorMessage = `The amount ${amountToUse} TON is below the minimum required (${minAmount} TON). Please increase your amount.`;
          } else if (errorMessage.includes('maximum')) {
            errorMessage = `The amount ${amountToUse} TON is above the maximum allowed. Please decrease your amount.`;
          } else if (errorMessage.includes('Invalid address') || errorMessage.includes('Cannot read properties of undefined')) {
            errorMessage = `TON address format error. The current wallet address format may not be compatible with TON transactions. Please ensure you have a TON-compatible wallet connected.`;
          } else if (errorMessage.includes('changelly') && errorMessage.includes('createOrder')) {
            errorMessage = `Changelly cannot process this TON transaction, possibly due to address format incompatibility. Please try again or contact support.`;
          } else if (errorMessage.includes('500') || errorMessage.includes('unavailable')) {
            errorMessage = `The TON exchange service is temporarily unavailable. Please try again in a few minutes.`;
          }
        } else if (fromCurrency.toLowerCase() === 'xlm') {
          // Format error message to be more user-friendly for XLM
          if (errorMessage.includes('minimum') || errorMessage.includes('min amount')) {
            const minAmountMatch = errorMessage.match(/([0-9.]+)\s*XLM/i);
            const minAmount = minAmountMatch ? minAmountMatch[1] : minAmounts[selectedToken] || '?';
            errorMessage = `The amount ${amountToUse} XLM is below the minimum required (${minAmount} XLM). Please increase your amount.`;
          } else if (errorMessage.includes('maximum')) {
            errorMessage = `The amount ${amountToUse} XLM is above the maximum allowed. Please decrease your amount.`;
          } else if (errorMessage.includes('Invalid address') || errorMessage.includes('Cannot read properties of undefined')) {
            errorMessage = `XLM address format error. The current wallet address format may not be compatible with XLM transactions. Please ensure you have a XLM-compatible wallet connected.`;
          } else if (errorMessage.includes('changelly') && errorMessage.includes('createOrder')) {
            errorMessage = `Changelly cannot process this XLM transaction, possibly due to address format incompatibility. Please try again or contact support.`;
          } else if (errorMessage.includes('500') || errorMessage.includes('unavailable')) {
            errorMessage = `The XLM exchange service is temporarily unavailable. Please try again in a few minutes.`;
          }
        } else if (fromCurrency.toLowerCase() === 'xrp') {
          // Format error message to be more user-friendly for XRP
          if (errorMessage.includes('minimum') || errorMessage.includes('min amount')) {
            const minAmountMatch = errorMessage.match(/([0-9.]+)\s*XRP/i);
            const minAmount = minAmountMatch ? minAmountMatch[1] : minAmounts[selectedToken] || '?';
            errorMessage = `The amount ${amountToUse} XRP is below the minimum required (${minAmount} XRP). Please increase your amount.`;
          } else if (errorMessage.includes('maximum')) {
            errorMessage = `The amount ${amountToUse} XRP is above the maximum allowed. Please decrease your amount.`;
          } else if (errorMessage.includes('Invalid address') || errorMessage.includes('Cannot read properties of undefined')) {
            errorMessage = `XRP address format error. The current wallet address format may not be compatible with XRP transactions. Please ensure you have a XRP-compatible wallet connected.`;
          } else if (errorMessage.includes('changelly') && errorMessage.includes('createOrder')) {
            errorMessage = `Changelly cannot process this XRP transaction, possibly due to address format incompatibility. Please try again or contact support.`;
          } else if (errorMessage.includes('500') || errorMessage.includes('unavailable')) {
            errorMessage = `The XRP exchange service is temporarily unavailable. Please try again in a few minutes.`;
          }
        } else if (fromCurrency.toLowerCase() === 'eth' || fromCurrency.toLowerCase().includes('eth')) {
          // Format error message to be more user-friendly for ETH
          if (errorMessage.includes('minimum') || errorMessage.includes('min amount')) {
            const minAmountMatch = errorMessage.match(/([0-9.]+)\s*ETH/i);
            const minAmount = minAmountMatch ? minAmountMatch[1] : minAmounts[selectedToken] || '?';
            errorMessage = `The amount ${amountToUse} ETH is below the minimum required (${minAmount} ETH). Please increase your amount.`;
          } else if (errorMessage.includes('maximum')) {
            errorMessage = `The amount ${amountToUse} ETH is above the maximum allowed. Please decrease your amount.`;
          } else if (errorMessage.includes('Invalid address') || errorMessage.includes('Cannot read properties of undefined')) {
            errorMessage = `ETH address validation failed. The exchange service may have issues with the ICP destination address format. Please try again or contact support.`;
          } else if (errorMessage.includes('changelly') && errorMessage.includes('createOrder')) {
            errorMessage = `Changelly cannot process this ETH transaction. This may be due to ICP address format incompatibility or network issues. Please try again or contact support.`;
          } else if (errorMessage.includes('simpleswap') && (errorMessage.includes('400') || errorMessage.includes('createOrder'))) {
            errorMessage = `SimpleSwap cannot process this ETH transaction. This may be due to ICP address format requirements or amount restrictions. Please try again or contact support.`;
          } else if (errorMessage.includes('500') || errorMessage.includes('unavailable')) {
            errorMessage = `The ETH exchange service is temporarily unavailable. Please try again in a few minutes.`;
          }
        } else if (fromCurrency.toLowerCase() === 'sol') {
          // Format error message to be more user-friendly for SOL
          if (errorMessage.includes('minimum') || errorMessage.includes('min amount')) {
            const minAmountMatch = errorMessage.match(/([0-9.]+)\s*SOL/i);
            const minAmount = minAmountMatch ? minAmountMatch[1] : minAmounts[selectedToken] || '?';
            errorMessage = `The amount ${amountToUse} SOL is below the minimum required (${minAmount} SOL). Please increase your amount.`;
          } else if (errorMessage.includes('maximum')) {
            errorMessage = `The amount ${amountToUse} SOL is above the maximum allowed. Please decrease your amount.`;
          } else if (errorMessage.includes('Invalid address') || errorMessage.includes('Cannot read properties of undefined')) {
            errorMessage = `SOL address validation failed. The exchange service may have issues with the ICP destination address format. Please try again or contact support.`;
          } else if (errorMessage.includes('changelly') && errorMessage.includes('createOrder')) {
            errorMessage = `Changelly cannot process this SOL transaction. This may be due to ICP address format incompatibility or network issues. Please try again or contact support.`;
          } else if (errorMessage.includes('simpleswap') && (errorMessage.includes('400') || errorMessage.includes('createOrder'))) {
            errorMessage = `SimpleSwap cannot process this SOL transaction. This may be due to ICP address format requirements or amount restrictions. Please try again or contact support.`;
          } else if (errorMessage.includes('500') || errorMessage.includes('unavailable')) {
            errorMessage = `The SOL exchange service is temporarily unavailable. Please try again in a few minutes.`;
          }
        } else {
          // Generic error formatting for other coins
          if (errorMessage.includes('Invalid address for specified network')) {
            errorMessage = `The address format is not compatible with ${fromCurrency.toUpperCase()} network. Please try again or contact support.`;
          } else if (errorMessage.includes('minimum') || errorMessage.includes('maximum')) {
            // Already formatted nicely
          } else if (errorMessage.includes('422') && errorMessage.includes('stealthex')) {
            errorMessage = `StealthEx cannot process this ${fromCurrency.toUpperCase()} transaction. This may be due to validation issues or temporary service problems. Please try again or contact support.`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Extract transaction data from nested structure if needed
      const txData = transactionData.transaction || transactionData;
    
      // Defensive check for required fields
      if (!txData || !txData.id) {
        throw new Error("The exchange service returned an incomplete response. Transaction ID is missing.");
      }
      
      // Get the deposit address from API response (where user needs to send their tokens)
      const depositAddressFromApi = txData.addressDeposit || txData.address || "";
      
      if (!depositAddressFromApi) {
        throw new Error("The exchange service did not provide a deposit address. Please try again.");
      }
      
      
      // Update state with transaction data
      setApiResponse({
        details: {
          id: txData.id,
          deposit: {
            address: depositAddressFromApi, // Deposit address from API response
            amount: txData.amountDeposit || amountToUse,
            extra_id: txData.extraIdDeposit || txData.memo || null
          },
          status: "waiting"
        }
      });
      
      setPolling(true);
      setStatus("waiting");
      setHasFetched(true);
      setCurrentSection(3);
    } catch (error) {
      
      let userErrorMsg = "Failed to create transaction.";
      
      if (error.message) {
        // Check for specific error patterns
        if (error.message.includes('Invalid address for specified network')) {
          userErrorMsg = `The address format is not compatible with ${fromCurrency.toUpperCase()} network. Please try again or contact support.`;
        } else if (error.message.includes('minimum') || error.message.includes('maximum')) {
          userErrorMsg = error.message; // Already formatted nicely
        } else if (error.message.includes('simpleswap') && error.message.includes('400')) {
          userErrorMsg = `SimpleSwap error: The amount may be below the minimum (${rateData?.minAmount || '?'} ${fromCurrency.toUpperCase()}) or above the maximum allowed. Try with a different amount.`;
        } else if (error.message.includes('changelly')) {
          userErrorMsg = `The exchange provider (Changelly) is having issues processing this transaction. Please try again with a different amount or try the easybit adapter.`;
        } else if (error.message.includes("failed to get exchange rate")) {
          userErrorMsg = `Failed to get exchange rates for ${fromCurrency.toUpperCase()} to ICP. Please try again with a different amount or token.`;
        } else if (error.message.includes("Empty response")) {
          userErrorMsg = "The exchange service returned an empty response. This could be a temporary issue. Please try again with a different amount or token.";
        } else {
          // Use the formatted error message from the inner error handling
          userErrorMsg = error.message;
        }
      }
      
      setStatus("error");
      setHasFetched(true);
      setErrorMessage(userErrorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExchange() {
    if (!apiResponse?.details?.id) return;
    
    try {
      setLoading(true);
      
      // If we have a transaction ID and Swapzone supports cancellation, we would call it here
      // For now, we'll just clear the UI state as Swapzone might not support explicit cancellation
      
      setApiResponse(null);
      setPolling(false);
      setStatus("");
      setCurrentSection(1);
    } catch (err) {
      // console.error("Error during transaction cleanup:", err);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  const isError = hasFetched ? !apiResponse?.details?.deposit?.address : false;

  // Logo de token actual
  const currentTokenObj = availableTokens[selectedToken];
  const tokenLogo = currentTokenObj?.logo || "";

  // Blur si no hay wallet conectada
  const leftBoxBlur =
      enableBlurIfNoWallet && !wallets?.ckBTC?.walletAddressForDisplay
          ? "blur(3px)"
          : "none";

  // Log deposit details only when they change
  useEffect(() => {

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
                      const selectTokenObj = availableTokens[newToken];
                      if (selectTokenObj && selectTokenObj.networks.length > 0) {
                        fetchMinimumAmount(newToken, selectTokenObj.networks[0]);
                      }
                    }}
                    className="w-full p-2 pr-8 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 munro-small appearance-none"
                >
                  {allowedTokens.map((tk) => (
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
                    const networkTokenObj = availableTokens[selectedToken];
                    if (networkTokenObj && networkTokenObj.networks[newIndex]) {
                      fetchMinimumAmount(selectedToken, networkTokenObj.networks[newIndex]);
                    }
                  }}
                  className="w-full p-2 border border-jacarta-600 rounded-lg bg-jacarta-800 focus:ring-accent focus:border-accent text-jacarta-100 dark:bg-jacarta-600 munro-small"
              >
                {currentTokenObj?.networks.map((opt, idx) => (
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
        {/* Transaction progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${transactionProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-jacarta-300 munro-small-text">
            <span>Awaiting deposit</span>
            <span>Confirming</span>
            <span>Converting</span>
            <span>Sending</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Transaction status */}
        {status && (
          <div className="mb-4 p-3 bg-jacarta-700 rounded-lg border border-jacarta-600">
            <h4 className="text-center font-medium text-white munro-small-heading">Transaction Status</h4>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${
                status === "finished" ? "bg-green-500" : 
                status === "failed" || status === "refunded" ? "bg-red-500" : 
                "bg-yellow-500 animate-pulse"
              }`}></div>
              <span className="text-jacarta-100 munro-small-text text-lg capitalize">
                {statusLabels[status] || status}
              </span>
            </div>
            <p className="text-center text-jacarta-300 text-sm mt-1 munro-small-text">
              {status === "waiting" && "Please send the exact amount specified below"}
              {status === "confirming" && "Your deposit has been detected and is being confirmed"}
              {status === "exchanging" && "Your tokens are being converted to ICP"}
              {status === "sending" && "ICP tokens are being sent to your wallet"}
              {status === "finished" && "Transaction complete! Check your wallet for ICP tokens"}
              {(status === "failed" || status === "refunded") && "Please try again or contact support"}
            </p>
          </div>
        )}

        {/* Two-column grid on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 w-full">
          {/* Left column - QR code section */}
          <div className="flex flex-col items-center justify-start w-full">
            {apiResponse?.details?.deposit?.address && (
                <>
                  <label className="block text-xl font-medium text-jacarta-500 mb-2 dark:text-jacarta-100 munro-small-text text-center">
                    Scan to deposit
                  </label>
                  <div className={`p-2 bg-white rounded-lg ${status === "finished" ? "opacity-50" : ""}`}>
                    <QRCodeSVG
                        value={apiResponse.details.deposit.address}
                        size={180}
                    />
                  </div>
                  {status === "waiting" && (
                    <div className="mt-2 text-sm text-center text-yellow-400 munro-small-text">
                      Waiting for your deposit...
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
                          ? `${apiResponse.details.deposit.amount} on ${availableTokens[selectedToken]?.networks?.[selectedNetworkIndex]?.displayNetwork
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
                    Transaction ID
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
            
            {/* Estimated completion time */}
            {status && status !== "finished" && status !== "failed" && status !== "refunded" && (
              <div className="mt-4 p-2 border border-jacarta-600 rounded-lg bg-jacarta-700">
                <p className="text-center text-jacarta-300 text-sm munro-small-text">
                  {status === "waiting" ? 
                    "Waiting for your deposit to be detected..." :
                    `Estimated completion: ${status === "confirming" ? "5-15" : 
                      status === "exchanging" ? "3-10" : 
                      status === "sending" ? "1-5" : "15-30"} minutes`
                  }
                </p>
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
            {status === "finished" ? "Start New Deposit" : "Cancel Deposit"}
          </button>
        </div>
      </div>
  );

  // Add this useEffect after the other useEffects
  useEffect(() => {
    // Fetch minimum amount when component mounts
    if (availableTokens[selectedToken] && availableTokens[selectedToken].networks[selectedNetworkIndex]) {
      fetchMinimumAmount(selectedToken, availableTokens[selectedToken].networks[selectedNetworkIndex]);
    }
  }, []);  // Empty dependency array so it only runs once

  // Function to download supported currencies as a txt file
  const downloadCurrencies = (format = 'txt') => {
    if (!supportedCurrencies.length) return;
    
    let blob;
    let filename;
    
    if (format === 'json') {
      // Create JSON format
      const jsonData = JSON.stringify(supportedCurrencies, null, 2);
      blob = new Blob([jsonData], { type: "application/json" });
      filename = "swapzone_currencies.json";
    } else {
      // Format the currencies into a readable text
      const date = new Date().toLocaleString();
      let textContent = "===================================\n";
      textContent += "SWAPZONE SUPPORTED CURRENCIES\n";
      textContent += `Generated: ${date}\n`;
      textContent += `Total: ${supportedCurrencies.length} currencies\n`;
      textContent += "===================================\n\n";
      
      // Group currencies by network
      const networkGroups = {};
      
      supportedCurrencies.forEach(currency => {
        const network = currency.network || "Unknown Network";
        if (!networkGroups[network]) {
          networkGroups[network] = [];
        }
        networkGroups[network].push(currency);
      });
      
      // List currencies alphabetically within each network group
      Object.keys(networkGroups).sort().forEach(network => {
        textContent += `## NETWORK: ${network} (${networkGroups[network].length} currencies)\n\n`;
        
        // Sort currencies by name within the network
        const sortedCurrencies = networkGroups[network].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        
        sortedCurrencies.forEach((currency, index) => {
          textContent += `${index + 1}. ${currency.name} (${currency.ticker})\n`;
          if (currency.smartContract) {
            textContent += `   Contract: ${currency.smartContract}\n`;
          }
          textContent += "\n";
        });
        
        textContent += "-----------------------------------\n\n";
      });
      
      // Add a simple alphabetical list at the end
      textContent += "ALPHABETICAL LIST OF ALL CURRENCIES\n";
      textContent += "===================================\n\n";
      
      supportedCurrencies
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((currency, index) => {
          textContent += `${index + 1}. ${currency.name} (${currency.ticker}) - ${currency.network || "Unknown Network"}\n`;
        });
      
      blob = new Blob([textContent], { type: "text/plain" });
      filename = "swapzone_currencies.txt";
    }
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
      <section className="relative h-screen">
        <div className="mx-4 text-center pt-24 md:pt-32">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-4">
            <div className="bg-jacarta-800 rounded-lg p-1 flex">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`px-6 py-3 rounded-lg munro-small-text transition-all duration-200 ${
                  activeTab === "deposit"
                    ? "bg-accent text-white shadow-lg"
                    : "text-jacarta-300 hover:text-white"
                }`}
              >
                Multichain Deposit
              </button>
              <button
                onClick={() => setActiveTab("swap")}
                className={`px-6 py-3 rounded-lg munro-small-text transition-all duration-200 ${
                  activeTab === "swap"
                    ? "bg-accent text-white shadow-lg"
                    : "text-jacarta-300 hover:text-white"
                }`}
              >
                ICP ⇄ ckBTC Swap
              </button>
            </div>
          </div>
          
          <span className="text-white text-2xl md:text-5xl munro-regular-heading">
            {activeTab === "deposit" ? "Multichain deposit" : "Time to swap"}
          </span>
          {supportedCurrencies.length > 0 && activeTab === "deposit" && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setShowCurrenciesModal(true)}
                className="text-sm text-blue-400 hover:text-blue-300 munro-small-text"
              >
                View supported currencies ({supportedCurrencies.length})
              </button>
            </div>
          )}
        </div>

        {/* Conditional rendering based on active tab */}
        {activeTab === "swap" ? (
          <SwapInterface />
        ) : (
          <>
            {/* Process steps indicator */}
            <div className="w-full flex justify-center mt-6 mb-8">
              <div className="bg-jacarta-800 rounded-lg p-4 max-w-2xl w-full">
                <div className="flex justify-between items-center relative">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                        ${step <= rightStep ? 'bg-accent text-white' : 'bg-gray-700 text-gray-400'} 
                        ${step === rightStep ? 'ring-2 ring-accent ring-offset-2 ring-offset-jacarta-800' : ''}
                        munro-small`}>
                        {step < rightStep ? <FaCheck /> : step}
                      </div>
                      <span className={`text-xs mt-2 text-center w-16 
                        ${step <= rightStep ? 'text-white' : 'text-gray-500'} munro-small-text`}>
                        {step === 1 ? "Connect" : 
                         step === 2 ? "Choose" : 
                         step === 3 ? "Deposit" : 
                         step === 4 ? "Convert" : "Receive"}
                      </span>
                    </div>
                  ))}
                  
                  {/* Progress bar connecting steps */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700">
                    <div 
                      className="h-0.5 bg-accent transition-all duration-500 ease-in-out"
                      style={{ width: `${(rightStep-1) * 25}%` }}
                    ></div>
                  </div>
                </div>
              </div>
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

              {/* Balance de ICP */}
          {/* Balance de ICP */}
          {wallets?.ckBTC?.walletAddressForDisplay && (
            <div
                className="px-6 mt-2 py-3 rounded-lg text-white munro-small-text text-center lg:w-1/2"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  border: '2px solid #3b82f6',
                  minWidth: '300px',
                  maxWidth: '300px'
                }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>ICP Balance:</span>
                {loadingIcpBalance ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span className="font-bold">
                    {icpBalanceValue !== null ? `${icpBalanceValue.toFixed(6)} ICP` : 'Unable to load'}
                  </span>
                )}
                <button
                  onClick={async () => {
                    if (!loadingIcpBalance && icpBalance) {
                      setLoadingIcpBalance(true);
                      try {
                        const balance = await icpBalance();
                        setIcpBalanceValue(balance);
                      } catch (error) {
                        console.error('Error refreshing ICP balance:', error);
                      } finally {
                        setLoadingIcpBalance(false);
                      }
                    }
                  }}
                  className="ml-2 text-blue-300 hover:text-white transition-colors disabled:opacity-50"
                  disabled={loadingIcpBalance}
                  title="Refresh balance"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          )}
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
        </>
        )}

        {/* Currencies Modal */}
        {showCurrenciesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="bg-jacarta-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4 sticky top-0">
                <h3 className="text-xl text-white munro-small-heading">Supported Currencies ({supportedCurrencies.length})</h3>
                <button 
                  onClick={() => setShowCurrenciesModal(false)}
                  className="text-white hover:text-gray-300 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              
              <div className="overflow-y-auto flex-grow pr-2" style={{ maxHeight: "calc(80vh - 140px)" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supportedCurrencies.map((currency, index) => (
                    <div key={index} className="border border-jacarta-600 rounded-lg p-3 bg-jacarta-700">
                      <div className="flex items-center mb-2">
                        <span className="text-white font-bold munro-small-text">{currency.name}</span>
                      </div>
                      <div className="text-jacarta-300 munro-small-text">
                        <div><strong>Ticker:</strong> {currency.ticker}</div>
                        <div><strong>Network:</strong> {currency.network || "Not specified"}</div>
                        {currency.smartContract && (
                          <div className="truncate"><strong>Contract:</strong> {currency.smartContract}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex justify-center gap-4 pt-2 border-t border-jacarta-600 sticky bottom-0">
                <button
                    onClick={() => downloadCurrencies('txt')}
                    className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg munro-small-text flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download as TXT
                </button>
                
                <button
                    onClick={() => downloadCurrencies('json')}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg munro-small-text flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download as JSON
                </button>
              </div>
            </div>
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