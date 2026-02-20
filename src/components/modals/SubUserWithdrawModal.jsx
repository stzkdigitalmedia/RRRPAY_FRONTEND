import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const SubUserWithdrawModal = ({
    isOpen,
    onClose,
    withdrawForm,
    onFormChange,
    onSubmit,
    isProcessing,
    subUserBalance,
    isBalanceLoading,
    selectedSubUserId
}) => {
    const { t } = useTranslation();



    console.log('--------SubUserWithdrawModal-----')

    // Don't render if modal is closed
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#2a2a2a', borderRadius: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>{t('withdrawFromSub')}</h2>
                        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>ID: {selectedSubUserId || 'N/A'}</p>
                        {/* Sub User Balance Display */}
                        <div className="mt-2">
                            {isBalanceLoading ? (
                                <div className="flex items-center gap-3 bg-green-50 px-3 py-2 rounded-xl shadow-sm">
                                    {/* Loading Spinner */}
                                    <div className="w-5 h-5 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                    {/* Loading Text */}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">{t('balance')}</span>
                                        <span className="text-sm text-gray-500 animate-pulse">{t('loading')}...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl shadow-sm">
                                    <span className="text-gray-700 font-medium text-sm">{t('balance')}:</span>
                                    <span className="text-lg font-bold text-green-600">
                                        ₹{Number(subUserBalance).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ color: '#9ca3af' }}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Loading State for Balance */}
                {isBalanceLoading ? (
                    <div className="text-center py-8">
                        <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
                        <p className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>{t('loadingBalance')}</p>
                        <p className="text-sm" style={{ color: '#9ca3af' }}>Please wait while we fetch the current balance</p>
                    </div>
                ) : (
                    // Withdraw Form
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Amount Field - Minimum ₹500 */}
                        <div className="form-group">
                            <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>Amount (Minimum ₹500)</label>
                            <input
                                type="number"
                                placeholder="Enter Amount (min 500)"
                                value={withdrawForm.amount}
                                onChange={(e) => onFormChange({ ...withdrawForm, amount: e.target.value })}
                                onWheel={(e) => e.target.blur()}
                                className="w-full px-4 py-3 rounded-lg"
                                style={{ background: '#1a1a1a', border: '1px solid #4b5563', color: '#ffffff' }}
                                required
                                min="500"
                            />
                        </div>

                        {/* Bank Selection Section - Currently Commented Out */}
                        {/* Bank selection will be implemented when needed */}

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button type="submit" disabled={isProcessing} className="flex-1 py-3 rounded-lg font-semibold" style={{ background: '#ffa600', color: '#000000' }}>
                                {isProcessing ? (
                                    <>{t('processing')}</>
                                ) : (
                                    <>{t('withdraw')}</>
                                )}
                            </button>
                            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg font-semibold" style={{ border: '1px solid #4b5563', color: '#d1d5db', background: 'transparent' }}>
                                {t('cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SubUserWithdrawModal;
