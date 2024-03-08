// components/FeatureSection.tsx
import React, { useState, useEffect } from 'react';
import styles from './FeatureSection.module.scss';
import contractABI from '../hooks/contractAbi_DAO.json';
import NFTcontractABI from '../hooks/contractAbi_NFT.json';

import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import { Contract, ethers, providers } from 'ethers';

const contractAddress = "0xF3116499767692201519949B8c20092419d12009";
const TokenContractAddress = "0x86746fF42E7EC38A225d8C3005F7F2B7a18d137C";

const images = [
  //'/images/planet-earth.jpg', // Replace with your image paths
  //'/images/river.jpg',
  //'/images/sdg_icon.png',
  // ...add as many images as you like
];

const placeholderImage = '/icons/goal-1/GOAL_1_PRIMARY_ICON/GOAL_1_SVG/TheGlobalGoals_Icons_Color_Goal_1.svg'; // Replace with your actual image path

export default function FeatureSection() {

  const [activeIndex, setActiveIndex] = useState(0);
  const { signer } = useAuth(); // 从全局上下文中访问签名者
  const [image, setImage] = useState(placeholderImage); // Set the default image
  const [contract, setContract] = useState<Contract | null>(null);
  const [TokenContract, setTokenContract] = useState<Contract | null>(null);
  const [events, setEvents] = useState<any>([]);
  const [caseNumber, setCaseNumber] = useState<number>();
  const [provider, setProvider] = useState<any>();
  const [treasury, setTreasury] = useState<string>();

  // useEffect(() => {
  //   const intervalId = window.setInterval(() => {
  //     setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  //   }, 5000); // Change image every 3 seconds

  //   return () => clearInterval(intervalId);
  // }, []);
    // Function to toggle the mint popup visibility

    useEffect(() => {
      const init = async () => {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);
          const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
          setContract(contractInstance);
          const TokenInstance = new ethers.Contract(TokenContractAddress, NFTcontractABI, provider);
          setTokenContract(TokenInstance);
        } else {
          alert("請安裝MetaMask!");
        }
      };
    
      init();
    }, []);
    
    useEffect(() => {
      const fetchTreasury = async () => {
        if (TokenContract) {
          try {
            // Get the treasury address
            const treasuryAddress = await TokenContract.treasury();
            console.log(`Treasury address: ${treasuryAddress}`);
    
            // Get the balance of the treasury address
            const balance = await provider.getBalance(treasuryAddress);
            console.log(`Treasury Balance: ${ethers.utils.formatEther(balance)} ETH`);
            setTreasury(ethers.utils.formatEther(balance).toString());

          } catch (error) {
            console.error("Error fetching treasury balance:", error);
          }
        }
      };
    
      if (contract) {
        listenForEvents(contract);
      }
      fetchTreasury();
    }, [contract, TokenContract]); // 依赖数组中应包含TokenContract
    

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
        console.log("提案ID:"+proposalIdDecimal);
        const proposalState = await contractInstance.state(proposalIdDecimal);
        const ProposalVotes = await contractInstance.proposalVotes(proposalIdDecimal);

        return {
          ...event.args,
          proposalIdDecimal,
          proposalState,
          ProposalVotes
        };
      }));
  
      console.log("長度"+processedEvents.length);
      setCaseNumber(processedEvents.length);
      setEvents(processedEvents); // Set the full list of events in reversed order

    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  


  return (
    <section className={styles.featureSection} style={{ backgroundImage: `url(${images[activeIndex]})` }}>
      <div className={`${styles.content} ${styles.semiTransparentOverlay}`}>
        <h1 className={styles.contentTitle }>SDGs 永續行動計畫</h1>
        <div className='flex'>
          <div className={styles.minted}>
             
              <span className={styles.bolderGreen}>{caseNumber}</span> 件提案計畫
              <span className={styles.bolder}> |
              {/* </span> 已完成 <span className={styles.bolderBlue}>15</span> 件目標 <span className={styles.bolder}>| */}
              </span> 已募資 <span className={styles.bolderOrange}>{treasury}</span> <span className={styles.bolder}>ETH
              </span>
           
          </div>
        </div>
        <div className={styles.mtop10px}><p>立即鑄造NFT, 參與永續計畫 !</p>
          <div className={styles.mtop20px}>
            <button className={styles.button} >我要提案</button>
            <button className={styles.button}>了解更多</button>
          </div>  


        {/* <Link href="/explore">
            <div className={`${styles.link} cursor-pointer`}>了解更多</div>
          </Link> */}
        </div>
        {/* <p>目前兌換 1 ETH : 30 SDG</p> */}
      </div>
           {/* New image container */}
           <div className={styles.imageContainer}>
        <img src={image} alt="Sustainable Goals" className={styles.featureImage} />
        <Link to="/products" className={styles.viewProductsButton}>NFT鑄造</Link> {/* Replace '/productlist' with your actual path */}
      </div>
    </section>
  );
};

