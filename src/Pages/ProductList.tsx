import React, { useEffect, useState } from 'react';
import './productlist.scss';
import { useAuth } from '../AuthContext';
import NFTcontractABI from '../hooks/contractAbi_NFT.json';
// import { useSmartContract } from '../hooks/useSmartContract';
// import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';
import { Contract } from 'ethers';
// 產品介面
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  quantity: number;
  imageUrl: string; // 新增圖片URL屬性
}

const TokenContractAddress = "0x86746fF42E7EC38A225d8C3005F7F2B7a18d137C";
// 初始產品列表
const initialProducts: Product[] = [
  { id: 0, name: '消除貧窮(普通)', price: 0.0001, description: 'DAO權重 X 1', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.1.png' },
  //SDG-CrowdFunding\public\icons\goal-1\GOAL_1_TARGETS\GOAL_1_TARGETS_PNG\GOAL_1_TARGET_1.1.png
  { id: 1, name: '消除貧窮(經典)', price: 0.0001, description: 'DAO權重 X 3', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.2.png'},
  { id: 2, name: '消除貧窮(史詩)', price: 0.0001, description: 'DAO權重 X 6', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.3.png'},
  { id: 3, name: '消除貧窮(傳說)', price: 0.0001, description: 'DAO權重 X 10', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.B.png'},
];

const ProductList = () => {
  
  // const { userInfo } = useAuth();
  // const { CAaddress } = useAuth(); //signin 後會更新
  // const { smartAccount } = useAuth();
  const [ userAddress,setUserAddress] = useState<string | undefined>(undefined);
  const { signer } = useAuth(); //全局變數
  const [ tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  // const { ethBalance, caAddress, eoaAddress, fetchEthBalance } = useSmartContract();
  // const { contract, fetchTreasury, mintBatchA, mintBatchWithCA } = useContract();
  const [totalSupply, setTotalSupply] = useState('Loading...');


  useEffect(() => {
    const init = async () => { //初始化
        if (signer) {
          const address = await signer.getAddress();
          setUserAddress(address);
          console.log("signer address:", address);
            
          const TokenInstance = new ethers.Contract(TokenContractAddress, NFTcontractABI, signer);
          setTokenContract(TokenInstance);
          //const votes = await TokenInstance.getVotes(address);
          //setUserVoteRight(votes);

            // Now that the contract is set, fetch events or listen for events  
        } else {
          setUserAddress(undefined);
        }
    };

    init(); //執行初始化
}, [signer]); //依賴signer執行

  // 處理數量變化
  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 0) {
      // Prevent quantity from going negative
      return;
    }
    setProducts(products.map(product =>
      product.id === id ? { ...product, quantity: Math.max(0, quantity) } : product
    ));
  };
  

// 計算總金額
const calculateTotal = () => {
  const total = products.reduce((sum, product) => {
    // Use the Number type to avoid string concatenation
    const productTotal = Number(product.price) * product.quantity;
    // Add the product total to the running sum
    return sum + productTotal;
  }, 0);
  // Use toFixed to limit the number of decimal places, then convert back to Number to strip trailing zeroes
  return Number(total.toFixed(4));
};


  // 顯示總金額
  const handleMint = async () => {
   if (!signer) {
      alert('請先連結您的錢包');
      return;
    }

    const totalAmount = calculateTotal();

    try {

      const payableAmount = ethers.utils.parseUnits(totalAmount.toString(), "ether");
      const ids = products.map(p => p.id);
      const quantities = products.map((product) => product.quantity);
      const transactionResponse = await tokenContract.mintBatch(ids, quantities,{
            value: payableAmount
      });

      // Wait for the transaction to be confirmed
      const receipt = await transactionResponse.wait();
      console.log(receipt);
      //const txReceipt = await smartAccount.mintBatch(totalAmount, ids, quantities);
      //const tx = await smartAccount.mintBatch(payableAmount, ids, quantities, { value: payableAmount });
      //const txReceipt = await tx.wait();
      if (receipt && receipt.status === 1) {
        alert('NFT鑄造成功');
        console.log('Minted successfully: address'+ receipt.to);
      }else {
        alert('鑄造過程中發生錯誤');
        console.error('The transaction was not successful:', receipt);
    }
    } catch (error) {
      console.error('Error during minting:', error);
      alert('鑄造過程中發生錯誤');
    }
  };

  return (
    <>
      <div className="product-list-container">
        <div className="product-list-title">本月NFT</div>
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product">
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <h4>{product.name}</h4>
              <p>鑄造價: {product.price}</p>
              <p>{product.description}</p>
              <input
                type="number"
                value={product.quantity}
                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                min="0"
              />
            </div>
          ))}
          <div className="total-amount-container">
            <div className="total-amount">
              鑄造費用: {calculateTotal()} Eth
            </div>
          </div>
          <button 
            className="mint-button" 
            onClick={handleMint}
            disabled={!signer} // Disable the button if the wallet is not connected
          >
            {signer ? '鑄造' : '連結錢包'} 
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductList;
