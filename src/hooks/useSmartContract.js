
import {useState, useEffect} from 'react';
import {ParticleNetwork} from '@particle-network/auth';
import {ParticleProvider} from '@particle-network/provider';
import { EthereumSepolia } from '@particle-network/chains';
import {AAWrapProvider, SmartAccount, SendTransactionMode} from '@particle-network/aa';
import {ethers} from 'ethers';

// Configuration for Particle Network
const config = {
  projectId: process.env.REACT_APP_PROJECT_ID,
  clientKey: process.env.REACT_APP_CLIENT_KEY,
  appId: process.env.REACT_APP_APP_ID,
};

// Initialize Particle Network
const particle = new ParticleNetwork({
  ...config,
  chainName: EthereumSepolia.name,
  chainId: EthereumSepolia.id,
  wallet: { displayWalletEntry: true, uiMode: 'dark' },
});

// Initialize Smart Account
const smartAccount = new SmartAccount(new ParticleProvider(particle.auth), {
  ...config,
  aaOptions:{
    biconomy: [{
      chainId: EthereumSepolia.id, //PolygonMumbai
      version: '1.0.0',
    }],
    paymasterApiKeys: [{
      chainId: EthereumSepolia.id,
      apiKey: process.env.REACT_APP_BICONOMY_KEY,

  }]
  }
});

// Custom provider
const customProvider = new ethers.providers.Web3Provider(new AAWrapProvider(smartAccount,
  SendTransactionMode.Gasless), 'any');
  
  particle.setERC4337(true);

// Custom hook for interacting with the smart contract
export const useSmartContract = () => {
  const [ethBalance, setEthBalance] = useState(null);
  const [caAddress, setCaAddress] = useState(null);
  const [eoaAddress, setEoaAddress] = useState(null);

  const fetchEthBalance = async () => {
    try {
      const caAddress = await smartAccount.getAddress();
      const eoaAddress = await smartAccount.getOwner();
      const balance = await customProvider.getBalance(caAddress);
      
      setEthBalance(ethers.utils.formatEther(balance));
      setCaAddress(caAddress);
      setEoaAddress(eoaAddress);
    } catch (error) {
      console.error("Failed to fetch ETH balance:", error);
      // Handle errors appropriately
    }
  };

  return { ethBalance, caAddress, eoaAddress, fetchEthBalance };
};
