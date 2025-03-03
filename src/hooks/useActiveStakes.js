import { useState, useEffect } from 'react';
import { useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from '../constants/contracts';
import { useInterestCalculator } from './useInterestCalculator';

/**
 * Custom hook for staking-related actions
 * @param {function} refetchStakes - Function to refetch stakes after an action
 * @returns {object} - Contains action functions and states
 */
export const useActiveStakes = (refetchStakes) => {
  const { writeContractAsync } = useWriteContract();
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const { calculateTotalGuaranteedInterest } = useInterestCalculator();
  
  // PRANA's decimals. Hardcoded to 9
  const decimals = 9;
  
  // Update time every second to recalculate interest
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Helper function to calculate interest
  const calculateInterest = (stake) => {
    const now = currentTime;
    const PERCENT_SCALE = 100; // Same as in the contract
    
    // Calculate time passed since the stake started
    // Cap the time at the end of the staking period
    const stakeEndTime = Number(stake.startTime) + Number(stake.duration);
    const effectiveTime = Math.min(now, stakeEndTime);
    const timePassed = effectiveTime - Number(stake.startTime);
    
    if (timePassed <= 0) return 0;
    
    // Calculate rate per second: (APR / PERCENT_SCALE) / (365 * 24 * 60 * 60)
    const ratePerSecond = (Number(stake.apr) * 1e18) / (PERCENT_SCALE * 365 * 24 * 60 * 60);
    
    // Calculate interest: principal * ratePerSecond * secondsPassed / 1e18
    const interest = (BigInt(stake.amount) * BigInt(Math.floor(ratePerSecond * timePassed))) / BigInt(1e18);
    
    return formatUnits(interest, decimals);
  };
  
  // Reset messages after 10 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Handle unstake
  const handleUnstake = async (stakeId) => {
    try {
      setActionLoading(stakeId);
      setError('');
      
      const txHash = await writeContractAsync({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'unstake',
        args: [stakeId]
      });
      
      setSuccess(`Unstaked successfully! Unstake thành công! Transaction: ${txHash.slice(0, 10)}...`);
      refetchStakes();
    } catch (err) {
      console.error('Unstake error:', err);
      setError(`Failed to unstake: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle early unstake
  const handleEarlyUnstake = async (stakeId) => {
    if (!window.confirm('Early unstaking incurs a 10% penalty. Are you sure you want to continue? Unstake sớm sẽ bị trừ 10% vốn gốc. Bạn có chắc chưa?')) {
      return;
    }
    
    try {
      setActionLoading(stakeId);
      setError('');
      
      const txHash = await writeContractAsync({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'unstakeEarly',
        args: [stakeId]
      });
      
      setSuccess(`Unstaked early successfully! Transaction: ${txHash.slice(0, 10)}...`);
      refetchStakes();
    } catch (err) {
      console.error('Early unstake error:', err);
      setError(`Failed to unstake early: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // Handle claim interest
  const handleClaimInterest = async (stakeId) => {
    try {
      setActionLoading(stakeId);
      setError('');
      
      const txHash = await writeContractAsync({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'claimInterest',
        args: [stakeId]
      });
      
      setSuccess(`Claim interest transaction ${txHash} đã được gửi thành công.`);
      refetchStakes();
    } catch (err) {
      console.error('Claim interest error:', err);
      setError(`Failed to claim interest: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return {
    handleUnstake,
    handleEarlyUnstake,
    handleClaimInterest,
    calculateInterest,
    calculateTotalGuaranteedInterest,
    currentTime,
    actionLoading,
    error,
    success,
    setError,
    setSuccess
  };
}; 