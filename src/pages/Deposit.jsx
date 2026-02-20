import React from 'react';
import PeerSidebar from '../components/peer/PeerSidebar';
import TransactionsPanel from '../components/peer/TransactionsPanel';

const Deposit = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PeerSidebar />
      <div className="flex-1 p-8">
        <TransactionsPanel transactionType="Deposit" />
      </div>
    </div>
  );
};

export default Deposit;
