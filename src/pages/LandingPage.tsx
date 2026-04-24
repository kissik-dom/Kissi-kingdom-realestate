import { Link } from "react-router-dom";
import { ArrowRight, Lock, Globe, Scale, Building, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf8]">
			{/* Hero Section */}
			<section className="kissi-gradient text-white py-20 md:py-32 px-4 relative overflow-hidden">
				{/* Subtle gradient overlay for depth */}
				<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
				<div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
					{/* Royal Seal */}
					<div className="flex justify-center mb-4">
						<img
							src="/royal-seal.png"
							alt="Royal Seal of the Kissi Kingdom"
							className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-lg"
						/>
					</div>

					<p className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#c5972c]/80 font-medium">
						From the Sovereign Authority of the Royal House of Kissi™
					</p>

					<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
						<span className="bg-gradient-to-r from-[#c5972c] via-[#e0c060] to-[#c5972c] bg-clip-text text-transparent">
							Global Real Estate
						</span>
						<br />
						<span className="text-white/90 text-2xl sm:text-3xl md:text-4xl font-light">
							Portfolio Management
						</span>
					</h1>

					<p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
						A secure platform for authorized brokers and agents managing
						properties on behalf of the Royal World Trust, backed by the Kissi
						Kingdom Sovereign Wealth Fund.
					</p>

					<div className="flex flex-wrap items-center justify-center gap-4 pt-4">
						<Link to="/our-why">
							<Button className="bg-gradient-to-r from-[#c5972c] to-[#a67c1e] hover:from-[#d4a94a] hover:to-[#c5972c] text-white px-8 py-3 text-sm font-medium rounded shadow-lg shadow-[#c5972c]/20">
								Our Why <ArrowRight className="ml-2 size-4" />
							</Button>
						</Link>
						<Link to="/broker-portal">
							<Button
								variant="outline"
								className="border-[#c5972c]/40 text-[#c5972c] hover:bg-[#c5972c]/10 px-8 py-3 text-sm font-medium rounded bg-transparent"
							>
								Broker Portal
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Stats Bar */}
			<section className="bg-[#060e1e] border-t border-[#c5972c]/10 py-8 px-4">
				<div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
					{[
						{ value: "2,100+", label: "PROPERTIES" },
						{ value: "164", label: "COUNTRIES" },
						{ value: "12", label: "ASSET CLASSES" },
						{ value: "24/7", label: "PORTAL ACCESS" },
					].map((stat) => (
						<div key={stat.label}>
							<div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#c5972c] to-[#e0c060] bg-clip-text text-transparent">
								{stat.value}
							</div>
							<div className="text-[10px] tracking-[0.2em] text-gray-500 mt-1">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Our Foundation */}
			<section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#faf9f6] to-[#f5f3ee]">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<p className="text-[10px] tracking-[0.35em] uppercase text-[#c5972c] font-medium mb-3">
							OUR FOUNDATION
						</p>
						<h2 className="text-2xl md:text-3xl font-bold text-[#0f1d3a]">
							Built on Integrity & Excellence
						</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-5">
						{[
							{
								icon: <Lock className="size-6 text-[#c5972c]" />,
								title: "Confidential & Secure",
								desc: "Every broker operates within an isolated portal. No cross-visibility. All access governed by NDA and strict confidentiality protocols.",
							},
							{
								icon: <Globe className="size-6 text-[#c5972c]" />,
								title: "Global Portfolio",
								desc: "Properties spanning 164 countries — ocean view estates, farmland, wineries, mineral rights, and luxury holdings curated for the Royal World Trust.",
							},
							{
								icon: <Scale className="size-6 text-[#c5972c]" />,
								title: "Attorney Oversight",
								desc: "All transactions are conducted under the oversight of Timothy Daniel, Esq., Ohio Bar No. 18978, Civil Securities.",
							},
						].map((card) => (
							<div
								key={card.title}
								className="bg-white border border-[#e0d8cc]/60 rounded-lg p-7 text-center hover:shadow-lg hover:shadow-[#c5972c]/5 transition-all"
							>
								<div className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#0f1d3a] to-[#162850] flex items-center justify-center mx-auto mb-4">
									{card.icon}
								</div>
								<h3 className="text-sm font-semibold text-[#0f1d3a] mb-2">
									{card.title}
								</h3>
								<p className="text-xs text-gray-500 leading-relaxed">
									{card.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Property Categories Preview */}
			<section className="py-16 md:py-24 px-4 bg-white">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<p className="text-[10px] tracking-[0.35em] uppercase text-[#c5972c] font-medium mb-3">
							PORTFOLIO
						</p>
						<h2 className="text-2xl md:text-3xl font-bold text-[#0f1d3a]">
							Asset Categories
						</h2>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{[
							{ icon: "🏛️", label: "Ivy League Schools" },
							{ icon: "🌍", label: "International Cities" },
							{ icon: "💎", label: "Precious Minerals" },
							{ icon: "🍷", label: "Wineries" },
							{ icon: "🌾", label: "Large-Scale Farms" },
							{ icon: "🐄", label: "Cattle Farms" },
							{ icon: "🥭", label: "Specialty Farms" },
							{ icon: "🏢", label: "NYC Commercial" },
							{ icon: "🏬", label: "Apartment Complexes" },
							{ icon: "🎓", label: "HBCU Properties" },
							{ icon: "🏟️", label: "Arenas & Stadiums" },
							{ icon: "🏈", label: "NBA/NFL Land" },
						].map((cat) => (
							<Link
								key={cat.label}
								to="/broker-portal"
								className="group bg-[#fafaf8] border border-[#e0d8cc]/60 rounded-lg p-4 text-center hover:border-[#c5972c]/40 hover:shadow-md transition-all"
							>
								<div className="text-2xl mb-2">{cat.icon}</div>
								<div className="text-xs font-medium text-[#0f1d3a] group-hover:text-[#c5972c] transition-colors">
									{cat.label}
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section className="kissi-gradient text-white py-16 md:py-24 px-4 relative">
				<div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
				<div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
					<p className="text-[10px] tracking-[0.35em] uppercase text-[#c5972c]/80 font-medium">
						CONTACT
					</p>
					<h2 className="text-2xl md:text-3xl font-bold">Get in Touch</h2>
					<p className="text-sm text-gray-400 max-w-xl mx-auto">
						For inquiries about the Kissi Kingdom portfolio or broker access,
						contact our office.
					</p>
					<div className="flex flex-wrap justify-center gap-8 pt-4">
						<div className="flex items-center gap-3">
							<Mail className="size-4 text-[#c5972c]" />
							<span className="text-sm text-gray-300">legal@kissikingdom.com</span>
						</div>
						<div className="flex items-center gap-3">
							<Building className="size-4 text-[#c5972c]" />
							<span className="text-sm text-gray-300">Civil Securities LLC</span>
						</div>
					</div>
				</div>
			</section>

			{/* Footer with seal */}
			<footer className="bg-[#060e1e] text-gray-500 py-8 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<img
						src="/royal-seal.png"
						alt="Royal Seal"
						className="w-12 h-12 object-contain mx-auto mb-3 opacity-40"
					/>
					<p className="text-[10px] tracking-wider">
						© {new Date().getFullYear()} Kissi Kingdom — From the Sovereign Authority of
						the Royal House of Kissi™. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
