import { expect } from "chai";
import { ethers } from "ethers";

const AgentABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "agentDid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "companyDid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "vcHash",
        "type": "bytes32"
      }
    ],
    "name": "AgentRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "agentDid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "companyDid",
        "type": "string"
      }
    ],
    "name": "AgentRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "companyDid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "CompanyRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "agentToCompany",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "agentVcHash",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "companyOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "agentDid",
        "type": "string"
      }
    ],
    "name": "getAgentCompany",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "companyDid",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "agentDid",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "vcHash",
        "type": "bytes32"
      }
    ],
    "name": "registerAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "companyDid",
        "type": "string"
      }
    ],
    "name": "registerCompany",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "agentDid",
        "type": "string"
      }
    ],
    "name": "revokeAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


describe("AgentRegistry - Sepolia Deployment", function () {

  this.timeout(60000);
  const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/5cb89a6d2e2c4340b5cf62694bde378f');

  const deployerSigner = new ethers.Wallet('db395bd00102c8e9af7f495735656b36db8026d25a408628cc98c7be16c78161', provider);//lawyer 
  const companySigner = new ethers.Wallet('eb89a7787f29c6e07b292ec63b3ad2bee6f9c98ac0aa837b916b7d8e63ca5a52', provider);
  const agentSigner = new ethers.Wallet('0d82afa300b4b7c4154cd4e65c759378e86e33a2d0ac4ebd730ca621022b6eca', provider); //judge 
  //Connect to existing contract 
  const registryAddress = '0xb415fd3e8e7a53056c6506a7b729951a9fe7a756';
  let registry;

  before(async function () {
    registry = new ethers.Contract(
      registryAddress,
      AgentABI,
      companySigner // transactions will be sent from company wallet
    );
  });

  it("should register a company", async function () {
    const companyDid = "did:ethr:company1";

    // Check if company is already registered
    let owner = await registry.companyOwner(companyDid);
    if (owner === ethers.constants.ZeroAddress) {
      const tx = await registry.registerCompany(companyDid);
      await tx.wait();
      owner = await registry.companyOwner(companyDid); // update owner after registration
    }

    // Assert the owner
    expect(owner).to.equal(companySigner.address);
  });


  it("should register an agent under a company", async function () {
    const companyDid = "did:ethr:company1";
    const agentDid = "did:ethr:agent1";
    const vcHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("VC123"));

    // Ensure company is registered
    const owner = await registry.companyOwner(companyDid);
    if (owner === ethers.constants.AddressZero) {
      const txCompany = await registry.registerCompany(companyDid);
      await txCompany.wait();
    }

    // Register agent
    const txAgent = await registry.registerAgent(companyDid, agentDid, vcHash);
    await txAgent.wait();

    const agentCompany = await registry.getAgentCompany(agentDid);
    const agentVc = await registry.agentVcHash(agentDid);

    expect(agentCompany).to.equal(companyDid);
    expect(agentVc).to.equal(vcHash);
  });
});
