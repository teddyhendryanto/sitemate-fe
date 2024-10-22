import type { AppProps } from "next/app";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
