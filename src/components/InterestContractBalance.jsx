import React from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { INTEREST_CONTRACT_ADDRESS, PRANA_TOKEN_ADDRESS, PRANA_TOKEN_ABI } from '../constants/contracts';

function InterestContractBalance() {
  // Read the PRANA balance of the interest contract
  const { data: balance } = useReadContract({
    address: PRANA_TOKEN_ADDRESS,
    abi: PRANA_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [INTEREST_CONTRACT_ADDRESS],
  });

  const decimals = 9;

  // Format the balance with 9 decimals (PRANA token decimals)
  const formattedBalance = balance ? formatUnits(balance, decimals) : '0';

  return (
    <div className="balance-display">
      <h3>Interest Contract Balance</h3>
      <p>{parseFloat(formattedBalance).toLocaleString()} <span className="token-symbol">PRANA</span></p>
      <label className="balance-description">
        Tổng số PRANA khả dụng để trả lãi suất.<br /> 
        (Đủ trả lãi suất cho 500,000 PRANA trong 1 năm.)
      </label>
    </div>
  );
}

export default InterestContractBalance; 