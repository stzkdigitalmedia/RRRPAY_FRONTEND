import { useState, useEffect } from "react";
import { Menu, X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { apiHelper } from "../utils/apiHelper";
import { useTranslation } from "react-i18next";
import CreateTransactionModal from "./modals/CreateTransactionModal";

const Header = () => {
	const { user } = useAuth(true);
	const { t } = useTranslation();
	const [showCreateTransaction, setShowCreateTransaction] = useState(false);
	const [transactionForm, setTransactionForm] = useState({
		amount: "",
		transactionType: "Deposit",
	});
	const [transactionProcessing, setTransactionProcessing] = useState(false);
	const [userBalance, setUserBalance] = useState(0);
	const [savedBanks, setSavedBanks] = useState([]);
	const [selectedBranch, setSelectedBranch] = useState("");

	const [selectedBankId, setSelectedBankId] = useState("");
	const [banksLoading, setBanksLoading] = useState(false);
	const [showAddBankModal, setShowAddBankModal] = useState(false);

	const fetchUserBalance = async () => {
		try {
			if (!user?._id) {
				return;
			}
			const response = await apiHelper.get(
				`/transaction/get_MainUserBalance/${user._id}`,
			);
			if (response?.success) {
				setUserBalance(response?.data?.balance || 0);
			}
		} catch (error) {
			console.error("Error fetching balance:", error);
		}
	};

	const fetchSavedBanks = async () => {
		setBanksLoading(true);
		try {
			const response = await apiHelper.get("/user/getSavedBanks");
			if (response?.success) {
				setSavedBanks(response?.data || []);
			}
		} catch (error) {
			console.error("Error fetching banks:", error);
		} finally {
			setBanksLoading(false);
		}
	};

	const handleCreateTransaction = async (e) => {
		e.preventDefault();

		// Validate payment method selection for Deposit transactions
		if (
			transactionForm?.transactionType === "Deposit" &&
			user?.teirId?.branches &&
			user.teirId.branches.length > 0 &&
			!selectedBranch
		) {
			toast.error("Please select a payment method");
			return;
		}

		setTransactionProcessing(true);

		try {
			const userId = user?._id;
			if (!userId) {
				toast.error("User not found");
				setTransactionProcessing(false);
				return;
			}

			// Check if RRRPAY is selected for Deposit - use manual transaction API
			if (
				transactionForm?.transactionType === "Deposit" &&
				selectedBranch === "RRRPAY"
			) {
				const manualPayload = {
					userId: userId,
					amount: parseFloat(transactionForm?.amount),
					transactionType: "Deposit",
					role: "User",
					mode: "RRRPAY",
					utrNo: transactionForm?.utrNo || "",
					userScreenShot: transactionForm?.userScreenShot || "",
				};

				await apiHelper.post(
					"/transaction/create_Manual_Transaction_For_MainUser",
					manualPayload,
				);
				toast.success("Transaction request submitted successfully!");
				setShowCreateTransaction(false);
				setTransactionForm({
					amount: "",
					transactionType: "Deposit",
					utrNo: "",
					userScreenShot: "",
				});
				setSelectedBankId("");
				fetchUserBalance();
				return;
			}

			// Check if it's a withdrawal with RRRPAY branch selected (peer transaction)
			if (
				transactionForm?.transactionType === "Withdraw" &&
				selectedBranch === "RRRPAY"
			) {
				const selectedBank = savedBanks[parseInt(selectedBankId)];
				if (!selectedBank) {
					toast.error("Please select a bank account for withdrawal");
					setTransactionProcessing(false);
					return;
				}

				const peerPayload = {
					userId: userId,
					// clientName: user?.clientName || '',
					amount: parseFloat(transactionForm?.amount),
					transactionType: "Withdrawal",
					upiId: selectedBank.upiId || "",
					bankName: selectedBank.bankName || "",
					accNo: selectedBank.accNo || "",
					branchUserName: "RRRPAY",
					role: "User",
					mode: "RRRPAY",
					accHolderName: selectedBank.accHolderName || "",
					ifscCode: selectedBank.ifscCode || "",
				};

				await apiHelper.post(
					"/transaction/create_Manual_Transaction_For_MainUser",
					peerPayload,
				);
				toast.success("Withdrawal request submitted successfully!");
				setShowCreateTransaction(false);
				setTransactionForm({
					amount: "",
					transactionType: "Deposit",
					utrNo: "",
					userScreenShot: "",
				});
				setSelectedBankId("");
				fetchUserBalance();
				return;
			}

			// For all other cases (non-RRRPAY branches) - use createTransaction API
			let payload = {
				userId: userId,
				amount: parseFloat(transactionForm?.amount),
				transactionType:
					transactionForm?.transactionType === "Withdraw"
						? "Withdrawal"
						: transactionForm?.transactionType,
				role: "User",
				mode: "PowerPay",
				branchUserName: selectedBranch || "drplay",
			};

			// Add bank details for withdraw transactions
			if (transactionForm?.transactionType === "Withdraw") {
				const selectedBank = savedBanks[parseInt(selectedBankId)];
				if (selectedBank) {
					payload = {
						...payload,
						upiId: selectedBank.upiId,
						bankName: selectedBank.bankName,
						accNo: selectedBank.accNo,
						accHolderName: selectedBank.accHolderName,
						ifscCode: selectedBank.ifscCode,
					};
				}
			}

			const response = await apiHelper.post(
				"/transaction/createTransaction",
				payload,
			);

			if (response?.success && response?.data) {
				const transaction = response?.data;

				toast.success("Transaction created successfully!");
				setShowCreateTransaction(false);
				setTransactionForm({
					amount: "",
					transactionType: "Deposit",
					utrNo: "",
					userScreenShot: "",
				});
				setSelectedBankId("");
				fetchUserBalance();

				// Handle different transaction types
				if (transactionForm?.transactionType === "Deposit") {
					// For all non-RRRPAY branches - redirect to powerdreams
					toast.info("Processing payment... Please wait");
					setTimeout(() => {
						window.location.href = `https://www.powerdreams.co/online/pay/${selectedBranch}/${transaction?._id}`;
					}, 2000);
				} else if (transactionForm?.transactionType === "Withdraw") {
					toast.info("Withdrawal request submitted successfully!");
				}

				return;
			}
		} catch (error) {
			console.error("Transaction error:", error);
			toast.error("Failed to create transaction: " + error.message);
		} finally {
			setTransactionProcessing(false);
		}
	};

	const handleDeleteBank = async (bankId) => {
		try {
			const response = await apiHelper.delete(`/user/deleteBank/${bankId}`);
			if (response?.success) {
				toast.success("Bank account deleted successfully");
				fetchSavedBanks();
			}
		} catch (error) {
			toast.error("Failed to delete bank account");
		}
	};

	useEffect(() => {
		if (user?._id) {
			fetchUserBalance();
		}
	}, [user]);

	useEffect(() => {
		if (
			showCreateTransaction &&
			transactionForm?.transactionType === "Withdraw"
		) {
			fetchSavedBanks();
		}
	}, [showCreateTransaction, transactionForm?.transactionType]);

	return (
		<>
			<header className="fixed top-0 left-0 right-0 max-w-[600px] mx-auto bg-black h-[70px] flex items-center px-4 shadow-md z-50">
				{/* LEFT */}
				<Link to="/profile" className="flex items-center gap-3 cursor-pointer">
					<div className="h-10 w-10 rounded-full bg-[#2b2a28] flex items-center justify-center">
						<span className="text-white text-lg font-bold">
							{(user?.clientName || "U").charAt(0).toUpperCase()}
						</span>
					</div>
					<span className="text-white text-sm">
						Hi{" "}
						{(user?.clientName || "User").charAt(0).toUpperCase() +
							(user?.clientName || "User").slice(1)}
					</span>
				</Link>

				{/* RIGHT */}
				<div className="ml-auto flex items-center gap-3">
					<Link to="/profile" className="text-white">
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>
					</Link>
				</div>
			</header>

			{/* Create Transaction Modal */}
			{showCreateTransaction && (
				<CreateTransactionModal
					isOpen={showCreateTransaction}
					onClose={() => {
						setShowCreateTransaction(false);
						setSelectedBranch(""); // Reset brancmax-w-[769px]						fetchUserBalance();
					}}
					transactionForm={transactionForm}
					onFormChange={setTransactionForm}
					onSubmit={handleCreateTransaction}
					isProcessing={transactionProcessing}
					userBalance={userBalance}
					selectedBranch={selectedBranch}
					onBranchChange={setSelectedBranch}
					user={user}
					savedBanks={savedBanks}
					selectedBankId={selectedBankId}
					onBankIdChange={setSelectedBankId}
					banksLoading={banksLoading}
					onDeleteBank={handleDeleteBank}
					onAddBankClick={() => setShowAddBankModal(true)}
					fetchUserBalance={fetchUserBalance}
					// fetchBanks={fetchBanks}
				/>
			)}
		</>
	);
};

export default Header;
