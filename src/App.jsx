import Page from "./app/page";
import { useBioniqContext } from "./hooks/BioniqContext";

function App() {
  const {
    login,
    userConnection,
    reloadInscriptions,
    reloadWallets,
    liveBioniqWalletApi,
  } = useBioniqContext();
  return (
    <>
      <Page login={login}></Page>
    </>
  );
}

export default App;
