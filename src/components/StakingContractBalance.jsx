import React from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { PRANA_TOKEN_ADDRESS, PRANA_TOKEN_ABI, STAKING_CONTRACT_ADDRESS } from '../constants/contracts';

function StakingContractBalance() {
  // Read the PRANA balance of the staking contract
  const { data: balance } = useReadContract({
    address: PRANA_TOKEN_ADDRESS,
    abi: PRANA_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [STAKING_CONTRACT_ADDRESS],
  });

  // Format the balance with 9 decimals (PRANA token decimals)
  const formattedBalance = balance ? formatUnits(balance, 9) : '0';

  return (
    <div className="balance-display">
      <h3>Protocal Total Value Staked</h3>
      <p><a href="https://polygonscan.com/token/0x928277e774f34272717eadfafc3fd802dafbd0f5?a=0x30236dB04c0C4E88bFA0c1c926CDaA47780100d0" target="_blank" rel="noopener noreferrer">{parseFloat(formattedBalance).toLocaleString()}</a> PRANA</p>
    </div>
  );
}

export default StakingContractBalance; 