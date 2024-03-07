import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Decimal from 'decimal.js';
import styles from './Header.module.scss';
import { useAuth } from '../AuthContext';
import { ethers } from 'ethers';

export default function Header() {
  const [balanceDec, setBalanceDec] = useState(new Decimal(0));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userAddress, setUserAddress, setSigner } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleConnectWallet = async () => {
    console.log("sssd");
    if (window.ethereum) {
      console.log("get signer");
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address); // Store user address in context
        setSigner(signer); // 使用新的签名者更新全局状态
        console.log(signer);
      } catch (error) {
        console.error("连接钱包时出错:", error);
      }
    } else {
      console.error('未安装MetaMask');
    }
  };

  const handleDisconnectWallet = () => {
    // Simple confirmation dialog to confirm wallet disconnection
    const willDisconnect = window.confirm("Are you sure you want to disconnect your wallet?");
    if (willDisconnect) {
      // Reset the context state
      setUserAddress('');
      setSigner(null);
    }
  };

   // Truncate the address for display purposes
   const truncatedAddress = userAddress ? 
   `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}` : '';


  return (
    <div className={styles.header}>
      <div className={styles.nav}>
        <Link to="/">
          <div className={styles.logo}>SDG 募資平台</div>
        </Link>
         <div className={`${styles.menuItem} ${isMenuOpen ? styles.menuOpen : ''}`}>
          {/* <Link to="/explore">
            <div className={styles.link}>探索</div>
          </Link>
          <Link to="/propose">
            <div className={styles.link}>提案</div>
          </Link>
          <Link to="/usedao">
            <div className={styles.link}>UseDAO</div>
          </Link> */}
          <Link to="/dao">
            <div className={styles.link}>DAO</div>
          </Link>
          {/* <Link to="/showcase">
            <div className={styles.link}>成果</div>
          </Link> */}
          <Link to="/products">
            <div className={styles.link}>NFT</div>
          </Link>
          <Link to="/contracts">
            <div className={styles.link}>關於</div>
          </Link>
        </div>
        <button className={styles.hamburger} onClick={toggleMenu}>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>
      {userAddress ? (
    <button 
      onClick={handleDisconnectWallet} 
      className={`${styles.buttonStyle} ${styles.disconnectButton}`}
    >
      {truncatedAddress}
    </button>
  ) : (
    <button 
      onClick={handleConnectWallet} 
      className={styles.buttonStyle}
    >
      連結錢包
    </button>
  )}
        {/* ... other elements */}
      </div>
   
  );
}
