import { useState, useEffect } from 'react';
import { useWriteContract } from 'wagmi';
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from '../constants/contracts';

/**
 * Custom hook for staking-related actions
 * @param {function} refetchStakes - Function to refetch stakes after an action
 * @returns {object} - Contains action functions and states
 */
export const useStakingActions = (refetchStakes) => {
  const { writeContractAsync } = useWriteContract();
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      
      setSuccess(`Unstaked successfully! Transaction: ${txHash.slice(0, 10)}...`);
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
    if (!window.confirm('Early unstaking incurs a 10% penalty. Are you sure you want to continue?')) {
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
      
      setSuccess(`Interest claimed successfully! Transaction: ${txHash.slice(0, 10)}...`);
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
    actionLoading,
    error,
    success,
    setError,
    setSuccess
  };
}; 