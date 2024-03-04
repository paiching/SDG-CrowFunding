import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
//import PublicMintListener from './PublicMintListener';

// Assuming REACT_APP_RPC_URL and REACT_APP_PRIVATE_KEY are set in your .env file
// const RPC_URL = process.env.REACT_APP_RPC_URL;
// const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
//const contractAddress = "0x1b31285934B8B638B42c1b06eF39d7796e3d6c26"; 
const RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.REACT_APP_SDG_PRIVATE_KEY;
const contractABI = require('../hooks/contractAbi_DAO.json');
const contractAddress = "0xab9aC5bdCb810B2eE3D29EaBe55D6F9696037Fc3"; 


const ContractsDao = () => {
  
  const [name, setName] = useState('Loading...');
  const [eventName, setEventName] = useState(null);
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
        // const fetchedTotalSupply = await contractInstance.totalSupply();
        // const fetchedSymbol = await contractInstance.symbol();
        const fetchedName = await contractInstance.name();
        //const fetchedPrice = await contractInstance.tokenPrice();

        // Assuming all values are in Wei and need to be formatted
        //setTotalSupply(ethers.utils.formatUnits(fetchedTotalSupply, 'ether'));
        // setTotalSupply(fetchedTotalSupply);
        // setSymbol(fetchedSymbol);
        setName(fetchedName);
        //setPrice(ethers.utils.formatEther(fetchedPrice));

        const eventName = "ProposalCreated"; // 用实际感兴趣的事件名称替换这里
        const fromBlock = 0; // 可以根据需要设置适当的值
        const toBlock = 'latest'; // 或者当前区块号

        // 过滤出特定事件
      // Filter specific events directly with contractInstance
        const events = await contractInstance.queryFilter(contractInstance.filters[eventName](), fromBlock, toBlock);
        setEventName(JSON.stringify(events.map(event => event.args))); // Convert events to a string to display
        
      } catch (error) {
        console.error("Error fetching contract data:", error);
      }
    };

    fetchContractData();


    return () => {
    //   if (contractInstance) {
    //     contractInstance.off("PublicMint", onPublicMint);
    //     // contractInstance.off("HoldersChanged", onHoldersChanged);
    //   }
    }; 
  }, []); //END


  const handlePropose = async () => {
    // Update these values as needed for your propose call
    const targets = ["0x0000000000000000000000000000000000000000"]; //actionplan contract
    const values = [0]; //
    const calldatas = ["0x"]; // This should be the actual calldata required by the target contract
    const description = "描述"; // Description of the proposal
    
    const result = await contract.propose(targets, values, calldatas, description);
    console.log(result); // Log the result or handle as needed
  };




  return (
    <div>
      <h1>SDGs 合約</h1>
      <p>Token Name: {name}</p>
      {/* <p>Token Symbol: {symbol}</p>
      <p>Total Supply: {totalSupply}</p> */}
      {/* <p>Token Price: <span>{price}</span></p> */}
      <p>Events: <span>{eventName}</span></p>
      {/* <button onClick={() => contract && contract.tokenPrice().then(res => setPrice(ethers.utils.formatEther(res)))}>
        Refresh Price
      </button> */}
      <button onClick={handlePropose}>
        提案
      </button>
    </div>
  );
};

export default ContractsDao;
