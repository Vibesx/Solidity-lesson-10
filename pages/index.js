import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
//import ManualHeader from "../components/ManualHeader";
import Header from "../components/Header";
import LotteryEntrance from "../components/LotteryEntrance";

export default function Home() {
	return (
		<div className={styles.container}>
			<Head>
				<title>Smart Contract Raffle</title>
				<meta name="description" content="Our Smart Contract Lottery" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			{/*This is how you comment in React/Next */}
			{/*Header is the component we defined in Header.js */}
			<Header />
			<LotteryEntrance />
		</div>
	);
}
