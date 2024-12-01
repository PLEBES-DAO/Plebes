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
  const [liveBioniqWalletApiUtils, setLiveBioniqWalletApiUtils] =
    useState(null);
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


  const getBidders = async (inscription) => {
    let data = await fetch(`https://api.bioniq.io/v2/events?sort=timestamp_desc&inscriptionid=${inscription.assetTokenId}&limit=10&page=1&type=new_bid,start_auction,end_auction`);
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


  const createAuction = async () => {
    let userInscriptions = inscriptions;
    console.log("use inscriptions", inscriptions)
    console.log("wallets in auction", wallets)
    try{
      setLoading(true)
      let auctionResponse = await liveBioniqWalletApi.inscription.createAuction({
        resolvedBioniqUser: {
          currentWallets: wallets,
        },
        tokenMode: "ckBTC",
        inscription: inscriptions[2],
        startAmount: { decimalAmount: 0.00001, tokenType: "ckBTC" },
        utxoList: [],
        wrapFeeRate: { fullRate: 1000, tokenType: "Btc" },
        auctionDuration: { seconds: 509500 }
      });
      console.log("auction response", auctionResponse)
      setLoading(false)
    }catch(e){
      setLoading(false)
      console.log('before setting error',e)
      setError("creating the auction failed this inscription probably already listed or the network timed out")
    }
   
  };

  const cancelAuction = async () => {
    let response = await liveBioniqWalletApi.inscription.cancelAuction({
      resolvedBioniqUser: {
        currentWallets: wallets,
      },
      inscription: inscriptions[2],
      tokenMode: "ckBTC"
    })
    console.log('response', response, inscriptions[2])
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
      console.log("getting wallets in reload wallets", _wallets)
      setWallets(_wallets);

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

  const reloadInscriptions = useCallback(async () => {
    console.log("@inscriptions reload before useEffect", liveBioniqWalletApi, wallets);
    if (liveBioniqWalletApi) {
      let adInscriptions = await liveBioniqWalletApi.inscription.getAdminInscriptions();
      console.log("ad inscriptions", adInscriptions)

      if (adInscriptions && adInscriptions[2] && adInscriptions[2].listing.category === "auction") {
        setLiveAuction(adInscriptions[2])
        let bidData = await getBidders(adInscriptions[2]);
        setLiveAuctionBidders(bidData)
      }
      // let auctionInscriptions = await liveInscriptionsApi.fetchInscriptions({ currenPage:1 , tokenMode:"ckBTC",search: { ownerWalletAddress: "feu76-lncck-6w62q-i2gnm-dsq6m-ytmf5-ez3v5-xr2ht-iqqov-2mz32-zae"}, sort: {name: "Recently Listed",ascending:true}  } )
      // console.log("@inscriptions", auctionInscriptions)
    }
    if (!liveBioniqWalletApi || !wallets) return

    const _inscriptions =
      await liveBioniqWalletApi.inscription.getAllUserInscriptions({
        resolvedBioniqUser: {
          currentWallets: wallets,
        },
        tokenMode: "ckBTC",
      });

    console.log("@inscriptions after load all inscriptions", _inscriptions);
    setInscriptions(_inscriptions);
    setLoading(false);
    return _inscriptions;
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
      sendInscription
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
      sendInscription
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
