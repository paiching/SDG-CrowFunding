import { useState, useEffect } from 'react';
import {ParticleNetwork} from '@particle-network/auth';
import {ParticleProvider} from '@particle-network/provider';
import { EthereumSepolia } from '@particle-network/chains';
import {AAWrapProvider, SmartAccount, SendTransactionMode} from '@particle-network/aa';
import {ethers} from 'ethers';


// Assuming these are set in your .env file
const RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.REACT_APP_SDG_PRIVATE_KEY;
const contractABI = require('./contractAbi_NFT.json');
const contractAddress = "0x79A90368c467E63d3921e607aad12b05E0732A69";

export const useContract = () => {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    setProvider(provider);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
    setContract(contractInstance);
  }, []);



  // 任何需要暴露给组件使用的合约函数
  const fetchTreasury = async () => {
    if (!contract) return;
    try {
      const treasury = await contract.treasury();
      return treasury;
      //return ethers.utils.formatUnits(fetchedTotalSupply, 'ether');
    } catch (error) {
      console.error("Error fetching total supply:", error);
    }
  };

  const mintBatch = async (payableAmount, ids, quantities) => {
    if (!contract) throw new Error('Contract not initialized');

    const transaction = await contract.mintBatch(ids, quantities, {
      value: ethers.utils.parseEther(payableAmount.toString())
    });

    return await transaction.wait(); // This will return the transaction receipt
  };

  const mintBatchWithCA = async (payableAmount, ids, quantities, userCaAddress) => {
    if (!contract) throw new Error('Contract not initialized');
    
    // 创建一个代表用户CA钱包的signer
    const userSigner = SmartAccount.connect(provider);
    const contractWithSigner = contract.connect(userSigner);

    const transaction = await contractWithSigner.mintBatch(ids, quantities, {
      value: ethers.utils.parseEther(payableAmount.toString())
    });

    return await transaction.wait(); // 这将返回交易回执
  };

  return { contract, fetchTreasury , mintBatch, mintBatchWithCA };
};
