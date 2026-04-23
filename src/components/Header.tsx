import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function Header() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const location = useLocation();

	const isAuthPage =
		location.pathname === "/login" || location.pathname === "/signup";

	// Hide header on landing page (it has its own hero/nav), broker portal, and browse
	const hideHeader = ["/", "/broker-portal", "/browse"].includes(
		location.pathname,
	);
	if (hideHeader) return null;

	return (
		<header className="sticky top-0 z-50 border-b border-[#e0d8cc] bg-[#0f1d3a]/95 backdrop-blur-md">
			<div className="container">
				<div className="flex h-14 items-center justify-between">
					<Link
						to="/"
						className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity text-white"
					>
						<div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#c5972c] to-[#a67c1e] flex items-center justify-center">
							<span className="text-sm">👑</span>
						</div>
						<span className="hidden sm:inline tracking-wide">
							KISSI KINGDOM
						</span>
					</Link>

					<nav className="flex items-center gap-1">
						<Link
							to="/our-why"
							className="text-xs text-gray-300 hover:text-[#c5972c] px-3 py-2 transition-colors"
						>
							Our Why
						</Link>
						<Link
							to="/contact"
							className="text-xs text-gray-300 hover:text-[#c5972c] px-3 py-2 transition-colors"
						>
							Contact
						</Link>
						<Link
							to="/broker-portal"
							className="text-xs text-gray-300 hover:text-[#c5972c] px-3 py-2 transition-colors"
						>
							Broker Portal
						</Link>

						{isLoading ? null : isAuthenticated ? (
							<Button
								size="sm"
								asChild
								className="bg-[#c5972c] hover:bg-[#d4a94a] text-white ml-2 h-8 text-xs"
							>
								<Link to="/dashboard">
									Dashboard
									<ArrowRight className="size-3 ml-1" />
								</Link>
							</Button>
						) : (
							!isAuthPage && (
								<Button
									size="sm"
									asChild
									className="bg-[#c5972c] hover:bg-[#d4a94a] text-white ml-2 h-8 text-xs"
								>
									<Link to="/login">Agent Login</Link>
								</Button>
							)
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
