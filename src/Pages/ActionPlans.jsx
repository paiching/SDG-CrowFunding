import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../hooks/contractAbi_DAO.json';
import AcontractABI from '../hooks/contractAbi_Action.json';
import NFTcontractABI from '../hooks/contractAbi_NFT.json';
import styles from './ActionPlans.scss'
import { useAuth } from '../AuthContext';
import { useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles
import DOMPurify from 'dompurify';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

window.Buffer = Buffer; // Assign it to window to make it available globally


const contractAddress = "0xF3116499767692201519949B8c20092419d12009";
const TokenContractAddress = "0x86746fF42E7EC38A225d8C3005F7F2B7a18d137C";
const actionContractAddress = "0x9cAE0C0148E6d51d000aefE2A07f1d32c5886fCc"; // Action contract address
const projectId = process.env.REACT_INFURA_PROJECT_ID;
const projectSecret = process.env.REACT_INFURA_PROJECT_SECRET;


const auth = 'Basic ' + btoa(projectId + ':' + projectSecret);

const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});
const ActionPlans = () => {
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
  const [imageHash, setImageHash] = useState(''); // 存储上传到IPFS的图片哈希

  const [detailsShown, setDetailsShown] = useState({});
  const [selectedState, setSelectedState] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  // Assuming `plans` is the state where you store your fetched and processed plans
  const [plans, setPlans] = useState([]);


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
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
  
        // Initialize DAO Contract
        const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
        setContract(contractInstance);
  
        // Initialize Action Contract
        const actionContractInstance = new ethers.Contract(actionContractAddress, AcontractABI, provider);
        setActionContract(actionContractInstance);
  
        await listenForActionPlans(actionContractInstance); // Call without a user address
      }
    };
  
    init();
  }, []);
  

  // signer變化時更新events
  useEffect(() => {
    const updateSignerAndlistenForActionPlans = async () => {
      if (signer) {
        const address = await signer.getAddress();
        setUserAddress(address);
        setIsWalletConnected(true);
        const signerContractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(signerContractInstance);
        await listenForActionPlans(signerContractInstance, address); // Call with a user address
      }
    };

    updateSignerAndlistenForActionPlans();
  }, [signer]);

  //當獲取到用戶地址重新獲取投票狀態
  useEffect(() => {
    const checkVotingStatus = async () => {
      if (contract && userAddress) {
        const updatedEventsWithVotingStatus = await Promise.all(events.map(async (event) => {
          const hasVoted = await contract.hasVoted(event.planId, userAddress);
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


    useEffect(() => {
      const filterEventsByState = () => {
        if (selectedState === '') {
          return events; // If no filter is selected, return all events
        }
        return events.filter((event) => {
          return event.proposalState.toString() === selectedState;
        });
      };

      const filteredEvents = filterEventsByState();
      setDisplayedEvents(filteredEvents);
    }, [selectedState, events]);

  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };


  const listenForActionPlans = async (actionContractInstance, userAddr = null) => {
    try {
      const eventName = "ActionPlanCreated"; // Use the actual event name
      const fromBlock = 0;
      const toBlock = 'latest';
  
      const plansFilter = actionContractInstance.filters[eventName]();
      const fetchedPlans = await actionContractInstance.queryFilter(plansFilter, fromBlock, toBlock);
  
      const processedPlans = await Promise.all(fetchedPlans.map(async (plan) => {
        // Process each plan event
        // Depending on the structure of your ActionPlan event, extract and process necessary info
        const planId = plan.args.planId.toString(); // Example: Getting planId from event args
  
        return {
          ...plan.args,
          planId,
          // Add any additional processing here
        };
      }));
  
      // Example: Update the state with fetched plans
      setPlans(processedPlans); // You might want to rename `setEvents` to something more appropriate
      console.log("processPlans:"+ JSON.stringify(processedPlans));
    } catch (error) {
      console.error("Error fetching action plans:", error);
    }
  };
  
  

  const loadMore = () => {
    const newPage = currentPage + 1;
    const newDisplayedEvents = events.slice(0, newPage * pageSize); // Get the next set of events
    setDisplayedEvents(newDisplayedEvents);
    setCurrentPage(newPage); // Update the current page
  };
  

  //這邊會偵測一有變更就會添加到表單資料
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  

  // Helper function to map state number to string
    const getProposalStateString = (stateNumber) => {
      const states = [
        'Pending',  //0
        'Active',
        'Canceled',
        'Defeated',
        'Succeeded', //4
        'Queued',
        'Expired',
        'Executed'
      ];
      return states[stateNumber] || 'Unknown';
    };

    //下拉選單
    const proposalStates = [
      { value: '', label: '全部狀態' },
      { value: '0', label: 'Pending' },
      { value: '1', label: 'Active' },
      { value: '2', label: 'Canceled' },
      { value: '3', label: 'Defeated' },
      { value: '4', label: 'Succeeded' },
      { value: '5', label: 'Queued' },
      { value: '6', label: 'Expired' },
      { value: '7', label: 'Executed' },
    ];
    

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
          if (event.planId === proposalId) {
            return { ...event, userHasVoted: true };
          }
          return event;
        });

        setPlans(updatedEvents); // Update your events state
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

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageData(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

  // 处理图片文件上传
  const handleImageUpload = async (e) => {
    setIsSubmitting(true);
    try {
      const file = e.target.files[0];
      if (!file) throw new Error("No file selected");
  
      const result = await ipfsClient.add(file);
      setImageHash(result.path); // This sets the state
      console.log('Image uploaded to IPFS with hash:', result.path);
  
      // ... Rest of your code to handle the uploaded image
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      // Handle the error state here
    }
    setIsSubmitting(false);
  };
  
  


  // 觸發募資案 Function to handle "Execute" button click
  const handleExecute = async (proposalId, category, targetToken, goalAmount, description) => {
    
    setIsSubmitting(true); // Optionally set a submitting/loading state

    try {
      const actionContract = new ethers.Contract(actionContractAddress, AcontractABI, signer);
      
      // If the goals parameter expects a uint8 array, you'll need to convert accordingly
      const goals = [category]; 

      // Assuming ETH is the target token, you can use the zero address to represent it in the contract call
      const targetTokenAddress = ethers.constants.AddressZero;
      
      // Convert the goal amount to the correct format (wei for ETH)
      const goalAmountWei = ethers.utils.parseUnits(goalAmount.toString(), 'ether');

     // Pass the event description as is if it's already a JSON string
      const executeTx = await actionContract.createActionPlan(goals, targetTokenAddress, goalAmountWei, description, {
        value: goalAmountWei, // If you need to send ETH along with the transaction
        gasPrice: ethers.utils.parseUnits('10', 'gwei'),
        gasLimit: 1000000,
      });
      console.log('Executing transaction:', executeTx);
      await executeTx.wait(); // Wait for the transaction to be mined
      alert('Plan executed successfully!');
    } catch (error) {
      console.error('Error executing plan:', error);
      alert('Failed to execute plan.');
    } finally {
      setIsSubmitting(false); // Optionally reset the submitting/loading state
    }
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
      {/* <dv className='tabButtons'>
        <button onClick={() => switchTab('form')}>發起提案</button>
        <button onClick={() => switchTab('events')}>提案列表</button>
      </dv> */}
      

    {tab === 'events' && (
      
      <div className="displayContainer">
                     <select onChange={handleCategoryChange} value={selectedCategory} className={styles.select}>
                <option value="all">全部類別</option>
                {/* Map over some predefined categories or dynamically create this list */}
      {goals.map((goal) => (
        <option key={goal.id} value={goal.id}>{goal.title}</option>
      ))}
              </select>    

              <div className={styles.formGroup}>
              <select
                id="proposalState"
                name="proposalState"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className={styles.select}
              >
                {proposalStates.map((state) => (
                  <option key={state.value} value={state.value}>{state.label}</option>
                ))}
              </select>
            </div>
      {plans.length > 0 ? (
        plans.map((event, index) => {
          let proposalDetailsHTML = '';
          // Assuming event.proposalIdDecimal is the decimal representation of the proposal ID
          // And event.proposalState is the number representing the state
          // Check if the proposal has succeeded
          const isProposalSucceeded = event.proposalState === 4; // Assuming '4' is the state code for 'Succeeded'
         
          console.log('Raw description:', event.description);

          const proposalStateString = getProposalStateString(event.proposalState);
           // Access ProposalVotes safely by checking if it exists
   
          const imageHash = event.imageHash?.imageHash.toString() ?? '';

          let proposalName, proposalCategory, proposalDetail;
          const imageUrl = `https://ipfs.io/ipfs/${imageHash}`;


          let jsonString = event.description;

          // Attempt to fix the unquoted keys if they follow a predictable pattern
        

          try {
      
            //const descriptionObj = JSON.parse(jsonString);
            // Parse the description from the JSON string
            //const descriptionObj = JSON.parse(event.description);
            const descriptionObject = {
              "proposalName": "海廢議題",
              "proposalCategory": "14",
              "proposalAmount": "",
              "proposalStartDate": "",
              "proposalEndDate": "",
              "proposalDetails": [
                {
                  "detail": ""
                }
              ],
              "proposalDetail": "<p>海洋守護者計劃致力於全球範圍內減少海洋廢棄物，特別是塑料污染，通過組織國際海灘清理日、深海清理活動以及提升公眾對海洋保護意識的教育項目。該計劃結合當地社區、政府、企業和國際組織的力量，共同對抗海洋污染問題，保護海洋生態系統。</p><h3>時間與地點</h3><ul><li><span style=\"color: var(--tw-prose-bold);\">時間</span>：2024年9月第一週，國際海灘清理日進行全天活動</li><li><span style=\"color: var(--tw-prose-bold);\">地點</span>：全球範圍內的重點海灘和沿海區域，具體地點將根據海洋垃圾分布和當地社區參與度確定</li></ul><h3>預算</h3><p>預算為0.002 ETH（根據當前匯率調整），將用於以下方面：</p><ul><li>海灘清理工具和物資（包括垃圾袋、手套、夾子等）</li><li>深海清理設備和專業潛水團隊的費用</li><li>教育宣傳材料和活動的組織開銷</li><li>志願者激勵（如紀念品、食物和飲水）</li></ul><h3>預期效果</h3><ol><li><span style=\"color: var(--tw-prose-bold);\">環境影響</span>：預計清除超過500公斤的海洋廢棄物，包括塑料、廢棄漁網等，減少對海洋生態系統的威脅。</li><li><span style=\"color: var(--tw-prose-bold);\">社區參與和意識提升</span>：預期動員超過1000名志願者參與清理活動，同時通過教育活動提高至少5000人的海洋保護意識。</li><li><span style=\"color: var(--tw-prose-bold);\">政策影響和持續行動</span>：與政府和企業合作，推動更嚴格的塑料使用規範和廢棄物管理政策，並鼓勵社區持續參與海洋保護活動。</li></ol><h3>實施細節</h3><ul><li><span style=\"color: var(--tw-prose-bold);\">前期準備</span>：透過合作夥伴和社交媒體廣泛宣傳，籌備志願者培訓資料和宣傳材料。</li><li><span style=\"color: var(--tw-prose-bold);\">活動執行</span>：在國際海灘清理日當天，組織分散在全球各地的清理活動，並通過專業潛水團隊進行深海清理。</li><li><span style=\"color: var(--tw-prose-bold);\">後續行動</span>：收集和分析清理數據，報告活動成效，並通過網絡論壇和工作坊繼續推廣海洋保護的信息。</li></ul><p><br></p>",
              "goalAmount": "0.002",
              "imageHash": ""
            };
            
            const descriptionString = JSON.stringify(descriptionObject);

            // Extract the proposalDetails and convert it to sanitized HTML
            proposalDetailsHTML = DOMPurify.sanitize(descriptionObject.proposalDetail);

            // Extract the values for display
            // proposalName = event.proposalName;
            // proposalCategory = descriptionObj.proposalCategory;
            // proposalDetail = event.description.proposalDetail;
 

          } catch (e) {
            console.error('Error parsing description:', e);
            // Handle the error according to your needs, e.g., set default values
            proposalName = 'Unknown';
            proposalCategory = 'Unknown';
            proposalDetail = 'Details are not available';
            proposalDetailsHTML = '<p>Details are not available</p>';

          }


          return (

            
          <div className="">


          <div key={index} className="event-card">
    <div className="proposal-feature">
    {/* <img src={goals[0].imageUrl} className="proposal-image" alt="Goal" /> */}
    <img src={event.imageUrl} className="proposal-image" alt="Goal" />
    <div className='feature-content'>
      <div className='feature-desc'>
        <p><span>ID</span>: {event.planId}</p>
        <p><span>標題</span>: {event.proposalName}</p>
        <p><span>類型</span>: {proposalCategory}</p>
        <p><span>目標金額</span>: {event.goalAmount.toString()}</p> {/* Adjust if your event object structure is different */}
        <p><span>狀態</span>: {proposalStateString} </p>
      </div>
    </div> 

  </div>

        {/* Details container */}
               {detailsShown[event.planId] && (
          <div dangerouslySetInnerHTML={{ __html: proposalDetailsHTML }} />
        )}

        {/* Toggle button */}
        <button onClick={() => toggleDetails(event.planId)}>
          {detailsShown[event.planId] ? '收起' : '提案詳情'}
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

export default ActionPlans;
