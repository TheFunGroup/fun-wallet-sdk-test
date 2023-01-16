import './App.css';
import logo from './logo.svg'
import { ethers } from 'ethers'
import { useState } from 'react'
import { FunWallet, AAVEWithdrawal, AccessControlSchema } from "@fun-wallet-dev/sdk"


const rpcURL = "https://avalanche-fuji.infura.io/v3/4a1a0a67f6874be6bb6947a62792dab7"
const chainID = '43113' // Fuji testnet ChainID
const prefundAmt = 0.3

function App() {
  const [aTokenAddress, setATokenAddress] = useState("0xC42f40B7E22bcca66B3EE22F3ACb86d24C997CC2") // Avalanche Fuji AAVE Dai
  const [pkey, setPkey] = useState("") // avax-fuji
  const [walletType, setWalletType] = useState(false)

  const handleClick = async () => {

    // Create an EOA instance
    let eoa;
    if (walletType) { // with metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
      eoa = provider.getSigner();
    }
    else { // with privateKey
      const provider = new ethers.providers.JsonRpcProvider(rpcURL)
      eoa = new ethers.Wallet(pkey, provider)
    }

    // Create an access control schema with one action: withdraw a user's funds from Aave
    const schema = new AccessControlSchema()
    const withdrawEntirePosition = schema.addAction(AAVEWithdrawal(aTokenAddress))

    // Create a FunWallet with the above access control schema, prefunded with prefundAmt AVAX
    const wallet = new FunWallet(eoa, schema, prefundAmt, chainID)

    // Deploy the FunWallet
    const walletDeployReceipt = await wallet.deploy()
    console.log("Creation Succesful:\n", walletDeployReceipt)

    // Create a tx that exits an EOA's Aave poisition to be called at a later point
    const aaveActionTx = await wallet.createActionTx(withdrawEntirePosition)

    // Create & deploy a tx that gives the FunWallet authorization to close the EOA's Aave position
    const tokenApprovalReceipt = await wallet.deployTokenApproval(aTokenAddress)
    console.log("Approval Succesful:\n", tokenApprovalReceipt)

    // After some time, deploy the Aave withdrawal action
    const aaveWithdrawalReceipt = await FunWallet.deployActionTx(aaveActionTx)
    console.log("Execution Succesful:\n", aaveWithdrawalReceipt)

  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <label>Click to switch</label>
          <button className="data-button" onClick={() => { setWalletType(!walletType) }}>{walletType ? "Using Metamask" : "Using Private Key"}</button>
        </div>
        {!walletType &&
          <input placeholder='Enter Private Key. KEYS ARE NOT STORED OR SAVED' value={pkey} onChange={({ target }) => { setPkey(target.value) }} className="data-input" />
        }
        <label>AToken Address: Default AaveDai</label>
        <input value={aTokenAddress} onChange={({ target }) => { setATokenAddress(target.value) }} className="data-input" />
        <button onClick={handleClick} className="data-button">
          Run Test
        </button>
      </header>
    </div>
  );
}

export default App;
