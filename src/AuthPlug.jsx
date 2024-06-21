import React, { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext(null);

export const useAuthClient = () => {
  const [isAuthPlug, setIsAuthenticated] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const nnsCanisterId = "d7f3o-miaaa-aaaam-acquq-cai";

  // Whitelist
  const whitelist = [nnsCanisterId];

  // Host
  const host = "https://mainnet.dfinity.network";

  const setPrincipalAsync = async () => {
    console.log("setting principal");
    let principal = await window.ic.plug.principalId;
    setPrincipal(principal);
  };

  const requestConnectAsync = async () => {
    const publicKeyRequest = await window.ic.plug.requestConnect({
      whitelist,
      host,
    });
    window.location.reload();
    console.log("public key", publicKey);
    if (publicKey) {
      setIsAuthenticated(true);
      setPublicKey(publicKeyRequest);
      await setPrincipalAsync();
    }
  };

  const verifyConnection = async () => {
    const connected = await window.ic.plug.isConnected();
    if (connected) {
      setIsAuthenticated(true);
      setPrincipalAsync();
    }
    // if (!connected) requestConnectAsync();
  };

  useEffect( () => {
    if (!publicKey && !principal) {
      verifyConnection();
    }
  }, []);

  useEffect(() => {
    console.log("logging public Key change", publicKey, principal);
  }, [publicKey, principal]);

  const login = async () => {
    await requestConnectAsync();
  };

  const logout = async () => {
    await window.ic.plug.disconnect();
    setIsAuthenticated(false);
    setPrincipal(null);
  };

  return {
    isAuthPlug,
    login,
    principal,
    logout,
  };
};

/**
 * @type {React.FC}
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
