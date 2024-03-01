import React from "react";
import ProposalGrid from "../Components/ProposalGrid.tsx"
import ProposalCard from "../Components/ProposalCard.tsx"


const proposals = [
    {
      image: '/images/corals-2.svg',
      tag: 'NFT | 綠島 | 海底覆網',
      description: '大部分的海廢為塑膠，這些塑膠垃圾的污染對海洋環境造成無遠弗屆的影響，威脅了海洋環境、海洋生物的健康、食品安全、航行安全、人類的健康、濱海旅遊等等，更加劇氣候變遷...',
      requiredFunding: 'NT$1,000,000',
      progressPercentage: 50,
      daysRemaining: 30,
      proposerIcon: "/images/sdg_icon.png",
      proposerName: "海洋保育基金會"
    },
    {
      image: '/images/corals-2.svg',
      tag: '山林復育協會',
      description: "目前我們協會協助在地植群復育的區域包括「台中、苗栗、彰化、高雄、花蓮」，每年公益提供一萬株以上的原生樹苗，在今年初的盤點統計中，我們的苗圃培育物種有242種，約六萬株。這些成果讓我們榮獲了「國家永續發展獎」與「臺中市低碳永續城市傑出貢獻獎」，在此感謝這幾年所有會員、會友、志工、贊助者的付出與努力。為了迎接八週年慶，我們謹訂於2024年3月17日(週日)舉辦「第五屆第一次會員大會」，敬邀大家蒞臨與會。...",
      requiredFunding: 'NT$1,000,000',
      progressPercentage: 50,
      daysRemaining: 30,
      proposerIcon: "/images/sdg_icon.png",
      proposerName: "海洋保育基金會"
    },
    {
      image: '/images/corals-2.svg',
      tag: 'New',
      description: 'This is a description of the first proposal...',
      requiredFunding: 'NT$1,000,000',
      progressPercentage: 50,
      daysRemaining: 30,
      proposerIcon: "/images/sdg_icon.png",
      proposerName: "海洋保育基金會"
    },
    {
      image: '/images/corals-2.svg',
      tag: 'New',
      description: 'This is a description of the first proposal...',
      requiredFunding: 'NT$1,000,000',
      progressPercentage: 50,
      daysRemaining: 30,
      proposerIcon: "/images/sdg_icon.png",
      proposerName: "海洋保育基金會"
    },
    {
      image: '/images/corals-2.svg',
      tag: 'New',
      description: 'This is a description of the first proposal...',
      requiredFunding: 'NT$1,000,000',
      progressPercentage: 50,
      daysRemaining: 30,
      proposerIcon: "/images/sdg_icon.png",
      proposerName: "海洋保育基金會"
    },
    {
      image: '/images/corals-2.svg',
      tag: 'New',
      description: 'This is a description of the first proposal...',
      requiredFunding: 'NT$1,000,000',
      progressPercentage: 50,
      daysRemaining: 30,
      proposerIcon: "/images/sdg_icon.png",
      proposerName: "海洋保育基金會"
    }
    // ... more proposals
  ];

const ProposalPage = ()=>{
    return (

    <>
        <ProposalGrid proposals={proposals} />
        
    </>

    );
}
export default ProposalPage;