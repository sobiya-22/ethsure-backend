// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PolicyRegistry {
    address public immutable companyAddress;

    constructor(address _companyAddress) {
        require(_companyAddress != address(0), "Invalid company address");
        companyAddress = _companyAddress;
    }

    // policyId => customer wallet address
    mapping(uint256 => address) public policyCustomer;

    // policyId => customer DID
    mapping(uint256 => string) public policyCustomerDID;

    // policyId => VC Hash (sha256 or IPFS hash hashed to bytes32)
    mapping(uint256 => bytes32) public policyVcHash;

    // policyId => status (true = active, false = claimed)
    mapping(uint256 => bool) public policyActive;

    uint256 public nextPolicyId = 1;

    event PolicyCreated(
        uint256 policyId,
        address customer,
        string customerDid,
        bytes32 vcHash
    );

    event PolicyClaimed(
        uint256 policyId,
        address customer
    );

    event PolicyUpdated(
        uint256 policyId,
        bytes32 newVcHash
    );

    /// @notice Create a new policy (any sender can create)
    function createPolicy(
        address customer,
        string calldata customerDid,
        bytes32 vcHash
    ) external returns (uint256) {
        require(customer != address(0), "Invalid customer");

        uint256 pid = nextPolicyId++;

        policyCustomer[pid] = customer;
        policyCustomerDID[pid] = customerDid;
        policyVcHash[pid] = vcHash;
        policyActive[pid] = true;

        emit PolicyCreated(pid, customer, customerDid, vcHash);

        return pid;
    }

    function claimPolicy(uint256 policyId) external {
        require(policyCustomer[policyId] != address(0), "Policy not found");
        require(msg.sender == companyAddress, "Only company can approve claim");
        require(policyActive[policyId], "Already claimed");

        policyActive[policyId] = false;

        emit PolicyClaimed(policyId, policyCustomer[policyId]);
    }

    /// @notice Update only the VC hash for a policy
    function updateVcHash(uint256 policyId, bytes32 newVcHash) external {
        require(policyCustomer[policyId] != address(0), "Policy not found");
        require(msg.sender == policyCustomer[policyId], "Not policy owner");

        policyVcHash[policyId] = newVcHash;

        emit PolicyUpdated(policyId, newVcHash);
    }

    /// @notice Get a policy's complete data
    function getPolicy(uint256 policyId)
        external
        view
        returns (
            address customer,
            string memory customerDid,
            bytes32 vcHash,
            bool isActive
        )
    {
        require(policyCustomer[policyId] != address(0), "Policy not found");

        return (
            policyCustomer[policyId],
            policyCustomerDID[policyId],
            policyVcHash[policyId],
            policyActive[policyId]
        );
    }
}