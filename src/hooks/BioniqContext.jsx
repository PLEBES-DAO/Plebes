// @ts-nocheck

"use client";

import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import CryptoJS from "crypto-js";
import { useAuth } from "../AuthPlug.jsx";
import { resolvePath } from "react-router-dom";
import { createicrc1Actor } from "../ic/icpswap/icrc1/index.js";
import { createPoolActor } from "../ic/icpswap/pool";
import { createSwapFactoryActor } from "../ic/icpswap/swapV3/index.js";
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp";


const icpCanister = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const ckBTCcanister = "mxzaz-hqaaa-aaaar-qaada-cai";

function toDefaultSub(owner, subaccount = []) {
  return { owner: owner, subaccount: subaccount };
}

function defaultDepositIcpSwap(token, amount, fee = 3000) {
  return { token: token, amount: amount, fee: fee };
}

function ApproveICP(spender, fee, amount) {
  return {
    fee: [],
    memo: [],
    from_subaccount: [],
    created_at_time: [],
    amount: amount,
    expected_allowance: [],
    expires_at: [],
    spender: { owner: spender, subaccount: [] },
  };
}

function defaultIcrcTransferArgs(
  to,
  transferBalance,
  fee = [],
  subaccount = [],
  from_subaccount = []
) {
  return {
    fee: fee,
    amount: transferBalance,
    memo: [],
    from_subaccount: from_subaccount,
    to: toDefaultSub(to, subaccount),
    created_at_time: [],
  };
}

function formatIcrcBalance(balance, supply) {
  let supplyAMillionth = Number(supply) / 100000000;
  return (Number(balance) * supplyAMillionth) / Number(supply);
}



function reverseFormatIcrcBalance(scaledBalance, supply) {
  let supplyAMillionth = Number(supply) / 100000000;
  let floatNumber = (Number(scaledBalance) * Number(supply)) / supplyAMillionth;
  let truncatedInt = Math.trunc(floatNumber);
  return truncatedInt;
}



export const BioniqContext = createContext(null);

const initWeb3AuthClient = lazy(() =>
  // @ts-ignore
  import(
    "../../bioniq/packages/bioniq-frontend/src/services/web-client-interface/web-clients/auth/web3-auth-client"
  ).then((module) => ({ default: module.initWeb3AuthClient }))
);

const createBioniqAuthClient = async (_web3AuthClient) => {
  return {
    async login(authProvider = "open-login") {
      const connection = await _web3AuthClient.login();
      return {
        ...connection,
        authProvider,
      };
    },
    async getCurrentUserConnection(authProvider = "open-login") {
      const connection = await _web3AuthClient.getCurrentAuth();
      if (!connection) {
        return undefined;
      }
      return {
        ...connection,
        authProvider,
      };
    },
    async logout(authProvider = "open-login") {
      await _web3AuthClient.logout();
    },
  };
};

