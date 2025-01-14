import HomePage9 from "./(homes)/home-9/page";

export const metadata = {
  title: "Home 1 || Xhibiter | NFT Marketplace Nextjs Template",
};

export default function Home({login,setModalOpen}) {
  return (
    <>
      <HomePage9 login={login} setModalOpen={setModalOpen} />
    </>
  );
}
