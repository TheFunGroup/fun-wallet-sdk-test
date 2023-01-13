import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers'
import { FunWallet, AAVEWithdrawal, AccessControlSchema } from "@fun-wallet/sdk"
const rpc = "https://avalanche-fuji.infura.io/v3/4a1a0a67f6874be6bb6947a62792dab7"
// const aTokenAddress = "0xC42f40B7E22bcca66B3EE22F3ACb86d24C997CC2" // Avalanche Fuji AAVE Dai


function App() {
  const handleClick = async () => {

    // Create an EOA instance with ethers

    // With metamask

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
    const eoa = provider.getSigner();

    // With privateKey

    // const privKey = "c5ff68eee74d447b88d5d0dd1d438b37f30a4c0b1e41e9c485c6e2ea282d1489"
    // const provider = new ethers.providers.JsonRpcProvider(rpc)
    // const eoa = new ethers.Wallet(privKey, provider)

    const aTokenAddress = "0xC42f40B7E22bcca66B3EE22F3ACb86d24C997CC2" // Avalanche Fuji AAVE Dai

    const schema = new AccessControlSchema()

    // Add the withdraw from aave action to the FunWallet
    const withdrawEntirePosition = schema.addAction(AAVEWithdrawal(aTokenAddress))


    // Create a new FunWallet instance, 
    const prefundAmt = 0 // eth
    const chain = '43113'
    // Initialize the FunWallet instance, initially funded with 0.3 AVAX to cover gas fees
    const wallet = await schema.createFunWallet(eoa, prefundAmt, chain)

    const createWalletReceipt = await wallet.initializeWallet()
    console.log("Creation Succesful:\n", createWalletReceipt)

    const executionOp = await wallet.createExecutionOp(withdrawEntirePosition)

    /* 
    Deploy a transaction approving the FunWallet to move the aave tokens from the EOA to the
    Aave smart contract.
    */

    const approveReceipt = await wallet.sendTokenApprovalTx(aTokenAddress)
    console.log("Approval Succesful:\n", approveReceipt)

    // // After some time, execute the Aave withdrawal action

    const executionReceipt = await FunWallet.sendOpToBundler(executionOp, chain)
    console.log("Execution Succesful:\n", executionReceipt)

  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <button onClick={handleClick}>
          test
        </button>
      </header>
    </div>
  );
}

export default App;
