import pinataSDK from "@pinata/sdk";
import crypto from "crypto";

const PINATA_API_KEY = 'c69ce1d0960d326b09df'
const PINATA_API_SECRET = 'd9341f8615213c38628133cca2c74468c9de63e3230e0a5a5d2949de77c0d60b'
const PINATA_GROUP_ID = '2ee967b9-578f-42d7-8e3a-282fd4e50b46'
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);


export function createAgentVC({ 
    agentDid,
    companyDid,
    name,
    licenseNumber
}) {
    return {
        type: "AgentCredential",
        agentDid,
        companyDid,
        name,
        licenseNumber,
        issuer: companyDid,
        issuedAt: new Date().toISOString()
    };
}


export function createPolicyVC({
    policyId,
    customerDid,
    customerWallet,
    coverageAmount,
    premiumAmount,
    durationYears,
    status = "active",
    companyDid
}) {
    return {
        type: "PolicyCredential",
        policyId,
        customerDid,
        customerWallet,
        coverageAmount,
        premiumAmount,
        durationYears,
        status,
        issuer: companyDid,
        issuedAt: new Date().toISOString()
    };
}

export function hashVC(vc) {
    return "0x" + crypto
        .createHash("sha256")
        .update(JSON.stringify(vc))
        .digest("hex");
}

export async function uploadVCtoIPFS(vc) {
    try {
        const result = await pinata.pinJSONToIPFS(vc, {
        pinataMetadata: {
            name: options.name || "vc-credential",
            keyvalues: options.keyvalues || {}
        },
        pinataOptions: {
            cidVersion: options.cidVersion || 1
        },
        group: PINATA_GROUP_ID 
        });
        return result.IpfsHash;
    } catch (error) {
        console.error("Pinata upload error:", error);
        throw error;
    }
}


export async function issueAgentVC(data) {
    const vc = createAgentVC(data);
    const hash = hashVC(vc);
    const cid = await uploadVCtoIPFS(vc,{
        name: `AgentVC-${data.name}-${data.licenseNumber}`,
        keyvalues: {
            type: "AgentCredential",
            issuer: data.companyDid
        },
    });

    return {
        vc,
        hash,
        cid
    };
}

export async function issuePolicyVC(data) {
    const vc = createPolicyVC(data);
    const hash = hashVC(vc);
    const cid = await uploadVCtoIPFS(vc,{
        name: `PolicyVC-${data.policyId}`,
        keyvalues: {
            type: "PolicyCredential",
            issuer: data.companyDid
        },
    });

    return {
        vc,
        hash,
        cid
    };
}


