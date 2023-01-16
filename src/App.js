import logo from './logo.svg';

import './App.css';
import { ethers } from 'ethers'
import { FunWallet, AAVEWithdrawal, AccessControlSchema } from "@fun-wallet-dev/sdk"
import { useEffect, useState } from 'react';
const rpc = "https://avalanche-fuji.infura.io/v3/4a1a0a67f6874be6bb6947a62792dab7"


function App() {
  const [aTokenAddress, setATokenAddress] = useState("0xC42f40B7E22bcca66B3EE22F3ACb86d24C997CC2") // Avalanche Fuji AAVE Dai
  const [pkey, setPkey] = useState("") // avax-fuji
  const [walletType, setWalletType] = useState(false)

  // useEffect(() => {
  //   if (pkey) {

  //   }
  // }, [pkey])
  const handleClick = async () => {

    // Create an EOA instance with ethers

    // With metamask
    let eoa;

    if (walletType) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
      eoa = provider.getSigner();
    }
    else {

      // With privateKey
      const provider = new ethers.providers.JsonRpcProvider(rpc)
      eoa = new ethers.Wallet(pkey, provider)
    }


    const schema = new AccessControlSchema()

    const withdrawEntirePosition = schema.addAction(AAVEWithdrawal(aTokenAddress))
    // Add the withdraw from aave action to the FunWallet



    // Create a new FunWallet instance, 
    const prefundAmt = 0 // eth
    const chain = '43113'
    // Initialize the FunWallet instance, initially funded with 0.3 AVAX to cover gas fees
    const wallet = new FunWallet(eoa, schema, prefundAmt, chain)

    const createWalletReceipt = await wallet.deploy()
    console.log("Creation Succesful:\n", createWalletReceipt)


    const aaveActionTx = await wallet.createActionTx(withdrawEntirePosition)

    /* 
    Deploy a transaction approving the FunWallet to move the aave tokens from the EOA to the
    Aave smart contract.
    */

    const approveReceipt = await wallet.deployTokenApproval(aTokenAddress)
    console.log("Approval Succesful:\n", approveReceipt)

    // After some time, execute the Aave withdrawal action

    const executionReceipt = await FunWallet.deployActionTx(aaveActionTx)
    console.log("Execution Succesful:\n", executionReceipt)

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
