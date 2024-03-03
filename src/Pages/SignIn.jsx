import React, {useState, useEffect} from 'react';
import {ParticleNetwork} from '@particle-network/auth';
import {ParticleProvider} from '@particle-network/provider';
import { EthereumSepolia } from '@particle-network/chains';
import {AAWrapProvider, SmartAccount, SendTransactionMode} from '@particle-network/aa';
import {ethers} from 'ethers';
import { useAuth } from '../AuthContext';

import { 
  Flex, 
  Image, 
  Text, 
  Button, 
  Center, 
  Box, 
  Stack
} from '@chakra-ui/react'
import {RiTwitterXLine} from 'react-icons/ri';
import {FaGoogle} from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  Header  from '../Components/Header.tsx';


const config = {
    projectId: process.env.REACT_APP_PROJECT_ID,
    clientKey: process.env.REACT_APP_CLIENT_KEY,
    appId: process.env.REACT_APP_APP_ID
}

const particle = new ParticleNetwork({
    ...config,
    chainName: EthereumSepolia.name,
    chainId: EthereumSepolia.id,
    wallet: {displayWalletEntry: true, uiMode: 'dark',}
});

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


const customProvider = new ethers.providers.Web3Provider(new AAWrapProvider(smartAccount,
SendTransactionMode.Gasless), 'any');

particle.setERC4337(true);

