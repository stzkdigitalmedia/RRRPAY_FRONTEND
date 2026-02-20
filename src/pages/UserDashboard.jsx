import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiHelper } from "../utils/apiHelper";
import { useToastContext } from "../App";
import PasswordInput from "../components/PasswordInput";
import PhoneInput from "../components/PhoneInput";
import MobileHeader from "../components/MobileHeader";
import {
	Wallet,
	Plus,
	BarChart3,
	Gamepad2,
	X,
	Check,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Copy,
	ArrowUp,
	ArrowDown,
	Link2,
	LinkIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";

// Modal Components
import CreateIdModal from "../components/modals/CreateIdModal";
import WalletModal from "../components/modals/WalletModal";
import CreateTransactionModal from "../components/modals/CreateTransactionModal";
import AddBankModal from "../components/modals/AddBankModal";
import SubUserWithdrawModal from "../components/modals/SubUserWithdrawModal";
import SubUserDepositModal from "../components/modals/SubUserDepositModal";
import ResetPasswordModal from "../components/modals/ResetPasswordModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import AvailableBonuses from "../components/AvailableBonuses";

const UserDashboard = () => {
	const { user, logout } = useAuth(true);
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [showCreateId, setShowCreateId] = useState(false);
	const [games, setGames] = useState([]);
	const [subAccounts, setSubAccounts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [subAccountsLoading, setSubAccountsLoading] = useState(false);
	const [showWallet, setShowWallet] = useState(false);
	const [userTransactions, setUserTransactions] = useState([]);
	const [userBalance, setUserBalance] = useState(0);
	const [transactionsLoading, setTransactionsLoading] = useState(false);
	const [balanceLoading, setBalanceLoading] = useState(false);
	const [showCreateTransaction, setShowCreateTransaction] = useState(false);
	const [transactionProcessing, setTransactionProcessing] = useState(false);
	const [transactionForm, setTransactionForm] = useState({
		amount: "",
		transactionType: "Deposit",
		accountHolderName: "",
		accountNumber: "",
		ifscCode: "",
		bankName: "",
	});
	const [showAddBankModal, setShowAddBankModal] = useState(false);
	const [savedBanks, setSavedBanks] = useState([]);
	const [selectedBankId, setSelectedBankId] = useState("");
	const [banksLoading, setBanksLoading] = useState(false);
	const [bankForm, setBankForm] = useState({
		accountHolderName: "",
		accountNumber: "",
		ifscCode: "",
		bankName: "",
		upiId: "",
	});
	const [showSubUserWithdraw, setShowSubUserWithdraw] = useState(false);
	const [selectedSubUser, setSelectedSubUser] = useState(null);
	const [subUserWithdrawForm, setSubUserWithdrawForm] = useState({
		amount: "",
		selectedBankId: "",
	});
	const [subUserBalance, setSubUserBalance] = useState(0);
	const [subUserBalanceLoading, setSubUserBalanceLoading] = useState(false);
	const [showSubUserDeposit, setShowSubUserDeposit] = useState(false);
	const [subUserDepositForm, setSubUserDepositForm] = useState({
		amount: "",
	});
	const [showBalanceLog, setShowBalanceLog] = useState(false);
	const [balanceLogData, setBalanceLogData] = useState([]);
	const [balanceLogLoading, setBalanceLogLoading] = useState(false);
	const [idCreated, setIdCreated] = useState(false);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [updatedTransactions, setUpdatedTransactions] = useState("");
	const [selectedBranch, setSelectedBranch] = useState("");
	const [showResetPassword, setShowResetPassword] = useState(false);
	const [resetPasswordForm, setResetPasswordForm] = useState({
		newPassword: "",
	});
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalTransactions, setTotalTransactions] = useState(0);
	const [walletFilters, setWalletFilters] = useState({
		status: "",
		transactionType: "",
		minAmount: "",
		maxAmount: "",
	});

	const [accountToDelete, setAccountToDelete] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const [currentSlide, setCurrentSlide] = useState(0);
	const [currentGameSlide, setCurrentGameSlide] = useState(0);
	const [touchStart, setTouchStart] = useState(0);
	const [touchEnd, setTouchEnd] = useState(0);
	const [formData, setFormData] = useState({
		gameId: "",
		clientName: "",
		password: "",
		phone: "",
	});
	const toast = useToastContext();

	// Touch handlers for swipe functionality
	const handleTouchStart = (e) => {
		setTouchStart(e.targetTouches[0].clientX);
	};

	const handleTouchMove = (e) => {
		setTouchEnd(e.targetTouches[0].clientX);
	};

	const handleTouchEnd = () => {
		if (!touchStart || !touchEnd) return;

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > 50;
		const isRightSwipe = distance < -50;

		if (isLeftSwipe) {
			// Swipe left - go to next slide
			const step = window.innerWidth >= 640 ? 2 : 1;
			const maxSlide =
				window.innerWidth >= 640
					? Math.max(0, subAccounts.length - 2)
					: subAccounts.length - 1;
			setCurrentSlide(Math.min(maxSlide, currentSlide + step));
		}

		if (isRightSwipe) {
			// Swipe right - go to previous slide
			const step = window.innerWidth >= 640 ? 2 : 1;
			setCurrentSlide(Math.max(0, currentSlide - step));
		}
	};

	const fetchBanks = async () => {
		setBanksLoading(true);
		try {
			const userId = user?._id;
			if (!userId) return;
			const response = await apiHelper.get(
				`/bank/getAllBanksWithoutPagination/${userId}`,
			);
			const banksList = response?.banks || response?.data || response || [];
			setSavedBanks(banksList);
		} catch (error) {
			console.error("Failed to fetch banks:", error);
			setSavedBanks([]);
		} finally {
			setBanksLoading(false);
		}
	};

	const handleSaveBank = async (e) => {
		e.preventDefault();
		try {
			const userId = user?._id;
			if (!userId) {
				toast.error("User not found");
				return;
			}

			const payload = {
				userId: userId,
				upiId: bankForm.upiId,
				bankName: bankForm.bankName,
				accNo: bankForm.accountNumber,
				accHolderName: bankForm.accountHolderName,
				ifscCode: bankForm.ifscCode,
				isActive: true,
			};

			await apiHelper.post("/bank/addBank", payload);
			toast.success("Bank added successfully!");
			setBankForm({
				accountHolderName: "",
				accountNumber: "",
				ifscCode: "",
				bankName: "",
				upiId: "",
			});
			setShowAddBankModal(false);
			fetchBanks();
		} catch (error) {
			toast.error("Failed to add bank: " + error.message);
		}
	};

	const handleDeleteBank = async (bankId) => {
		try {
			if (!bankId) {
				toast.error("Bank ID not found");
				return;
			}

			if (
				window.confirm("Are you sure you want to delete this bank account?")
			) {
				await apiHelper.delete(`/bank/deleteBank/${bankId}`);
				toast.success("Bank account deleted successfully!");
				fetchBanks();
				setSelectedBankId("");
			}
		} catch (error) {
			toast.error("Failed to delete bank account: " + error.message);
		}
	};

	const createBalanceLog = async (userId) => {
		try {
			await apiHelper.post("/balance/createBalanceLog", { userId });
		} catch (error) {
			console.error("Failed to create balance log:", error);
		}
	};

	const fetchSubUserBalance = async (subAccountId) => {
		setSubUserBalanceLoading(true);
		try {
			const response = await apiHelper.get(
				`/balance/getBalanceLogBySubUserId/${subAccountId}`,
			);
			const logData = response?.data || response || [];
			const latestLog = Array.isArray(logData) ? logData[0] : logData;

			if (latestLog?.status === "Accept") {
				setSubUserBalance(latestLog?.CurrentBalance || 0);
				const payload = {
					amount: latestLog?.CurrentBalance,
					subUserId: subAccountId,
				};
				setSubUserBalanceLoading(false);
			} else {
				// Keep loading if status is pending
				setTimeout(() => fetchSubUserBalance(subAccountId));
			}
		} catch (error) {
			console.error("Failed to fetch sub-user balance:", error);
			setSubUserBalance(0);
			setSubUserBalanceLoading(false);
		}
	};

	const handleSubUserWithdraw = async (e) => {
		e.preventDefault();
		setTransactionProcessing(true);

		try {
			// if (subUserWithdrawForm.selectedBankId === '') {
			//   toast.error('Please select a bank account');
			//   setTransactionProcessing(false);
			//   return;
			// }

			// const selectedBank = savedBanks[parseInt(subUserWithdrawForm.selectedBankId)];
			// if (!selectedBank) {
			//   toast.error('Selected bank not found');
			//   setTransactionProcessing(false);
			//   return;
			// }

			const payload = {
				subUserId: selectedSubUser?.id || selectedSubUser?._id,
				amount: parseFloat(subUserWithdrawForm.amount),
				mode: "Wallet",
				role: "SubUser",
				// upiId: selectedBank.upiId,
				// bankName: selectedBank.bankName,
				// accNo: selectedBank.accNo,
				// accHolderName: selectedBank.accHolderName,
				// ifscCode: selectedBank.ifscCode
			};

			await apiHelper.post(
				"/transaction/withdrawAmountRequest_ForSubUser",
				payload,
			);
			toast.info(
				"Withdrawal request submitted successfully plese check history!",
			);
			setShowSubUserWithdraw(false);
			setSubUserWithdrawForm({ amount: "", selectedBankId: "" });
			setSelectedSubUser(null);
			fetchUserBalance();
		} catch (error) {
			toast.error("Failed to submit withdrawal request: " + error.message);
		} finally {
			setTransactionProcessing(false);
		}
	};

	const checkTransactionStatus = async (subAccountId) => {
		try {
			const response = await apiHelper.get(
				`/transaction/latest-transaction/${subAccountId}`,
			);
			const transaction = response?.data || response;

			if (transaction?.status === "Accept") {
				toast.success("Your transaction successful!");
				setTransactionProcessing(false);
				setShowSubUserDeposit(false);
				setSubUserDepositForm({ amount: "" });
				setSelectedSubUser(null);
				fetchUserBalance();
			} else {
				setTimeout(() => checkTransactionStatus(subAccountId), 1000);
			}
		} catch (error) {
			console.error("Failed to check transaction status:", error);
			setTransactionProcessing(false);
		}
	};

	const handleSubUserDeposit = async (e) => {
		e.preventDefault();
		setTransactionProcessing(true);

		try {
			const payload = {
				subUserId: selectedSubUser?.id || selectedSubUser?._id,
				amount: parseFloat(subUserDepositForm.amount),
				mode: "Wallet",
				role: "SubUser",
			};

			await apiHelper.post(
				"/transaction/depositAmountRequest_ForSubUser",
				payload,
			);
			checkTransactionStatus(selectedSubUser?.id || selectedSubUser?._id);
		} catch (error) {
			toast.error("Failed to submit deposit request: " + error.message);
			setTransactionProcessing(false);
		}
	};

	const checkPasswordResetStatus = async (clientName) => {
		try {
			const response = await apiHelper.get(
				`/password/get-latestPassword-change-by-clientName/${clientName}`,
			);
			const passwordChange = response?.data || response;

			if (passwordChange?.status === "Completed") {
				toast.success("Password reset completed successfully!");
				setResetPasswordLoading(false);
				setShowResetPassword(false);
				setResetPasswordForm({ newPassword: "" });
				setSelectedSubUser(null);
				fetchSubAccounts();
			} else {
				setTimeout(() => checkPasswordResetStatus(clientName), 2000);
			}
		} catch (error) {
			console.error("Failed to check password reset status:", error);
			setResetPasswordLoading(false);
		}
	};

	// const handleResetPassword = async (e) => {
	//   e.preventDefault();
	//   setResetPasswordLoading(true);

	//   try {
	//     if (resetPasswordForm.newPassword.includes(' ')) {
	//       toast.error('Password cannot contain spaces');
	//       setResetPasswordLoading(false);
	//       return;
	//     }

	//     if (!validatePassword(resetPasswordForm.newPassword)) {
	//       toast.error('Password must contain 8+ characters with 1 uppercase, 1 lowercase, 1 number, 1 special character. Avoid common passwords and sequential patterns');
	//       setResetPasswordLoading(false);
	//       return;
	//     }

	//     const payload = {
	//       subUserId: selectedSubUser?.id || selectedSubUser?._id,
	//       clientName: selectedSubUser?.clientName,
	//       newPassword: resetPasswordForm.newPassword
	//     };

	//     await apiHelper.post('/password/create-password-change-log', payload);
	//     toast.success('Password reset request submitted successfully!');
	//     setResetPasswordLoading(false);
	//     setShowResetPassword(false);
	//     setResetPasswordForm({ newPassword: '' });
	//     setSelectedSubUser(null);
	//     checkPasswordResetStatus(selectedSubUser?.clientName);
	//   } catch (error) {
	//     toast.error('Failed to reset password: ' + error.message);
	//     setResetPasswordLoading(false);
	//   }
	// };

	const handleResetPassword = async (e) => {
		e.preventDefault();
		setResetPasswordLoading(true);

		try {
			let finalPassword = resetPasswordForm.newPassword;

			// ✅ LOTUSBOOK default password
			if (selectedSubUser?.gameName === "LOTUSBOOK") {
				finalPassword = "Lotu@1255";
			} else {
				if (finalPassword.includes(" ")) {
					toast.error("Password cannot contain spaces");
					setResetPasswordLoading(false);
					return;
				}

				if (!validatePassword(finalPassword)) {
					toast.error(
						"Password must contain 8+ characters with 1 uppercase, 1 lowercase, 1 number, 1 special character",
					);
					setResetPasswordLoading(false);
					return;
				}
			}

			const payload = {
				subUserId: selectedSubUser?.id || selectedSubUser?._id,
				clientName: selectedSubUser?.clientName,
				newPassword: finalPassword,
			};

			await apiHelper.post("/password/create-password-change-log", payload);

			toast.success("Password reset request submitted successfully!");
			setShowResetPassword(false);
			setResetPasswordForm({ newPassword: "" });
			setSelectedSubUser(null);

			checkPasswordResetStatus(selectedSubUser?.clientName);
		} catch (error) {
			toast.error("Failed to reset password: " + error.message);
		} finally {
			setResetPasswordLoading(false);
		}
	};

	const fetchGames = async () => {
		try {
			// Fetch both games and panels
			const [gamesResponse, panelsResponse] = await Promise.all([
				apiHelper.get("/game/getAllGamesWithPagination?page=1&limit=50"),
				apiHelper.get("/panel/getAllPanels?page=1&limit=10"),
			]);

			const gamesList =
				gamesResponse.games || gamesResponse.data || gamesResponse || [];
			const panelsData =
				panelsResponse.data?.panels ||
				panelsResponse.panels ||
				panelsResponse.data ||
				panelsResponse ||
				[];

			// Filter only active panels
			const activePanels = panelsData.filter(
				(panel) => panel?.isActive === true,
			);

			// Get unique game names from active panels
			const activeGameNames = [
				...new Set(activePanels.map((panel) => panel.panelName || panel.name)),
			];

			// Filter games that have active panels
			const availableGames = gamesList.filter(
				(game) =>
					activeGameNames.includes(game.name) && (game.status || game.isActive),
			);

			setGames(availableGames);
		} catch (error) {
			console.error("Failed to fetch games:", error);
			setGames([]);
		}
	};

	const fetchSubAccounts = async () => {
		setSubAccountsLoading(true);
		try {
			const response = await apiHelper.get(
				"/subAccount/getSubAccounts?page=1&limit=50",
			);
			const accountsList =
				response?.subAccounts || response?.data || response || [];
			setSubAccounts(accountsList);
		} catch (error) {
			console.error("Failed to fetch sub accounts:", error);
			toast.error("Failed to fetch sub accounts: " + error.message);
		} finally {
			setSubAccountsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const checkIdCreationStatus = async (subAccountId) => {
		try {
			const response = await apiHelper.get(
				`/subAccount/latest-sub-user/${subAccountId}`,
			);
			const transaction = response?.data?.status;

			if (transaction === "Accept") {
				setIdCreated(true);
				setTimeout(() => {
					setLoading(false);
					setShowCreateId(false);
					setIdCreated(false);
					setFormData({
						gameId: formData.gameId,
						clientName: "",
						password: "",
						phone: "",
					});
					fetchSubAccounts();
				}, 2000);
				return; // Stop further API calls
			} else {
				setTimeout(() => checkIdCreationStatus(subAccountId), 2000);
			}
		} catch (error) {
			console.error("Failed to check ID creation status:", error);
			setLoading(false);
		}
	};

	const validatePassword = (password) => {
		const regex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		const commonPasswords = [
			"Abcd@1234",
			"Password@123",
			"Admin@123",
			"Test@1234",
			"User@1234",
		];

		// Check for sequential alphabetical patterns
		const hasSequentialPattern =
			/abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz/i.test(
				password,
			);

		return (
			regex.test(password) &&
			!commonPasswords.includes(password) &&
			!hasSequentialPattern
		);
	};

	const handleCreateId = async (e) => {
		e.preventDefault();

		if (formData.clientName.length > 6) {
			toast.error("Client name must be maximum 6 characters");
			return;
		}

		if (formData.clientName.includes(" ")) {
			toast.error("Client name cannot contain spaces");
			return;
		}

		if (!/^[a-zA-Z0-9]+$/.test(formData.clientName)) {
			toast.error("Client name can only contain letters and numbers");
			return;
		}

		setLoading(true);

		try {
			const payload = {
				gameId: formData.gameId,
				clientName: formData.clientName,
				phone: user?.phone || "",
			};

			const response = await apiHelper.post(
				"/subAccount/createSubAccount",
				payload,
			);
			const createdAccount = response?.data || response;
			const subAccountId = createdAccount?.id || createdAccount?._id;

			if (subAccountId) {
				checkIdCreationStatus(subAccountId);
			} else {
				toast.success("ID created successfully!");
				setLoading(false);
				setShowCreateId(false);
				setFormData({
					gameId: formData.gameId,
					clientName: "",
					password: "",
					phone: "",
				});
				fetchSubAccounts();
			}
		} catch (error) {
			toast.error("Failed to create ID: " + error.message);
			setLoading(false);
		}
	};

	const fetchUserBalance = async () => {
		setBalanceLoading(true);
		try {
			const userId = user?._id;
			if (!userId) {
				return;
			}
			const balanceResponse = await apiHelper.get(
				`/transaction/get_MainUserBalance/${userId}`,
			);
			setUserBalance(balanceResponse?.data?.balance || 0);
		} catch (error) {
			console.error("Failed to fetch balance:", error);
			setUserBalance(0);
		} finally {
			setBalanceLoading(false);
		}
	};

	const checkPendingTransactions = async () => {
		try {
			const userId = user?._id;
			if (!userId) return;

			const transactionsResponse = await apiHelper.post(
				`/transaction/getUserTransactions/${userId}?page=1&limit=10`,
			);
			const transactions = transactionsResponse?.data?.transactions || [];

			for (const transaction of transactions) {
				if (
					transaction?.status === "Accept" &&
					transaction?.mode == "Wallet" &&
					transaction?.transactionStatus != "Completed"
				) {
					try {
						// ✅ Step 1: Get transaction detail
						const statusResponse = await apiHelper.get(
							`/transaction/get_single_transactions/${transaction?._id}`,
						);

						if (statusResponse?.data) {
							const currentStatus = statusResponse?.data?.status;

							// ✅ Step 2: Update transaction based on status
							let updatedStatus = "Pending"; // default
							if (currentStatus === "Accept") {
								updatedStatus = "Completed";
							} else if (currentStatus === "Insufficent") {
								updatedStatus = "Reject";
							} else if (currentStatus === "Pending") {
								updatedStatus = "Pending";
							}

							await apiHelper.patch(
								`/transaction/update_Wallet_Withdrawal_Transaction/${transaction?._id}`,
								{
									status: updatedStatus,
								},
							);

							setUpdatedTransactions(transaction?._id);

							// ✅ Step 3: Handle toast + balance refresh
							if (updatedStatus === "Completed") {
								toast.success("Transaction completed successfully!");
								fetchUserBalance();
							}
						}
					} catch (error) {
						console.log("Error updating transaction:", transaction?._id, error);
					}
				}
			}

			for (const transaction of transactions) {
				try {
					const statusResponse = await apiHelper.get(
						`/transaction/callCheckStatus/${transaction?._id}`,
					);

					if (!statusResponse?.data?.success) continue;

					const newStatus = statusResponse?.data?.data?.status;

					// ❌ Withdrawal + Initial → UPDATE MAT KARO
					if (
						transaction?.transactionType === "Withdrawal" &&
						newStatus === "Initial"
					) {
						continue; // ⛔ yahin loop skip
					}

					// ✅ Sirf valid cases me update
					if (newStatus) {
						await apiHelper.patch(
							`/transaction/update_Transaction_Request_Data_of_Request/${transaction?._id}`,
							{ status: newStatus },
						);

						// ✅ Final actions
						if (newStatus === "Accept") {
							toast.success("Transaction completed successfully!");
							fetchUserBalance();
							setUpdatedTransactions(transaction?._id);
						} else if (newStatus === "Reject") {
							toast.error("Transaction Rejected");
							fetchUserBalance();
							setUpdatedTransactions(transaction?._id);
						} else if (newStatus === "Initial") {
						}
					}
				} catch (statusError) {
					console.log(
						"Status check error for transaction:",
						transaction?._id,
						statusError,
					);
				}
			}
		} catch (error) {
			console.log("Background status check error:", error);
		}
	};

	// useEffect(() => {
	//   setInterval(() => {
	//     checkPendingTransactions();
	//   }, 5000);
	// }, []);

	useEffect(() => {
		fetchUserBalance();
	}, [user, balanceLogData, userTransactions, showCreateTransaction]);

	useEffect(() => {
		if (user?._id) {
			checkPendingTransactions();
		}
	}, [user]);

	useEffect(() => {
		if (user?._id) {
			const interval = setInterval(() => {
				checkPendingTransactions();
			}, 5000); // Check every 5 seconds

			return () => clearInterval(interval);
		}
	}, [user]);

	const handleViewWallet = async (pageNum = 1, filters = walletFilters) => {
		// Ensure pageNum is a number
		const page = Number(pageNum) || 1;

		if (page === 1) {
			setShowWallet(true);
		}
		setTransactionsLoading(true);
		try {
			const userId = user?._id;
			if (!userId) {
				toast.error("User not found");
				setTransactionsLoading(false);
				return;
			}

			const payload = {
				page: page,
				limit: 10,
				...filters,
			};

			// Remove empty filters
			Object.keys(payload).forEach((key) => {
				if (
					payload[key] === "" ||
					payload[key] === null ||
					payload[key] === undefined
				) {
					delete payload[key];
				}
			});

			const transactionsResponse = await apiHelper.post(
				`/transaction/getUserTransactions/${userId}`,
				payload,
			);
			const transactions = transactionsResponse?.data?.transactions || [];
			const pagination = transactionsResponse?.data?.pagination || {};

			setCurrentPage(Number(pagination.currentPage) || page);
			setTotalPages(Number(pagination.totalPages) || 1);
			setTotalTransactions(
				Number(pagination.totalTransactions) || transactions.length,
			);

			setUserTransactions(transactions);
		} catch (error) {
			console.error("Transaction fetch error:", error);
			toast.error("Failed to fetch transactions: " + error.message);
			setUserTransactions([]);
		} finally {
			setTransactionsLoading(false);
		}
	};

	const handleWalletFilterChange = (key, value) => {
		setWalletFilters((prev) => ({ ...prev, [key]: value }));
	};

	const applyWalletFilters = () => {
		setCurrentPage(1);
		handleViewWallet(1, walletFilters);
	};

	const clearWalletFilters = () => {
		const clearedFilters = {
			status: "",
			transactionType: "",
			minAmount: "",
			maxAmount: "",
		};
		setWalletFilters(clearedFilters);
		setCurrentPage(1);
		handleViewWallet(1, clearedFilters);
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

	const handleDeleteSubAccount = (account) => {
		setAccountToDelete(account);
		setShowDeleteConfirm(true);
	};

	const confirmDelete = async () => {
		setDeleteLoading(true);

		try {
			const subAccountId = accountToDelete?.id || accountToDelete?._id;

			// Create balance log
			await apiHelper.post("/balance/createBalanceLog", {
				userId: subAccountId,
			});

			// Keep checking until CurrentBalance is available
			const checkBalance = async () => {
				const response = await apiHelper.get(
					`/balance/getBalanceLogBySubUserId/${subAccountId}`,
				);
				const currentBalance = response?.data?.CurrentBalance;

				if (currentBalance === undefined) {
					setTimeout(checkBalance, 1000);
					return;
				}

				if (currentBalance >= 1) {
					toast.error(
						"Please withdraw the balance first before deleting the account",
					);
					setDeleteLoading(false);
					setShowDeleteConfirm(false);
					return;
				}

				// Delete account
				await apiHelper.delete(`/subAccount/deleteSubAccount/${subAccountId}`);
				toast.success(`${accountToDelete?.clientName} has been deleted...`);
				fetchSubAccounts();
				setDeleteLoading(false);
				setShowDeleteConfirm(false);
			};

			checkBalance();
		} catch (error) {
			toast.error("Failed to delete account: " + error.message);
			setDeleteLoading(false);
			setShowDeleteConfirm(false);
		}
	};

	useEffect(() => {
		fetchGames();
		fetchSubAccounts();
		fetchUserBalance();
	}, []);

	// Smart polling for sub accounts - only when there are pending statuses
	useEffect(() => {
		if (subAccounts.length === 0) return;

		const hasPendingAccounts = subAccounts.some(
			(account) => account.status === "Pending",
		);

		if (!hasPendingAccounts) {
			return; // Stop polling if no pending accounts
		}

		const interval = setInterval(() => {
			fetchSubAccounts();
		}, 5000); // Check every 3 seconds

		return () => clearInterval(interval);
	}, [subAccounts]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (showUserDropdown && !event.target.closest(".relative")) {
				setShowUserDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showUserDropdown]);

	return (
		<div className="min-h-screen bg-[#0e0e0e] max-w-[600px] mx-auto">
			{/* Mobile Header */}
			<MobileHeader
				userBalance={userBalance}
				onDepositClick={() => {
					setTransactionForm({
						...transactionForm,
						transactionType: "Deposit",
					});
					setShowCreateTransaction(true);
				}}
				onWithdrawClick={() => {
					setTransactionForm({
						...transactionForm,
						transactionType: "Withdraw",
					});
					setShowCreateTransaction(true);
					fetchBanks();
				}}
				// onWalletClick={() => navigate('/')}
			/>

			{/* Main Content */}
			<div className="max-w-[600px] pt-[]">
				{/* Banner Section */}
				<div className="px-4 py-3">
					{/* Promotional Banner */}
					<div className="relative w-full overflow-hidden mb-3 rounded-xl">
						<img
							src="/bghero.png"
							alt="RRRPAY Banner"
							className="w-full h-auto object-cover"
						/>
					</div>

					{/* Begin Journey Section */}
					<div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-3">
						<div className="flex items-start gap-3 mb-4">
							<img src="/rrr.png" alt="RRR Logo" className="h-12" />
							<div>
								<h3 className="text-white text-lg font-semibold mb-1">
									Begin your Journey
								</h3>
								{/* <p className="text-[#f59e0b] text-sm">
									By creating your first ID with RRRPLAY
								</p> */}
								<p className="text-white text-xs mt-1">
									We got something for the wild punter in you.
								</p>
							</div>
						</div>
						<button
							onClick={() => navigate("/my-ids")}
							className="w-full bg-[#f59e0b] hover:bg-[#] text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
						>
							<Plus className="w-5 h-5" />
							CREATE NEW
						</button>
					</div>
				</div>

				{/* Available Bonuses */}
				<AvailableBonuses
					userId={user?._id}
					subAccounts={subAccounts}
					onBalanceUpdate={fetchUserBalance}
				/>

				{/* Games Section */}
				{subAccounts.length > 0 && (
					<div className="pb-4 ">
						<div className="flex justify-between items-center mb-3 px-4 ml-0 ">
							<div>
								<h2 className="text-xl font-semibold text-white">
									{t("myIds")} ({subAccounts.length})
								</h2>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() =>
										setCurrentGameSlide(Math.max(0, currentGameSlide - 3))
									}
									className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
								>
									<ChevronLeft className="mx-auto" />
								</button>
								<button
									onClick={() =>
										setCurrentGameSlide(
											Math.min(subAccounts.length - 3, currentGameSlide + 3),
										)
									}
									className="w-9 h-9 rounded-lg bg-white/10 text-white hover:bg-white/20"
								>
									<ChevronRight className="mx-auto" />
								</button>
							</div>
						</div>
						<div className="relative overflow-hidden ">
							<div
								className="flex gap-3   transition-transform duration-300 ease-in-out"
								style={{
									transform: `translateX(-${currentGameSlide * (100 / 3 + 1)}%)`,
								}}
							>
								{subAccounts.map((account) => {
									const game = account.gameId;

									return (
										<div
											key={account.id || account._id}
											onClick={() => {
												navigate(`/id-details/${account.id || account._id}`);
											}}
											className="flex-shrink-0 w-[calc(33.333%-0.5rem)] bg-gradient-to-br from-[#0b0b0c] to-[#130d0d] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
										>
											<div className="h-32 sm:h-40 bg-black/20 flex items-center justify-center">
												{game?.image ? (
													<img
														src={game.image}
														alt={game.name}
														className="w-full h-full object-cover"
													/>
												) : (
													<Gamepad2 className="w-12 h-12 text-white" />
												)}
											</div>
											<div className="p-3 bg-black/40">
												<p className="text-white text-sm font-medium truncate">
													{game?.name || "Game"}
												</p>
												<p className="text-gray-400 text-xs truncate">
													{account.clientName || "N/A"}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}


			</div>

			{/* Create ID Modal */}
			{showCreateId && (
				<CreateIdModal
					isOpen={showCreateId}
					onClose={() => setShowCreateId(false)}
					formData={formData}
					onInputChange={handleInputChange}
					onSubmit={handleCreateId}
					isLoading={loading}
					isCreated={idCreated}
					games={games}
				/>
			)}

			{/* Wallet/Transaction History Modal */}
			{showWallet && (
				<WalletModal
					isOpen={showWallet}
					onClose={() => {
						setShowWallet(false);
						setWalletFilters({
							status: "",
							transactionType: "",
							minAmount: "",
							maxAmount: "",
						});
						fetchUserBalance();
					}}
					transactions={userTransactions}
					filters={walletFilters}
					onFilterChange={handleWalletFilterChange}
					onApplyFilters={applyWalletFilters}
					onClearFilters={clearWalletFilters}
					isLoading={transactionsLoading}
					currentPage={currentPage}
					onPageChange={handleViewWallet}
					onViewScreenshot={(id) => {
						// TODO: Implement screenshot fetch functionality
						console.log("View screenshot for:", id);
					}}
				/>
			)}

			{/* Create Transaction Modal */}
			{showCreateTransaction && (
				<CreateTransactionModal
					isOpen={showCreateTransaction}
					onClose={() => {
						setShowCreateTransaction(false);
						setSelectedBranch(""); // Reset branch selection
						fetchUserBalance();
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
					fetchBanks={fetchBanks}
				/>
			)}

			{/* Add Bank Modal */}
			{showAddBankModal && (
				<AddBankModal
					isOpen={showAddBankModal}
					onClose={() => setShowAddBankModal(false)}
					bankForm={bankForm}
					onBankFormChange={setBankForm}
					onSubmit={handleSaveBank}
				/>
			)}

			{/* Sub User Withdraw Modal */}
			{showSubUserWithdraw && (
				<SubUserWithdrawModal
					isOpen={showSubUserWithdraw}
					onClose={() => {
						setShowSubUserWithdraw(false);
						fetchUserBalance();
					}}
					withdrawForm={subUserWithdrawForm}
					onFormChange={setSubUserWithdrawForm}
					onSubmit={handleSubUserWithdraw}
					isProcessing={transactionProcessing}
					subUserBalance={subUserBalance}
					isBalanceLoading={subUserBalanceLoading}
					selectedSubUserId={selectedSubUser?.clientName}
				/>
			)}

			{/* Sub User Deposit Modal */}

			{showSubUserDeposit && (
				<SubUserDepositModal
					isOpen={showSubUserDeposit}
					onClose={() => {
						setShowSubUserDeposit(false);
						fetchUserBalance();
					}}
					depositForm={subUserDepositForm}
					onFormChange={setSubUserDepositForm}
					onSubmit={handleSubUserDeposit}
					isProcessing={transactionProcessing}
					userBalance={userBalance}
					selectedSubUserId={selectedSubUser?.clientName}
				/>
			)}

			{/* Reset Password Modal */}
			{showResetPassword && (
				<ResetPasswordModal
					isOpen={showResetPassword}
					onClose={() => {
						setShowResetPassword(false);
						setResetPasswordForm({ newPassword: "" });
						setSelectedSubUser(null);
					}}
					passwordForm={resetPasswordForm}
					onPasswordFormChange={setResetPasswordForm}
					onSubmit={handleResetPassword}
					isLoading={resetPasswordLoading}
					selectedSubUserId={selectedSubUser?.clientName}
				/>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<DeleteConfirmModal
					isOpen={showDeleteConfirm}
					onClose={() => setShowDeleteConfirm(false)}
					onConfirm={confirmDelete}
					isLoading={deleteLoading}
					accountId={accountToDelete?.clientName}
				/>
			)}

			{/* Bottom padding to prevent content overlap */}
			<BottomNavigation activePage="home" />
		</div>
	);
};

export default UserDashboard;
