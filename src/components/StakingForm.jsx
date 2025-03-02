import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useSignTypedData, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { PRANA_TOKEN_ADDRESS, PRANA_TOKEN_ABI, STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI } from '../constants/contracts';
import { DURATION_OPTIONS } from '../constants/durations';
import DurationSlider from './DurationSlider';

const StakingForm = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, status } = useWriteContract();
  const { isPending: isSignPending, signTypedDataAsync } = useSignTypedData();
  const publicClient = usePublicClient();

  // State
  const [amount, setAmount] = useState('');
  const [durationIndex, setDurationIndex] = useState(2); // Default: 30 days
  const [permitSignature, setPermitSignature] = useState(null);
  const [transactionArgs, setTransactionArgs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aprs, setAprs] = useState({});
  
  // Hardcoded decimals value instead of fetching from blockchain
  const decimals = 9;

  // Data fetching
  const { data: minStake } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'MIN_STAKE',
    enabled: isConnected,
  });
  
  // Fetch all APRs at once
  const { data: allAprsData } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getAllAPRs',
    enabled: isConnected,
  });
  
  // Process APR data when it's available
  useEffect(() => {
    if (allAprsData) {
      const [durations, aprValues] = allAprsData;
      const aprMap = {};
      
      // Map each duration to its corresponding APR
      for (let i = 0; i < durations.length; i++) {
        aprMap[durations[i].toString()] = aprValues[i];
      }
      
      setAprs(aprMap);
    }
  }, [allAprsData]);

  const formattedMinStake = minStake ? formatUnits(minStake, decimals) : '100';

  // Unified loading state
  useEffect(() => {
    setLoading(isSignPending || status === 'pending');
  }, [isSignPending, status]);

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

  // Handlers
  const handlePermit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) < parseFloat(formattedMinStake)) {
      setError(`Minimum stake amount is ${formattedMinStake} PRANA`);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Convert amount to wei
      const amountInWei = parseUnits(amount, decimals);
      
      // Current timestamp + 1 hour (in seconds)
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Get current nonce for the user
      const nonceResult = await publicClient.readContract({
        address: PRANA_TOKEN_ADDRESS,
        abi: PRANA_TOKEN_ABI,
        functionName: 'nonces',
        args: [address]
      });
      
      console.log('User nonce:', nonceResult.toString());
      
      // Prepare domain, types, and message for EIP-2612 permit
      const domain = {
        name: 'Prana_v2',
        version: '1',
        chainId: 137, // Polygon Mainnet
        verifyingContract: PRANA_TOKEN_ADDRESS,
      };
      
      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      };
      
      const message = {
        owner: address,
        spender: STAKING_CONTRACT_ADDRESS,
        value: amountInWei,
        nonce: nonceResult,
        deadline,
      };
      
      // Sign the permit message
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'Permit',
        message,
      });
      
      console.log('Signature received:', signature);
      
      // Process the signature into v, r, s components
      const r = '0x' + signature.slice(2, 66);
      const s = '0x' + signature.slice(66, 130);
      let v = parseInt(signature.slice(130, 132), 16);
      
      // Adjust v to Ethereum standard (27 or 28)
      if (v < 27) v += 27;
      
      // Construct transaction arguments
      const args = [
        amountInWei,
        Number(DURATION_OPTIONS[durationIndex].seconds),
        Number(deadline),
        v,
        r,
        s
      ];
      
      // Save permit data
      setPermitSignature({
        r, s, v, signature
      });
      
      // Set transaction arguments for staking
      setTransactionArgs(args);
      
      setSuccess('Permit signed successfully! You can now Stake! - Permit thành công! Bạn có thể stake PRANA ngay!');
    } catch (err) {
      console.error('Permit signing error:', err);
      if (err.message?.includes('User rejected') || 
          err.message?.includes('User denied') ||
          err.message?.includes('cancelled')) {
        setError('Signature request was rejected');
      } else {
        setError(`Failed to sign permit: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!permitSignature || !transactionArgs) {
      setError('Please sign the permit first - Bạn cần ký permit trước');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Execute the transaction without overriding gas settings
      // Let MetaMask handle gas estimation for better compatibility
      const txHash = await writeContractAsync({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'stakeWithPermit',
        args: transactionArgs
      });
      
      console.log('Transaction hash:', txHash);
      setSuccess(`Staking successful! Stake thành công! Transaction: ${txHash}`);
      
      // Reset form after successful stake
      setAmount('');
      setPermitSignature(null);
      setTransactionArgs(null);
    } catch (err) {
      console.error('Staking error:', err);
      
      let errorMsg = 'Failed to stake';
      
      if (err.message?.includes('execution reverted')) {
        const revertReason = err.message.match(/execution reverted: (.*?)(?:"|$)/);
        errorMsg = revertReason ? `Contract error: ${revertReason[1]}` : 'Transaction reverted';
      } else if (err.message?.includes('rejected')) {
        errorMsg = 'Transaction rejected by wallet';
      } else if (err.message?.includes('insufficient funds')) {
        errorMsg = 'Insufficient funds for transaction';
      } else if (err.message?.includes('extra fees')) {
        errorMsg = 'MetaMask rejected the transaction due to excessive fees. Try again.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Render
  if (!isConnected) return null;
  
  return (
    <div className="staking-form" key="staking-form">
      <h3>Stake PRANA</h3>
      
      <div className="form-group">
        <label htmlFor="stake-amount">Amount</label>
        <input
          id="stake-amount"
          type="text"
          value={amount}
          onChange={(e) => {
            // Only allow numbers and decimal points
            const value = e.target.value;
            if (value === '' || /^[0-9]*[.]?[0-9]*$/.test(value)) {
              setAmount(value);
            }
          }}
          placeholder={`Min: ${formattedMinStake}`}
          disabled={loading}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <div id="duration-label" className="form-label">Duration & APR</div>
        <DurationSlider
          durationIndex={durationIndex}
          setDurationIndex={setDurationIndex}
          durationOptions={DURATION_OPTIONS}
          aprs={aprs}
          disabled={loading || !!permitSignature}
          labelId="duration-label"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="action-buttons">
        <button 
          className="btn-primary"
          onClick={handlePermit} 
          disabled={loading || !amount || !!permitSignature}
        >
          {loading && isSignPending ? (
            <><span className="spinner">↻</span>Signing...</>
          ) : (
            permitSignature ? 'Permit Signed ✓' : 'Sign Permit (off-chain)'
          )}
        </button>
        
        <button 
          className="btn-secondary"
          onClick={handleStake} 
          disabled={loading || !permitSignature}
        >
          {loading && status === 'pending' ? (
            <><span className="spinner">↻</span>Staking...</>
          ) : 'Stake'}
        </button>
      </div>
    </div>
  );
};

export default StakingForm; 