// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Add interface to access StakingContract's function
interface IStakingContract {
    function totalInterestNeeded() view external returns (uint96);
}

contract PranaInterestContract is Ownable {
    IERC20 public immutable PRANA;              // PRANA token
    address public PranaStakingContract;        // Address of the StakingContract
    bool public stakingContractSet = false;     // Flag to ensure single setting

    constructor(address _prana) Ownable(msg.sender) {
        PRANA = IERC20(_prana);
    }

    // Called after the StakingContract is deployed
    function setStakingContract(address _stakingContract) external onlyOwner {
        require(!stakingContractSet, "Staking contract already set");
        PranaStakingContract = _stakingContract;
        stakingContractSet = true;
    }

    modifier onlyStakingContract() {
        require(msg.sender == PranaStakingContract, "Only staking contract allowed");
        _;
    }

    function payInterest(address user, uint256 amount) external onlyStakingContract {
        PRANA.transfer(user, amount);
    }    
    
    function getWithdrawableAmount() public view returns (uint256) {
        require(PranaStakingContract != address(0), "Staking contract not set");
        
        // Get total interest needed for all stakes
        uint256 neededAmount = IStakingContract(PranaStakingContract).totalInterestNeeded();
        
        // Get current balance
        uint256 currentBalance = PRANA.balanceOf(address(this));
        
        // Calculate and return maximum withdrawable amount
        return currentBalance > neededAmount ? currentBalance - neededAmount : 0;
    }

    function withdrawExcessTokens(uint256 amount) external onlyOwner {
        uint256 excessAmount = getWithdrawableAmount();
        require(amount <= excessAmount, "Amount exceeds withdrawable balance");
        
        // Transfer excess tokens to owner
        require(PRANA.transfer(msg.sender, amount), "Transfer failed");
    }
}