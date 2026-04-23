import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ADMIN_ACCESS_CODE } from "@/lib/constants";

export function BrokerPortalPage() {
	const [code, setCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const navigate = useNavigate();

	const agent = useQuery(
		api.agents.verifyAccessCode,
		code.length === 6 ? { code } : "skip",
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (code.length !== 6) {
			toast.error("Please enter a valid 6-digit access code");
			return;
		}
		setIsVerifying(true);

		// Small delay to let query resolve
		setTimeout(() => {
			if (agent) {
				toast.success(`Welcome, ${agent.name}`);
				// Store agent session with role
				sessionStorage.setItem("brokerAgent", JSON.stringify(agent));

				// Route based on role
				if (agent.role === "admin" || code === ADMIN_ACCESS_CODE) {
					navigate("/admin");
				} else {
					navigate("/browse");
				}
			} else {
				toast.error("Invalid access code. Please try again.");
				setIsVerifying(false);
			}
		}, 800);
	};

	return (
		<div className="flex-1 flex flex-col overflow-hidden min-h-screen kissi-gradient">
			<section className="text-white flex-1 flex flex-col items-center justify-center py-16 px-4">
				<div className="max-w-md w-full">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#c5972c] mb-10"
					>
						<ArrowLeft className="size-4" />
						Back to Home
					</Link>

					{/* Crest */}
					<div className="flex justify-start mb-6">
						<div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#c5972c] to-[#a67c1e] flex items-center justify-center">
							<span className="text-2xl">👑</span>
						</div>
					</div>

					<h1 className="text-3xl font-bold mb-2">Broker Portal</h1>
					<p className="text-gray-400 mb-8 text-sm">
						Enter your unique access code to continue.
					</p>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2 font-medium">
								ACCESS CODE
							</label>
							<Input
								type="text"
								maxLength={6}
								value={code}
								onChange={(e) =>
									setCode(
										e.target.value
											.replace(/\D/g, "")
											.slice(0, 6),
									)
								}
								placeholder="000000"
								className="bg-white/5 border-white/20 text-white text-center text-2xl tracking-[0.5em] py-4 h-14 placeholder:text-gray-600 font-mono focus:border-[#c5972c] focus:ring-[#c5972c]"
							/>
						</div>

						<Button
							type="submit"
							disabled={code.length !== 6 || isVerifying}
							className="w-full bg-[#c5972c] hover:bg-[#d4a94a] text-white py-3 h-12 text-base font-medium"
						>
							{isVerifying ? "Verifying..." : "Enter Portal"}
						</Button>
					</form>

					{/* Admin hint */}
					<div className="mt-8 border-t border-white/10 pt-6">
						<div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
							<Shield className="size-3" />
							<span className="uppercase tracking-widest">
								Admin Access
							</span>
						</div>
						<p className="text-xs text-gray-500">
							Administrators enter their admin access code above to
							manage agents, assign properties, and oversee the
							full pipeline.
						</p>
					</div>

					<p className="text-xs text-gray-500 mt-6">
						Access codes are issued by the Kissi Kingdom office. For
						inquiries:{" "}
						<a
							href="mailto:kissikingdomoffice@gmail.com"
							className="text-[#c5972c] hover:underline"
						>
							kissikingdomoffice@gmail.com
						</a>
					</p>
				</div>
			</section>
		</div>
	);
}
