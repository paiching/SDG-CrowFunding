import { useState, useEffect,useContext } from 'react';
import {ethers} from 'ethers';
import { AuthContext  } from '../AuthContext';


const contractABI = require('./contractAbi_NFT.json');
const contractAddress = "0x78EE555683Ac65e61C8830840e758a9622bc473C";

export const useContract = () => {
  const [contract, setContract] = useState(null);
  
  // 使用 useContext 获取 AuthContext 中的 smartAccount
  const { smartAccount } = useContext(AuthContext);

  useEffect(() => {
    if (smartAccount) {
      // 使用 smartAccount 的提供者初始化合约
      const provider = new ethers.providers.Web3Provider(smartAccount.provider);
      const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
      setContract(contractInstance);
    }
  }, [smartAccount]);

 

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



// 使用智能账户执行mintBatch操作
const mintBatchWithCA = async (payableAmount, ids, quantities) => {
    // 确保合约和smartAccount都已初始化
    if (!contract || !smartAccount) throw new Error('合约或smartAccount未初始化');

  
    // 准备交易详情
    const txs = [
      {
        to: contractAddress,
        data: contract.interface.encodeFunctionData('mintBatch', [ids, quantities]),
        value: ethers.utils.parseUnits(payableAmount, 'ether').toString()
      }
    ];

    // 获取交易的费用报价
    const feeQuotesResult = await smartAccount.getFeeQuotes(txs);
    const gaslessUserOp = feeQuotesResult.verifyingPaymasterGasless?.userOp;

    // 如果有无需用户支付gas费用的选项，发送用户操作
    if (gaslessUserOp) {
      const txHash = await smartAccount.sendUserOperation(gaslessUserOp);
      return txHash; // 返回交易哈希
    } else {
      throw new Error('无可用的无Gas交易选项');
    }
   };

  return { contract, fetchTreasury, mintBatchWithCA };
};
