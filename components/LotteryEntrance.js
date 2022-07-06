import { useWeb3Contract } from "react-moralis";
// we can only specify the folder as it will automatically look into the index.js
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
	// the reason Moralis knows the chainId is because it gets it from the Header, which gets it from our Metamask wallet and it passes it down to all the comonents inside the Moralis provided tags
	// NOTE: it returns the chainId in hex form; to parse it to int we can use parseInt(value)
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
	const chainId = parseInt(chainIdHex);

	// if we would just declare entranceFee as a variable, the ui wouldn't get re-rendered when it changes its value (which is what we want);
	// setting up a useState creates a hook that triggers this re-render when entranceFee changes
	// the "0" set as a parameter for useState is the starting value of entranceFee
	const [entranceFee, setEntranceFee] = useState("0");
	const [numPlayers, setNumPlayers] = useState("0");
	const [recentWinner, setRecentWinner] = useState("0");

	const dispatch = useNotification();

	const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
	// { runContractFunction: enterRaffle } takes runContractFunction from useWeb3Contract and names it enterRaffle; think of it as an alias
	// runContractFunction can both send transactions and read state
	// the runContractFunction will also be async

	const {
		runContractFunction: enterRaffle,
		isLoading,
		isFetching,
	} = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "enterRaffle",
		params: {},
		msgValue: entranceFee, // this sends the value to enterRaffle; when we call the function, we pass entranceFee dynamically: enterRaffle{value: <entrance_fee>}()
	});

	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getEntranceFee",
		params: {},
	});

	const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getNumberOfPlayers",
		params: {},
	});

	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress,
		functionName: "getRecentWinner",
		params: {},
	});

	async function updateUI() {
		const entranceFeeFromCall = (await getEntranceFee()).toString();
		const numPlayersFromCall = (await getNumberOfPlayers()).toString();
		const recentWinnerFromCall = await getRecentWinner();
		setEntranceFee(entranceFeeFromCall);
		setNumPlayers(numPlayersFromCall);
		setRecentWinner(recentWinnerFromCall);
	}

	// we can't call await inside a useEffect function dirrectly, but we can create a function inside it, call await inside that function, then outside this function and inside useEffect call this created function
	// the isWeb3Enabled will be false by default, then it will turn true if it sees that a wallet is connected, thus changing its state, thus triggering this useEffect
	useEffect(() => {
		// if Web3 is enabled, get the entrance fee (which we will pass to msgValue)
		if (isWeb3Enabled) {
			updateUI();
		}
	}, [isWeb3Enabled]);

	// handleSuccess gets triggered on successful raffle entrance
	const handleSuccess = async function (tx) {
		await tx.wait(1);
		handleNewNotification(tx);
		updateUI();
	};

	const handleNewNotification = function () {
		// check web3ui docs for info on dispatch and properties
		dispatch({
			type: "info",
			message: "Transaction Complete!",
			title: "Tx Notification",
			position: "topR",
			icon: "bell",
		});
	};

	return (
		<div className="p-5">
			Hi from lottery entrance!{" "}
			{raffleAddress ? (
				<div>
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white fond-bold py-2 px-4 rounded ml-auto"
						onClick={async function () {
							// onSuccess doesn't check if the transaction has a block confirmation, it just checks to see if the transaction was successfully sent to Metamask
							// that's why we need to do tx.wait(1) in handleSuccess
							await enterRaffle({
								onSuccess: handleSuccess,
								// it's good practice to always add onError as well
								onError: (error) => console.log(error),
							});
						}}
						disabled={isLoading || isFetching}
					>
						{isLoading || isFetching ? (
							<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
						) : (
							<div>Enter Raffle</div>
						)}
					</button>
					<div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} eth</div>
					<div>Number of Players: {numPlayers}</div>
					<div>Recent Winner: {recentWinner}</div>
				</div>
			) : (
				<div>No Raffle Address Detected</div>
			)}
		</div>
	);
}
