import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from '../constants/contracts';
import { DURATION_OPTIONS } from '../constants/durations';
import useActiveStakes from '../hooks/useActiveStakes';
import { useInterestCalculator } from '../hooks/useInterestCalculator';

function ActiveStakes() {
  const { address, isConnected } = useAccount();
  
  // State
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // PRANA's decimals. Hardcoded decimals value instead of fetching from blockchain
  const decimals = 9;
  
  // Helper function to format timestamps to Vietnam time with 24h format
  const formatVietnamTime = (timestamp) => {
    // Create date from timestamp (multiply by 1000 to convert seconds to milliseconds)
    const date = new Date(Number(timestamp) * 1000);
    
    // Format for Vietnam timezone (UTC+7)
    return date.toLocaleString('en-GB', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  // Fetch user's stakes
  const { data: stakesData, isLoading: isStakesLoading, refetch: refetchStakes } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getStakerStakes',
    args: [address],
    enabled: isConnected && !!address,
  });
  
  // Get staking actions from custom hook
  const { 
    handleUnstake, 
    handleEarlyUnstake, 
    handleClaimInterest,
    calculateInterest,
    actionLoading,
    error,
    success
  } = useActiveStakes(refetchStakes);
  
  // Get interest calculator functions
  const { calculateTotalGuaranteedInterest } = useInterestCalculator();
  
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
        
        const totalGuaranteedInterest = calculateTotalGuaranteedInterest(stake);
        
        return {
          ...stake,
          amountFormatted: formatUnits(stake.amount, decimals),
          startTimeFormatted: formatVietnamTime(stake.startTime),
          endTimeFormatted: formatVietnamTime(endTime),
          durationLabel: durationOption.label,
          isExpired,
          canUnstake,
          canUnstakeEarly,
          canClaimInterest,
          progress: Math.min(100, Math.floor(((now - Number(stake.startTime)) / Number(stake.duration)) * 100)),
          totalGuaranteedInterest: formatUnits(totalGuaranteedInterest, decimals)
        };
      });
      
      setStakes(processedStakes);
    }
  }, [stakesData, decimals]);
  
  // Set loading state
  useEffect(() => {
    setLoading(isStakesLoading);
  }, [isStakesLoading]);
  
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
                  <div className="interest-text">Tổng lãi suất tích lũy: <strong>≈ {calculateInterest(stake)}</strong> PRANA</div>
                  <div className="interest-text">Tổng lãi suất dự kiến khi đáo hạn: <strong>≈ {calculateTotalGuaranteedInterest(stake)}</strong> PRANA</div>
                </div>
              </div>
              
              <div className="stake-actions">
                {stake.canClaimInterest && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleClaimInterest(stake.id)}
                    disabled={actionLoading.stakeId === stake.id}
                  >
                    {actionLoading.stakeId === stake.id && actionLoading.action === 'claimInterest' ? (
                      <><span className="spinner">↻</span>Processing...</>
                    ) : 'Claim Interest'}
                  </button>
                )}
                
                {stake.canUnstake && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleUnstake(stake.id)}
                    disabled={actionLoading.stakeId === stake.id}
                  >
                    {actionLoading.stakeId === stake.id && actionLoading.action === 'unstake' ? (
                      <><span className="spinner">↻</span>Processing...</>
                    ) : 'Unstake'}
                  </button>
                )}
                
                {stake.canUnstakeEarly && (
                  <button 
                    className="btn-danger"
                    onClick={() => handleEarlyUnstake(stake.id)}
                    disabled={actionLoading.stakeId === stake.id}
                    title="10% penalty applies for early unstaking"
                  >
                    {actionLoading.stakeId === stake.id && actionLoading.action === 'unstakeEarly' ? (
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