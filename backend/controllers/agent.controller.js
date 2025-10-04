// try {
//     const txHash = await registerAgentOnChain(company_did, agent.agent_did, vc_hash);
//     console.log("Agent registered on-chain:", txHash);

//     return res.status(200).json({
//       success: true,
//       message: "KYC completed and agent registered on blockchain",
//       user: agent,
//       txHash,
//     });
//   } catch (err) {
//     console.error("Blockchain registration failed:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "KYC saved but blockchain registration failed",
//       error: err.message,
//     });
//   }

// make changes and additions below ---above file remains as it is 