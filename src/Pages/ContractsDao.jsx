import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../hooks/contractAbi_DAO.json';
import styles from './Dao.scss'

const contractAddress = "0xab9aC5bdCb810B2eE3D29EaBe55D6F9696037Fc3";

const ContractsDao = () => {
  const [description, setDescription] = useState('');
  const [events, setEvents] = useState([]);
  const [name, setName] = useState('Loading...');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [sortAscending, setSortAscending] = useState(false); 
  // New state variables for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
   // New state variables for submission status and sorted events
   const [sortedEvents, setSortedEvents] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setIsWalletConnected(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
            setContract(contractInstance);
            fetchContractName(contractInstance);
            listenForEvents(contractInstance);
          } else {
            setName('Please connect your wallet');
          }
        });
    } else {
      setName('MetaMask is not installed');
    }
  }, []);



  const fetchContractName = async (contractInstance) => {
    try {
      const fetchedName = await contractInstance.name();
      setName(fetchedName);
    } catch (error) {
      console.error("Error fetching contract name:", error);
      setName('Error fetching contract name');
    }
  };

  const listenForEvents = async (contractInstance) => {
    try {
      const eventName = "ProposalCreated";
      const fromBlock = 0;
      const toBlock = 'latest';
  
      const eventFilter = contractInstance.filters[eventName]();
      const fetchedEvents = await contractInstance.queryFilter(eventFilter, fromBlock, toBlock);
      setEvents(fetchedEvents.map(e => e.args)); // Directly setting the fetched events
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    // Call listenForEvents whenever contract or sortAscending state changes
    if (contract) {
      listenForEvents(contract);
    }
  }, [contract, sortAscending]);

    // Adjust processAndSortEvents to take into account the new sortedEvents array
    const processAndSortEvents = (events, ascending) => {
       // Create a new array before sorting to avoid mutating the original array
        const sortedEvents = [...events].sort((a, b) => {
          const timeA = parseInt(a[7].hex, 16);
          const timeB = parseInt(b[7].hex, 16);
          return ascending ? timeA - timeB : timeB - timeA;
        });
        return sortedEvents;
    };

      // Function to handle sorting
  const toggleSortOrder = () => {
    const newSortOrder = !sortAscending;
    setSortAscending(newSortOrder);
    setSortedEvents(processAndSortEvents([...events], newSortOrder));
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsWalletConnected(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
        fetchContractName(contractInstance);
        listenForEvents(contractInstance);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handlePropose = async () => {
    if (!isWalletConnected) {
      await handleConnectWallet();
    }
    if (contract) {
      setIsSubmitting(true); // Start the submission process
      setSubmissionStatus('Processing...'); // Set the status message
      const targets = ["0xE9748e34c0705d67CdFaAAC2B3eE1031D6c146cF"];
      const values = [0];
      const calldatas = ["0x42"];
      try {
        const transactionResponse = await contract.propose(targets, values, calldatas, description, {
          gasPrice: ethers.utils.parseUnits('10', 'gwei'),
          gasLimit: 1000000
        });
        console.log(transactionResponse);
        // Wait for one confirmation to ensure the event is emitted
        await transactionResponse.wait(1);
        // Update the status message
        setSubmissionStatus('Proposal submitted successfully!');
        setIsSubmitting(false); // End the submission process
        setDescription('');
        // Fetch and display new events
        await listenForEvents(contract);
        alert('Proposal submitted successfully.');

      } catch (error) {
        console.error("Error submitting proposal:", error);
        setSubmissionStatus('Failed to submit proposal.');
        setIsSubmitting(false); // End the submission process
      }
    }
  };

  return (
    <div className='proposalContainer'>
      
      <p>Token Name: {name}</p>
      <input
        type="text"
        value={description}
        onChange={handleDescriptionChange}
        placeholder="Enter proposal description"
      />
    {isSubmitting && <div className="submission-status">{submissionStatus}</div>}
      <button onClick={handlePropose} disabled={isSubmitting}>
        提案
      </button>
      { !isWalletConnected && 
        <button onClick={handleConnectWallet}>
          連接錢包
        </button>
      }
      <button onClick={toggleSortOrder}>
        {sortAscending ? "Sort Descending" : "Sort Ascending"}
      </button>
      <div className="displayContainer">
        
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} className="event-card">
              <p>ID: {parseInt(event[0].hex, 16).toString()}</p>
              <p>Proposer: {event[1]}</p>
              <p>Targets: {event[2].toString()}</p>
              <p>Values: {event[3].map(v => parseInt(v.hex, 16)).toString()}</p>
              <p>Calldatas: {event[4].toString()}</p>
              <p>Description: {event[8]}</p>
            </div>
          ))
        ) : (
          <p>No events to display</p>
        )}
      </div>
    </div>
  );
};

export default ContractsDao;