const SignIn = ()=>{
  // const [userInfo, setUserInfo] = useState(null);
  // const [CAaddress, setCAaddress] = useState(null);

  console.log(useAuth()); // Add this line to log the output of useAuth
  const { userInfo, setUserInfo, CAaddress,setCAaddress } = useAuth();
  //這邊會影響provider的參數設置 請參考AuthContext <AuthContext.Provider value={{ userInfo, setUserInfo, smartAccount, setSmartAccount }}>

  const [caAddress, setCaAddress] = useState(null);
  const [eoaAddress, setEoaAddress] = useState(null);
  const [ethBalance, setEthBalance] = useState();
  // const [status, setStatus] = useState(null);
  // const [userOpHash, setUserOpHash] = useState(null);
  const [tx, setTx] = useState(null);
  const [success, setSuccess] = useState(true);


  // const updateStatus = async (txHash, userOpHash) =>{
  //   setStatus('success')
  //   setTxHash(txHash)
  //   setUserOpHash(userOpHash)
  // }

  const fetchEthBalance = async () =>{
    const caAddress = await smartAccount.getAddress();
    const eoaAddress = await smartAccount.getOwner();
    const balance = await customProvider.getBalance(caAddress);
    setEthBalance(ethers.utils.formatEther(balance));
    setCaAddress(caAddress);
    setEoaAddress(eoaAddress);
    setCAaddress(caAddress);

    console.log(smartAccount.getPaymasterApiKey());

  };

  const handleLogin = async (preferredAuthType) => {

    try {
      const user = !particle.auth.isLogin() ? await particle.auth.login({preferredAuthType}) : particle.auth.getUserInfo();
      setUserInfo(user);
 
    } catch (error) {
      console.error("Login failed:", error);
      // Handle the error accordingly
    }
  };
  

  const executeUserOpAndGasNativeByUser = async ()=>{
    const tokenAddress = "0x84bC8e38798B0a8B10ff6715d0Aa9E3aDaD19Fad";
    const nftAddress = "0x1a655F4eB12Ab4d464459044E15B8069d894E04b";

    const ERC20_ABI = require('../erc20Abi.json');
    const ERC721_ABI = require('../erc721Abi.json');

    const INFURA_ID = "3869e5d0a7ef4190b30686ff26767689";
    const provider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_ID}`);
    
    

    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const erc721 = new ethers.Contract(nftAddress, ERC721_ABI, provider);
    const tokenAmount = "100";

    const amount = ethers.utils.parseUnits(tokenAmount, 18);

    const txs = 
      [
      {
        to: tokenAddress,
        data: erc20.interface.encodeFunctionData("mint", [amount]),
      },
      {
        to : tokenAddress,
        data: erc20.interface.encodeFunctionData("transfer", ["0xE2c0f71ebe5F5F5E3600CA632b16c5e850183ddf", amount])
      },
      {
        to: nftAddress,
        data: erc721.interface.encodeFunctionData("publicMint", [3]),
      }];

    const userOpBundle = await smartAccount.buildUserOperation({tx: txs, feeQuote: null, tokenPaymasterAddress: null});
    
    const userOp = userOpBundle.userOp;
    const userOpHash = userOpBundle.userOpHash;

    console.log(`user op: ${userOp}`)
    console.log(`user op hash: ${userOpHash}`)

    const txHash = await smartAccount.sendUserOperation({userOp: userOp, userOpHash: userOpHash});
    console.log('Transaction hash: ', txHash);
    

  }

  const executeUserOpAndGasNativeByPaymaster = async ()=>{
    const tokenAddress = "0x84bC8e38798B0a8B10ff6715d0Aa9E3aDaD19Fad";
    const nftAddress = "0x1a655F4eB12Ab4d464459044E15B8069d894E04b";

    const ERC20_ABI = require('../erc20Abi.json');
    const ERC721_ABI = require('../erc721Abi.json');

    const INFURA_ID = "803d8c704fb1402183256652496311e2";
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${INFURA_ID}`);
    
    

    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const erc721 = new ethers.Contract(nftAddress, ERC721_ABI, provider);
    const tokenAmount = "100";

    const amount = ethers.utils.parseUnits(tokenAmount, 18);

    

    const txs = 
      [
      {
        to: tokenAddress,
        data: erc20.interface.encodeFunctionData("mint", [amount]),
      },
      {
        to : tokenAddress,
        data: erc20.interface.encodeFunctionData("transfer", ["0xE2c0f71ebe5F5F5E3600CA632b16c5e850183ddf", amount])
      },
      {
        to: nftAddress,
        data: erc721.interface.encodeFunctionData("publicMint", [3]),
      }];

    //get fee quotes with tx or txs
    const feeQuotesResult = await smartAccount.getFeeQuotes(txs);
    console.log(feeQuotesResult);

    // gasless transaction userOp, maybe null
    const gaslessUserOp = feeQuotesResult.verifyingPaymasterGasless?.userOp;
    const gaslessUserOpHash = feeQuotesResult.verifyingPaymasterGasless?.userOpHash;

    console.log(`user op: ${gaslessUserOp}`)
    console.log(`user op hash: ${gaslessUserOpHash}`)

    const txHash = await smartAccount.sendUserOperation({userOp: gaslessUserOp, userOpHash: gaslessUserOpHash});
    console.log('Transaction hash: ', txHash);

  
  }

  const executeUserOpAndGasERC20ByUser = async ()=>{
    const tokenAddress = "0x84bC8e38798B0a8B10ff6715d0Aa9E3aDaD19Fad";
    const nftAddress = "0x1a655F4eB12Ab4d464459044E15B8069d894E04b";

    const ERC20_ABI = require('../erc20Abi.json');
    const ERC721_ABI = require('../erc721Abi.json');

    const INFURA_ID = "803d8c704fb1402183256652496311e2";
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${INFURA_ID}`);
    
    

    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const erc721 = new ethers.Contract(nftAddress, ERC721_ABI, provider);
    const tokenAmount = "100";

    const amount = ethers.utils.parseUnits(tokenAmount, 18);

    

    const txs = 
      [
      {
        to: tokenAddress,
        data: erc20.interface.encodeFunctionData("mint", [amount]),
        //value: ""
      },
      {
        to : tokenAddress,
        data: erc20.interface.encodeFunctionData("transfer", ["0xE2c0f71ebe5F5F5E3600CA632b16c5e850183ddf", amount])
      },
      {
        to: nftAddress,
        data: erc721.interface.encodeFunctionData("publicMint", [3]),
      }];

    //get fee quotes with tx or txs
    const feeQuotesResult = await smartAccount.getFeeQuotes(txs);
    console.log(feeQuotesResult);


    // pay with ERC-20 tokens: fee quotes
    const tokenPaymasterAddress = feeQuotesResult.tokenPaymaster.tokenPaymasterAddress;
    const tokenFeeQuote = feeQuotesResult.tokenPaymaster.feeQuotes[0];
    console.log('supported tokens : ', feeQuotesResult.tokenPaymaster.feeQuotes);
    

    const userOpBundle = await smartAccount.buildUserOperation({tx: txs, feeQuote: tokenFeeQuote, tokenPaymasterAddress: tokenPaymasterAddress});
      
    const userOp = userOpBundle.userOp;
    const userOpHash = userOpBundle.userOpHash;

    console.log(`user op: ${userOp}`)
    console.log(`user op hash: ${userOpHash}`)

    const txHash = await smartAccount.sendUserOperation({userOp: userOp, userOpHash: userOpHash});
    console.log('Transaction hash: ', txHash);
  }

  return (

      <Stack>
      
        <Box>
          <Flex>
            {!userInfo ? (
              <Flex className='login-section'>
                <Button padding= '16px' size={[1,2,3]} leftIcon={<FaGoogle />} bg="#F5F5F5" borderRadius="15px" variant="solid"  onClick={() => handleLogin('google')}>Sign in with Google</Button>
                <Button  padding= '16px' size={[1,2,3]} leftIcon={<RiTwitterXLine />} bg="#F5F5F5" borderRadius="15px"  onClick={()=> handleLogin('twitter')}>Sign in wth Twitter</Button>
              </Flex>
            ): (
                <Box>
                  <Flex>
                    <Text fontSize={[1,2,3]}>{userInfo.name}&nbsp;:&nbsp;&nbsp; </Text>
                    <Text fontSize={[1,2,3]}>{ethBalance} ETH</Text>
                  </Flex>
                  <Flex>
                    <Text fontSize={[1,2,3]} >EOA Address: </Text>
                  </Flex>
                  <Flex>
                    <Text fontSize={[1,2,3]} >{eoaAddress}</Text>
                  </Flex>
                  <Flex>
                    <Text fontSize={[1,2,3]} >CA Address: </Text>
                  </Flex>
                  <Flex>
                    <Text fontSize={[1,2,3]} >{caAddress}</Text>
                  </Flex>
                  <Flex  fontSize={[1,2,3]}>
                    <Button fontSize="lg" padding= '16px' size={[1,2,3]} bg="#F5F5F5" borderRadius="15px" onClick={executeUserOpAndGasNativeByUser}> 自行支付 </Button>
                    <Button fontSize="lg" padding= '16px' size={[1,2,3]} bg="#F5F5F5" borderRadius="15px" onClick={executeUserOpAndGasNativeByPaymaster}> Paymaster支付</Button>
                    <Button fontSize="lg" padding= '16px' size={[1,2,3]} bg="#F5F5F5" borderRadius="15px" onClick={executeUserOpAndGasERC20ByUser}> ERC-20支付 </Button>
                   
                  </Flex>
                </Box>
            )}
            
          </Flex>
        </Box>
    
    </Stack>
  
  );

}

export default SignIn;