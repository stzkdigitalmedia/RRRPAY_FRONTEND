import { X, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * WalletModal Component
 * Displays transaction history with filtering and pagination capabilities
 * Shows all user transactions in a detailed table format
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Array} props.transactions - List of user transactions
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback for filter changes
 * @param {Function} props.onApplyFilters - Callback to apply filters
 * @param {Function} props.onClearFilters - Callback to clear filters
 * @param {boolean} props.isLoading - Loading state for transactions
 * @param {number} props.currentPage - Current pagination page
 * @param {Function} props.onPageChange - Callback for page navigation
 * @param {Function} props.onViewScreenshot - Callback to view transaction screenshot
 */
const WalletModal = ({
  isOpen,
  onClose,
  transactions,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  isLoading,
  currentPage,
  onPageChange,
  onViewScreenshot
}) => {
  const { t } = useTranslation();

  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ffa600] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">₹</span>
              </div>
              {t('transactionHistory')}
            </h2>
            <p className="text-gray-400 text-sm mt-2">{t('viewHistory')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('status')}</label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">{t('allStatus')}</option>
                <option value="Initial">{t('initial')}</option>
                <option value="Pending">{t('pending')}</option>
                <option value="Accept">{t('accept')}</option>
                <option value="Reject">{t('reject')}</option>
              </select>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('type')}</label>
              <select
                value={filters.transactionType}
                onChange={(e) => onFilterChange('transactionType', e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">{t('allTypes')}</option>
                <option value="Deposit">{t('deposit')}</option>
                <option value="Withdrawal">{t('withdraw')}</option>
              </select>
            </div>

            {/* Minimum Amount Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('amount')} (Min)</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => onFilterChange('minAmount', e.target.value)}
                placeholder="Min amount"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Maximum Amount Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('amount')} (Max)</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => onFilterChange('maxAmount', e.target.value)}
                placeholder="Max amount"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onApplyFilters}
              className="px-4 py-2 bg-[#ffa600] hover:bg-[#ff9d1f] text-black rounded-lg font-semibold transition-colors text-sm"
            >
              {t('applyFilters')}
            </button>
            <button
              onClick={onClearFilters}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-[#3a3a3a] rounded-lg font-semibold transition-colors text-sm"
            >
              {t('clearFilters')}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4" style={{ width: '32px', height: '32px' }}></div>
            <p className="text-gray-400">{t('loadingTransactions')}...</p>
          </div>
        ) : transactions.length === 0 ? (
          // Empty State
          <div className="text-center py-8 text-gray-400">
            <p className="text-lg mb-2">{t('noTransactions')}</p>
            <p className="text-sm">{t('requestFirstTransaction')}</p>
          </div>
        ) : (
          // Transactions Table
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-[#2a2a2a]">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('amount')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('type')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Game Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('clientName')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('status')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Remark</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Transaction From</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">{t('createdAt')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Updated At</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction.id || transaction._id || index} className="border-b border-gray-700">
                    {/* Row Number */}
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-white">{((currentPage - 1) * 10) + index + 1}</p>
                    </td>
                    {/* Action Column - Screenshot Button */}
                    <td className="py-4 px-4">
                      {transaction?.transactionType === 'Withdrawal' && transaction?.mode === 'PowerPay' && transaction?.status === 'Accept' ? (
                        <button
                          onClick={() => onViewScreenshot(transaction?._id)}
                          className="p-2 text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Screenshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    {/* Amount Column */}
                    <td className="py-4 px-4">
                      <p className={`text-sm font-medium ${transaction.transactionType === 'Deposit' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.transactionType === 'Deposit' ? '+' : '-'}₹{transaction.amount}
                      </p>
                    </td>
                    {/* Type Badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${transaction.transactionType === 'Deposit'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-red-600/20 text-red-400'
                      }`}>
                        {transaction.transactionType}
                      </span>
                    </td>
                    {/* Game Name */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-300">{transaction.gameName || 'Main Wallet'}</p>
                    </td>
                    {/* Client Name */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-300">{transaction.clientName || 'N/A'}</p>
                    </td>
                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${transaction.status === 'Accept'
                        ? 'bg-green-600/20 text-green-400'
                        : transaction.status === 'Reject'
                          ? 'bg-red-600/20 text-red-400'
                          : transaction.status === 'Pending'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'bg-orange-600/20 text-orange-400'
                      }`}>
                        {transaction.status || 'Pending'}
                      </span>
                    </td>
                    {/* Remarks */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-300">{transaction.remarks || 'No remark'}</p>
                    </td>
                    {/* Transaction Mode */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-300">
                        {transaction.mode === "Wallet"
                          ? "Game Transaction"
                          : transaction.mode === "PowerPay"
                            ? "Wallet Transaction"
                            : transaction.mode}
                      </p>
                    </td>
                    {/* Created Date */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-300">{new Date(transaction.createdAt).toLocaleString('en-IN', { hour12: true })}</p>
                    </td>
                    {/* Updated Date */}
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-300">{transaction.updatedAt ? new Date(transaction.updatedAt).toLocaleString('en-IN', { hour12: true }) : 'N/A'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {t('showingPage')} {currentPage} {t('transactions')}
              </div>
              <div className="flex items-center gap-2">
                {/* Previous Page Button */}
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-2 text-sm bg-[#ffa600] hover:bg-[#ff9d1f] text-black rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('previous')}
                </button>
                {/* Current Page Indicator */}
                <span className="px-3 py-2 text-sm bg-[#2a2a2a] text-white rounded-lg">
                  {t('page')} {currentPage}
                </span>
                {/* Next Page Button */}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm bg-[#ffa600] hover:bg-[#ff9d1f] text-black rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
