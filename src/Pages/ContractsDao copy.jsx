import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../hooks/contractAbi_DAO.json'; // 假设你的ABI文件路径是这个

const contractAddress = "0xab9aC5bdCb810B2eE3D29EaBe55D6F9696037Fc3";

const ContractsDao = () => {
  const [name, setName] = useState('Loading...');
  const [eventName, setEventName] = useState('No events yet');
  const [userAddress, setUserAddress] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      requestAccount(provider); // 请求用户授权
    } else {
      console.error('Please install MetaMask!');
    }
  }, []);

  const requestAccount = async (provider) => {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setUserAddress(await signer.getAddress());
    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
    setContract(contractInstance);
    fetchContractName(contractInstance);
  };

  const fetchContractName = async (contractInstance) => {
    try {
      const fetchedName = await contractInstance.name();
      setName(fetchedName);
      listenForEvents(contractInstance);
    } catch (error) {
      console.error("Error fetching contract name:", error);
    }
  };

  const listenForEvents = async (contractInstance) => {
    const eventName = "ProposalCreated"; // 用实际感兴趣的事件名称替换这里
    const fromBlock = 0; // 可以根据需要设置适当的值
    const toBlock = 'latest'; // 或者当前区块号

    const events = await contractInstance.queryFilter(contractInstance.filters[eventName](), fromBlock, toBlock);
    setEventName(JSON.stringify(events.map(event => event.args)));
  };

  const handlePropose = async () => {
    if (!contract) return;
    try {
      const targets = ["0xE9748e34c0705d67CdFaAAC2B3eE1031D6c146cF"]; // Action plan contract
      const values = [0];
      const calldatas = ["0x22"]; // This should be the actual calldata required by the target contract
      const description = "Proposal #1"; // Description of the proposal

      const transactionResponse = await contract.propose(targets, values, calldatas, description, {
        gasPrice: ethers.utils.parseUnits('10', 'gwei'),
        gasLimit: 1000000
      });
      console.log(transactionResponse);
    } catch (error) {
      console.error("Error submitting proposal:", error);
    }
  };

  return (
    <div>
      <h1>SDGs 合約</h1>
      <p>Token Name: {name}</p>
      <p>Events: <span>{eventName}</span></p>
      <p>User Address: <span>{userAddress}</span></p>
      <button onClick={handlePropose}>
        提案
      </button>
    </div>
  );
};

export default ContractsDao;
