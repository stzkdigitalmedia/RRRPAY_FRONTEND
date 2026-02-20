import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiHelper } from "../utils/apiHelper";
import { useToastContext } from "../App";
import { X, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import PasswordInput from "../components/PasswordInput";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

// Safe localStorage for mobile compatibility
const safeLocalStorage = {
	setItem: (key, value) => {
		try {
			if (typeof Storage !== "undefined" && window.localStorage) {
				localStorage.setItem(key, value);
				return true;
			}
		} catch (error) {
			console.warn("localStorage not available:", error);
		}
		return false;
	},
	getItem: (key) => {
		try {
			if (typeof Storage !== "undefined" && window.localStorage) {
				return localStorage.getItem(key);
			}
		} catch (error) {
			console.warn("localStorage not available:", error);
		}
		return null;
	},
	removeItem: (key) => {
		try {
			if (typeof Storage !== "undefined" && window.localStorage) {
				localStorage.removeItem(key);
				return true;
			}
		} catch (error) {
			console.warn("localStorage not available:", error);
		}
		return false;
	},
};

const MyIDs = ({
	games = [],
	subAccounts = [],
	setFormData,
	formData,
	setShowCreateId,
}) => {
	const [activeTab, setActiveTab] = useState("createId");
	const [localGames, setLocalGames] = useState([]);
	const [showCreateIdLocal, setShowCreateIdLocal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [idCreated, setIdCreated] = useState(false);
	const [localFormData, setLocalFormData] = useState({
		gameId: "",
		clientName: "",
		password: "",
		phone: "",
	});
	const [localSubAccounts, setLocalSubAccounts] = useState([]);
	const [subAccountsLoading, setSubAccountsLoading] = useState(false);
	const [selectedSubUser, setSelectedSubUser] = useState(null);
	const [showSubUserWithdraw, setShowSubUserWithdraw] = useState(false);
	const [showSubUserDeposit, setShowSubUserDeposit] = useState(false);
	const [showResetPassword, setShowResetPassword] = useState(false);
	const [subUserBalance, setSubUserBalance] = useState(0);
	const [subUserBalanceLoading, setSubUserBalanceLoading] = useState(false);
	const [transactionProcessing, setTransactionProcessing] = useState(false);
	const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
	const [subUserWithdrawForm, setSubUserWithdrawForm] = useState({
		amount: "",
		selectedBankId: "",
	});
	const [subUserDepositForm, setSubUserDepositForm] = useState({ amount: "" });
	const [resetPasswordForm, setResetPasswordForm] = useState({
		newPassword: "",
	});
	const { user } = useAuth();
	const toast = useToastContext();
	const { t } = useTranslation();
	const navigate = useNavigate();

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
				setSubUserBalanceLoading(false);
			} else {
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
			const payload = {
				subUserId: selectedSubUser?.id || selectedSubUser?._id,
				amount: parseFloat(subUserWithdrawForm.amount),
				mode: "Wallet",
				role: "SubUser",
			};

			await apiHelper.post(
				"/transaction/withdrawAmountRequest_ForSubUser",
				payload,
			);
			toast.info(
				"Withdrawal request submitted successfully please check history!",
			);
			setShowSubUserWithdraw(false);
			setSubUserWithdrawForm({ amount: "", selectedBankId: "" });
			setSelectedSubUser(null);
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

	const fetchSubAccounts = async () => {
		setSubAccountsLoading(true);
		try {
			const response = await apiHelper.get(
				"/subAccount/getSubAccounts?page=1&limit=50",
			);
			const accountsList =
				response?.subAccounts || response?.data || response || [];
			setLocalSubAccounts(accountsList);
		} catch (error) {
			console.error("Failed to fetch sub accounts:", error);
			toast.error("Failed to fetch sub accounts: " + error.message);
		} finally {
			setSubAccountsLoading(false);
		}
	};

	const fetchGames = async () => {
		try {
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

			const activePanels = panelsData.filter(
				(panel) => panel?.isActive === true,
			);
			const activeGameNames = [
				...new Set(activePanels.map((panel) => panel.panelName || panel.name)),
			];
			const availableGames = gamesList.filter(
				(game) =>
					activeGameNames.includes(game.name) && (game.status || game.isActive),
			);

			setLocalGames(availableGames);
		} catch (error) {
			console.error("Failed to fetch games:", error);
			setLocalGames([]);
		}
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
					setShowCreateIdLocal(false);
					setIdCreated(false);
					setLocalFormData({
						gameId: localFormData.gameId,
						clientName: "",
						password: "",
						phone: "",
					});
					fetchSubAccounts();
				}, 2000);
				return;
			} else {
				setTimeout(() => checkIdCreationStatus(subAccountId), 2000);
			}
		} catch (error) {
			console.error("Failed to check ID creation status:", error);
			setLoading(false);
		}
	};

	const handleCreateId = async (e) => {
		e.preventDefault();

		if (localFormData.clientName.length > 6) {
			toast.error("Client name must be maximum 6 characters");
			return;
		}

		if (localFormData.clientName.includes(" ")) {
			toast.error("Client name cannot contain spaces");
			return;
		}

		if (!/^[a-zA-Z0-9]+$/.test(localFormData.clientName)) {
			toast.error("Client name can only contain letters and numbers");
			return;
		}

		setLoading(true);

		try {
			const payload = {
				gameId: localFormData.gameId,
				clientName: localFormData.clientName,
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
				setShowCreateIdLocal(false);
				setLocalFormData({
					gameId: localFormData.gameId,
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

	const handleInputChange = (e) => {
		setLocalFormData({ ...localFormData, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		fetchGames();
		fetchSubAccounts();

		// Check localStorage for active tab
		const savedTab = safeLocalStorage.getItem("myIdsActiveTab");
		if (savedTab === "myIds") {
			setActiveTab("myIds");
		}
	}, []);

	return (
		<>
			{/* Fixed Header */}
			<div className="fixed top-0 left-0 right-0 z-50">
				<Header />
			</div>

			{/* Fixed Top Tabs */}
			<div className="fixed top-[55px] mx-auto max-w-[600px] left-0 right-0 z-40 bg-black px-3 sm:px-5 py-3 text-white">
				<div className="max-w-[600px] mx-auto">
					<div className="flex bg-black gap-8 overflow-hidden">
						<button
							onClick={() => setActiveTab("myIds")}
							className={`flex-1 py-3 text-sm font-medium transition relative ${
								activeTab === "myIds" ? "text-white" : "text-gray-400"
							}`}
						>
							MY IDS
							{activeTab === "myIds" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff8c00]"></div>
							)}
						</button>

						<button
							onClick={() => {
								safeLocalStorage.removeItem("myIdsActiveTab");
								setActiveTab("createId");
							}}
							className={`flex-1 py-3 text-sm font-medium transition relative ${
								activeTab === "createId" ? "text-white" : "text-gray-400"
							}`}
						>
							CREATE ID
							{activeTab === "createId" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff8c00]"></div>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Scrollable Content */}
			<div className="pt-[120px] sm:pt-[125px] pb-20 min-h-screen bg-black p-3 sm:px-5 max-w-[600px] mx-auto text-white">
				{/* ================= CREATE ID ================= */}
				{activeTab === "createId" && (
					<>
						{/* CREATE ID LIST */}
						<div className="space-y-3">
							{(localGames.length > 0 ? localGames : games).map((game) => (
								<div
									key={game.id || game._id}
									className="flex items-center justify-between bg-[#2a2a2a] rounded-xl p-4"
								>
									{/* LEFT */}
									<div className="flex items-center gap-4">
										{/* LOGO */}
										<div className="w-12 h-12 rounded-full bg-black overflow-hidden flex items-center justify-center">
											{game.image ? (
												<img
													src={game.image}
													alt={game.name}
													className="w-full h-full object-contain"
												/>
											) : (
												<span className="text-xs">LOGO</span>
											)}
										</div>

										{/* DETAILS */}
										<div>
											<div className="flex items-center gap-2">
												<p className="font-medium text-sm text-white">
													{game.name}
												</p>
												{game.trending && (
													<span className="text-blue-400 text-xs">💎</span>
												)}
											</div>
											<p className="text-xs text-gray-400 mt-0.5">
												{game.gameUrl && game.gameUrl.length > 21
													? `${game.gameUrl.substring(0, 21)}...`
													: game.gameUrl}
											</p>
										</div>
									</div>

									{/* RIGHT */}
									<button
										onClick={() => {
											setLocalFormData({
												...localFormData,
												gameId: game.id || game._id,
											});
											setShowCreateIdLocal(true);
										}}
										className="px-4 py-2 rounded-lg bg-[#ffa600] hover:bg-[#ff9d1f] text-black text-sm font-semibold transition flex items-center gap-2"
									>
										<div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
											<span className="text-[#ffa600] text-lg font-bold leading-none mb-1">+</span>
										</div>
										CREATE ID
									</button>
								</div>
							))}
						</div>
					</>
				)}

				{/* ================= MY IDS ================= */}
				{activeTab === "myIds" && (
					<>
						{subAccountsLoading ? (
							<div className="bg-[#2a2a2a] rounded-xl p-8 text-center text-gray-400">
								Loading IDs...
							</div>
						) : (localSubAccounts.length > 0 ? localSubAccounts : subAccounts)
								.length === 0 ? (
							<div className="bg-[#2a2a2a] rounded-xl p-8 text-center text-gray-400">
								No IDs found
							</div>
						) : (
							<div className="space-y-3">
								{(localSubAccounts.length > 0
									? localSubAccounts
									: subAccounts
								).map((acc) => (
									<div
										key={acc.id || acc._id}
										className="flex justify-between items-center bg-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:bg-[#333333] transition"
										onClick={() => {
											safeLocalStorage.setItem("myIdsActiveTab", "myIds");
											const subAccId = acc.id || acc._id;
											navigate(`/id-details/${subAccId}`);
										}}
									>
										<div className="flex items-center gap-3">
											<div className="w-12 h-12 overflow-hidden rounded-full bg-black flex items-center justify-center">
												<img
													src={acc.gameId?.image}
													alt=""
													className="w-full h-full object-contain"
												/>
											</div>
											<div>
												<p className="text-sm font-medium text-white">
													{acc?.clientName}
												</p>
												<p className="text-xs text-gray-400">
													{acc.gameId?.gameUrl && acc.gameId.gameUrl.length > 17
														? `${acc.gameId.gameUrl.substring(0, 17)}...`
														: acc.gameId?.gameUrl}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={(e) => {
													e.stopPropagation();
													setSelectedSubUser(acc);
													setShowSubUserDeposit(true);
												}}
												className="rounded-full w-8 h-8 text-xs bg-green-600 hover:bg-green-700 transition"
											>
												D
											</button>
											<button
												onClick={async (e) => {
													e.stopPropagation();
													setSelectedSubUser(acc);
													await createBalanceLog(acc?.id || acc?._id);
													setShowSubUserWithdraw(true);
													fetchSubUserBalance(acc?.id || acc?._id);
												}}
												className="rounded-full w-8 h-8 text-xs bg-red-600 hover:bg-red-700 transition"
											>
												W
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													setSelectedSubUser(acc);
													setShowResetPassword(true);
												}}
												className="rounded-full w-8 h-8 text-xs bg-[#ff9d1f] hover:bg-[#ff9e1fb9] transition"
											>
												P
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</>
				)}

				{/* Create ID Modal */}
				{showCreateIdLocal && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
						<div className="bg-[#2a2a2a] rounded-xl p-6 max-w-md w-full mx-4">
							<div className="flex justify-between items-center mb-6">
								<div>
									<h2 className="text-xl font-semibold text-white">
										Create New ID
									</h2>
									<p className="text-gray-400 text-sm mt-1">
										Game:{" "}
										{(localGames.length > 0 ? localGames : games).find(
											(g) => (g.id || g._id) === localFormData.gameId,
										)?.name || "Select a game"}
									</p>
								</div>
								<button
									onClick={() => setShowCreateIdLocal(false)}
									className="text-gray-400 hover:text-white"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{idCreated ? (
								<div className="text-center py-8">
									<div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
										<Check className="w-8 h-8 text-green-400" />
									</div>
									<p className="text-lg font-semibold text-green-400 mb-2">
										ID Created
									</p>
									<p className="text-sm text-gray-400">
										ID Created Successfully
									</p>
								</div>
							) : loading ? (
								<div className="text-center py-8">
									<div
										className="loading-spinner mx-auto mb-4"
										style={{ width: "32px", height: "32px" }}
									></div>
									<p className="text-lg font-semibold text-white mb-2">
										Creating ID
									</p>
									<p className="text-sm text-gray-400">Please Wait</p>
								</div>
							) : (
								<form onSubmit={handleCreateId} className="space-y-4">
									<div>
										<label className="text-sm font-medium text-gray-300 mb-2 block">Client Name</label>
										<input
											type="text"
											name="clientName"
											placeholder="Enter Client Name"
											value={localFormData.clientName}
											onChange={handleInputChange}
											maxLength={6}
											className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa600]"
											required
										/>
										<p className="text-xs text-gray-500 mt-1">
											Maximum 6 characters
										</p>
									</div>

									<div className="flex gap-3 pt-4">
										<button
											type="submit"
											className="flex-1 py-3 rounded-lg bg-[#ffa600] hover:bg-[#ff9d1f] text-black font-semibold transition"
										>
											Create ID
										</button>
										<button
											type="button"
											onClick={() => setShowCreateIdLocal(false)}
											className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#3a3a3a] font-semibold transition"
										>
											Cancel
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}

				{/* Withdraw Modal */}
				{showSubUserWithdraw && (
					<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
						<div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
							<div className="flex justify-between items-center mb-6">
								<div>
									<h2 className="text-xl font-semibold text-white flex items-center gap-2">
										<div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
											<span className="text-white font-bold text-sm">₹</span>
										</div>
										Withdraw From Sub
									</h2>
									<div className="mt-2 flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
										<span className="text-gray-400 text-sm">ID:</span>
										<span className="text-[#ffa600] font-medium text-sm">
											{selectedSubUser?.clientName || "N/A"}
										</span>
									</div>
									<div className="mt-3">
										{subUserBalanceLoading ? (
											<div className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded-lg">
												<div className="w-5 h-5 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
												<div className="flex flex-col">
													<span className="text-sm font-medium text-gray-300">
														Balance
													</span>
													<span className="text-sm text-gray-500 animate-pulse">
														Loading...
													</span>
												</div>
											</div>
										) : (
											<div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
												<span className="text-gray-300 font-medium text-sm">
													Balance:
												</span>
												<span className="text-lg font-bold text-green-500">
													₹{Number(subUserBalance).toLocaleString("en-IN")}
												</span>
											</div>
										)}
									</div>
								</div>
								<button
									onClick={() => setShowSubUserWithdraw(false)}
									className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{subUserBalanceLoading ? (
								<div className="text-center py-8">
									<div className="w-12 h-12 border-4 border-[#ffa600] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
									<p className="text-lg font-semibold text-white mb-2">
										Loading Balance
									</p>
									<p className="text-sm text-gray-400">
										Please wait while we fetch the current balance
									</p>
								</div>
							) : (
								<form onSubmit={handleSubUserWithdraw} className="space-y-6">
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Withdraw Amount
										</label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 font-semibold">₹</span>
											<input
												type="number"
												placeholder="Enter amount (Min ₹200)"
												value={subUserWithdrawForm.amount}
												onChange={(e) =>
													setSubUserWithdrawForm({
														...subUserWithdrawForm,
														amount: e.target.value,
													})
												}
												className="w-full pl-8 pr-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
												required
												min={200}
											/>
										</div>
										<p className="text-xs text-gray-500 mt-1">
											Minimum withdraw amount is ₹200
										</p>
									</div>

									<div className="flex gap-3 pt-4">
										<button
											type="submit"
											disabled={transactionProcessing}
											className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50"
										>
											{transactionProcessing ? "Processing" : "Withdraw Now"}
										</button>
										<button
											type="button"
											onClick={() => setShowSubUserWithdraw(false)}
											className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#3a3a3a] font-semibold transition-colors"
										>
											Cancel
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}
				{/* Deposit Modal */}
				{showSubUserDeposit && (
					<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
						<div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
							<div className="flex justify-between items-center mb-6">
								<div>
									<h2 className="text-xl font-semibold text-white flex items-center gap-2">
										<div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
											<span className="text-white font-bold text-sm">₹</span>
										</div>
										Deposit To Sub
									</h2>
									<div className="mt-2 flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
										<span className="text-gray-400 text-sm">ID:</span>
										<span className="text-[#ff9d1f] font-medium text-sm">
											{selectedSubUser?.clientName || "N/A"}
										</span>
									</div>
								</div>
								<button
									onClick={() => setShowSubUserDeposit(false)}
									className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{transactionProcessing ? (
								<div className="text-center py-8">
									<div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
									<p className="text-lg font-semibold text-white mb-2">
										Processing Deposit
									</p>
									<p className="text-sm text-gray-400">
										Please wait while we process your deposit
									</p>
								</div>
							) : (
								<form onSubmit={handleSubUserDeposit} className="space-y-6">
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Deposit Amount
										</label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 font-semibold">₹</span>
											<input
												type="number"
												placeholder="Enter amount (Min ₹100)"
												value={subUserDepositForm.amount}
												onChange={(e) =>
													setSubUserDepositForm({
														...subUserDepositForm,
														amount: e.target.value,
													})
												}
												className="w-full pl-8 pr-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
												required
												min={100}
											/>
										</div>
										<p className="text-xs text-gray-500 mt-1">
											Minimum deposit amount is ₹100
										</p>
									</div>

									<div className="flex gap-3 pt-4">
										<button
											type="submit"
											className="flex-1 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
										>
											Deposit Now
										</button>
										<button
											type="button"
											onClick={() => setShowSubUserDeposit(false)}
											className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#3a3a3a] font-semibold transition-colors"
										>
											Cancel
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}
				{/* Reset Password Modal */}
				{showResetPassword && (
					<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
						<div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
							<div className="flex justify-between items-center mb-6">
								<div>
									<h2 className="text-xl font-semibold text-white flex items-center gap-2">
										<div className="w-8 h-8 bg-[#ff7700] rounded-lg flex items-center justify-center">
											<span className="text-white font-bold text-sm">🔐</span>
										</div>
										{t("resetPassword")}
									</h2>
									<div className="mt-2 flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
										<span className="text-gray-400 text-sm">ID:</span>
										<span className="text-[#ffa600] font-medium text-sm">
											{selectedSubUser?.clientName || "N/A"}
										</span>
									</div>
								</div>
								<button
									onClick={() => {
										setShowResetPassword(false);
										setResetPasswordForm({ newPassword: "" });
										setSelectedSubUser(null);
									}}
									className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{resetPasswordLoading ? (
								<div className="text-center py-8">
									<div className="w-12 h-12 border-4 border-[#ffa600] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
									<p className="text-lg font-semibold text-white mb-2">
										{t("processing")}...
									</p>
									<p className="text-sm text-gray-400">
										Please wait while we process your password reset
									</p>
								</div>
							) : (
								<form onSubmit={handleResetPassword} className="space-y-6">
									{selectedSubUser?.gameName === "LOTUSBOOK" ? (
										<div className="p-4 rounded-xl bg-yellow-900/30 border border-yellow-600">
											<h3 className="text-sm font-semibold text-yellow-400 mb-1">
												Confirm Password Reset
											</h3>
											<p className="text-sm text-yellow-300">
												This user belongs to <b>LOTUSBOOK</b>. Are you sure you
												want to reset the password to the default password?
											</p>
										</div>
									) : (
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">{t("newPassword")}</label>
											<PasswordInput
												name="newPassword"
												placeholder="Example@1256"
												value={resetPasswordForm.newPassword}
												onChange={(e) =>
													setResetPasswordForm({
														...resetPasswordForm,
														newPassword: e.target.value,
													})
												}
												className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa600] focus:ring-1 focus:ring-[#ffa600] transition-colors"
												required
											/>
											<p className="text-xs text-gray-500 mt-1">
												Must contain 8+ characters with 1 uppercase, 1
												lowercase, 1 number, 1 special character.
											</p>
										</div>
									)}

									<div className="flex gap-3 pt-4">
										<button
											type="submit"
											className="flex-1 py-3 rounded-lg bg-[#ffa600] hover:bg-[#ff9d1f] text-black font-semibold transition-colors"
										>
											{selectedSubUser?.gameName === "LOTUSBOOK"
												? "Yes, Reset Password"
												: t("resetPassword")}
										</button>

										<button
											type="button"
											onClick={() => {
												setShowResetPassword(false);
												setResetPasswordForm({ newPassword: "" });
												setSelectedSubUser(null);
											}}
											className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#3a3a3a] font-semibold transition-colors"
										>
											{t("cancel")}
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				)}
			</div>

			<BottomNavigation activePage="ids" />
		</>
	);
};

export default MyIDs;
