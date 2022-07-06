// export default allows other applications to use this Component through import
import { useMoralis } from "react-moralis";
import { useEffect } from "react";

export default function ManualHeader() {
	// useMoralis is known as a react hook; Hooks let you "hook into" React state and lifecycle features
	{
		/* account stores the wallet account connected; not being connected (?probably) returns undefined; isWeb3Enabled returns true if a wallet is connected */
	}
	const { enableWeb3, deactivateWeb3, account, isWeb3Enabled, isWeb3EnableLoading, Moralis } =
		useMoralis();
	{
		/* useEffect is a sort of listener that takes two parameters: a function and an optional array of properties; every time one of the properties (dependencies) changes, the function is triggered
		If you don't provide an array, it runs anytime something re-renders; CAREFUL as this can cause circular renders
		Blank dependency array: run once on load
	*/
	}
	useEffect(() => {
		if (isWeb3Enabled) {
			return;
		}
		if (typeof window !== "undefined") {
			if (window.localStorage.getItem("connected")) {
				enableWeb3();
			}
		}
		console.log(isWeb3Enabled);
	}, [isWeb3Enabled]);
	useEffect(() => {
		Moralis.onAccountChanged((account) => {
			console.log(`Account changed to ${account}`);
			if (account == null) {
				window.localStorage.removeItem("connected");
				deactivateWeb3();
				console.log("Null account found");
			}
		});
	}, []);
	{
		/* basically using curly brackets you can inject javascript */
	}
	return (
		<div>
			{account ? (
				<div>Connected to {account}</div>
			) : (
				<button
					onClick={async () => {
						await enableWeb3();
						if (typeof window !== "undefined") {
							// we set a key-value in local storage to know on refresh that we already connected
							window.localStorage.setItem("connected", "injected");
						}
					}}
					disabled={isWeb3EnableLoading}
				>
					Connect
				</button>
			)}
		</div>
	);
}
