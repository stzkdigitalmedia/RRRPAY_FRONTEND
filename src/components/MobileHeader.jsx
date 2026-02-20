import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Building2, Bell } from 'lucide-react';

const MobileHeader = ({ userBalance, onDepositClick, onWithdrawClick, onWalletClick }) => {
  const { user } = useAuth(true);

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
          Hi {(user?.clientName || "User").charAt(0).toUpperCase() + (user?.clientName || "User").slice(1)}
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

    <div className="w-full max-w-[600px] bg-[#0e0e0e] px-4 py-3 mt-20">
    <div className="grid grid-cols-3 gap-3">
          <div
            onClick={onDepositClick}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#222222] transition-colors"
          >
            <div className="w-10 h-10 bg-[#f59e0b] rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white text-xs font-medium">Deposit</span>
            <span className="text-white text-xs font-medium">Wallet</span>
          </div>

          <div
            onClick={onWalletClick}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#222222] transition-colors"
          >
            <div className="text-[#f59e0b] text-xl font-bold mb-1">
              ₹{userBalance || 0}
            </div>
            <span className="text-white text-xs font-medium">Wallet</span>
            <span className="text-white text-xs font-medium">Balance</span>
          </div>

          <div
            onClick={onWithdrawClick}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#222222] transition-colors"
          >
            <div className="w-10 h-10 bg-[#f59e0b] rounded-lg flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white text-xs font-medium">Withdraw</span>
            <span className="text-white text-xs font-medium">Wallet</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
