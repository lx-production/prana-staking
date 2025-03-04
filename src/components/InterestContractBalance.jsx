import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { INTEREST_CONTRACT_ADDRESS, PRANA_TOKEN_ADDRESS, PRANA_TOKEN_ABI } from '../constants/contracts';

const InterestContractBalance = () => {
  const { isConnected } = useAccount();
  
  const { data: balance, isLoading, error } = useReadContract({
    address: PRANA_TOKEN_ADDRESS,
    abi: PRANA_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [INTEREST_CONTRACT_ADDRESS],
    enabled: isConnected,
  });

  // Log any errors for debugging
  if (error) {
    console.error("Interest contract balance error:", error);
  }

  // Hardcoded decimals value for PRANA token
  const decimals = 9;

  if (!isConnected) return null;

  return (
    <div className="interest-balance-container">
      <h3>Interest Contract Balance</h3>
      {isLoading ? (
        <p>Loading balance...</p>
      ) : error ? (
        <p className="error">Error loading balance: {error.message || 'Unknown error'}</p>
      ) : (
        <div>
          <p className="balance">
            {balance ? formatUnits(balance, decimals) : '0'} PRANA
          </p>
          <p className="balance-description">
            Tổng số PRANA khả dụng để trả lãi suất.<br/>
            (Đủ trả lãi suất cho 500.000 PRANA trong 1 năm.)
          </p>
        </div>
      )}
    </div>
  );
};

export default InterestContractBalance; 