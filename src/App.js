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

  const walletTransferERC = async (wallet, to, amount, tokenAddr) => {
    const transfer = new Modules.TokenTransfer()
    await wallet.addModule(transfer)
    const transferActionTx = await transfer.createTransferTx(to, amount, { address: tokenAddr })
    console.log(transferActionTx)
    const receipt = await wallet.deployTx(transferActionTx)
    console.log(receipt)
  }

  const transferTokenAvax = async () => {
    if (window.ethereum.networkVersion !== "43113") {
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
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
      const eoa = provider.getSigner();
      console.log(eoa)
      const config = new FunWalletConfig(eoa, chainID, 0);
      const wallet = new FunWallet(config, API_KEY);
      await wallet.init()
      console.log("Fun wallet address", wallet.address)
      await walletTransferERC(wallet, "0xDc054C4C5052F0F0c28AA8042BB333842160AEA2", "100", USDC_AVAX_ADDR) //1000000 = 1usdc
    }
    catch (e) {
      console.log(e)
      alert("error, check console")
    }
  }
  const transferTokenGoerli = async()=>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
    const eoa = provider.getSigner();
    console.log(eoa)
    const config = new FunWalletConfig(eoa, "5", 0);
    const wallet = new FunWallet(config, API_KEY);
    await wallet.init()
    console.log("Fun wallet address", wallet.address)
    await walletTransferERC(wallet, "0xDc054C4C5052F0F0c28AA8042BB333842160AEA2", "100", "0x07865c6E87B9F70255377e024ace6630C1Eaa37F") //1000000 = 1usdc
  }

  const transferTokenFork = async () => {
    const chainID = "31337"
    const PREFUND_AMT = 0.3

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
    const eoa = provider.getSigner();
    console.log(eoa)

    const config = new FunWalletConfig(eoa, chainID, PREFUND_AMT);
    const wallet = new FunWallet(config, API_KEY);
    await wallet.init()
    console.log("Fun wallet address", wallet.address)
    
    await walletTransferERC(wallet, "0x6B175474E89094C44Da98b954EedeAC495271d0F", "10000", USDC_AVAX_ADDR) //1000000 = 1usdc
  }

  const aaveWithdrawal = async () => {
    // An internal Fun RPC for customer testing
    const rpc = "http://localhost:8545";

    // Note that the key here will be exposed and should never be used in production
    // const provider = new ethers.providers.JsonRpcProvider(rpc);
    // const eoa = new ethers.Wallet(PRIV_KEY, provider);


    // To create an EOA instance with an external wallet (e.g MetaMask) do this instead;
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
    const eoa = provider.getSigner();


    // Create a FunWallet
    const chainID = "31337";
    const prefundAmt = 0.3; // ether
    const API_KEY = "hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf"; // Get your API key from app.fun.xyz/api-key

    const config = new FunWalletConfig(eoa, chainID, prefundAmt);
    const wallet = new FunWallet(config, API_KEY);

    // Gather data asynchronously from onchain resources to get expected wallet data
    await wallet.init();
    const eoaAaveWithdrawalModule = new EoaAaveWithdrawal();
    await wallet.addModule(eoaAaveWithdrawalModule);

    const deployWalletReceipt = await wallet.deploy();
    console.log(deployWalletReceipt)
    // Address of aDAI on mainnet
    const TOKEN_ADDRESSS = "0x028171bCA77440897B824Ca71D1c56caC55b68A3";
    // // Use max int to withdraw the entire deposit
    const WITHDRAW_AMOUNT = ethers.constants.MaxInt256

    const moduleRequiredPreTxs = await eoaAaveWithdrawalModule.getPreExecTxs(TOKEN_ADDRESSS, WITHDRAW_AMOUNT);
    console.log(moduleRequiredPreTxs)
    const reqPreTxReceipt = await wallet.deployTxs(moduleRequiredPreTxs);
    console.log(reqPreTxReceipt)

    const aaveWithdrawTx = await eoaAaveWithdrawalModule.createWithdrawTx(TOKEN_ADDRESSS, await wallet.eoa.getAddress(), WITHDRAW_AMOUNT)
    console.log(aaveWithdrawTx)

    const aaveWithdrawalReceipt = await wallet.deployTx(aaveWithdrawTx);
    console.log(aaveWithdrawalReceipt)
  }

  const aaveWithdrawalGoerli = async () => {
    // An internal Fun RPC for customer testing
    const rpc = "https://goerli.infura.io/v3/4a1a0a67f6874be6bb6947a62792dab7";

    // Note that the key here will be exposed and should never be used in production
    // const provider = new ethers.providers.JsonRpcProvider(rpc);
    // const eoa = new ethers.Wallet(PRIV_KEY, provider);


    // To create an EOA instance with an external wallet (e.g MetaMask) do this instead;
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
    const eoa = provider.getSigner();


    // Create a FunWallet
    const chainID = "5";
    const prefundAmt = 0.1; // ether
    const API_KEY = "hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf"; // Get your API key from app.fun.xyz/api-key

    const config = new FunWalletConfig(eoa, chainID, prefundAmt);
    const wallet = new FunWallet(config, API_KEY);

    // Gather data asynchronously from onchain resources to get expected wallet data
    await wallet.init();
    const eoaAaveWithdrawalModule = new EoaAaveWithdrawal();
    await wallet.addModule(eoaAaveWithdrawalModule);

    const deployWalletReceipt = await wallet.deploy();
    console.log(deployWalletReceipt)
    // Address of ausdc on goerli
    const TOKEN_ADDRESSS = "0x935c0F6019b05C787573B5e6176681282A3f3E05";
    // // Use max int to withdraw the entire deposit
    const WITHDRAW_AMOUNT = ethers.constants.MaxInt256

    const moduleRequiredPreTxs = await eoaAaveWithdrawalModule.getPreExecTxs(TOKEN_ADDRESSS, WITHDRAW_AMOUNT);
    console.log(moduleRequiredPreTxs)
    const reqPreTxReceipt = await wallet.deployTxs(moduleRequiredPreTxs);
    console.log(reqPreTxReceipt)

    const aaveWithdrawTx = await eoaAaveWithdrawalModule.createWithdrawTx(TOKEN_ADDRESSS, await wallet.eoa.getAddress(), WITHDRAW_AMOUNT)
    console.log(aaveWithdrawTx)

    const aaveWithdrawalReceipt = await wallet.deployTx(aaveWithdrawTx);
    console.log(aaveWithdrawalReceipt)
  }

  const swaps = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
    const eoa = provider.getSigner();

    const chainID = "31337";
    const prefundAmt = 0.3; // ether
    const API_KEY = "hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf"; // Get your API key from app.fun.xyz/api-key

    const config = new FunWalletConfig(eoa, chainID, prefundAmt);
    const wallet = new FunWallet(config, API_KEY);

    // Gather data asynchronously from onchain resources to get expected wallet data
    await wallet.init();

    const tokenSwapModule = new TokenSwap();
    await wallet.addModule(tokenSwapModule);

    const deployWalletReceipt = await wallet.deploy();
    console.log(deployWalletReceipt)

    const tokenIn = { type: 0, symbol: "weth", chainId: chainID }
    const tokenOut = { type: 1, address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" }

    // This particular transaction has a 5% slippage limit (specified by the parameters 5 & 100)
    const swapTx = await tokenSwapModule.createSwapTx(tokenIn, tokenOut, 60, wallet.address, 5, 100)
    const aaveWithdrawalReceipt = await wallet.deployTx(swapTx);
    console.log(aaveWithdrawalReceipt)

  }
  const paymaster = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
    const eoa = provider.getSigner();

    const chainID = "31337";
    const prefundAmt = 0.3; // ether
    const API_KEY = "hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf"; // Get your API key from app.fun.xyz/api-key

    // const paymaster = new USDCPaymaster(paymasterAddress, sponsorAddress)
    // const config = new FunWalletConfig(eoa, chainID, prefundAmt, "", paymaster);
    // const wallet = new FunWallet(config, API_KEY);

    // // Gather data asynchronously from onchain resources to get expected wallet data
    // await wallet.init();

    // const paymasterInterface = new PaymasterSponsorInterface(eoa)
    // await paymasterInterface.init()

    // // 5. Add a Eth or Native Token Deposit Into Your Sponsor Account

    // await paymasterInterface.addEthDepositForSponsor(value, eoa.address)
    // await paymasterInterface.lockTokenDeposit()

    // // 6. Allow Users to Use Your Sponsor Account

    // await paymasterInterface.setWhitelistMode(true)

    // const postBalance = await paymasterInterface.getEthDepositInfoForSponsor(eoa.address)
    // console.log("paymasterBalance: ", postBalance.toString())

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
        <h3>Try out <a href="https://docs.fun.xyz/">Fun SDK</a> v0.1.2</h3>
        <button onClick={transferTokenAvax} className="data-button">
          Run Transfer Token Test on Avalanche Fuji
        </button>
        <button onClick={transferTokenGoerli} className="data-button">
          Run Transfer Token Test on Ethereum Goerli
        </button>
        <button onClick={transferTokenFork} className="data-button">
          Run Transfer Token Test on Fork
        </button>

        <button onClick={aaveWithdrawal} className="data-button">
          Run Aave Withdrawal Test on Fork
        </button>

        <button onClick={aaveWithdrawalGoerli} className="data-button">
          Run Aave Withdrawal Test on Goerli
        </button>

        <button onClick={swaps} className="data-button">
          Run Swap Test on Fork
        </button>

        <button onClick={paymaster} className="data-button">
          Run Paymaster Test on Fork
        </button>

      </header>
    </div>
  );
}

export default App;
