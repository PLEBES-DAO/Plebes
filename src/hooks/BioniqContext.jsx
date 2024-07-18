
// @ts-nocheck

'use client';

import React, {
	useState,
	createContext,
	useEffect,
	useContext,
	useMemo,
	useCallback,
	lazy,
	Suspense,
} from 'react';

 export const BioniqContext = createContext(null);


const initWeb3AuthClient = lazy(() =>
// @ts-ignore
	import('../../bioniq/packages/bioniq-frontend/src/services/web-client-interface/web-clients/auth/web3-auth-client').then(module => ({ default: module.initWeb3AuthClient }))
);

const createBioniqAuthClient = async (_web3AuthClient) => {
	return {
		async login(authProvider = 'open-login') {
			const connection = await _web3AuthClient.login();
			return {
				...connection,
				authProvider,
			};
		},
		async getCurrentUserConnection(authProvider = 'open-login') {
			const connection = await _web3AuthClient.getCurrentAuth();
			if (!connection) {
				return undefined;
			}
			return {
				...connection,
				authProvider,
			};
		},
		async logout(authProvider = 'open-login') {
			await _web3AuthClient.logout();
		},
	};
}


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

	const isLoading = useMemo(() => {
		return !web3Auth || !bioniqAuthClient || !liveBioniqWalletApi;
	}, [web3Auth, bioniqAuthClient, liveBioniqWalletApi]);

	useEffect(() => {
		console.log("in init")
		const init = async () => {
			try {
				console.log("in the bionic init")
				const _initWeb3AuthClient = await import('../../bioniq/packages/bioniq-frontend/src/services/web-client-interface/web-clients/auth/web3-auth-client');
				const _web3AuthClient = await _initWeb3AuthClient.initWeb3AuthClient();
							//@ts-ignore
				setWeb3Auth(_web3AuthClient.web3Auth);

				const _bioniqAuthClient = await createBioniqAuthClient(_web3AuthClient);
							//@ts-ignore
				setBioniqAuthClient(_bioniqAuthClient);
				console.log("web auth client load sucessfully")
			} catch (error) {
				console.error("loading web auth client error",error);
			}
		};
		init();
	}, []);

	useEffect(() => {
		const loadModule = async () => {
			try {
				//@ts-ignore
				console.log("trying to load the module in bioniq-wallet-api")
				let liveBioniq = await import(
					'../../bioniq//packages/bioniq-frontend/src/services/web-client-interface/web-clients/bioniq-wallet-api/live-bioniq-wallet-api/live-bioniq-wallet-api'
				);

				console.log("liveBioniq",liveBioniq.bioniqWalletApiClient.liveClient())
				//@ts-ignore
				console.log("before setting in the state live-bioniq")
				// setLiveBioniqWalletApi(liveBioniqWalletApi);
				// setLiveBioniqWalletApiUtils({
				// 				//@ts-ignore
				// 	btc_sendOrdinalWithCardinalFees,
				// 	constructVoltMemo,
				// 	refreshInscriptionUpstream,
				// });
				console.log("bioniq live api loaded into state")
			} catch (error) {
				console.error('Failed to load the module:', error);
			}
		};
		loadModule();
	}, []);

	const reloadUserConnection = useCallback(async () => {
		if (!bioniqAuthClient) return;

		const _userConnection = await bioniqAuthClient.getCurrentUserConnection('open-login');
		setUserConnection(_userConnection);
	}, [bioniqAuthClient]);

	const reloadWallets = useCallback(async () => {
		if (!liveBioniqWalletApi || !userConnection) return;

		try {
			const _wallets = await liveBioniqWalletApi.wallet.loadWallets({
				privateKey: userConnection.privateKey,
				tokenMode: 'ckBTC',
			});
			setWallets(_wallets);

			let _balances = [];

			for (const walletType in _wallets) {
				if (Object.hasOwnProperty.call(_wallets, walletType)) {
					const balances = await liveBioniqWalletApi.wallet.fetchLatestWalletBalance({
						wallet: _wallets[walletType],
						tokenMode: walletType,
					});

					_balances = _balances.concat(balances);
				}
			}
			setBalances(_balances);
		} catch (error) {
			console.error('Error reloading wallets:', error);
		}
	}, [liveBioniqWalletApi, userConnection]);

	useEffect(() => {
		reloadWallets();
	}, [liveBioniqWalletApi, userConnection, reloadWallets]);

	const reloadInscriptions = useCallback(async () => {
		if (!liveBioniqWalletApi || !wallets) return;

		const _inscriptions = await liveBioniqWalletApi.inscription.getAllUserInscriptions({
			resolvedBioniqUser: {
				currentWallets: wallets,
			},
			tokenMode: 'ckBTC',
		});

		setInscriptions(_inscriptions);
		return _inscriptions;
	}, [liveBioniqWalletApi, wallets]);

	// useEffect(() => {
	// 	reloadInscriptions();
	// }, [liveBioniqWalletApi, userConnection, reloadWallets]);

	const login = useCallback(async () => {
		console.log("inside the bionic login")
		if (!bioniqAuthClient) return;
		console.log("inside the bioniq login after the if authclient")
		const bioniqAuthClientLoginResult = await bioniqAuthClient.login('open-login');
		setIsLoggedIn(true);
		await reloadUserConnection();
	}, [bioniqAuthClient, reloadUserConnection]);

	const logout = useCallback(async () => {
		if (!bioniqAuthClient) return;

		try {
			await bioniqAuthClient.logout('open-login');
			setIsLoggedIn(false);
			setUserConnection(null);
			setWallets(null);
			setBalances(null);
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