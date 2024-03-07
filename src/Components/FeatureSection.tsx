// components/FeatureSection.tsx
import React, { useState, useEffect } from 'react';
import styles from './FeatureSection.module.scss';
import contractABI from '../hooks/contractAbi_DAO.json';
import NFTcontractABI from '../hooks/contractAbi_NFT.json';

import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

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
  // useEffect(() => {
  //   const intervalId = window.setInterval(() => {
  //     setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  //   }, 5000); // Change image every 3 seconds

  //   return () => clearInterval(intervalId);
  // }, []);
    // Function to toggle the mint popup visibility


  return (
    <section className={styles.featureSection} style={{ backgroundImage: `url(${images[activeIndex]})` }}>
      <div className={`${styles.content} ${styles.semiTransparentOverlay}`}>
        <h1 className={styles.contentTitle }>SDG 募資行動計畫</h1>
        <div className='flex'>
          <div className={styles.minted}>
            <span>
              <span className={styles.bolderGreen}>122</span> 件提案進行中 <span className={styles.bolder}>|
              </span> 已完成 <span className={styles.bolderBlue}>15</span> 件目標 <span className={styles.bolder}>|
              </span> 已發行 <span className={styles.bolderOrange}>3,137</span> <span className={styles.bolder}>NFT</span>
            </span>
          </div>
        </div>
        <div className={styles.mtop10px}><p>完成任務並解鎖NFT</p>
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

