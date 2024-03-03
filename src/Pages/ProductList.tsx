import React, { useEffect, useState } from 'react';
import './productlist.scss';
import { useAuth } from '../AuthContext';
import { useSmartContract } from '../hooks/useSmartContract';
import { useContract } from '../hooks/useContract';

// 產品介面
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  quantity: number;
  imageUrl: string; // 新增圖片URL屬性
}

// 初始產品列表
const initialProducts: Product[] = [
  { id: 0, name: '消除貧窮(普通)', price: 0.001, description: 'DAO權重 X 1', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.1.png' },
  //SDG-CrowdFunding\public\icons\goal-1\GOAL_1_TARGETS\GOAL_1_TARGETS_PNG\GOAL_1_TARGET_1.1.png
  { id: 1, name: '消除貧窮(經典)', price: 0.001, description: 'DAO權重 X 3', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.2.png'},
  { id: 2, name: '消除貧窮(史詩)', price: 0.001, description: 'DAO權重 X 6', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.3.png'},
  { id: 3, name: '消除貧窮(傳說)', price: 0.001, description: 'DAO權重 X 10', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.B.png'},
];

const ProductList = () => {
  const { userInfo } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const { ethBalance, caAddress, eoaAddress, fetchEthBalance } = useSmartContract();
  const { contract, fetchTreasury, mintBatch,mintBatchWithCA } = useContract();
  const [totalSupply, setTotalSupply] = useState('Loading...');

  useEffect(() => {
    fetchEthBalance();
  }, [fetchEthBalance]); // Fetch balance when the component mounts

  useEffect(() => {
    // This effect runs when ethBalance changes
    if (ethBalance !== null) {
      console.log(`Balance: ${ethBalance}`);
    }
  }, [ethBalance]); // ethBalance is a dependency of this effect
  
  useEffect(() => {
    fetchTreasury().then(supply => {
      setTotalSupply(supply);
      console.log("Treasury TotalSupply:"+totalSupply);
    });
  }, [fetchTreasury]);

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
    return products.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  // 顯示總金額
  const handleMint = async () => {
    // if (!userInfo) {
    //   alert('请先登录');
    //   window.location.href = '/signin';
    //   return;
    // }

    const totalAmount = calculateTotal();
    const ids = products.map(p => p.id);
    const quantities = products.map(p => p.quantity);

    console.log("IDS"+ids);
    console.log("number"+quantities);
    try {
      const txReceipt = await mintBatchWithCA(totalAmount, ids, quantities,caAddress);
      console.log('Minted successfully: address'+caAddress+" | ", txReceipt);
    } catch (error) {
      console.error('Error during minting:', error);
      alert('鑄造过程中发生错误');
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
              鑄造費用: {calculateTotal()}
            </div>
          </div>
          <button className="mint-button" onClick={handleMint}>鑄造</button>
        </div>
      </div>
    </>
  );
};

export default ProductList;
