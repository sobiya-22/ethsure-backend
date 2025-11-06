import { registerCompanyOnChain } from "../blockchain/agentRegistry.js";

const COMPANY_DID = `did:ethr:0x1:0x87D757Fc89779c8aca68Dd9655dE948F4D17f0cf`

await registerCompanyOnChain(COMPANY_DID);