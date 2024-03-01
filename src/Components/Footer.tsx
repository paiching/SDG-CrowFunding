import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Decimal from 'decimal.js';
import styles from './Footer.module.scss';

const Footer = () => {
    return (
      <footer className={styles.siteFooter}>
        <div className={styles.footerContainer}>
          <div className={styles.footerColumn}>
            <h4>關於</h4>
            <ul>
              <li>關於我們</li>
              <li>提案審核</li>
              <li>合作提案</li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>後援</h4>
            <ul>
              <li>經典專題回顧</li>
              <li>提案者列表</li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>協助</h4>
            <ul>
              <li>常見問題</li>
              <li>提案者指南</li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>更多</h4>
            <ul>
              <li>SDG 基金會</li>
            </ul>
          </div>
          <div className={styles.footerSocial}>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
        <div className={styles.footerInfo}>
          <span>SDG CrowdFunding</span>
          <div className={styles.footerLine}></div>
          <span>SDG 行動募資平台 © 2024</span>
          <span>SDG行動股份有限公司 統一編號 XXXXX </span>
        </div>
      </footer>
    );
  };
  
  export default Footer;