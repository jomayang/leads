import "../styles/globals.css";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

const WalletConnectionProvider = dynamic(
  () => import("../context/WalletConnectionProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletConnectionProvider>
      <Component {...pageProps} />
    </WalletConnectionProvider>
  );
}

export default MyApp;
