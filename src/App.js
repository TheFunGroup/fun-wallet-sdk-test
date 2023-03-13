import './App.css';
import logo from './logo.svg'
import { ethers } from 'ethers'
import { useState } from 'react'
import { FunWallet, FunWalletConfig, Modules, Paymasters } from "@fun-wallet/sdk";
const { EoaAaveWithdrawal, TokenSwap } = Modules;
const { USDCPaymaster, PaymasterSponsorInterface } = Paymasters;

// import { FunWallet, FunWalletConfig, Modules } from "./fun-wallet-dev/sdk/index";

const getBalance = async (wallet) => {
  const balance = await wallet.provider.getBalance(wallet.address);
  return ethers.utils.formatUnits(balance, 18)
}

const transferAmt = async (signer, to, value) => {
  const tx = await signer.sendTransaction({ to, value: ethers.utils.parseEther(value.toString()) })
  await tx.wait()
  console.log(`${await signer.getAddress()} == ${value} => ${to}`)
}
function App() {
  const HARDHAT_FORK_CHAIN_ID = 31337
  const RPC_URL = "http://127.0.0.1:8545"
  const PRIV_KEY = "0x66f37ee92a08eebb5da72886f3c1280d5d1bd5eb8039f52fdb8062df7e364206"
  const PKEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  const DAI_ADDR = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  const API_KEY = "hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf"
  const USDC_ADDR = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const AVAX_RPC_URL = "https://avalanche-fuji.infura.io/v3/4a1a0a67f6874be6bb6947a62792dab7"
  const AVAX_CHAIN_ID = "43113"
  const USDC_AVAX_ADDR = "0x5425890298aed601595a70AB815c96711a31Bc65"
  const AVAX_RECEIVE_PKEY = '3ef076e7d3d2e1f65ded46b02372d7c5300aec49e780b3bb4418820bf068e732'
  const AMOUNT = 60
  const PREFUND_AMT = 0
  const chainID = "43113"
  const TOKEN_ADDRESS = DAI_ADDR
  const WITHDRAW_AMOUNT = ethers.constants.MaxInt256

  const paymaster = async () =>{

  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        <h3>Try out <a href="https://docs.fun.xyz/">Fun SDK</a> v0.1.2</h3>
        <button onClick={paymaster} className="data-button">
          Mint NFT from Paymaster
        </button>

      </header>
    </div>
  );
}

export default App;
