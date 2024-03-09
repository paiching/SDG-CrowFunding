import React from 'react';
import styles from './about.scss';

function about() {
  return (
    <div className='aboutContainer'>  
    <div >
      {/* <h1>SDGs DAO</h1> */}
      <h2>1. 前言</h2>
      <p>隨著全球面臨日益嚴峻的環境和社會挑戰，聯合國可持續發展目標（SDGs）提供了一個共同的藍圖，旨在促進和平與繁榮，保護地球。近年來，區塊鏈技術和非同質化代幣（NFT）為實現這些目標提供了新的可能性。本報告提出一個創新的NFT眾籌平台，透過集合社群力量和技術創新，支持與SDGs目標下的項目和創意。</p>
      
      <h2>2. 遇到問題</h2>
      <ul>
        <li>對慈善家: 募資平台眾多，但不知如何確保資金被正當運用</li>
        <li>對行動家: 想參與永續行動，但不知從何加入</li>
        <li>對願景家: 對於永續計畫有想法，但不知從何尋找資源</li>
      </ul>
      
      <h2>3. 區塊鏈的幫助</h2>
      <ul>
        <li>對慈善家: 利用區塊鏈技術的透明性，確保所有資金流向和使用情況都可以被追蹤及審視</li>
        <li>對行動家: 透過持有 NFT 成為 DAO 的一員，人人都可以參與組織，為永續發展盡一份力</li>
        <li>對願景家: 透過鏈上提案、投票，讓好想法能夠被看見，共同決定資金運用，共創 DAO 的價值</li>
      </ul>
      
      <h2>4. 運作機制</h2>
      <ul>
        <li>透過公開鑄造 NFT 集結成員與國庫</li>
        <li>透過 DAO 提案運用國庫</li>
        <li>透過經營成果回饋利潤</li>
      </ul>
      
      <h2>5. 核心開發團隊</h2>
      <ul>
        <li>ChaoJen 智能合約撰寫</li>
        <li>Henry 前端與智能合約交互</li>
      </ul>
    </div>
    </div>
  );
}

export default about;
