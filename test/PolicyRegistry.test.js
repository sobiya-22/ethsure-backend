import { expect } from "chai";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

// Fix dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read ABI JSON manually
const PolicyJson = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../artifacts/contracts/PolicyRegistry.sol/PolicyRegistry.json"),
        "utf8"
    )
);

const PolicyABI = PolicyJson.abi;

describe("PolicyRegistry - Sepolia Deployment", function () {

    this.timeout(60000);

    const provider = new ethers.providers.JsonRpcProvider(
        process.env.SEPOLIA_RPC
    );

    const deployer = new ethers.Wallet("db395bd00102c8e9af7f495735656b36db8026d25a408628cc98c7be16c78161", provider);
    const companySigner = new ethers.Wallet('eb89a7787f29c6e07b292ec63b3ad2bee6f9c98ac0aa837b916b7d8e63ca5a52', provider);
    const customer1 = new ethers.Wallet("caae7841d2f56ecd8c9edcea5199b00773c5a16ecf58e0b4d63536c4693819a7", provider);
    const customer2 = new ethers.Wallet("75e93aad7e994de2af7e930ffa27309032d798efdcc4ce6e156c4bbad707ebe7", provider);

    let registry;

    const registryAddress = process.env.POLICY_REGISTRY_CONTRACT_ADDRESS;

    before(async function () {
        registry = new ethers.Contract(registryAddress, PolicyABI, companySigner);
    });

    it("should create a policy", async function () {
        const vcHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("POLICY_VC_123"));
        const customerDid = "did:ethr:customer1";

        const tx = await registry.createPolicy(customer1.address, customerDid, vcHash);
        const receipt = await tx.wait();

        const iface = new ethers.utils.Interface(PolicyABI);

        let event;
        for (const log of receipt.logs) {
            try {
                const parsed = iface.parseLog(log);
                if (parsed.name === "PolicyCreated") {
                    event = parsed;
                    break;
                }
            } catch (e) { }
        }

        if (!event) throw new Error("Event not found");
        const policyId = Number(event.args.policyId);

        if (!event) throw new Error("PolicyCreated event not found");

        const storedCustomer = await registry.policyCustomer(policyId);
        expect(storedCustomer).to.equal(customer1.address);
    });

    it("should allow customer to claim their policy", async function () {
        const vcHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("POLICY_VC_ABC"));
        const customerDid = "did:ethr:customer2";

        // Create a policy for customer2
        const tx = await registry.createPolicy(customer2.address, customerDid, vcHash);
        const receipt = await tx.wait();
        const iface = new ethers.utils.Interface(PolicyABI);

        let event;
        for (const log of receipt.logs) {
            try {
                const parsed = iface.parseLog(log);
                if (parsed.name === "PolicyCreated") {
                    event = parsed;
                    break;
                }
            } catch (e) { }
        }

        if (!event) throw new Error("Event not found");
        const policyId = Number(event.args.policyId);


        // Connect contract with customer2 signer
        const customerRegistry = registry.connect(customer2);

        const tx2 = await customerRegistry.claimPolicy(policyId);
        await tx2.wait();

        const isActive = await registry.policyActive(policyId);
        expect(isActive).to.equal(false);
    });

    it("should update VC hash", async function () {
        const vcHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("VC_TEST"));
        const customerDid = "did:ethr:testUser";

        const tx = await registry.createPolicy(customer1.address, customerDid, vcHash);
        const receipt = await tx.wait();
        const iface = new ethers.utils.Interface(PolicyABI);

        let event;
        for (const log of receipt.logs) {
            try {
                const parsed = iface.parseLog(log);
                if (parsed.name === "PolicyCreated") {
                    event = parsed;
                    break;
                }
            } catch (e) { }
        }

        if (!event) throw new Error("Event not found");
        const policyId = Number(event.args.policyId);


        const newHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("VC_UPDATED"));

        // customer updates VC
        const customerRegistry = registry.connect(customer1);
        const tx2 = await customerRegistry.updateVcHash(policyId, newHash);
        await tx2.wait();

        const storedHash = await registry.policyVcHash(policyId);
        expect(storedHash).to.equal(newHash);
    });

});
