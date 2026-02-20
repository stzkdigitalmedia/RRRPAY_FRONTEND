import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

const Offers = () => {
	const navigate = useNavigate();

	return (
		<>
			<Header />
			<div className="min-h-screen bg-black overflow-y-auto scrollbar-hide">
				<style jsx>{`
					.scrollbar-hide::-webkit-scrollbar {
						display: none;
					}
					.scrollbar-hide {
						-ms-overflow-style: none;
						scrollbar-width: none;
					}
				`}</style>
				<div className="max-w-[600px] bg-[#0e0e0e] min-h-screen mx-auto flex flex-col items-center justify-center px-4">
					{/* No Offers Icon */}
					<div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-6">
						<svg
							className="w-16 h-16 text-purple-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
							/>
							<line
								x1="4"
								y1="4"
								x2="20"
								y2="20"
								stroke="currentColor"
								strokeWidth={2}
								strokeLinecap="round"
							/>
						</svg>
					</div>

					{/* No Offers Text */}
					<h2 className="text-[#f59e0b] text-2xl font-semibold mb-2">No Offers Yet</h2>
					<p className="text-gray-400 text-sm mb-8">Please create ID</p>

					{/* Create ID Button */}
					{/* <button
						onClick={() => navigate("/my-ids")}
						className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
					>
						<Plus className="w-5 h-5" />
						CREATE ID
					</button> */}
				</div>
			</div>
			<BottomNavigation activePage="offers" />
		</>
	);
};

export default Offers;
