import React, { useState } from 'react';
import './productlist.scss';
import { useAuth } from '../AuthContext';

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
  { id: 1, name: '消除貧窮(普通)', price: 100, description: 'DAO權重 X 1', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.1.png' },
  //SDG-CrowdFunding\public\icons\goal-1\GOAL_1_TARGETS\GOAL_1_TARGETS_PNG\GOAL_1_TARGET_1.1.png
  { id: 2, name: '消除貧窮(經典)', price: 200, description: 'DAO權重 X 3', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.2.png'},
  { id: 3, name: '消除貧窮(史詩)', price: 300, description: 'DAO權重 X 6', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.3.png'},
  { id: 4, name: '消除貧窮(傳說)', price: 400, description: 'DAO權重 X 10', quantity: 0 ,imageUrl: '/icons/goal-1/GOAL_1_TARGETS/GOAL_1_TARGETS_PNG/GOAL_1_TARGET_1.B.png'},
];

const ProductList = () => {
  const { userInfo } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);

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
  const handleMint = () => {
    
    //先判斷是否有user資料 沒有就要signin
    //這裡要MintBatch()
    if (userInfo) {
      // 如果 userInfo 存在，表示用户已登录，继续与合约交互
      //MintBatch();
      alert(`總金額: ${calculateTotal()}`);
    } else {
      alert(`no login`);
      // 如果 userInfo 不存在，显示登录弹窗
      // 你可以使用 Modal 组件或设置一个状态来显示登录弹窗
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