const BioniqContextProvider = ({ children }) => {
  const [web3Auth, setWeb3Auth] = useState(null);
  const [bioniqAuthClient, setBioniqAuthClient] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [liveBioniqWalletApi, setLiveBioniqWalletApi] = useState(null);
  const [liveBioniqWalletApiUtils, setLiveBioniqWalletApiUtils] = useState(null);
  const [userConnection, setUserConnection] = useState(null);
  const [wallets, setWallets] = useState(null);
  const [balances, setBalances] = useState(null);
  const [inscriptions, setInscriptions] = useState(null);
  const [adminInscriptions, setAdminInscriptions] = useState(null);
  const [liveInscriptionsApi, setLiveInscriptions] = useState(null);
  const [liveAuction, setLiveAuction] = useState(null);
  const [liveAuctionBidders, setLiveAuctionBidders] = useState(null);
  const [ckBTCTotal, setCkBTCTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicState,setHistoricState] = useState(null);
  const[ btcPriceState, setBtcPrice] = useState(null);
  const[identity , setIdentity] = useState(null);
  const[swapStep,setSwapStep] = useState(0);
  const isLoading = useMemo(() => {
    return !web3Auth || !bioniqAuthClient || !liveBioniqWalletApi;
  }, [web3Auth, bioniqAuthClient, liveBioniqWalletApi]);

  function deriveKey(password, salt) {
    const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize: 256 / 32,
      iterations: 100000,
      hasher: CryptoJS.algo.SHA256,
    });
    return key.toString(CryptoJS.enc.Hex);
  }

  // Example usage:
  const buffer = new ArrayBuffer(65);
  // Fill the buffer with some example data
  const view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    view[i] = i;
  }

  useEffect(() => {
    console.log("if liveAuction changes")
  }, [liveAuction])

  useEffect(() => {
    console.log("in init");
    const init = async () => {
      try {
        console.log("in the bionic init");
        const _initWeb3AuthClient = await import(
          "../../bioniq/packages/bioniq-frontend/src/services/web-client-interface/web-clients/auth/web3-auth-client"
        );
        const _web3AuthClient = await _initWeb3AuthClient.initWeb3AuthClient();
        //@ts-ignore
        setWeb3Auth(_web3AuthClient.web3Auth);

        const _bioniqAuthClient = await createBioniqAuthClient(_web3AuthClient);
        //@ts-ignore
        setBioniqAuthClient(_bioniqAuthClient);
        reloadUserConnection()
        console.log("web auth client load sucessfully");
      } catch (error) {
        console.error("loading web auth client error", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadModule = async () => {
      try {
        //@ts-ignore
        console.log("trying to load the module in bioniq-wallet-api");
        let liveBioniq = await import(
          "../../bioniq//packages/bioniq-frontend/src/services/web-client-interface/web-clients/bioniq-wallet-api/live-bioniq-wallet-api/live-bioniq-wallet-api"
        );

        let liveInscriptions = await import(
          "../../bioniq//packages/bioniq-frontend/src/services/web-client-interface/web-clients/bioniq-inscription-api/live-client/live-bioniq-inscription-api-client"
        );
        console.log("liveInscriptions", liveInscriptions.inscriptionApiClient.liveClient())
        console.log(
          "liveBioniq",
          liveBioniq.bioniqWalletApiClient.liveClient()
        );
        //@ts-ignore
        console.log("before setting in the state live-bioniq");
        setLiveBioniqWalletApi(liveBioniq.bioniqWalletApiClient.liveClient());
        setLiveInscriptions(liveInscriptions.inscriptionApiClient.liveClient());
        // setLiveBioniqWalletApiUtils({
        // 				//@ts-ignore
        // 	btc_sendOrdinalWithCardinalFees,
        // 	constructVoltMemo,
        // 	refreshInscriptionUpstream,
        // });
        console.log("bioniq live api loaded into state");
        // await reloadUserConnection();
      } catch (error) {
        console.error("Failed to load the module:", error);
      }
    };
    loadModule();
  }, []);

  useEffect(() => {
    reloadUserConnection()
  }, [bioniqAuthClient])



  const resetError = async()=>{
    setError(null);
  }



  async function getSwapInfo() {
    let pool = await createSwapFactoryActor().getPool({
      fee: 3000,
      token0: { address: ckBTCcanister, standard: "ICRC2" },
      token1: { address: icpCanister, standard: "ICP" },
    });
    console.log("pool gather in swap factory", pool);
    let balanceAF, balanceBF, tokenBSymbol, tokenASymbol;
    let zeroForOne = pool.ok.token0.address === icpCanister ? true : false;
  
    if (pool.ok) {
      let tokenAactor = createicrc1Actor(pool.ok.token1.address, {
        agentOptions: {
          identity,
        },
      });
      let tokenBactor = createicrc1Actor(pool.ok.token0.address, {
        agentOptions: {
          identity,
        },
      });
      let balanceA = await tokenAactor.icrc1_balance_of(
        toDefaultSub(pool.ok.canisterId)
      );
      let balanceB = await tokenBactor.icrc1_balance_of(
        toDefaultSub(pool.ok.canisterId)
      );
      tokenASymbol = await tokenAactor.icrc1_symbol();
      tokenBSymbol = await tokenBactor.icrc1_symbol();
      let supplyA = await tokenAactor.icrc1_total_supply();
      let supplyB = await tokenBactor.icrc1_total_supply();
  
      balanceAF = formatIcrcBalance(balanceA, supplyA);
      balanceBF = formatIcrcBalance(balanceB, supplyB);
  
      // Calculate the price of 1 tokenA with respect to tokenB
      console.log("balance A and B", balanceAF, balanceBF);
      let priceOfTokenAInB = balanceAF / balanceBF;
      console.log("price token A in B", priceOfTokenAInB);
      let priceOfTokenBinA = balanceBF / balanceAF;
      let poolCanister = pool.ok.canisterId;
      let poolFee = pool.fee;
      console.log("poo");
  
      console.log(
        "pooldata ",
        balanceAF,
        balanceBF,
        Number(supplyA),
        Number(supplyB)
      );
      return {
        balanceAF,
        balanceBF,
        tokenASymbol,
        tokenBSymbol,
        priceOfTokenAInB,
        priceOfTokenBinA,
        poolCanister,
        poolFee,
        zeroForOne,
        supplyA,
        supplyB,
        pool,
      };
    }
  }

  async function withdrawAll(poolCanister) {
    let address1 = poolCanister.ok.token1.address;
    let address0 = poolCanister.ok.token0.address;
  
    console.log("poolCanister before claim All", poolCanister);
    let poolActor = createPoolActor(poolCanister.ok.canisterId, {
      agentOptions: { identity },
    });
    let result = await poolActor.getUserUnusedBalance(identity.getPrincipal());
  
    let token0Fee = await createicrc1Actor(
      poolCanister.ok.token0.address
    ).icrc1_fee();
    let token1Fee = await createicrc1Actor(
      poolCanister.ok.token1.address
    ).icrc1_fee();
  
    console.log("addresses", address0, address1);
    console.log("result");
  
    let withdrawResultA = await poolActor.withdraw({
      fee: Number(token1Fee),
      token: address1,
      amount: result.ok.balance1,
    });
    let withdrawResultB = await poolActor.withdraw({
      fee: Number(token0Fee),
      token: address0,
      amount: result.ok.balance0,
    });
  
    console.log("withdraw results", withdrawResultA, withdrawResultB);
    console.log("results", result);
    return "unused tokens have been claimed!!";
  }
  async function withdrawAll(poolCanister) {
    let address1 = poolCanister.ok.token1.address;
    let address0 = poolCanister.ok.token0.address;
  
    console.log("poolCanister before claim All", poolCanister);
    let poolActor = createPoolActor(poolCanister.ok.canisterId, {
      agentOptions: { identity },
    });
    let result = await poolActor.getUserUnusedBalance(identity.getPrincipal());
  
    let token0Fee = await createicrc1Actor(
      poolCanister.ok.token0.address
    ).icrc1_fee();
    let token1Fee = await createicrc1Actor(
      poolCanister.ok.token1.address
    ).icrc1_fee();
  
    console.log("addresses", address0, address1);
    console.log("result");
  
    let withdrawResultA = await poolActor.withdraw({
      fee: Number(token1Fee),
      token: address1,
      amount: result.ok.balance1,
    });
    let withdrawResultB = await poolActor.withdraw({
      fee: Number(token0Fee),
      token: address0,
      amount: result.ok.balance0,
    });
  
    console.log("withdraw results", withdrawResultA, withdrawResultB);
    console.log("results", result);
    return "unused tokens have been claimed!!";
  }


  async function buy() {
    setSwapStep(1)
    const {
      balanceAF,
      balanceBF,
      tokenASymbol,
      tokenBSymbol,
      priceOfTokenAInB,
      priceOfTokenBinA,
      poolCanister,
      zeroForOne,
      supplyA,
      supplyB,
      pool,
    } = await getSwapInfo();
  
    let poolActor = createPoolActor(poolCanister, {
      agentOptions: {
        identity,
      },
    });
    let logedIcpActor = createicrc1Actor(icpCanister, {
      agentOptions: { identity },
    });
  
    let tokenBsupply = supplyB;
    let icpSupply = await logedIcpActor.icrc1_total_supply();
    let fee = await logedIcpActor.icrc1_fee();
    let balance = await logedIcpActor.icrc1_balance_of(
      toDefaultSub(identity.getPrincipal())
    );
    console.log("balance",balance)
    let amount = Number(balance)-Number(fee);
    let transferSub = await logedIcpActor.icrc1_transfer(defaultIcrcTransferArgs(poolCanister,amount,[Number(fee)],[SubAccount.fromPrincipal(identity.getPrincipal()).toUint8Array()]));
    console.log("transfer sub",transferSub);
    console.log("deposit amout", defaultDepositIcpSwap(icpCanister, amount, Number(fee)))
    setSwapStep(2)
  let depositResult = await poolActor.deposit(
    defaultDepositIcpSwap(icpCanister, amount, fee)
  );
    console.log("deposit Result", depositResult);
    let amountOutMinimum = priceOfTokenBinA;
    console.log("price of token", priceOfTokenAInB, "B:  ", priceOfTokenBinA);
    console.log("ammount minimon before formate", amountOutMinimum);
    let formatedAmmountOut = reverseFormatIcrcBalance(
      amountOutMinimum,
      tokenBsupply
    );
    setSwapStep(3)
    console.log("amountOutMinimum", formatedAmmountOut);
    console.log();
    amount = Number(depositResult.ok)
    let quote = await poolActor.quote({
      zeroForOne: false,
      amountIn: amount.toString(),
      amountOutMinimum: "0",
    });
    let minimumQuote = quote.ok;
    console.log("quote", Number(minimumQuote));
    let miniumsum = Number(minimumQuote);
    console.log("miniumsum", miniumsum);
  
    let swapResult = await poolActor.swap({
      zeroForOne: false,
      amountIn: amount.toString(),
      amountOutMinimum: miniumsum.toString(),
    });
    console.log("looking at swap result", swapResult);
    setSwapStep(4)
    let resultWithdrawSwap = await withdrawAll(pool);
    console.log(" result of withdrawing the swap", resultWithdrawSwap);
    setSwapStep(5)
     reloadBalances();
    //return `we bough some ${tokenInfo.symbol} Chad!`;
  }

  async function withdraw(){
    const {
      balanceAF,
      balanceBF,
      tokenASymbol,
      tokenBSymbol,
      priceOfTokenAInB,
      priceOfTokenBinA,
      poolCanister,
      zeroForOne,
      supplyA,
      supplyB,
      pool,
    } = await getSwapInfo();
    await withdrawAll(pool);
  }

  const getBidders = async (inscription) => {
    let data = await fetch(`https://api.bioniq.io/v2/events?sort=timestamp_desc&inscriptionid=${inscription.id}&limit=10&page=1&type=new_bid,start_auction,end_auction`);
    let response = await data.json();
    console.log("data", response);
    if (response.results && response.results[0]) {
      let metadatasFiltered = response.results.filter((item) => item.name === "new_bid")
      let metadatas = metadatasFiltered.map((item) => {
        return JSON.parse(item.metadata);
      })
      console.log("looking at metadatas", metadatas)
      return metadatas;
    }
    return [];
  };

  const reloadBalances = async () =>{
    let _balances = [];

    for (const walletType in _wallets) {
      if (Object.hasOwnProperty.call(_wallets, walletType)) {
        const balances = await liveBioniqWalletApi.wallet.fetchLatestWalletBalance({
          wallet: _wallets[walletType],
          tokenMode: walletType,
        });

        _balances = _balances.concat(balances);
        console.log("balances in wallet", _balances)
      }
    }
    setBalances(_balances);
  };

  // async bid({inscription, bidAmount, resolvedBioniqUser, tokenMode})
  const createAbid = async (amount) => {
    console.log("creating a bid?")
    let inscriptionToSend = liveAuction;
    let bidAmount = { decimalAmount: amount, tokenType: "ckBTC" };
    let resolvedBioniqUser = { currentWallets: wallets };
    setLoading(true);
    try {
      let bidResponse = await liveBioniqWalletApi.inscription.bid({ resolvedBioniqUser, bidAmount, inscription: inscriptionToSend, tokenMode: "ckBTC" })
      console.log("response",bidResponse)
      setError("bid created sucessfully, It will take a few minutes to show up in bidders");
      reloadBalances()
    } catch (e) {
      console.log("in create bid", e)
      setLoading(false);
      setError(e)

    }
    setLoading(false);
    /// console.log("create a bid", bidResponse);
  };


  const withdrawCKBTC = async (destinationAddress) =>{
    // async sendToken({destinationAddress, amountToSend, feeRate, utxoList, wallet, tokenMode}) {
    setLoading(true)
    try{ 
      let sendingckBTCResponse = await liveBioniqWalletApi.token.sendToken({
        destinationAddress,
        amountToSend:{ decimalAmount: 0.00, tokenType: "ckBTC" },
        feeRate:null,
        utxoList:[],
        wallet:wallets["ckBTC"],
        tokenMode:"ckBTC"
      });
     // reloadBalances()
      console.log("looking for ckBTC response",sendingckBTCResponse);
      setLoading(false)
      setError("all ckBTC was sent to "+destinationAddress+"ckBTC Principal Address")
      reloadBalances()

    }catch(e){
      console.log("in transfer send", e.toString())
      setLoading(false);
      setError("error while transfering check you have the right balance")
    }
   
  }


  const sendInscription = async (inscription,destinationAddress) =>{
    setLoading(true);
    console.log('in send inscription',inscription,destinationAddress)
  //   async sendInscription({
  //     inscription,
  //     destinationAddress,
  //     utxoList,
  //     wrapFeeRate,
  //     resolvedBioniqUser,
  // }) 
  try{
    console.log("in send inscription try",inscription,destinationAddress)
    let sendinscriptionResponse = await liveBioniqWalletApi.inscription.sendInscription({
      inscription,
      resolvedBioniqUser: {
        currentWallets: wallets,
      },
      destinationAddress,
      utxoList:[],
      wrapFeeRate: { fullRate: 1000, tokenType: "Btc" }
    })
    await reloadInscriptions();
    setLoading(false);
    console.log("response",sendinscriptionResponse)
  }catch(e){
    setError(e)
    console.log("failed send inscription",e)
  }
  };


  const createAuction = async (inscription) => {
    //let userInscriptions = inscriptions;
    //console.log("use inscriptions", inscriptions)
    console.log("create auction inscription",inscription)
    console.log("wallets in auction", wallets)
    try{
      setLoading(true)
      await endAuction();
      let auctionResponse = await liveBioniqWalletApi.inscription.createAuction({
        resolvedBioniqUser: {
          currentWallets: wallets,
        },
        tokenMode: "ckBTC",
        inscription: inscription,
        startAmount: { decimalAmount: 0.00005, tokenType: "ckBTC" },
        utxoList: [],
        wrapFeeRate: { fullRate: 1000, tokenType: "Btc" },
        auctionDuration: { seconds: 82800 }
      });
      await saveCurrentAuction("plebes",inscription.id);
      console.log("auction response", auctionResponse)
      setLoading(false)
    }catch(e){
      setLoading(false)
      console.log('before setting error',e)
      setError("creating the auction failed this inscription probably already listed or the network timed out")
    }
   
  };

  const cancelAuction = async (inscription) => {
    let response = await liveBioniqWalletApi.inscription.cancelAuction({
      resolvedBioniqUser: {
        currentWallets: wallets,
      },
      inscription: inscription,
      tokenMode: "ckBTC"
    })
    await endAuction();
    console.log('response', response, inscription)
  }

  const reloadUserConnection = useCallback(async () => {
    console.log("in reload user connection", bioniqAuthClient)
    if (!bioniqAuthClient) return;

    const _userConnection = await bioniqAuthClient.getCurrentUserConnection(
      "open-login"
    );
    console.log("user connection", _userConnection)
    setUserConnection(_userConnection);
    if (_userConnection && _userConnection.privateKey) return   setIsLoggedIn(true)
    
      return setLoading(false);
  }, [bioniqAuthClient]);

  const reloadWallets = useCallback(async () => {
    if (!liveBioniqWalletApi || !userConnection) return;

    try {
      console.log("before livee bionic loadWallets")
      const _wallets = await liveBioniqWalletApi.wallet.loadWallets({
        privateKey: userConnection.privateKey,
        tokenMode: 'ckBTC',
      });
      const _identity = await liveBioniqWalletApi.wallet.exportII(userConnection.privateKey);
      console.log("getting wallets in reload wallets", _wallets)
      setWallets(_wallets);
      setIdentity(_identity)

      let _balances = [];

      for (const walletType in _wallets) {
        if (Object.hasOwnProperty.call(_wallets, walletType)) {
          const balances = await liveBioniqWalletApi.wallet.fetchLatestWalletBalance({
            wallet: _wallets[walletType],
            tokenMode: walletType,
          });

          _balances = _balances.concat(balances);
          console.log("balances in wallet", _balances)
        }
      }
      setBalances(_balances);
    } catch (error) {
      console.error('Error reloading wallets:', error);
    }
  }, [liveBioniqWalletApi, userConnection]);



  useEffect(() => {
    console.log("before reload wallets", liveBioniqWalletApi);

    reloadWallets();
  }, [liveBioniqWalletApi, reloadWallets]);




  async function fetchUserInscriptions(user) {
    try {
      const response = await fetch(`https://api.bioniq.io/v2/inscriptions?address=${user}&page=2&limit=100`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("response in fetch inscriptions",response)
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Fetched Inscriptions Data:", data);
      return data;
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  }

  async function getHistory() {
    try{
      const response = await fetch("https://api.bioniq.io/v2/events?type=sale&collection=plebes&hasInscription=true&page=1&limit=20&protocol=ckBTC", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("response in fetch history",response)
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Fetched history Data:", data);
      return data;
    }catch(error){
      console.log("error",error)
    }
  }

  const fetchCryptoData = async () => {
    // Replace ACCESS_TOKEN with your actual token
    const token = 'somfr7gidu5pw7gfzcoe';
    const url = `https://api.freecryptoapi.com/v1/getData?symbol=BTC+ETH+SOL+ETHBTC@binance&token=${token}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("fetch crypto",data);
      let btcPrice = data.symbols[0].highest;
      setBtcPrice(btcPrice);
      console.log("btc price",btcPrice)
      //return data[0]
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };



  const convertUsdToBtcOnDemand = async (usdAmount) => {
    try {
      const token = 'somfr7gidu5pw7gfzcoe';
      const url = `https://api.freecryptoapi.com/v1/getData?symbol=BTC+ETH+SOL+ETHBTC@binance&token=${token}`;
      
      const response = await fetch(url);
      const data = await response.json();
      const btcPriceFromApi = data.symbols[0].highest;
      
      return usdAmount / btcPriceFromApi;
    } catch (error) {
      console.error('Error converting USD to BTC:', error);
      return null;
    }
  };


  const convertBtcToUsd = async (btcBalance) => {
    try {
      const token = 'somfr7gidu5pw7gfzcoe';
      const url = `https://api.freecryptoapi.com/v1/getData?symbol=BTC+ETH+SOL+ETHBTC@binance&token=${token}`;
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      // data.symbols[0].highest should contain the current BTC price in USD
      const btcPriceFromApi = data.symbols[0].highest;
      // Convert the given BTC balance to USD
      const usdAmount = btcBalance * btcPriceFromApi;
      console.log("usd amount",usdAmount)
      return usdAmount;
    } catch (error) {
      console.error('Failed to convert BTC to USD:', error);
      return null; // or throw error, depending on your needs
    }
  };
  


  const getCurrentAuction = async () => {
    const url = `https://api.plebes.xyz/current-auction`;
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      console.log("response",response)
      let auction = await response.json();
      console.log("current",auction)
      let currentAuction = auction.assetId;
      let getInscription = `https://api.bioniq.io/v2/inscription/${currentAuction}?protocol=ckBTC`;
      const response2 = await fetch(getInscription, {
        method: 'GET',
      });
      let currentAuctionInscriptionRes = await response2.json();
      console.log("current Auction",currentAuctionInscriptionRes)
      setLiveAuction(currentAuctionInscriptionRes);
      let bidData = await getBidders(currentAuctionInscriptionRes);
      setLiveAuctionBidders(bidData)
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };


  const setCurrentAuction = async () =>{
    const url = `https://api.plebes.xyz/current-auction`;
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
      let auction = await response.data();
      let currentAuction = auction.assetId;
      let getInscription = `https://api.bioniq.io/v2/inscription/${currentAuction}?protocol=ckBTC`;
      const response2 = await fetch(getInscription, {
        method: 'GET',
      });
      let currentAuctionInscriptionRes = await response2.data();
      setLiveAuction(currentAuctionInscriptionRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  async function saveCurrentAuction(password, assetId) {
    const endpoint = "https://api.plebes.xyz/save-auction"; // Replace with your server's endpoint
    console.log("password")
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password:password, assetId:assetId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to save auction: ${errorData.error || response.statusText}`
        );
      }
  
      const data = await response.json();
      console.log("Auction saved successfully:", data);
      return data;
    } catch (error) {
      console.error("Error saving auction:", error.message);
      throw error;
    }
  }
  

  async function endAuction() {
    try {
      const response = await fetch('https://api.plebes.xyz/end-auction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: 'plebes' })
      });
      
      // If the endpoint returns JSON, parse it
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  


  const fetchFROMVPS = async () => {
    // Replace ACCESS_TOKEN with your actual token
    const url = `https://api.plebes.xyz/hello-world`;
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
     // console.log("fetch vps",response);
      // if (!response.ok) {
      //   throw new Error(`${response.status} - ${response.statusText}`);
      // }
  
      const data = await response.json();
      console.log("fetch vps",data);
      //let btcPrice = data.symbols[0].highest;
     // setBtcPrice(btcPrice);
    //  console.log("btc price",btcPrice)
      //return data[0]
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };
  
  // Call the function to execute


  const reloadInscriptions = useCallback(async () => {
    //await fetchFROMVPS();
    console.log("@inscriptions reload before useEffect", liveBioniqWalletApi, wallets);
    if (liveBioniqWalletApi) {
      await fetchCryptoData()
      let historicArray = [];
      let history = await getHistory();
      let currentAuction =   await getCurrentAuction();

      console.log("looking at history",history);
      if(history){
        console.log("in history")
        history.results.forEach(async(item)=>{
          console.log("in history results item",typeof item.metadata)
          let metadata = JSON.parse(item.metadata)
          if(metadata && metadata.seller === "bc1qz6dmmfrh9ejmn7fj2563lav7ze6pxck73a4vgy"){
            historicArray.push({metadata,item});
          }
          console.log("metadatas",metadata)
        })
      }
      setHistoricState(historicArray);
      console.log("historic array",historicArray);
      //console.log("ad inscriptions", adInscriptions)

      // adInscriptions.results.forEach(async (item)=>{
      //   if (item && item.listing_type === "auction" || item.listing_type === "bid") {
      //     setLiveAuction(item)
      //     let bidData = await getBidders(item);
      //     console.log("bid data",bidData)
      //     setLiveAuctionBidders(bidData)
      //   }
      // })
      // let adInscriptions = await liveBioniqWalletApi.inscription.getAdminInscriptions();
      // console.log("ad inscriptions", adInscriptions)

      // if (adInscriptions && adInscriptions[3] && adInscriptions[3].listing_type === "auction") {
      //   setLiveAuction(adInscriptions[3])
      //   let bidData = await getBidders(adInscriptions[3]);
      //   setLiveAuctionBidders(bidData)
      // }
      // let auctionInscriptions = await liveInscriptionsApi.fetchInscriptions({ currenPage:1 , tokenMode:"ckBTC",search: { ownerWalletAddress: "feu76-lncck-6w62q-i2gnm-dsq6m-ytmf5-ez3v5-xr2ht-iqqov-2mz32-zae"}, sort: {name: "Recently Listed",ascending:true}  } )
      // console.log("@inscriptions", auctionInscriptions)
    }
    if (!liveBioniqWalletApi || !wallets) return

    // const _inscriptions =
    //   await liveBioniqWalletApi.inscription.getAllUserInscriptions({
    //     resolvedBioniqUser: {
    //       currentWallets: wallets,
    //     },
    //     tokenMode: "ckBTC",
    //   });

    // console.log("@inscriptions after load all inscriptions", _inscriptions);
    let getInscriptions = await fetchUserInscriptions(wallets.BTC.walletAddress)
    console.log("page 1 inscriptions",getInscriptions)
    setInscriptions(getInscriptions.results);
    setLoading(false);
    return getInscriptions.restults;
  }, [liveBioniqWalletApi, wallets]);

  useEffect(() => {
    console.log("@inscriptions useEffect");
    reloadInscriptions();
  }, [liveBioniqWalletApi, wallets]);

  const login = useCallback(async () => {
    console.log("inside the bionic login", bioniqAuthClient);
    if (!bioniqAuthClient) return;
    console.log("inside the bioniq login after the if authclient");
    const bioniqAuthClientLoginResult = await bioniqAuthClient.login(
      "open-login"
    );
    setIsLoggedIn(true);
    await reloadUserConnection();
  }, [bioniqAuthClient, reloadUserConnection]);

  const logout = useCallback(async () => {
    if (!bioniqAuthClient) return;

    try {
      await bioniqAuthClient.logout("open-login");
      setIsLoggedIn(false);
      setUserConnection(null);
      setWallets(null);
      setBalances(null);
      setInscriptions(null);
    } catch (error) {
      console.error(error);
    }
  }, [bioniqAuthClient]);

  const contextValue = useMemo(
    () => ({
      isLoading,
      web3Auth,
      bioniqAuthClient,
      isLoggedIn,
      login,
      logout,
      liveBioniqWalletApi,
      liveBioniqWalletApiUtils,
      userConnection,
      wallets,
      balances,
      reloadWallets,
      reloadUserConnection,
      btcAddress: wallets?.BTC?.walletAddress,
      ckBtcAddress: wallets?.ckBTC?.walletAddress,
      inscriptions,
      reloadInscriptions,
      createAuction,
      cancelAuction,
      liveAuction,
      createAbid,
      loading,
      liveAuctionBidders,
      ckBTCTotal,
      error,
      resetError,
      sendInscription,
      withdrawCKBTC,
      historicState,
      btcPriceState,
      buy,
      withdraw,
      swapStep,
      setSwapStep,
      convertBtcToUsd,
      convertUsdToBtcOnDemand
    }),
    [
      isLoading,
      web3Auth,
      bioniqAuthClient,
      isLoggedIn,
      login,
      logout,
      liveBioniqWalletApi,
      liveBioniqWalletApiUtils,
      userConnection,
      wallets,
      balances,
      reloadWallets,
      reloadUserConnection,
      inscriptions,
      reloadInscriptions,
      createAuction,
      cancelAuction,
      liveAuction,
      createAbid,
      ckBTCTotal,
      loading,
      liveAuctionBidders,
      ckBTCTotal,
      error,
      resetError,
      sendInscription,
      withdrawCKBTC,
      historicState,
      btcPriceState,
      buy,
      withdraw,
      swapStep,
      setSwapStep,
      convertBtcToUsd,
      convertUsdToBtcOnDemand
    ]
  );

  return (
    <BioniqContext.Provider value={contextValue}>
      {children}
    </BioniqContext.Provider>
  );
};

export const useBioniqContext = () => useContext(BioniqContext);

export default BioniqContextProvider;
