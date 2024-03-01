import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
//import PublicMintListener from './PublicMintListener';

// Assuming REACT_APP_RPC_URL and REACT_APP_PRIVATE_KEY are set in your .env file
// const RPC_URL = process.env.REACT_APP_RPC_URL;
// const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
//const contractAddress = "0x1b31285934B8B638B42c1b06eF39d7796e3d6c26"; 
const RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.REACT_APP_SDG_PRIVATE_KEY;
const contractABI = require('./contractAbi_SDGs.json');
const contractAddress = "0xF9bCDf3524B002BD2897ACe463FbCBD935821b77"; 


const Contracts = () => {
  const [price, setPrice] = useState('Loading...');
  const [totalSupply, setTotalSupply] = useState('Loading...');
  const [symbol, setSymbol] = useState('Loading...');
  const [name, setName] = useState('Loading...');
  const [eventName, seteventName] = useState('Loading...');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);

    // Set the contract instance in state
    setContract(contractInstance);

    // Fetch the contract data
    const fetchContractData = async () => {
      try {
        const fetchedTotalSupply = await contractInstance.totalSupply();
        const fetchedSymbol = await contractInstance.symbol();
        const fetchedName = await contractInstance.name();
        //const fetchedPrice = await contractInstance.tokenPrice();

        // Assuming all values are in Wei and need to be formatted
        setTotalSupply(ethers.utils.formatUnits(fetchedTotalSupply, 'ether'));
        // setTotalSupply(fetchedTotalSupply);
        setSymbol(fetchedSymbol);
        setName(fetchedName);
        //setPrice(ethers.utils.formatEther(fetchedPrice));

        const eventName = "NewHolder"; // 用实际感兴趣的事件名称替换这里
        const fromBlock = 0; // 可以根据需要设置适当的值
        const toBlock = 'latest'; // 或者当前区块号

        // 过滤出特定事件
      // Filter specific events directly with contractInstance
    //   const events = await contractInstance.queryFilter(contractInstance.filters[eventName](), fromBlock, toBlock);
    //   seteventName(JSON.stringify(events.map(event => event.args))); // Convert events to a string to display
        
      } catch (error) {
        console.error("Error fetching contract data:", error);
      }
    };

    fetchContractData();

    // 監聽造幣程式
    // Define the mint event handling function
    // const onPublicMint = (to, amount, event) => {
    //   console.log(`Minted to address: ${to} amount: ${ethers.utils.formatUnits(amount, 'ether')}`); // Assuming the amount is in Wei
    // // Here you can update the state or perform other logic based on the mint event
    // };

    // const onHoldersChanged = () => {
    //   console.log(`holder changed`); 
    //   //用合約地址獲取多少人擁有TWT幣
    //   getHoldersData();
    // };

    // const getHoldersData = async () => {
    //   try {
    //     const holderData = await contractInstance.holders();
    //     console.log("這是一個holder資料地圖:"+{holderData})
    //   } catch (error) {
    //     console.error("Error fetching holderdata:", error);
    //   }
    // };

    // Listen for the mint event
    //contractInstance.on("PublicMint", onPublicMint);
    // contractInstance.on("HoldersChanged", onHoldersChanged);

    // Clean up the listener when the component is unmounted
    return () => {
    //   if (contractInstance) {
    //     contractInstance.off("PublicMint", onPublicMint);
    //     // contractInstance.off("HoldersChanged", onHoldersChanged);
    //   }
    };

  }, []);

  return (
    <div>
      <h1>SDGs 合約</h1>
      <p>Token Name: {name}</p>
      <p>Token Symbol: {symbol}</p>
      <p>Total Supply: {totalSupply}</p>
      {/* <p>Token Price: <span>{price}</span></p> */}
      <p>Events: <span>{eventName}</span></p>
      <button onClick={() => contract && contract.tokenPrice().then(res => setPrice(ethers.utils.formatEther(res)))}>
        Refresh Price
      </button>
    </div>
  );
};

export default Contracts;
