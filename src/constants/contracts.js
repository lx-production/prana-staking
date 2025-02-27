// This file contains the contract addresses and ABIs
// Replace placeholder addresses with actual deployed contract addresses

// PRANA Token contract (ERC20 with permit functionality)
export const PRANA_TOKEN_ADDRESS = '0x928277e774F34272717EADFafC3fd802dAfBD0F5'; // Replace with actual token address

// Contract ABIs - Using standard JSON format instead of human-readable format
export const PRANA_TOKEN_ABI = [
  // ERC20 standard functions
  {
    "name": "name",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "string"}]
  },
  {
    "name": "symbol",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "string"}]
  },
  {
    "name": "decimals",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "uint8"}]
  },
  {
    "name": "totalSupply",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "balanceOf",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{"name": "owner", "type": "address"}],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "allowance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "outputs": [{"type": "uint256"}]
  },
  {
    "name": "approve",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "value", "type": "uint256"}
    ],
    "outputs": [{"type": "bool"}]
  },
  {
    "name": "transfer",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "value", "type": "uint256"}
    ],
    "outputs": [{"type": "bool"}]
  },
  {
    "name": "transferFrom",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"name": "from", "type": "address"},
      {"name": "to", "type": "address"},
      {"name": "value", "type": "uint256"}
    ],
    "outputs": [{"type": "bool"}]
  },
  
  // ERC20Permit functions
  {
    "name": "permit",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"},
      {"name": "value", "type": "uint256"},
      {"name": "deadline", "type": "uint256"},
      {"name": "v", "type": "uint8"},
      {"name": "r", "type": "bytes32"},
      {"name": "s", "type": "bytes32"}
    ],
    "outputs": []
  },
  
  // Events
  {
    "name": "Transfer",
    "type": "event",
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ]
  },
  {
    "name": "Approval",
    "type": "event",
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": true, "name": "spender", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ]
  }
];

// Staking Contract
export const STAKING_CONTRACT_ADDRESS = '0x35A09e66ef690dc843968c7199aBEd4f6c4906bA'; // Replace with actual contract address

export const STAKING_CONTRACT_ABI = [
  // View functions
  'function PRANA() view returns (address)',
  'function MIN_STAKE() view returns (uint256)',
  'function DAY() view returns (uint32)',
  'function gracePeriod() view returns (uint32)',
  'function earlyUnstakePenaltyPercent() view returns (uint8)',
  'function aprByDuration(uint32 duration) view returns (uint8)',
  'function userStakes(address user, uint256 index) view returns (uint32 id, uint256 amount, uint32 startTime, uint32 duration, uint8 apr, uint32 lastClaimTime)',
  'function getAllAPRs() view returns (uint32[] durations, uint8[] aprs)',
  'function getStakerStakes(address staker) view returns (tuple(uint32 id, uint256 amount, uint32 startTime, uint32 duration, uint8 apr, uint32 lastClaimTime)[])',
  
  // Write functions
  'function stakeWithPermit(uint256 amount, uint32 duration, uint32 deadline, uint8 v, bytes32 r, bytes32 s)',
  'function claimInterest(uint32 stakeId)',
  'function unstake(uint32 stakeId)',
  'function unstakeEarly(uint32 stakeId)',
  
  // Events
  'event StakedPRANA(address indexed user, uint32 indexed stakeId, uint256 amount, uint32 duration, uint8 apr, uint32 startTime)',
  'event InterestClaimed(address indexed user, uint32 indexed stakeId, uint256 amount, uint32 timePassed, uint32 claimTime)',
  'event UnstakedPRANA(address indexed user, uint32 indexed stakeId, uint256 amount, uint32 duration, uint32 unstakeTime)'
];

// Interest Contract
export const INTEREST_CONTRACT_ADDRESS = '0x3389a6CCEd6fB6956d297E889823CB6066C8f036'; // Replace with actual contract address

export const INTEREST_CONTRACT_ABI = [
  // View functions
  'function PRANA() view returns (address)',
  'function PranaStakingContract() view returns (address)',
  'function getWithdrawableAmount() view returns (uint256)'
]; 