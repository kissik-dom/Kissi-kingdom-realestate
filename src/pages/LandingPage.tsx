import { Link } from "react-router-dom";
import { ArrowRight, Lock, Globe, Scale, Building, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf8]">
			{/* Hero Section */}
			<section className="kissi-gradient text-white py-20 md:py-32 px-4">
				<div className="max-w-4xl mx-auto text-center space-y-6">
					{/* Crest */}
					<div className="flex justify-center mb-4">
						<div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#c5972c] to-[#a67c1e] flex items-center justify-center shadow-lg shadow-[#c5972c]/20">
							<span className="text-3xl">👑</span>
						</div>
					</div>

					<p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#c5972c] font-medium">
						Sovereign Authority of the Royal House of Kissi™
					</p>

					<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
						Global Real Estate
						<br />
						<span className="text-[#c5972c]">Portfolio Management</span>
					</h1>

					<p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
						A secure platform for authorized brokers and agents managing
						properties on behalf of the Royal World Trust, backed by the Kissi
						Kingdom Sovereign Wealth Fund.
					</p>

					<div className="flex flex-wrap items-center justify-center gap-4 pt-4">
						<Link to="/our-why">
							<Button className="bg-[#c5972c] hover:bg-[#d4a94a] text-white px-8 py-3 text-base font-medium rounded">
								Our Why <ArrowRight className="ml-2 size-4" />
							</Button>
						</Link>
						<Link to="/broker-portal">
							<Button
								variant="outline"
								className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-base font-medium rounded bg-transparent"
							>
								Broker Portal
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Stats Bar */}
			<section className="bg-[#0a1428] border-t border-[#1e3460] py-8 px-4">
				<div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
					{[
						{ value: "2,100+", label: "PROPERTIES" },
						{ value: "164", label: "COUNTRIES" },
						{ value: "7", label: "ASSET CLASSES" },
						{ value: "24/7", label: "PORTAL ACCESS" },
					].map((stat) => (
						<div key={stat.label}>
							<div className="text-2xl md:text-3xl font-bold text-[#c5972c]">
								{stat.value}
							</div>
							<div className="text-xs tracking-[0.15em] text-gray-400 mt-1">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Our Foundation */}
			<section className="py-16 md:py-24 px-4 bg-[#fafaf8]">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<p className="text-xs tracking-[0.3em] uppercase text-[#c5972c] font-medium mb-3">
							OUR FOUNDATION
						</p>
						<h2 className="text-3xl md:text-4xl font-bold text-[#0f1d3a]">
							Built on Integrity & Excellence
						</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{[
							{
								icon: <Lock className="size-7 text-[#c5972c]" />,
								title: "Confidential & Secure",
								desc: "Every broker operates within an isolated portal. No cross-visibility. All access governed by NDA and strict confidentiality protocols.",
							},
							{
								icon: <Globe className="size-7 text-[#c5972c]" />,
								title: "Global Portfolio",
								desc: "Properties spanning 164 countries — ocean view estates, farmland, wineries, mineral rights, and luxury holdings curated for the Royal World Trust.",
							},
							{
								icon: <Scale className="size-7 text-[#c5972c]" />,
								title: "Attorney Oversight",
								desc: "All transactions are conducted under the oversight of Timothy Daniel, Esq., Ohio Bar No. 18978, Civil Securities.",
							},
						].map((card) => (
							<div
								key={card.title}
								className="bg-white border border-[#e0d8cc] rounded-lg p-8 text-center hover:shadow-lg transition-shadow"
							>
								<div className="w-14 h-14 rounded-lg bg-[#0f1d3a] flex items-center justify-center mx-auto mb-5">
									{card.icon}
								</div>
								<h3 className="text-lg font-semibold text-[#0f1d3a] mb-3">
									{card.title}
								</h3>
								<p className="text-sm text-gray-600 leading-relaxed">
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
						<p className="text-xs tracking-[0.3em] uppercase text-[#c5972c] font-medium mb-3">
							PORTFOLIO
						</p>
						<h2 className="text-3xl md:text-4xl font-bold text-[#0f1d3a]">
							Asset Categories
						</h2>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
								className="group bg-[#fafaf8] border border-[#e0d8cc] rounded-lg p-5 text-center hover:border-[#c5972c] hover:shadow-md transition-all"
							>
								<div className="text-3xl mb-3">{cat.icon}</div>
								<div className="text-sm font-medium text-[#0f1d3a] group-hover:text-[#c5972c] transition-colors">
									{cat.label}
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section className="kissi-gradient text-white py-16 md:py-24 px-4">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<p className="text-xs tracking-[0.3em] uppercase text-[#c5972c] font-medium">
						CONTACT
					</p>
					<h2 className="text-3xl md:text-4xl font-bold">Get in Touch</h2>
					<p className="text-gray-300 max-w-xl mx-auto">
						For inquiries about the Kissi Kingdom portfolio or broker access,
						contact our office.
					</p>
					<div className="flex flex-wrap justify-center gap-8 pt-4">
						<div className="flex items-center gap-3">
							<Mail className="size-5 text-[#c5972c]" />
							<span className="text-sm">legal@kissikingdom.com</span>
						</div>
						<div className="flex items-center gap-3">
							<Building className="size-5 text-[#c5972c]" />
							<span className="text-sm">Civil Securities LLC</span>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-[#0a1428] text-gray-400 py-8 px-4 text-center text-xs">
				<p>
					© {new Date().getFullYear()} Kissi Kingdom — Sovereign Authority of
					the Royal House of Kissi™. All rights reserved.
				</p>
			</footer>
		</div>
	);
}
