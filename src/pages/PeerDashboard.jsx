import React from 'react';
import PeerSidebar from '../components/peer/PeerSidebar';

const PeerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PeerSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Peer Transactions</h1>
          <p className="text-gray-700">Use the sidebar links to open the Deposit or Withdraw pages.</p>
        </div>
      </div>
    </div>
  );
};

export default PeerDashboard;