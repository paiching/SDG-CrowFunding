import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../hooks/contractAbi_DAO.json';
import AcontractABI from '../hooks/contractAbi_Action.json';
import NFTcontractABI from '../hooks/contractAbi_NFT.json';
import styles from './Dao.scss'
import { useAuth } from '../AuthContext';
import { useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import DOMPurify from 'dompurify';

const contractAddress = "0xF3116499767692201519949B8c20092419d12009";
const TokenContractAddress = "0x86746fF42E7EC38A225d8C3005F7F2B7a18d137C";

const ContractsDao = () => {
  const { signer, setSigner } = useAuth(); // 从全局上下文中访问签名者
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [events, setEvents] = useState([]);
  const [name, setName] = useState('Loading...');
  const [ProposalVotes, setProposalVotes] = useState(); //投票的票數
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [ActionContract, setActionContract] = useState(null);
  const [sortAscending, setSortAscending] = useState(false); 
  // New state variables for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('');
   // New state variables for submission status and sorted events
  const [sortedEvents, setSortedEvents] = useState([]);
  const [ userAddress,setUserAddress] = useState();
  const [ userVoteRight,setUserVoteRight] = useState();
  const [ userHasVoted, setUserHasVoted ] = useState();
  //load more
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10; // You can set this to however many events you want per page

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [imageData, setImageData] = useState(null);


  const [detailsShown, setDetailsShown] = useState({});


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


  const toggleDetails = (id) => {
    setDetailsShown((prevDetailsShown) => ({
      ...prevDetailsShown,
      [id]: !prevDetailsShown[id]
    }));
  };

  const cleanHTML = (dirtyHtml) => {
    return { __html: DOMPurify.sanitize(dirtyHtml) };
  };

  //處理參數類別
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  let query = useQuery();
  const selectedCategoryFromQuery = query.get('category');

  useEffect(() => {
    if (selectedCategoryFromQuery) {
      setSelectedCategory(`${selectedCategoryFromQuery}`);
    }
  }, [selectedCategoryFromQuery]);



  //初始
  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
      setContract(contractInstance);
      await listenForEvents(contractInstance); // Call without a user address
    };
  
    init();
  }, []);

  // signer變化時更新events
  useEffect(() => {
    const updateSignerAndListenForEvents = async () => {
      if (signer) {
        const address = await signer.getAddress();
        setUserAddress(address);
        setIsWalletConnected(true);
        const signerContractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(signerContractInstance);
        await listenForEvents(signerContractInstance, address); // Call with a user address
      }
    };

    updateSignerAndListenForEvents();
  }, [signer]);

  //當獲取到用戶地址重新獲取投票狀態
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (contract && userAddress) {
        const updatedEventsWithVotingStatus = await Promise.all(events.map(async (event) => {
          const hasVoted = await contract.hasVoted(event.proposalIdDecimal, userAddress);
          return { ...event, userHasVoted: hasVoted };
        }));
        setEvents(updatedEventsWithVotingStatus);
      }
    };
  
    checkVotingStatus();
  }, [userAddress, contract]);
  

  //當類型變更時
  useEffect(() => {
    //console.log("Selected Category: ", selectedCategory); // Log the selected category
    const filterEvents = () => {
        if (selectedCategory === 'all') {
            return events;
        } else {
            return events.filter((event) => {
                try {
                    const descriptionObj = JSON.parse(event.description);
                    // Make sure the comparison is done between values of the same type (both strings or both numbers)
                    return `${descriptionObj.proposalCategory}` === selectedCategory;
                } catch (e) {
                    console.error('Error parsing description:', e);
                    return false;
                }
            });
        }
    };

    const filteredEvents = filterEvents();
    setDisplayedEvents(filteredEvents.slice(0, currentPage * pageSize));
}, [selectedCategory, events, currentPage]);
  
  

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };


  const listenForEvents = async (contractInstance, userAddr = null) => {
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
        console.log("提案ID:"+proposalIdDecimal);
        // 使用await来等待异步查询状态
        const proposalState = await contractInstance.state(proposalIdDecimal);

        let userHasVoted = false;
        let ProposalVotes = { againstVotes: '0', forVotes: '0', abstainVotes: '0' };

        if (userAddr) {
          userHasVoted = await contractInstance.hasVoted(proposalIdDecimal, userAddr);
          ProposalVotes = await contractInstance.proposalVotes(proposalIdDecimal);
        }

        // Make sure ProposalVotes has the expected structure or provide defaults
        if (!ProposalVotes || typeof ProposalVotes !== 'object') {
          ProposalVotes = { againstVotes: '0', forVotes: '0', abstainVotes: '0' };
        }
        
       
        return {
          ...event.args,
          proposalIdDecimal,
          proposalState,
          userHasVoted,
          ProposalVotes
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
  
  

  const loadMore = () => {
    const newPage = currentPage + 1;
    const newDisplayedEvents = events.slice(0, newPage * pageSize); // Get the next set of events
    setDisplayedEvents(newDisplayedEvents);
    setCurrentPage(newPage); // Update the current page
  };
  

  //tabs

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  
  const handleSubmit = async (e) => {
    
    e.preventDefault();
    const descriptionJSON = JSON.stringify(formData);
    // Start processing
    setIsSubmitting(true);
    setSubmissionStatus('Processing...');

    try {
    await handlePropose(descriptionJSON);

    setSubmissionStatus('Proposal submitted successfully!');
    setTab("events");

    }catch (error) {
      console.error("Error submitting proposal:", error);
      setSubmissionStatus('Failed to submit proposal.');
    } finally {
      setIsSubmitting(false);
    }

  };

  const handlePropose = async (description) => {

    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
    setContract(contractInstance);

    if (contractInstance) {
      setIsSubmitting(true); // Start the submission process
      setSubmissionStatus('處理中...'); // Set the status message
      const targets = ["0xE9748e34c0705d67CdFaAAC2B3eE1031D6c146cF"];
      const values = [0];
      const calldatas = ["0x42"];
      try {
    
  
        const transactionResponse = await contractInstance.propose(targets, values, calldatas, description, {
          gasPrice: ethers.utils.parseUnits('5', 'gwei'),
          gasLimit: 1000000
        });
        console.log(transactionResponse);
        // Wait for one confirmation to ensure the event is emitted
        await transactionResponse.wait(1);
        // Update the status message
        setSubmissionStatus('提案發佈完成!');
        setIsSubmitting(false); // End the submission process
        setDescription('');
        // Fetch and display new events
        await listenForEvents(contract);
        alert('提案發佈完成');

      } catch (error) {
        console.error("Error submitting proposal:", error);
        setSubmissionStatus('提案發佈失敗');
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

      setIsSubmitting(true); // Start the submission process
      setSubmissionStatus('處理中...'); // Set the status message

      //這邊要檢查是否有votes
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);

      // You'll need to implement the voting logic here
      // This might involve interacting with a smart contract function
      console.log(`Voting on proposal ${proposalId} with vote type ${voteType}`);
      try {
        const transactionResponse = await contractInstance.castVote(proposalId, voteType, {
          gasPrice: ethers.utils.parseUnits('10', 'gwei'),
          gasLimit: 1000000
        });

        console.log(transactionResponse);
        // Wait for one confirmation to ensure the event is emitted
        await transactionResponse.wait(1);

        setIsSubmitting(false); // End the submission process
        // Update the status message
        setSubmissionStatus('投票完成!');
        alert('投票完成');

        //diable button
        const updatedEvents = events.map(event => {
          if (event.proposalIdDecimal === proposalId) {
            return { ...event, userHasVoted: true };
          }
          return event;
        });

        setEvents(updatedEvents); // Update your events state
        setSubmissionStatus('Vote successful!');
        setIsSubmitting(false);

      } catch (error) {
        console.error("Error submitting proposal:", error);
        setSubmissionStatus('投票發佈失敗');
        setIsSubmitting(false); // End the submission process
      }
    };
    
    const switchTab = (selectedTab) => {
      setTab(selectedTab);
    };
    

    const goals = [
      { id: 1, title: '消除貧窮', imageUrl: '/icons/goal-1/GOAL_1_PRIMARY_ICON/GOAL_1_SVG/TheGlobalGoals_Icons_Color_Goal_1.svg', linkUrl: '/dao?category=1', count: '20'},
      { id: 2, title: '消除飢餓', imageUrl: '/icons/goal-2/GOAL_2_PRIMARY_ICON/GOAL_2_SVG/TheGlobalGoals_Icons_Color_Goal_2.svg', linkUrl: '/dao?category=2', count: '20'},
      { id: 3, title: '健康與福祉', imageUrl: '/icons/goal-3/GOAL_3_PRIMARY_ICON/GOAL_3_SVG/TheGlobalGoals_Icons_Color_Goal_3.svg', linkUrl: '/dao?category=3', count: '20'},
      { id: 4, title: '教育品質', imageUrl: '/icons/goal-4/GOAL_4_PRIMARY_ICON/GOAL_4_SVG/TheGlobalGoals_Icons_Color_Goal_4.svg', linkUrl: '/dao?category=4', count: '20'},
      { id: 5, title: '性別平等', imageUrl: '/icons/goal-5/GOAL_5_PRIMARY_ICON/GOAL_5_SVG/TheGlobalGoals_Icons_Color_Goal_5.svg', linkUrl: '/dao?category=5', count: '20'},
      { id: 6, title: '淨水與衛生', imageUrl: '/icons/goal-6/GOAL_6_PRIMARY_ICON/GOAL_6_SVG/TheGlobalGoals_Icons_Color_Goal_6.svg', linkUrl: '/dao?category=6', count: '20'},
      { id: 7, title: '可負擔能源', imageUrl: '/icons/goal-7/GOAL_7_PRIMARY_ICON/GOAL_7_SVG/TheGlobalGoals_Icons_Color_Goal_7.svg', linkUrl: '/dao?category=7', count: '20'},
      { id: 8, title: '就業與經濟成長', imageUrl: '/icons/goal-8/GOAL_8_PRIMARY_ICON/GOAL_8_SVG/TheGlobalGoals_Icons_Color_Goal_8.svg', linkUrl: '/dao?category=8', count: '20'},
      { id: 9, title: '工業創新基礎建設', imageUrl: '/icons/goal-9/GOAL_9_PRIMARY_ICON/GOAL_9_SVG/TheGlobalGoals_Icons_Color_Goal_9.svg', linkUrl: '/dao?category=9', count: '20'},
      { id: 10, title: '減少不平等', imageUrl: '/icons/goal-10/GOAL_10_PRIMARY_ICON/GOAL_10_SVG/TheGlobalGoals_Icons_Color_Goal_10.svg', linkUrl: '/dao?category=10', count: '20'},
      { id: 11, title: '永續城市', imageUrl: '/icons/goal-11/GOAL_11_PRIMARY_ICON/GOAL_11_SVG/TheGlobalGoals_Icons_Color_Goal_11.svg', linkUrl: '/dao?category=11', count: '20'},
      { id: 12, title: '責任消費與生產', imageUrl: '/icons/goal-12/GOAL_12_PRIMARY_ICON/GOAL_12_SVG/TheGlobalGoals_Icons_Color_Goal_12.svg', linkUrl: '/dao?category=12', count: '20'},
      { id: 13, title: '氣候行動', imageUrl: '/icons/goal-13/GOAL_13_PRIMARY_ICON/GOAL_13_SVG/TheGlobalGoals_Icons_Color_Goal_13.svg', linkUrl: '/dao?category=13', count: '20'},
      { id: 14, title: '海洋生態', imageUrl: '/icons/goal-14/GOAL_14_PRIMARY_ICON/GOAL_14_SVG/TheGlobalGoals_Icons_Color_Goal_14.svg', linkUrl: '/dao?category=14', count: '20'},
      { id: 15, title: '陸地生態', imageUrl: '/icons/goal-15/GOAL_15_PRIMARY_ICON/GOAL_15_SVG/TheGlobalGoals_Icons_Color_Goal_15.svg', linkUrl: '/dao?category=15', count: '20'},
      { id: 16, title: '和平與正義制度', imageUrl: '/icons/goal-16/GOAL_16_PRIMARY_ICON/GOAL_16_SVG/TheGlobalGoals_Icons_Color_Goal_16.svg', linkUrl: '/dao?category=16', count: '20'},
      { id: 17, title: '全球夥伴', imageUrl: '/icons/goal-17/GOAL_17_PRIMARY_ICON/GOAL_17_SVG/TheGlobalGoals_Icons_Color_Goal_17.svg', linkUrl: '/dao?category=17', count: '20'}
      // ... (populate this array with real goal data)
    ];

  return (
    <div className='proposalContainer'>
   
      {/* Display submission status */}
    {isSubmitting && <div className="submission-status">{submissionStatus}</div>}
      <dv className='tabButtons'>
        <button onClick={() => switchTab('form')}>發起提案</button>
        <button onClick={() => switchTab('events')}>提案列表</button>
      </dv>
      

      {tab === 'form' && (
        <div className={styles.wrapper}>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {/* Disable the form elements based on isSubmitting state */}
          <fieldset disabled={isSubmitting}>
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
                {goals.map((goal) => (
        <option key={goal.id} value={goal.id}>{goal.title}</option>
      ))}
              </select>
            </div>
      
            <div className={styles.formGroup}>
              <label htmlFor="proposalDetail" className={styles.label}>提案內容</label>
              <ReactQuill
                value={formData.proposalDetail}
                onChange={(content) => setFormData({ ...formData, proposalDetail: content })}
                readOnly={isSubmitting}
                theme="snow"
              />
            </div>

            <button 
            className="mint-button" 
            type="submit"
            disabled={!signer} // Disable the button if the wallet is not connected
          >
            {signer ? '提交提案' : '連結錢包'} 
          </button>
            {/* <button type="submit" className={styles.submitButton}>提交提案</button> */}
            </fieldset>
          </form>
        </div>
      )}


    {tab === 'events' && (
      
      <div className="displayContainer">
                     <select onChange={handleCategoryChange} value={selectedCategory} className={styles.select}>
                <option value="all">全部類別</option>
                {/* Map over some predefined categories or dynamically create this list */}
      {goals.map((goal) => (
        <option key={goal.id} value={goal.id}>{goal.title}</option>
      ))}
              </select>    
      {displayedEvents.length > 0 ? (
        displayedEvents.map((event, index) => {
          // Assuming event.proposalIdDecimal is the decimal representation of the proposal ID
          // And event.proposalState is the number representing the state
          const proposalStateString = getProposalStateString(event.proposalState);
           // Access ProposalVotes safely by checking if it exists
          const againstVotes = event.ProposalVotes?.againstVotes.toString() ?? '0';
          const forVotes = event.ProposalVotes?.forVotes.toString() ?? '0';
          const abstainVotes = event.ProposalVotes?.abstainVotes.toString() ?? '0';

          let proposalName, proposalCategory, proposalDetail;
          try {
            // Parse the description from the JSON string
            const descriptionObj = JSON.parse(event.description);
            const cleanHTML = DOMPurify.sanitize(event.description);
           

            // Extract the values for display
            proposalName = descriptionObj.proposalName;
            proposalCategory = descriptionObj.proposalCategory;
            proposalDetail = descriptionObj.proposalDetail || (descriptionObj.proposalDetails && descriptionObj.proposalDetails[0].detail);
            console.log("Proposal State:", event.proposalState);
            console.log("User Vote Right:", event.userVoteRight);
            console.log("User Has Voted:", event.userHasVoted);
            console.log("voteStart:", event.voteStart.toString());
            console.log("voteEnd:", event.voteEnd.toString());

          } catch (e) {
            console.error('Error parsing description:', e);
            // Handle the error according to your needs, e.g., set default values
            proposalName = 'Unknown';
            proposalCategory = 'Unknown';
            proposalDetail = 'Details are not available';
          }

          return (

            
          <div className="">


          <div key={index} className="event-card">
            <div className="proposal-feature">
    <img src={goals[0].imageUrl} className="proposal-image" alt="Goal" />
    <div className='feature-content'>
      <div className="vote-flex">
        <p><span>反對數</span>: {againstVotes}</p>
        <p><span>贊成數</span>: {forVotes}</p>
        <p><span>棄票數</span>: {abstainVotes}</p>
      </div>
      <div className='feature-desc'>
        <p><span>ID</span>: {event.proposalIdDecimal}</p>
        <p><span>標題</span>: {proposalName}</p>
        <p><span>類型</span>: {proposalCategory}</p>
        <p><span>狀態</span>: {proposalStateString}</p>
        { event.proposalState === 1 && !event.userHasVoted ?  (
                <div>
                  <button disabled={event.userHasVoted || !signer} onClick={() => handleVote(event.proposalIdDecimal, 0)}>反對</button>
                  <button disabled={event.userHasVoted || !signer} onClick={() => handleVote(event.proposalIdDecimal, 1)}>贊成</button>
                  <button disabled={event.userHasVoted || !signer} onClick={() => handleVote(event.proposalIdDecimal, 2)}>棄票</button>
                  <div> {signer ? null : ( <div> <p>請連結錢包...</p></div>)}</div>
                </div>
              ) : event.userHasVoted ? (
                // Indicate that the user has already voted if the proposal is Active
                <p>您已經投過票</p>
              ) : null}
      </div>
    </div> 

  </div>
        {/* Conditionally render proposalDetail */}
      {detailsShown[event.proposalIdDecimal] && (
        <div dangerouslySetInnerHTML={cleanHTML(proposalDetail)} />
      )}

      {/* Read More / Collapse Button */}
      <button onClick={() => toggleDetails(event.proposalIdDecimal)} className="read-more-button">
        {detailsShown[event.proposalIdDecimal] ? '收起' : '提案詳情'}
      </button>
             
            </div>{/* end of event-card */}
      </div>
          );
        })
      ) : (
        <div>
        {displayedEvents.length>0 ? (
          <p>讀取中...</p>
        ) : (
          <div className="pageHight">
          <p>無提案...</p>
          </div>
        )}
      </div>
        
      )}
      {events.length > displayedEvents.length && displayedEvents.length > 10 &&  (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
    )}
    </div>
  );
};

export default ContractsDao;
