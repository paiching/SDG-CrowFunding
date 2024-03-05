import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../hooks/contractAbi_DAO.json';
import AcontractABI from '../hooks/contractAbi_Action.json';
import NFTcontractABI from '../hooks/contractAbi_NFT.json';
import styles from './Dao.scss'

const contractAddress = "0xab9aC5bdCb810B2eE3D29EaBe55D6F9696037Fc3";
const TokenContractAddress = "0x78EE555683Ac65e61C8830840e758a9622bc473C";

const ContractsDao = () => {
  const [description, setDescription] = useState('');
  const [events, setEvents] = useState([]);
  const [name, setName] = useState('Loading...');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [ActionContract, setActionContract] = useState(null);
  const [sortAscending, setSortAscending] = useState(false); 
  // New state variables for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
   // New state variables for submission status and sorted events
  const [sortedEvents, setSortedEvents] = useState([]);
  const [signer, setSigner] =useState();
  const [ userAddress,setUserAddress] = useState();
  const [ userVoteRight,setUserVoteRight] = useState();
  //load more
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10; // You can set this to however many events you want per page
  //tabs
  const [tab, setTab] = useState('events'); // 'form' or 'events'
  const [formData, setFormData] = useState({
    proposalName: '',
    proposalCategory: '',
    proposalAmount: '',
    proposalStartDate: '',
    proposalEndDate: '',
    proposalDetails: [{ detail: '' }]
  });


  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(async accounts => {
          if (accounts.length > 0) {
            setIsWalletConnected(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            console.log("signer address:", await signer.getAddress());
            setUserAddress(userAddress);
            const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
            setContract(contractInstance);
            const TokenInstance = new ethers.Contract(TokenContractAddress, NFTcontractABI, signer);
            const userVoteRight = await TokenInstance.getVotes(userAddress);
            setUserVoteRight(userVoteRight);
            //setActionContract(ActioncontractInstance);
            fetchContractName(contractInstance);
            if (contract) {
              listenForEvents(contract);
            }
          } else {
            setName('Please connect your wallet');
          }
        });
    } else {
      setName('MetaMask is not installed');
    }
  }, []);


  useEffect(() => {
    if (contract) {
      listenForEvents(contract);
    }
  }, [contract, sortAscending]);

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
      
      // 使用Promise.all等待所有的状态查询完成
      const processedEvents = await Promise.all(fetchedEvents.map(async (event) => {
        // 提案ID的BigNumber转换成字符串（十进制表示）
        const proposalIdDecimal = event.args.proposalId.toString();
  
        // 使用await来等待异步查询状态
        const proposalState = await contractInstance.state(proposalIdDecimal);

        const userHasVoted = await checkIfUserHasVoted(contractInstance, proposalIdDecimal, userAddress);
  
        // 返回处理后的事件对象，包括提案状态
        return {
          ...event.args,
          proposalIdDecimal,
          proposalState,
          userHasVoted
        };
      }));
  
      console.log(processedEvents);
      const reversedEvents = processedEvents.reverse(); // Reverse the full list of events for display
      setEvents(reversedEvents); // Set the full list of events in reversed order
      setDisplayedEvents(reversedEvents.slice(0, pageSize)); // Display the first page of reversed events
      setCurrentPage(1); // Reset to the first page
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  
  
  const checkIfUserHasVoted = async (contractInstance, proposalId, userAddress) => {
    try {
      // Call the hasVoted function from the smart contract
      const hasVoted = await contractInstance.hasVoted(proposalId, userAddress);
      return hasVoted;
    } catch (error) {
      console.error("Error checking if user has voted:", error);
      return false; // Default to false if there's an error
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

  const loadMore = () => {
    const newPage = currentPage + 1;
    const newDisplayedEvents = events.slice(0, newPage * pageSize); // Get the next set of events
    setDisplayedEvents(newDisplayedEvents);
    setCurrentPage(newPage); // Update the current page
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

  //tabs

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
  
    // Check if the change is for the proposalDetails field
    if (name.startsWith("proposalDetail")) {
      const updatedDetails = formData.proposalDetails.map((detail, detailIndex) => {
        if (index === detailIndex) {
          return { ...detail, detail: value };
        }
        return detail;
      });
      setFormData({ ...formData, proposalDetails: updatedDetails });
    } else {
      // Handle other fields
      setFormData({ ...formData, [name]: value });
    }
  };
  
  
  const addProposalDetailInput = () => {
    setFormData({ ...formData, proposalDetails: [...formData.proposalDetails, { detail: '' }] });
  };

  
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Combine form data into a JSON string
    const descriptionJSON = JSON.stringify(formData);
    
    console.log(descriptionJSON);
    // Call handlePropose with the combined JSON string as description
    //await handlePropose(descriptionJSON);
  };
  

  const handlePropose = async (description) => {
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

  // Helper function to map state number to string
    const getProposalStateString = (stateNumber) => {
      const states = [
        'Pending',
        'Active',
        'Canceled',
        'Defeated',
        'Succeeded',
        'Queued',
        'Expired',
        'Executed'
      ];
      return states[stateNumber] || 'Unknown';
    };

    const handleVote = async (proposalId, voteType) => {
      // You'll need to implement the voting logic here
      // This might involve interacting with a smart contract function
      console.log(`Voting on proposal ${proposalId} with vote type ${voteType}`);
      // Example:
      // const tx = await contractInstance.vote(proposalId, voteType);
      // await tx.wait();
    };
    
    const switchTab = (selectedTab) => {
      setTab(selectedTab);
    };
    

  return (
    <div className='proposalContainer'>
      
      <button onClick={() => switchTab('form')}>發起提案</button>
      <button onClick={() => switchTab('events')}>投票表決</button>

      {tab === 'form' && (
  <div className={styles.wrapper}>
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="proposalName" className={styles.label}>提案名稱</label>
        <input
          id="proposalName"
          type="text"
          name="proposalName"
          value={formData.proposalName}
          onChange={handleInputChange}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="proposalCategory" className={styles.label}>提案類別</label>
        <select
          id="proposalCategory"
          name="proposalCategory"
          value={formData.proposalCategory}
          onChange={handleInputChange}
          className={styles.select}
        >
          <option value="">請選擇類別</option>
          {[...Array(17)].map((_, index) => (
            <option key={index} value={index + 1}>{index + 1}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="proposalAmount" className={styles.label}>提案金額</label>
        <input
          id="proposalAmount"
          type="number"
          name="proposalAmount"
          value={formData.proposalAmount}
          onChange={handleInputChange}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="proposalStartDate" className={styles.label}>提案開始時間</label>
        <input
          id="proposalStartDate"
          type="date"
          name="proposalStartDate"
          value={formData.proposalStartDate}
          onChange={handleInputChange}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="proposalEndDate" className={styles.label}>提案結束時間</label>
        <input
          id="proposalEndDate"
          type="date"
          name="proposalEndDate"
          value={formData.proposalEndDate}
          onChange={handleInputChange}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="proposalDetail" className={styles.label}>提案內容</label>
        <textarea
          id="proposalDetail"
          name="proposalDetail"
          value={formData.proposalDetail}
          onChange={handleInputChange}
          className={styles.textarea}
        />
      </div>
      <button type="submit" className={styles.submitButton}>提交提案</button>
    </form>
  </div>
)}


    {tab === 'events' && (
      <div className="displayContainer">
        
      {displayedEvents.length > 0 ? (
        displayedEvents.map((event, index) => {
          // Assuming event.proposalIdDecimal is the decimal representation of the proposal ID
          // And event.proposalState is the number representing the state
          const proposalStateString = getProposalStateString(event.proposalState);

          return (
            <div key={index} className="event-card">
              <p>ID: {event.proposalIdDecimal}</p>
              <p>Proposer: {event.proposer}</p>
              {/* ... other event details ... */}
              <p>Description: {event.description}</p>
              <p>State: {proposalStateString}</p> {/* Display the state string */}
              {event.proposalState === 1 && userVoteRight > 0 &&!event.userHasVoted ? (
                <div>
                  <button onClick={() => handleVote(event.proposalIdDecimal, 0)}>反對</button>
                  <button onClick={() => handleVote(event.proposalIdDecimal, 1)}>贊成</button>
                  <button onClick={() => handleVote(event.proposalIdDecimal, 2)}>棄票</button>
                </div>
              ) : event.proposalState === 1 && event.userHasVoted ? (
                // Indicate that the user has already voted if the proposal is Active
                <p>您已經投過票</p>
              ) : null}
            </div>
          );
        })
      ) : (
        <p>No events to display</p>
      )}
      {events.length > displayedEvents.length && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
    )}
    </div>
  );
};

export default ContractsDao;
