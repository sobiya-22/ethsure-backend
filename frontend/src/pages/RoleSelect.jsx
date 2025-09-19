import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
// import { useWalletAddress } from "@/hooks/useWalletAddress";
// import { useWeb3AuthUser } from "@web3auth/modal/react";
import {
  registerCustomer,
  getCustomer,
} from "@/services/customerAPI";
import {
  registerAgent,
  getAgent,
} from "@/services/agentAPI";

// ✅ Helper function to redirect based on role & KYC/Approval
const redirectToDashboard = (roleType, data, navigate) => {
  switch (roleType) {
    case "customer":
      if (data.kyc_status === "verified") {
        navigate("/customer-dashboard");
      } else {
        navigate("/customer-kyc");
      }
      break;

    case "agent":
      if (data.is_approved !== "verified") {
        navigate("/agent-kyc");
      } else {
        navigate("/agent-dashboard"); 
      }
      break;

    case "admin":
      navigate("/admin-dashboard");
      break;

    default:
      console.warn("Unknown role type:", roleType);
  }
};

const RoleSelect = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const { walletAddress } = useWalletAddress();
  const { userInfo } = useWeb3AuthUser();

  // Check if customer or agent already exists
  useEffect(() => {
    if (!walletAddress) {
      console.warn("⚠️ Wallet address is null, skipping API call");
      return;
    }
  
    console.log("✅ Using walletAddress:", walletAddress);

    const fetchUser = async () => {
      try {
        const customerRes = await getCustomer(walletAddress);
        if (customerRes.data?.data) {
          setUserData((prev) => ({ ...prev, customer: customerRes.data.data }));
          redirectToDashboard("customer", customerRes.data.data, navigate);
          return;
        }
      } catch (_) {}

      try {
        const agentRes = await getAgent(walletAddress);
        if (agentRes.data?.data) {
          setUserData((prev) => ({ ...prev, agent: agentRes.data.data }));
          redirectToDashboard("agent", agentRes.data.data, navigate);
        }
      } catch (_) {}
    };

    fetchUser();
  }, [walletAddress, navigate]);

  const handleConfirm = async () => {
    if (!selectedRole || !walletAddress) return;

    setLoading(true);
    const email = userInfo?.email || "temp@example.com";
    const name = userInfo?.name || userInfo?.email || "User";

    try {
      if (selectedRole === "customer") {
        if (!userData.customer) {
          const res = await registerCustomer({ wallet_address: walletAddress, email, name });
          setUserData((prev) => ({ ...prev, customer: res.data.data }));
          redirectToDashboard("customer", res.data.data, navigate);
        } else {
          redirectToDashboard("customer", userData.customer, navigate);
        }
      } else if (selectedRole === "agent") {
        if (!userData.agent) {
          const res = await registerAgent({ wallet_address: walletAddress, email, name });
          setUserData((prev) => ({ ...prev, agent: res.data.data }));
          redirectToDashboard("agent", res.data.data, navigate);
        } else {
          redirectToDashboard("agent", userData.agent, navigate);
        }
      } else if (selectedRole === "admin") {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      console.error("Role selection failed:", err);
      alert("Failed to process role selection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white w-full">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Select Your{" "}
          <span className="bg-gradient-to-r from-blue-400 to-green-600 bg-clip-text text-transparent">
            Role
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Choose your role to continue with the EthSure platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["agent", "customer", "admin"].map((role) => (
            <Card
              key={role}
              className={`bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer ${
                selectedRole === role ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedRole(role)}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  {role === "agent" &&
                    "Assist customers with insurance policies, verify claims, and act as a trusted intermediary."}
                  {role === "customer" &&
                    "Submit insurance claims, track claim status, and receive payouts quickly."}
                  {role === "admin" && "Oversee the entire system, manage users, and ensure compliance."}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Button
            size="lg"
            disabled={!selectedRole || loading || !walletAddress}
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-10 py-4"
          >
            {loading ? "Processing..." : "Continue"}
          </Button>
          {!walletAddress && (
            <p className="text-red-400 text-sm mt-2">
              Wallet connection failed. Please try logging in again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
