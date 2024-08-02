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
    let principal = await window.ic.plug.principalId;
    console.log("getting principal",principal)
    setPrincipal(principal);

  };

  const requestConnectAsync = async () => {
    const publicKeyRequest = await window.ic.plug.requestConnect({
      whitelist,
      host,
    });
    console.log("public key", publicKeyRequest);
      //  window.location.reload();
    if (publicKeyRequest) {
      setIsAuthenticated(true);
      setPublicKey(publicKeyRequest);
      await setPrincipalAsync();
    }

  };

  const verifyConnection = async () => {
    const connected = await window.ic.plug.isConnected();
    console.log("is connected",connected)
    if (connected) {
      setIsAuthenticated(true);
      await setPrincipalAsync();
    }
    // if (!connected) requestConnectAsync();
  };

  useEffect( () => {
    if (!publicKey && !principal) {
      console.log("in verify connection")
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
