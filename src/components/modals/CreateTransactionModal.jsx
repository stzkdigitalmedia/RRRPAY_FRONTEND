import {
	ChevronLeft,
	Trash2,
	Eye,
	Upload,
	CheckCircle2,
	Building2,
	CreditCard,
	User2,
	Hash,
	QrCode,
	Copy,
	ArrowUp,
	ArrowDown,
	X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { apiHelper } from "../../utils/apiHelper";

const CreateTransactionModal = ({
	isOpen,
	onClose,
	transactionForm,
	onFormChange,
	onSubmit,
	isProcessing,
	userBalance,
	selectedBranch,
	onBranchChange,
	user,
	savedBanks,
	selectedBankId,
	onBankIdChange,
	banksLoading,
	onDeleteBank,
	onAddBankClick,
	fetchUserBalance,
	fetchBanks,
}) => {
	const { t } = useTranslation();

	// Fetch banks when modal opens for withdraw
	useEffect(() => {
		if (
			isOpen &&
			transactionForm?.transactionType === "Withdraw" &&
			fetchBanks
		) {
			fetchBanks();
		}
	}, [isOpen, transactionForm?.transactionType]);

	console.log("--------CreateTransactionModal-----");

	// Local state for UTR upload popup (shown when Deposit + RRRPAY)
	const [showUTRModal, setShowUTRModal] = useState(false);
	const [utrNo, setUtrNo] = useState("");
	const [screenshotFile, setScreenshotFile] = useState(null);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [uploadError, setUploadError] = useState(null);
	const [bankDetails, setBankDetails] = useState(null);
	const [loadingBankDetails, setLoadingBankDetails] = useState(false);
	const [qrCodeUrl, setQrCodeUrl] = useState("");

	// Fetch bank details when UTR modal opens
	const fetchBankDetails = async () => {
		setLoadingBankDetails(true);
		try {
			const data = await apiHelper.get(
				"/bank/getActiveBankDetails/697dfaf3a21085957445d0fd",
			);
			setBankDetails(data?.data || data);
		} catch (err) {
			console.error("Failed to fetch bank details", err);
		} finally {
			setLoadingBankDetails(false);
		}
	};

	// Generate QR code for UPI
	const generateQRCode = async (upiId, amount) => {
		try {
			const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&cu=INR`;
			const qrUrl = await QRCode.toDataURL(upiUrl);
			setQrCodeUrl(qrUrl);
		} catch (err) {
			console.error("QR generation failed:", err);
		}
	};

	// Generate QR when bank details and amount are available
	useEffect(() => {
		if (bankDetails?.upiId && transactionForm.amount) {
			generateQRCode(bankDetails.upiId, transactionForm.amount);
		}
	}, [bankDetails, transactionForm.amount]);

	// Auto-select branch if no RRRPAY and only one active branch
	useEffect(() => {
		if (isOpen && !selectedBranch && user?.teirId?.branches) {
			const activeBranches = user.teirId.branches.filter(
				(branch) => branch.isActive,
			);
			// If no isManual (no RRRPAY option) and only one active branch, auto-select it
			if (!user.teirId.isManual && activeBranches.length === 1) {
				onBranchChange(activeBranches[0].branchName);
			}
		}
	}, [isOpen, user, selectedBranch, onBranchChange]);

	// Copy to clipboard function
	const copyToClipboard = (text) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				alert("Copied to clipboard!");
			})
			.catch(() => {
				alert("Failed to copy");
			});
	};

	// Submit UTR + screenshot to manual transaction endpoint
	const handleUTRSubmit = async (e) => {
		e.preventDefault();
		setUploadError(null);

		if (!transactionForm.amount) {
			setUploadError("Please enter amount");
			return;
		}
		if (!utrNo || utrNo.trim() === "") {
			setUploadError("Please enter UTR number");
			return;
		}
		if (!screenshotFile) {
			setUploadError("Please attach screenshot file");
			return;
		}

		const formData = new FormData();
		formData.append("userId", user?._id || user?.id || "");
		formData.append("amount", transactionForm.amount);
		formData.append("transactionType", "Deposit");
		formData.append("role", "User");
		formData.append("mode", "RRRPAY");
		formData.append("branchUserName", "RRRPAY");
		formData.append("utrNo", utrNo);
		formData.append("userScreenShot", screenshotFile);

		setUploadLoading(true);

		try {
			const json = await apiHelper.postFormData(
				"/transaction/create_Manual_Transaction_For_MainUser",
				formData,
			);
			window.alert(json.message || "Transaction created successfully");
			setShowUTRModal(false);
			setUtrNo("");
			setScreenshotFile(null);
			fetchUserBalance && fetchUserBalance();
			onClose && onClose();
		} catch (err) {
			console.error("UTR upload failed", err);
			setUploadError(err.message || "Upload failed");
		} finally {
			setUploadLoading(false);
		}
	};

	const handleFileChange = (e) => {
		const f = e.target.files && e.target.files[0];
		if (f) setScreenshotFile(f);
	};

	// Don't render if modal is closed
	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
				<div className="bg-[#1a1a1a] border border-gray-800 shadow-2xl max-w-md w-full rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
					<div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-black/40 backdrop-blur-md">
						<button
							onClick={onClose}
							className="text-gray-300 hover:text-white transition-colors"
						>
							<ChevronLeft className="w-6 h-6" />
						</button>
						<h2 className="text-xl font-semibold text-white">
							{transactionForm?.transactionType === "Withdraw"
								? "Withdraw"
								: "Deposit"}
						</h2>
					</div>

					<div className="p-6">
						<div className="flex justify-center mb-6 mt-4">
							<div className="relative">
								<div className="w-20 h-20 bg-[#f59e0b] rounded-2xl flex items-center justify-center shadow-lg">
									{transactionForm?.transactionType === "Withdraw" ? (
										<ArrowDown
											className="w-10 h-10 text-black"
											strokeWidth={3}
										/>
									) : (
										<ArrowUp className="w-10 h-10 text-black" strokeWidth={3} />
									)}
								</div>
								<div className="absolute -top-2 -left-2 w-20 h-16 border-4 border-[#f59e0b]/60 rounded-2xl"></div>
							</div>
						</div>

						<div className="text-center mb-8">
							<p className="text-gray-400 text-sm mb-2">Wallet Balance</p>
							<p className="text-white text-4xl font-bold">₹{userBalance}</p>
						</div>

						<form onSubmit={onSubmit} className="space-y-6">
							<div>
								<label className="text-gray-300 text-sm mb-2 block font-medium">
									Coins* (Minimum deposit amount is 500 coins)
								</label>
								<input
									type="number"
									placeholder="Enter Coins"
									value={transactionForm.amount}
									onChange={(e) =>
										onFormChange({ ...transactionForm, amount: e.target.value })
									}
									onWheel={(e) => e.target.blur()}
									className="w-full bg-[#2a2a2a] text-white placeholder-gray-500 px-4 py-3.5 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all"
									required
									min={500}
								/>
							</div>

							{user?.teirId?.isManual && user.teirId.branches.length > 0 ? (
								<div>
									<label className="text-gray-300 text-sm mb-2 block font-medium">
										Select Payment Method
									</label>
									<div className="space-y-2 mb-2">
										<div
											className={`p-3 border rounded-xl cursor-pointer transition-all ${
												selectedBranch === "RRRPAY"
													? "border-[#f59e0b] bg-[#2a2a2a]"
													: "border-gray-700 bg-[#252525] hover:border-gray-600"
											}`}
											onClick={() => onBranchChange("RRRPAY")}
										>
											<div className="flex items-center gap-3">
												<input
													type="radio"
													name="branchSelection"
													value="RRRPAY"
													checked={selectedBranch === "RRRPAY"}
													onChange={() => onBranchChange("RRRPAY")}
													className="text-[#f59e0b] focus:ring-[#f59e0b]"
												/>
												<span className="font-medium text-white">RRRPAY</span>
											</div>
										</div>
									</div>
									<div className="space-y-2">
										{user.teirId.branches
											.filter((branch) => branch.isActive)
											.map((branch, index) => (
												<div
													key={index}
													className={`p-3 border rounded-xl cursor-pointer transition-all ${
														selectedBranch === branch.branchName
															? "border-[#f59e0b] bg-[#2a2a2a]"
															: "border-gray-700 bg-[#252525] hover:border-gray-600"
													}`}
													onClick={() => onBranchChange(branch.branchName)}
												>
													<div className="flex items-center gap-3">
														<input
															type="radio"
															name="branchSelection"
															value={branch.branchName}
															checked={selectedBranch === branch.branchName}
															onChange={() => onBranchChange(branch.branchName)}
															className="text-[#f59e0b] focus:ring-[#f59e0b]"
														/>
														<span className="font-medium text-white">
															{branch.branchName}
														</span>
													</div>
												</div>
											))}
									</div>
								</div>
							) : (
								user?.teirId?.branches &&
								user.teirId.branches.length > 0 && (
									<div>
										<label className="text-gray-300 text-sm mb-2 block font-medium">
											Select Payment Method
										</label>
										<div className="space-y-2">
											{user.teirId.branches
												.filter((branch) => branch.isActive)
												.map((branch, index) => (
													<div
														key={index}
														className={`p-3 border rounded-xl cursor-pointer transition-all ${
															selectedBranch === branch.branchName
																? "border-[#f59e0b] bg-[#2a2a2a]"
																: "border-gray-700 bg-[#252525] hover:border-gray-600"
														}`}
														onClick={() => onBranchChange(branch.branchName)}
													>
														<div className="flex items-center gap-3">
															<input
																type="radio"
																name="branchSelection"
																value={branch.branchName}
																checked={selectedBranch === branch.branchName}
																onChange={() =>
																	onBranchChange(branch.branchName)
																}
																className="text-[#f59e0b] focus:ring-[#f59e0b]"
															/>
															<span className="font-medium text-white">
																{branch.branchName}
															</span>
														</div>
													</div>
												))}
										</div>
									</div>
								)
							)}

							{transactionForm?.transactionType === "Withdraw" && (
								<>
									{banksLoading ? (
										<div className="text-center py-4">
											<div
												className="loading-spinner mx-auto mb-2"
												style={{ width: "20px", height: "20px" }}
											></div>
											<p className="text-gray-400 text-sm">Loading banks...</p>
										</div>
									) : savedBanks.length > 0 ? (
										<div>
											<label className="text-gray-300 text-sm mb-2 block font-medium">
												{t("selectBankAccount")}
											</label>
											<div className="space-y-3">
												{savedBanks.map((bank, index) => (
													<div
														key={bank.id || bank._id || index}
														className={`p-3 border rounded-xl cursor-pointer transition-all ${
															selectedBankId === index.toString()
																? "border-[#f59e0b] bg-[#2a2a2a]"
																: "border-gray-700 bg-[#252525] hover:border-gray-600"
														}`}
														onClick={() => onBankIdChange(index.toString())}
													>
														<div className="flex items-center gap-3">
															<input
																type="radio"
																name="bankSelection"
																value={index}
																checked={selectedBankId === index.toString()}
																onChange={() =>
																	onBankIdChange(index.toString())
																}
																className="text-[#f59e0b] focus:ring-[#f59e0b]"
															/>
															<div className="flex-1">
																<div className="font-medium text-white">
																	{bank.bankName || "Unknown Bank"}
																</div>
																<div className="text-sm text-gray-400">
																	Holder Name:{" "}
																	{bank.accHolderName || "Unknown Holder"}
																</div>
																<div className="text-sm text-gray-500">
																	A/C: {bank.accNo || "N/A"}
																</div>
																<div className="text-sm text-gray-500">
																	IFSC: {bank.ifscCode || "N/A"}
																</div>
																{bank.upiId && (
																	<div className="text-sm text-gray-500">
																		UPI: {bank.upiId}
																	</div>
																)}
															</div>
															<button
																type="button"
																onClick={(e) => {
																	e.stopPropagation();
																	onDeleteBank(bank.id || bank._id);
																}}
																className="text-red-400 hover:text-red-300 p-1 transition-colors"
																title="Delete Bank Account"
															>
																<Trash2 className="w-4 h-4" />
															</button>
														</div>
													</div>
												))}
											</div>
										</div>
									) : (
										<div className="text-center py-4 text-gray-400">
											<p className="text-sm">
												No bank accounts found. Add your first bank account.
											</p>
										</div>
									)}

									<button
										type="button"
										onClick={onAddBankClick}
										className="w-full py-3.5 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold rounded-xl transition-all shadow-lg"
									>
										{t("addBank")}
									</button>
								</>
							)}

							{selectedBranch === "RRRPAY" &&
							transactionForm?.transactionType === "Deposit" ? (
								<button
									type="button"
									onClick={() => {
										if (!transactionForm.amount) {
											alert("Please enter amount");
											return;
										}
										fetchBankDetails();
										setShowUTRModal(true);
									}}
									className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-3.5 rounded-xl transition-all shadow-lg"
								>
									{transactionForm?.transactionType === "Withdraw"
										? "WITHDRAW COINS"
										: "DEPOSIT COINS"}
								</button>
							) : (
								<button
									type="submit"
									disabled={isProcessing}
									className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isProcessing
										? "Processing..."
										: transactionForm?.transactionType === "Withdraw"
											? "WITHDRAW COINS"
											: "DEPOSIT COINS"}
								</button>
							)}
						</form>
					</div>
				</div>
			</div>

			{showUTRModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
					<div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
						{/* Header */}
						<div className="flex justify-between items-center mb-6">
							<div>
								<h3 className="text-xl font-semibold text-white flex items-center gap-2">
									<div className="w-8 h-8 bg-[#f59e0b] rounded-lg flex items-center justify-center">
										<span className="text-black font-bold text-sm">₹</span>
									</div>
									Complete Payment
								</h3>
								<p className="text-gray-400 text-sm mt-2">
									Enter payment details
								</p>
							</div>
							<button
								onClick={() => setShowUTRModal(false)}
								className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Amount Display */}
						<div className="mb-4 p-3 bg-[#2a2a2a] rounded-lg border border-gray-700">
							<div className="flex justify-between items-center">
								<span className="text-gray-300 font-medium text-sm">
									Amount to Pay
								</span>
								<span className="text-lg font-bold text-[#f59e0b]">
									₹{transactionForm.amount}
								</span>
							</div>
						</div>

						{/* Bank Details */}
						{loadingBankDetails ? (
							<div className="mb-4 p-3 bg-[#2a2a2a] rounded-lg">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin"></div>
									<p className="text-gray-400">Loading bank details...</p>
								</div>
							</div>
						) : bankDetails ? (
							<div className="mb-4">
								{/* QR Code Section */}
								{bankDetails.upiId && qrCodeUrl && (
									<div className="mb-3 p-3 bg-[#2a2a2a] rounded-lg border border-gray-700">
										<div className="text-center">
											<div className="flex items-center justify-center gap-2 mb-2">
												<QrCode className="w-4 h-4 text-[#f59e0b]" />
												<h4 className="font-medium text-white">
													Scan QR to Pay
												</h4>
											</div>
											<div className="bg-white p-2 rounded-lg inline-block">
												<img
													src={qrCodeUrl}
													alt="UPI QR Code"
													className="w-24 h-24"
												/>
											</div>
											<p className="text-xs text-gray-400 mt-1">
												Scan with any UPI app
											</p>
											<p className="text-xs text-gray-500 font-mono">
												{bankDetails.upiId}
											</p>
										</div>
									</div>
								)}

								{/* Bank Details */}
								<div className="bg-[#2a2a2a] rounded-xl border border-gray-700 shadow-sm">
									<div className="p-2 border-b border-gray-700">
										<h4 className="font-semibold text-white flex items-center gap-2">
											<div className="p-1 bg-[#f59e0b]/20 rounded-lg">
												<Building2 className="w-4 h-4 text-[#f59e0b]" />
											</div>
											Bank Details
										</h4>
									</div>
									<div className="p-2 space-y-1">
										<div className="flex items-center justify-between p-1.5 bg-[#1a1a1a] rounded-lg">
											<span className="text-gray-400 font-medium text-xs">
												Bank Name
											</span>
											<div className="flex items-center gap-1">
												<span className="font-semibold text-white text-xs">
													{bankDetails.bankName || "N/A"}
												</span>
												<button
													onClick={() => copyToClipboard(bankDetails.bankName)}
													className="p-0.5 text-[#f59e0b] hover:bg-gray-700 rounded transition-colors"
												>
													<Copy className="w-3 h-3" />
												</button>
											</div>
										</div>
										<div className="flex items-center justify-between p-1.5 bg-[#1a1a1a] rounded-lg">
											<span className="text-gray-400 font-medium text-xs">
												Account Number
											</span>
											<div className="flex items-center gap-1">
												<span className="font-mono font-semibold text-white text-xs">
													{bankDetails.accNo || "N/A"}
												</span>
												<button
													onClick={() => copyToClipboard(bankDetails.accNo)}
													className="p-0.5 text-[#f59e0b] hover:bg-gray-700 rounded transition-colors"
												>
													<Copy className="w-3 h-3" />
												</button>
											</div>
										</div>
										<div className="flex items-center justify-between p-1.5 bg-[#1a1a1a] rounded-lg">
											<span className="text-gray-400 font-medium text-xs">
												Account Holder
											</span>
											<div className="flex items-center gap-1">
												<span className="font-semibold text-white text-xs">
													{bankDetails.accHolderName || "N/A"}
												</span>
												<button
													onClick={() =>
														copyToClipboard(bankDetails.accHolderName)
													}
													className="p-0.5 text-[#f59e0b] hover:bg-gray-700 rounded transition-colors"
												>
													<Copy className="w-3 h-3" />
												</button>
											</div>
										</div>
										<div className="flex items-center justify-between p-1.5 bg-[#1a1a1a] rounded-lg">
											<span className="text-gray-400 font-medium text-xs">
												IFSC Code
											</span>
											<div className="flex items-center gap-1">
												<span className="font-mono font-semibold text-white text-xs">
													{bankDetails.ifscCode || "N/A"}
												</span>
												<button
													onClick={() => copyToClipboard(bankDetails.ifscCode)}
													className="p-0.5 text-[#f59e0b] hover:bg-gray-700 rounded transition-colors"
												>
													<Copy className="w-3 h-3" />
												</button>
											</div>
										</div>
										{bankDetails.upiId && (
											<div className="flex items-center justify-between p-1.5 bg-[#1a1a1a] rounded-lg">
												<span className="text-gray-400 font-medium text-xs">
													UPI ID
												</span>
												<div className="flex items-center gap-1">
													<span className="font-mono font-semibold text-white text-xs">
														{bankDetails.upiId}
													</span>
													<button
														onClick={() => copyToClipboard(bankDetails.upiId)}
														className="p-0.5 text-[#f59e0b] hover:bg-gray-700 rounded transition-colors"
													>
														<Copy className="w-3 h-3" />
													</button>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						) : null}

						{/* Form */}
						<form onSubmit={handleUTRSubmit} className="space-y-4">
							{/* UTR Input */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									UTR / Transaction ID
								</label>
								<input
									type="text"
									value={utrNo}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, "");
										if (value.length <= 12) {
											setUtrNo(value);
										}
									}}
									placeholder="Enter 12-digit UTR number"
									className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] transition-colors"
									maxLength={12}
									required
								/>
							</div>

							{/* File Upload */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Payment Screenshot
								</label>
								<div className="relative">
									<input
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="hidden"
										id="screenshot-upload"
										required
									/>
									<label
										htmlFor="screenshot-upload"
										className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-[#f59e0b] cursor-pointer transition-colors bg-[#2a2a2a]"
									>
										{screenshotFile ? (
											<div className="text-center">
												<CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
												<span className="text-xs text-gray-300">
													{screenshotFile.name}
												</span>
											</div>
										) : (
											<div className="text-center">
												<Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
												<span className="text-xs text-gray-400">
													Click to upload screenshot
												</span>
											</div>
										)}
									</label>
								</div>
							</div>

							{/* Error Message */}
							{uploadError && (
								<div className="p-3 bg-red-600/20 border border-red-600 rounded-lg">
									<p className="text-xs text-red-400">{uploadError}</p>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex gap-3 pt-4">
								<button
									type="submit"
									disabled={uploadLoading}
									className="flex-1 bg-[#f59e0b] hover:bg-[#ff9d1f] text-black py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{uploadLoading ? "Uploading..." : "Submit Payment"}
								</button>
								<button
									type="button"
									onClick={() => setShowUTRModal(false)}
									className="flex-1 bg-[#2a2a2a] border border-gray-600 text-gray-300 hover:bg-[#3a3a3a] py-3 px-4 rounded-lg font-semibold transition-colors"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
};

export default CreateTransactionModal;
