import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const BottomNavigation = ({ activePage }) => {
	const navigate = useNavigate();
	const { logout } = useAuth();

	const handleLogout = () => {
		logout();
		window.location.href = "/login";
	};

	return (
		<>
			{/* Bottom Navigation Bar */}
			<div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-black max-w-[600px] w-full rounded-t-2xl shadow-lg z-50">
				<div className="flex items-center justify-around py-2 px-4 w-full">
					{/* Home */}
					<button
						onClick={() => navigate("/user-dashboard")}
						className={`flex flex-col items-center py-2 px-2 sm:px-3 transition-colors flex-1 ${
							activePage === "home"
								? "text-[#f59e0b]"
								: "text-gray-400 hover:text-[#f59e0b]"
						}`}
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 mb-1"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
						</svg>
						<span className="text-xs font-medium">Home</span>
					</button>

					{/* Offers */}
					<button
						onClick={() => navigate("/offers")}
						className={`flex flex-col items-center py-2 px-2 sm:px-3 transition-colors flex-1 ${
							activePage === "offers"
								? "text-[#f59e0b]"
								: "text-gray-400 hover:text-[#f59e0b]"
						}`}
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 mb-1"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
						</svg>
						<span className="text-xs font-medium">Offers</span>
					</button>

					{/* Passbook */}
					<button
						onClick={() => navigate("/passbook")}
						className={`flex flex-col items-center py-2 px-2 sm:px-3 transition-colors flex-1 ${
							activePage === "passbook"
								? "text-[#f59e0b]"
								: "text-gray-400 hover:text-[#f59e0b]"
						}`}
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 mb-1"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
						</svg>
						<span className="text-xs font-medium">Passbook</span>
					</button>

					{/* IDs */}
					<button
						onClick={() => navigate("/my-ids")}
						className={`flex flex-col items-center py-2 px-2 sm:px-3 transition-colors flex-1 ${
							activePage === "ids"
								? "text-[#f59e0b]"
								: "text-gray-400 hover:text-[#f59e0b]"
						}`}
					>
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 mb-1"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10-4h2v6h-2z" />
						</svg>
						<span className="text-xs font-medium">IDs</span>
					</button>

				</div>
			</div>

			{/* Bottom padding to prevent content overlap */}
			<div className="h-16"></div>
		</>
	);
};

export default BottomNavigation;
