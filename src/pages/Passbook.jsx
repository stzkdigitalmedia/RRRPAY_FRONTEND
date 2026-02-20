import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiHelper } from "../utils/apiHelper";
import { useToastContext } from "../App";
import BottomNavigation from "../components/BottomNavigation";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { BookOpen, Filter, Search, X, Eye } from "lucide-react";
import Header from "../components/Header";

const Passbook = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const toast = useToastContext();
	const { t } = useTranslation();
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState({
		status: "",
		transactionType: "",
		minAmount: "",
		maxAmount: "",
	});
	const [showScreenshot, setShowScreenshot] = useState(false);
	const [screenshotData, setScreenshotData] = useState(null);
	const [screenshotLoading, setScreenshotLoading] = useState(false);
	const [expandedTransactions, setExpandedTransactions] = useState(null);

	useEffect(() => {
		if (user?._id) {
			fetchTransactions();
		}
	}, [page, user]);

	const fetchTransactions = async (
		currentPage = page,
		currentFilters = filters,
	) => {
		setLoading(true);
		try {
			const payload = {
				page: currentPage,
				limit: 15,
				...currentFilters,
			};

			Object.keys(payload).forEach((key) => {
				if (
					payload[key] === "" ||
					payload[key] === null ||
					payload[key] === undefined
				) {
					delete payload[key];
				}
			});

			const response = await apiHelper.post(
				`/transaction/getUserTransactions/${user?._id}`,
				payload,
			);
			const data = response?.data?.transactions || [];
			const totalPagesFromAPI = response?.data?.totalPages || 1;

			setTransactions(data);
			setTotalPages(totalPagesFromAPI);
		} catch (error) {
			toast.error("Failed to fetch transactions: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const applyFilters = () => {
		setPage(1);
		fetchTransactions(1, filters);
		setShowFilters(false);
	};

	const clearFilters = () => {
		const clearedFilters = {
			status: "",
			transactionType: "",
			minAmount: "",
			maxAmount: "",
		};
		setFilters(clearedFilters);
		setPage(1);
		fetchTransactions(1, clearedFilters);
		setShowFilters(false);
	};

	const getStatusPill = (status) => {
		if (status === "Accept") return "bg-green-600/20 text-green-400";
		if (status === "Reject") return "bg-red-600/20 text-red-400";
		if (status === "Initial") return "bg-blue-600/20 text-blue-400";
		return "bg-orange-600/20 text-orange-400";
	};

	const getIconConfig = (type) => {
		if (type === "Deposit") {
			return {
				bg: "bg-green-50",
				icon: "text-green-600",
				sign: "+",
			};
		}
		return {
			bg: "bg-red-50",
			icon: "text-red-600",
			sign: "-",
		};
	};

	const toggleTransactionDetails = (transactionId) => {
		if (expandedTransactions === transactionId) {
			setExpandedTransactions(null);
		} else {
			setExpandedTransactions(transactionId);
		}
	};

	const fetchTransactionScreenshot = async (transactionId) => {
		setScreenshotLoading(true);
		try {
			const response = await apiHelper.get(
				`/transaction/fetch_powerPay_transaction_screenshot/${transactionId}`,
			);
			setScreenshotData(response);
			setShowScreenshot(true);
		} catch (error) {
			toast.error("Failed to fetch screenshot: " + error.message);
		} finally {
			setScreenshotLoading(false);
		}
	};

	return (
		<>
			<Header />
			<div className="!min-h-screen mt-15">
				<div className="max-w-[600px] bg-[#0e0e0e] min-h-screen mx-auto">
					<div className="flex items-center justify-end pt-4 px-4 flex-wrap gap-2">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="p-1 px-1 sm:px-2 text-black bg-white flex text-[12px] rounded-lg hover:bg-gray-200"
						>
							<Filter size={20} className="my-auto text-black" />
							{/* {t('applyFilters')} */}
						</button>
					</div>
					<div>
						{showFilters && (
							<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
								<div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
									{/* HEADER */}
									<div className="flex justify-between items-center mb-6">
										<div>
											<h2 className="text-xl font-semibold text-white flex items-center gap-2">
												<div className="w-8 h-8 bg-[#f59e0b] rounded-lg flex items-center justify-center">
													<Filter className="w-4 h-4 text-black" />
												</div>
												{t("applyFilters")}
											</h2>
											<p className="text-gray-400 text-sm mt-2">
												Filter your transactions
											</p>
										</div>
										<button
											onClick={() => setShowFilters(false)}
											className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
										>
											<X className="w-5 h-5" />
										</button>
									</div>

									{/* FILTER FORM */}
									<div className="space-y-4">
										{/* STATUS */}
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">
												{t("status")}
											</label>
											<select
												value={filters.status}
												onChange={(e) =>
													handleFilterChange("status", e.target.value)
												}
												className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
											>
												<option value="">{t("allStatus")}</option>
												<option value="Initial">{t("initial")}</option>
												<option value="Pending">{t("pending")}</option>
												<option value="Accept">{t("accept")}</option>
												<option value="Reject">{t("reject")}</option>
											</select>
										</div>

										{/* TYPE */}
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">
												{t("type")}
											</label>
											<select
												value={filters.transactionType}
												onChange={(e) =>
													handleFilterChange("transactionType", e.target.value)
												}
												className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
											>
												<option value="">{t("allTypes")}</option>
												<option value="Deposit">{t("deposit")}</option>
												<option value="Withdrawal">{t("withdraw")}</option>
											</select>
										</div>

										{/* AMOUNT */}
										<div className="grid grid-cols-2 gap-3">
											<input
												type="number"
												placeholder={`${t("amount")} (Min)`}
												value={filters.minAmount}
												onChange={(e) =>
													handleFilterChange("minAmount", e.target.value)
												}
												className="px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
											/>
											<input
												type="number"
												placeholder={`${t("amount")} (Max)`}
												value={filters.maxAmount}
												onChange={(e) =>
													handleFilterChange("maxAmount", e.target.value)
												}
												className="px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
											/>
										</div>

										{/* ACTION BUTTONS */}
										<div className="flex gap-3 pt-4">
											<button
												onClick={applyFilters}
												className="flex-1 py-3 rounded-lg bg-[#f59e0b] hover:bg-[#f59e0b] text-black font-semibold transition-colors"
											>
												{t("applyFilters")}
											</button>
											<button
												onClick={clearFilters}
												className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#3a3a3a] font-semibold transition-colors"
											>
												{t("clear")}
											</button>
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="space-y-3 mt-3 px-2 sm:px-4">
							{loading ? (
								<div className="text-center py-8">
									<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
									<p className="text-gray-400">Loading transactions...</p>
								</div>
							) : transactions.length === 0 ? (
								<div className="text-center py-8 text-gray-400">
									<p>No transactions found</p>
								</div>
							) : (
								transactions.map((transaction, index) => {
									const icon = getIconConfig(transaction.transactionType);

									return (
										<div
											key={transaction?._id || index}
											className="bg-[#2a2a2a] rounded-xl p-4"
										>
											{/* TOP ROW - CLICKABLE */}
											<div
												className="flex items-start gap-4 cursor-pointer"
												onClick={() =>
													toggleTransactionDetails(transaction._id)
												}
											>
												{/* ICON */}
												<div className="w-12 h-12 rounded-full bg-[#3a3a3a] flex items-center justify-center">
													{transaction.transactionType === "Deposit" ? (
														// <ArrowDown className={`w-7 h-7 ${icon.icon}`} />

														<svg
															width="24"
															height="24"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M2 8.5H14.5"
																stroke="#0B930B"
																stroke-width="1.5"
																stroke-miterlimit="10"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M6 16.5H8"
																stroke="#0B930B"
																stroke-width="1.5"
																stroke-miterlimit="10"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M10.5 16.5H14.5"
																stroke="#0B930B"
																stroke-width="1.5"
																stroke-miterlimit="10"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M22 14.03V16.11C22 19.62 21.11 20.5 17.56 20.5H6.44C2.89 20.5 2 19.62 2 16.11V7.89C2 4.38 2.89 3.5 6.44 3.5H14.5"
																stroke="#0B930B"
																stroke-width="1.5"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M20 3.5V9.5L22 7.5"
																stroke="#0B930B"
																stroke-width="1.5"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M20 9.5L18 7.5"
																stroke="#0B930B"
																stroke-width="1.5"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
													) : (
														// <ArrowUp className={`w-7 h-7 ${icon.icon}`} />

														<svg
															width="24"
															height="24"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																d="M2 8.5H14.5"
																stroke="#FF1212"
																stroke-width="1.5"
																stroke-miterlimit="10"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M6 16.5H8"
																stroke="#FF1212"
																stroke-width="1.5"
																stroke-miterlimit="10"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M10.5 16.5H14.5"
																stroke="#FF1212"
																stroke-width="1.5"
																stroke-miterlimit="10"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M22 14.03V16.11C22 19.62 21.11 20.5 17.56 20.5H6.44C2.89 20.5 2 19.62 2 16.11V7.89C2 4.38 2.89 3.5 6.44 3.5H14.5"
																stroke="#FF1212"
																stroke-width="1.5"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M20 9.5V3.5L22 5.5"
																stroke="#FF1212"
																stroke-width="1.5"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
															<path
																d="M20 3.5L18 5.5"
																stroke="#FF1212"
																stroke-width="1.5"
																stroke-linecap="round"
																stroke-linejoin="round"
															/>
														</svg>
													)}
												</div>

												{/* MAIN INFO */}
												<div className="flex-1">
													<p className="text-sm font-medium text-white">
														{transaction.transactionType === "Deposit" ? "Deposit to wallet" : "Withdraw from wallet"}
													</p>

													<p className="text-xs text-gray-400 mt-1">
														{transaction.createdAt
															? new Date(transaction.createdAt).toLocaleString("en-IN", {
																weekday: "short",
																month: "short",
																day: "2-digit",
																year: "numeric",
																hour: "2-digit",
																minute: "2-digit",
																hour12: true
															})
															: ""}
													</p>
												</div>

												{/* AMOUNT + STATUS */}
												<div className="text-right">
													<p className="text-lg font-bold text-white">
														{icon.sign}{transaction.amount}
													</p>

													<span className={`inline-block mt-1 px-3 py-1 rounded-md text-xs font-medium ${getStatusPill(transaction.status)}`}>
														{transaction.status === "Accept" ? "Completed" :
														transaction.status === "Reject" ? "Rejected" :
														transaction.status === "Initial" ? "Initial" : "Pending"}
													</span>
												</div>
											</div>

											{/* EXTRA DETAILS (MANDATORY DATA) - EXPANDABLE */}
											{expandedTransactions === transaction._id && (
												<div className="mt-4 space-y-2 text-sm text-gray-300 border-t border-gray-600 pt-4">
													<div className="flex justify-between">
														<span className="text-gray-300">
															{t("gameName")}:
														</span>
														<span className="font-medium">
															{transaction.gameName || "N/A"}
														</span>
													</div>

													<div className="flex justify-between">
														<span className="text-gray-300">
															{t("clientName")}:
														</span>
														<span className="font-medium">
															{transaction.clientName || "N/A"}
														</span>
													</div>

													<div className="flex justify-between">
														<span className="text-gray-300">
															{t("remark")}:
														</span>
														<span className="font-medium">
															{transaction.remarks || "-"}
														</span>
													</div>

													<div className="flex justify-between">
														<span className="text-gray-300">
															{t("transactionFrom")}:
														</span>
														<span className="font-medium">
															{transaction.transactionFrom || "N/A"}
														</span>
													</div>

													<div className="flex justify-between text-xs pt-2 border-t border-gray-100">
														<span className="text-gray-300">
															{t("createdAt")}:
														</span>
														<span>
															{transaction.createdAt
																? new Date(
																		transaction.createdAt,
																	).toLocaleString("en-IN")
																: "N/A"}
														</span>
													</div>

													<div className="flex justify-between text-xs">
														<span className="text-gray-300">
															{t("updatedAt")}:
														</span>
														<span>
															{transaction.updatedAt
																? new Date(
																		transaction.updatedAt,
																	).toLocaleString("en-IN")
																: "N/A"}
														</span>
													</div>
												</div>
											)}

											{/* SCREENSHOT BUTTON (KEEP LOGIC) - ONLY SHOW WHEN EXPANDED */}
											{expandedTransactions === transaction._id &&
												transaction?.transactionType === "Withdrawal" &&
												transaction?.mode === "PowerPay" &&
												transaction?.status !== "Reject" && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															fetchTransactionScreenshot(transaction?._id);
														}}
														className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-blue-500 text-blue-600 hover:bg-blue-50"
													>
														<Eye className="w-4 h-4" />
														View Screenshot
													</button>
												)}
										</div>
									);
								})
							)}
						</div>

						{/* Pagination */}
						{!loading && totalPages > 1 && (
							<div className="flex items-center justify-center gap-3 py-6 px-4">
								<button
									onClick={() => setPage((prev) => Math.max(1, prev - 1))}
									disabled={page === 1}
									className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
										page === 1
											? "bg-[#1b1b1b] text-gray-600 cursor-not-allowed"
											: "bg-[#005993] text-white hover:bg-[#004a7a] shadow-lg"
									}`}
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M15 18L9 12L15 6"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<span className="hidden sm:inline">Previous</span>
								</button>

								<div className="flex items-center gap-2 px-4 py-2.5 bg-[#1b1b1b] rounded-xl">
									<span className="text-white font-semibold">{page}</span>
									<span className="text-gray-500">/</span>
									<span className="text-gray-400">{totalPages}</span>
								</div>

								<button
									onClick={() =>
										setPage((prev) => Math.min(totalPages, prev + 1))
									}
									disabled={page === totalPages}
									className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
										page === totalPages
											? "bg-[#1b1b1b] text-gray-600 cursor-not-allowed"
											: "bg-[#005993] text-white hover:bg-[#004a7a] shadow-lg"
									}`}
								>
									<span className="hidden sm:inline">Next</span>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M9 18L15 12L9 6"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Screenshot Modal */}
				{showScreenshot && (
					<div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="flex justify-between items-center p-4 border-b">
								<h3 className="text-lg font-semibold text-gray-900">
									Transaction Screenshot
								</h3>
								<button
									onClick={() => {
										setShowScreenshot(false);
										setScreenshotData(null);
									}}
									className="text-gray-400 hover:text-gray-600"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
							<div className="p-4">
								{screenshotLoading ? (
									<div className="text-center py-8">
										<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
										<p className="text-gray-600">Loading screenshot...</p>
									</div>
								) : screenshotData ? (
									<div className="space-y-4">
										{screenshotData?.data?.data?.screenshotPeer ? (
											<img
												src={screenshotData?.data?.data.screenshotPeer}
												alt="Transaction Screenshot"
												className="w-full h-auto rounded-lg border"
											/>
										) : (
											<div className="text-center py-8 text-gray-500">
												<p>No screenshot available for this transaction</p>
											</div>
										)}
										{screenshotData.message && (
											<div className="bg-gray-50 p-3 rounded-lg">
												<p className="text-sm text-gray-600">
													{screenshotData.message}
												</p>
											</div>
										)}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500">
										<p>Failed to load screenshot</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				<BottomNavigation activePage="passbook" />
			</div>
		</>
	);
};

export default Passbook;
