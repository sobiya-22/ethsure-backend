import { expect } from "chai";
import  {ethers} from "hardhat";

describe("AgentRegistry", function () {
  let deployer,registry, company, agent;

  beforeEach(async function () {
    [deployer, company, agent] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("AgentRegistry");
    registry = await Registry.deploy();
  });

  it("should register a company", async function () {
    await registry.connect(company).registerCompany("did:ethr:company1");
    expect(await registry.companyOwner("did:ethr:company1")).to.equal(company.address);
  });

  it("should register an agent under a company", async function () {
    await registry.connect(company).registerCompany("did:ethr:company1");

    const vcHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("VC123"));
    await registry.connect(company).registerAgent("did:ethr:company1", "did:ethr:agent1", vcHash);

    expect(await registry.getAgentCompany("did:ethr:agent1")).to.equal("did:ethr:company1");
    expect(await registry.agentVcHash("did:ethr:agent1")).to.equal(vcHash);
  });
});
