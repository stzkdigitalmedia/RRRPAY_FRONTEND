import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

const AddBankModal = ({
	isOpen,
	onClose,
	bankForm,
	onBankFormChange,
	onSubmit,
}) => {
	const { t } = useTranslation();

	console.log("--------bank-----");
	// Don't render if modal is closed
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
			<div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
				{/* Modal Header */}
				<div className="flex justify-between items-center mb-6">
					<div>
						<h2 className="text-xl font-semibold text-white flex items-center gap-2">
							<div className="w-8 h-8 bg-[#f59e0b] ff9d1f rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">🏦</span>
							</div>
							{t("addBankDetails")}
						</h2>
						<p className="text-gray-400 text-sm mt-2">
							{t("saveBankForWithdrawals")}
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Bank Form */}
				<form onSubmit={onSubmit} className="space-y-4">
					{/* UPI ID Field */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							{t("upiId")}
						</label>
						<input
							type="text"
							placeholder={t("enterUpiId")}
							value={bankForm.upiId}
							onChange={(e) =>
								onBankFormChange({ ...bankForm, upiId: e.target.value })
							}
							className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
							required
						/>
					</div>

					{/* Bank Name Field */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							{t("bankName")}
						</label>
						<input
							type="text"
							placeholder={t("enterBankName")}
							value={bankForm.bankName}
							onChange={(e) =>
								onBankFormChange({ ...bankForm, bankName: e.target.value })
							}
							className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
							required
						/>
					</div>

					{/* Account Number Field */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							{t("accountNumber")}
						</label>
						<input
							type="text"
							placeholder={t("enterAccountNumber")}
							value={bankForm.accountNumber}
							onChange={(e) =>
								onBankFormChange({ ...bankForm, accountNumber: e.target.value })
							}
							className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
							required
						/>
					</div>

					{/* Account Holder Name Field */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							{t("accountHolder")}
						</label>
						<input
							type="text"
							placeholder={t("enterAccountHolder")}
							value={bankForm.accountHolderName}
							onChange={(e) =>
								onBankFormChange({
									...bankForm,
									accountHolderName: e.target.value,
								})
							}
							className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
							required
						/>
					</div>

					{/* IFSC Code Field */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							{t("ifscCode")}
						</label>
						<input
							type="text"
							placeholder={t("enterIfscCode")}
							value={bankForm.ifscCode}
							onChange={(e) =>
								onBankFormChange({ ...bankForm, ifscCode: e.target.value })
							}
							className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
							required
						/>
					</div>

					{/* Form Actions */}
					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							className="flex-1 py-3 rounded-lg bg-[#f59e0b] hover:bg-[#f59e0b] text-black font-semibold transition-colors"
						>
							{t("saveBank")}
						</button>
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-[#3a3a3a] font-semibold transition-colors"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddBankModal;
