import { ChevronLeft, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const SubUserDepositModal = ({
	isOpen,
	onClose,
	depositForm,
	onFormChange,
	onSubmit,
	isProcessing,
	userBalance,
	selectedSubUserId,
}) => {
	const { t } = useTranslation();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
			<div className="bg-[#1a1a1a] border border-gray-800 shadow-2xl max-w-md w-full rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
				<div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-black/40 backdrop-blur-md">
					<button
						onClick={onClose}
						className="text-gray-300 hover:text-white transition-colors"
					>
						<ChevronLeft className="w-6 h-6" />
					</button>
					<h2 className="text-xl font-semibold text-white">Deposit</h2>
				</div>

				{isProcessing ? (
					<div className="text-center py-8 px-4">
						<div
							className="loading-spinner mx-auto mb-4"
							style={{ width: "32px", height: "32px" }}
						></div>
						<p className="text-lg font-semibold text-white mb-2">
							{t("processing")}...
						</p>
						<p className="text-sm text-gray-400">
							Please wait while we process your deposit
						</p>
					</div>
				) : (
					<div className="p-6">
						<div className="flex justify-center mb-6 mt-4">
							<div className="relative">
								<div className="w-20 h-20 bg-[#f59e0b] rounded-2xl flex items-center justify-center shadow-lg">
									<ArrowUp className="w-10 h-10 text-black" strokeWidth={3} />
								</div>
								<div className="absolute -top-2 -left-2 w-20 h-16 border-4 border-[#f59e0b]/60 rounded-2xl"></div>
							</div>
						</div>

						<div className="text-center mb-8">
							<p className="text-gray-400 text-sm mb-2">Wallet Balance</p>
							<p className="text-white text-4xl font-bold">
								₹{userBalance}
							</p>
						</div>

						<form onSubmit={onSubmit} className="space-y-6">
							<div>
								<label className="text-gray-300 text-sm mb-2 block font-medium">
									Coins* (Minimum deposit amount is 100 coins)
								</label>
								<input
									type="number"
									placeholder="Enter Coins"
									value={depositForm.amount}
									onChange={(e) =>
										onFormChange({ ...depositForm, amount: e.target.value })
									}
									onWheel={(e) => e.target.blur()}
									className="w-full bg-[#2a2a2a] text-white placeholder-gray-500 px-4 py-3.5 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all"
									required
									min="100"
								/>
							</div>

							<button
								type="submit"
								className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold py-3.5 rounded-xl transition-all shadow-lg"
							>
								DEPOSIT COINS
							</button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
};

export default SubUserDepositModal;
