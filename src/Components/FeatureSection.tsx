// components/FeatureSection.tsx
import React, { useState, useEffect } from 'react';
import styles from './FeatureSection.module.scss';


const images = [
  //'/images/planet-earth.jpg', // Replace with your image paths
  //'/images/river.jpg',
  //'/images/sdg_icon.png',
  // ...add as many images as you like
];

export default function FeatureSection() {

  const [activeIndex, setActiveIndex] = useState(0);
  

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
              </span> 已發行 <span className={styles.bolderOrange}>3,137</span> / 1,000,000,000  <span className={styles.bolder}>USDGs</span>
            </span>
          </div>
        </div>
        <div className={styles.mtop10px}><p>完成任務並解鎖NFT</p>
          <div className={styles.mtop20px}>
            <button className={styles.button} >Mint</button>
            <button className={styles.button}>我要提案</button>
          </div>  
        {/* <Link href="/explore">
            <div className={`${styles.link} cursor-pointer`}>了解更多</div>
          </Link> */}
        </div>
        {/* <p>目前兌換 1 ETH : 30 SDG</p> */}
      </div>
 
    </section>
  );
};

