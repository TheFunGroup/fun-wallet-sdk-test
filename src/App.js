import './App.css';
import logo from './logo.svg'
import { ethers } from 'ethers'
import { useState } from 'react'
import { FunWallet, FunWalletConfig, Modules } from "@fun-wallet/sdk";
import { EoaAaveWithdrawal } from '@fun-wallet/sdk/src/modules';
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

  const walletTransferERC = async (wallet, to, amount, tokenAddr) => {
    const transfer = new Modules.TokenTransfer()
    await wallet.addModule(transfer)
    const transferActionTx = await transfer.createTransferTx(to, amount, { address: tokenAddr })
    const receipt = await wallet.deployTx(transferActionTx)
    console.log(receipt)

  }

  const transferToken = async () => {
    if (window.ethereum.networkVersion !== "43113") {
      console.log('hi')
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexlify(43113) }]
        });
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Avalanche Fuji',
                chainId: ethers.utils.hexlify(43113),
                nativeCurrency: { name: 'AVAX', decimals: 18, symbol: 'AVAX' },
                rpcUrls: [AVAX_RPC_URL]
              }
            ]
          });
        }
      }
    }
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
      const eoa = provider.getSigner();
  
      const config = new FunWalletConfig(eoa, chainID, PREFUND_AMT);
      console.log("config111111", config)
      console.log(await config.getChainInfo())
      const wallet = new FunWallet(config, API_KEY);
      await wallet.init()
      console.log(wallet.address)
      await walletTransferERC(wallet, "0xDc054C4C5052F0F0c28AA8042BB333842160AEA2", "100", USDC_AVAX_ADDR) //1000000 = 1usdc
    }
    catch(e){
      console.log(e)
      alert("error, check console")
    }
    
  }

  //outdated stuff
  const [aTokenAddress, setATokenAddress] = useState("0xC42f40B7E22bcca66B3EE22F3ACb86d24C997CC2") // Avalanche Fuji AAVE Dai
  const [pkey, setPkey] = useState("") // avax-fuji
  const [walletType, setWalletType] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <div>
          <label>Click to switch</label>
          <button className="data-button" onClick={() => { setWalletType(!walletType) }}>{walletType ? "Using Metamask" : "Using Private Key"}</button>
        </div> */}
        {/* {!walletType &&
          <input placeholder='Enter Private Key. KEYS ARE NOT STORED OR SAVED' value={pkey} onChange={({ target }) => { setPkey(target.value) }} className="data-input" />
        } */}
        {/* <label>AToken Address: Default AaveDai</label> */}
        {/* <input value={aTokenAddress} onChange={({ target }) => { setATokenAddress(target.value) }} className="data-input" /> */}
        
        <button onClick={transferToken} className="data-button">
          Run Test
        </button>
        
        <button onClick={EoaAaveWithdrawal} className="data-button">
          Run Test
        </button>

      </header>
    </div>
  );
}

export default App;
