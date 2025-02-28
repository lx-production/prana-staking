import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, PRANA_TOKEN_ADDRESS, PRANA_TOKEN_ABI } from '../constants/contracts';
import { DURATION_OPTIONS } from '../constants/durations';

function ActiveStakes() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, status } = useWriteContract();
  
  // State
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch token decimals
  const { data: decimals = 9 } = useReadContract({
    address: PRANA_TOKEN_ADDRESS,
    abi: PRANA_TOKEN_ABI,
    functionName: 'decimals',
    enabled: isConnected,
  });
  
  // Helper function to calculate interest
  const calculateInterest = (stake) => {
    const now = Math.floor(Date.now() / 1000);
    const PERCENT_SCALE = 100; // Same as in the contract
    
    // Calculate time passed since last claim or start time
    // Cap the time at the end of the staking period
    const stakeEndTime = Number(stake.startTime) + Number(stake.duration);
    const effectiveTime = Math.min(now, stakeEndTime);
    const timePassed = effectiveTime - Number(stake.lastClaimTime);
    
    if (timePassed <= 0) return 0;
    
    // Calculate rate per second: (APR / PERCENT_SCALE) / (365 * 24 * 60 * 60)
    const ratePerSecond = (Number(stake.apr) * 1e18) / (PERCENT_SCALE * 365 * 24 * 60 * 60);
    
    // Calculate interest: principal * ratePerSecond * secondsPassed / 1e18
    const interest = (BigInt(stake.amount) * BigInt(Math.floor(ratePerSecond * timePassed))) / BigInt(1e18);
    
    return formatUnits(interest, decimals);
  };
  
  // Fetch user's stakes
  const { data: stakesData, isLoading: isStakesLoading, refetch: refetchStakes } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getStakerStakes',
    args: [address],
    enabled: isConnected && !!address,
  });
  
  // Process stakes data
  useEffect(() => {
    if (stakesData) {
      const processedStakes = stakesData.map(stake => {
        const now = Math.floor(Date.now() / 1000);
        const endTime = stake.startTime + stake.duration;
        const isExpired = now > endTime;
        const canUnstake = isExpired;
        const canUnstakeEarly = !isExpired;
        const canClaimInterest = true; // Always allow claiming interest
        
        // Find the corresponding duration option
        const durationOption = DURATION_OPTIONS.find(option => 
          option.seconds === Number(stake.duration)
        ) || { label: `${Math.floor(Number(stake.duration) / 86400)} Days` };
        
        return {
          ...stake,
          amountFormatted: formatUnits(stake.amount, decimals),
          startTimeFormatted: new Date(Number(stake.startTime) * 1000).toLocaleDateString(),
          endTimeFormatted: new Date(endTime * 1000).toLocaleDateString(),
          durationLabel: durationOption.label,
          isExpired,
          canUnstake,
          canUnstakeEarly,
          canClaimInterest,
          progress: Math.min(100, Math.floor(((now - stake.startTime) / stake.duration) * 100))
        };
      });
      
      setStakes(processedStakes);
    }
  }, [stakesData, decimals]);
  
  // Reset messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  
  // Set loading state
  useEffect(() => {
    setLoading(isStakesLoading);
  }, [isStakesLoading]);
  
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
  
  if (!isConnected) return null;
  
  return (
    <div className="active-stakes-container">
      <h3>Active Stakes</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {loading ? (
        <div className="loading-message">
          <span className="spinner">↻</span> Loading stakes...
        </div>
      ) : stakes.length === 0 ? (
        <p className="no-stakes-message">You don't have any active stakes yet.</p>
      ) : (
        <div className="stakes-list">
          {stakes.map((stake) => (
            <div key={stake.id} className="stake-card">
              <div className="stake-header">
                <div className="stake-id">Stake #{stake.id.toString()}</div>
                <div className={`stake-status ${stake.isExpired ? 'expired' : 'active'}`}>
                  {stake.isExpired ? 'Matured' : 'Active'}
                </div>
              </div>
              
              <div className="stake-details">
                <div className="stake-amount">
                  <strong>{stake.amountFormatted}</strong> PRANA
                </div>
                <div className="stake-apr">
                  <span className="apr-tag">{stake.apr}% APR</span>
                </div>
              </div>
              
              <div className="stake-duration">
                <div>Duration: {stake.durationLabel}</div>
              </div>
              
              <div className="stake-dates">
                <div>Start: {stake.startTimeFormatted}</div>
                <div>End: {stake.endTimeFormatted}</div>
              </div>
              
              <div className="stake-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${stake.progress}%` }}
                  ></div>
                </div>
                <div className="progress-info">
                  <div className="progress-text">{stake.progress}% Complete</div>
                  <div className="interest-text">Interest earned: <strong>{calculateInterest(stake)}</strong> PRANA</div>
                </div>
              </div>
              
              <div className="stake-actions">
                {stake.canClaimInterest && (
                  <button 
                    className="btn-primary"
                    onClick={() => handleClaimInterest(stake.id)}
                    disabled={actionLoading === stake.id}
                  >
                    {actionLoading === stake.id ? (
                      <><span className="spinner">↻</span>Processing...</>
                    ) : 'Claim Interest'}
                  </button>
                )}
                
                {stake.canUnstake && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleUnstake(stake.id)}
                    disabled={actionLoading === stake.id}
                  >
                    {actionLoading === stake.id ? (
                      <><span className="spinner">↻</span>Processing...</>
                    ) : 'Unstake'}
                  </button>
                )}
                
                {stake.canUnstakeEarly && (
                  <button 
                    className="btn-danger"
                    onClick={() => handleEarlyUnstake(stake.id)}
                    disabled={actionLoading === stake.id}
                    title="10% penalty applies for early unstaking"
                  >
                    {actionLoading === stake.id ? (
                      <><span className="spinner">↻</span>Processing...</>
                    ) : 'Unstake Early (10% penalty)'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActiveStakes; 