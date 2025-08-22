import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { base } from 'wagmi/chains'

// BST Contract ABI (key functions)
const BST_ABI = [
  {
    "inputs": [{"type": "address", "name": "account"}],
    "name": "balanceOf",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "user"}],
    "name": "stakedBalance",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view", 
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "user"}],
    "name": "isQualifiedHost",
    "outputs": [{"type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "amount"}],
    "name": "stakeForHost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256", "name": "amount"}],
    "name": "unstake", 
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "user"}],
    "name": "calculateRewards",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address", "name": "user"}],
    "name": "getDiscountRate",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// BST Token Hook
export function useBSTToken() {
  const { address } = useAccount()
  const bstContractAddress = process.env.NEXT_PUBLIC_BST_TOKEN_ADDRESS as `0x${string}`
  
  // Read token balance
  const { data: balance } = useReadContract({
    address: bstContractAddress,
    abi: BST_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
  
  // Read staked balance
  const { data: stakedBalance } = useReadContract({
    address: bstContractAddress,
    abi: BST_ABI,
    functionName: 'stakedBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
  
  // Check if qualified host
  const { data: isQualifiedHost } = useReadContract({
    address: bstContractAddress,
    abi: BST_ABI,
    functionName: 'isQualifiedHost',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
  
  // Calculate pending rewards
  const { data: pendingRewards } = useReadContract({
    address: bstContractAddress,
    abi: BST_ABI,
    functionName: 'calculateRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
  
  // Get discount rate
  const { data: discountRate } = useReadContract({
    address: bstContractAddress,
    abi: BST_ABI,
    functionName: 'getDiscountRate',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
  
  // Write functions
  const { writeContract: stakeTokens } = useWriteContract()
  const { writeContract: unstakeTokens } = useWriteContract()
  const { writeContract: claimRewards } = useWriteContract()
  
  const stake = (amount: string) => {
    if (!address) return
    
    stakeTokens({
      address: bstContractAddress,
      abi: BST_ABI,
      functionName: 'stakeForHost',
      args: [parseEther(amount)]
    })
  }
  
  const unstake = (amount: string) => {
    if (!address) return
    
    unstakeTokens({
      address: bstContractAddress,
      abi: BST_ABI,
      functionName: 'unstake',
      args: [parseEther(amount)]
    })
  }
  
  const claimAllRewards = () => {
    if (!address) return
    
    claimRewards({
      address: bstContractAddress,
      abi: BST_ABI,
      functionName: 'claimRewards'
    })
  }
  
  return {
    // Balances
    balance: balance ? formatEther(balance) : '0',
    stakedBalance: stakedBalance ? formatEther(stakedBalance) : '0',
    pendingRewards: pendingRewards ? formatEther(pendingRewards) : '0',
    
    // Status
    isQualifiedHost: !!isQualifiedHost,
    discountRate: discountRate ? Number(discountRate) : 0,
    
    // Actions
    stake,
    unstake,
    claimRewards: claimAllRewards,
    
    // Utils
    minHostStake: '1000', // 1000 BST minimum
    canListProperties: !!isQualifiedHost,
    discountPercentage: discountRate ? Number(discountRate) / 100 : 0
  }
}
