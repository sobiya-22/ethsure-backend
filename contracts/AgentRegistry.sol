// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgentRegistry {
    // Company DID -> owner address
    mapping(string => address) public companyOwner;

    // Agent DID -> Company DID
    mapping(string => string) public agentToCompany;

    // Agent DID -> VC Hash (keccak256 of VC or IPFS CID)
    mapping(string => bytes32) public agentVcHash;

    event CompanyRegistered(string companyDid, address owner);
    event AgentRegistered(string agentDid, string companyDid, bytes32 vcHash);
    event AgentRevoked(string agentDid, string companyDid);

    /// @notice Register a company DID to msg.sender
    function registerCompany(string calldata companyDid) external {
        require(companyOwner[companyDid] == address(0), "Company already registered");
        companyOwner[companyDid] = msg.sender;
        emit CompanyRegistered(companyDid, msg.sender);
    }

    /// @notice Register an agent DID under a company
    function registerAgent(
        string calldata companyDid,
        string calldata agentDid,
        bytes32 vcHash
    ) external {
        require(companyOwner[companyDid] != address(0), "Company not registered");
        require(companyOwner[companyDid] == msg.sender, "Not company owner");

        agentToCompany[agentDid] = companyDid;
        agentVcHash[agentDid] = vcHash;

        emit AgentRegistered(agentDid, companyDid, vcHash);
    }

    /// @notice Revoke an agent
    function revokeAgent(string calldata agentDid) external {
        string memory companyDid = agentToCompany[agentDid];
        require(bytes(companyDid).length > 0, "Agent not registered");
        require(companyOwner[companyDid] == msg.sender, "Not company owner");

        delete agentToCompany[agentDid];
        delete agentVcHash[agentDid];

        emit AgentRevoked(agentDid, companyDid);
    }

    /// @notice Get the company DID of an agent
    function getAgentCompany(string calldata agentDid) external view returns (string memory) {
        return agentToCompany[agentDid];
    }
}
