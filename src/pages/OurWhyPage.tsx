import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Users, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OurWhyPage() {
	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf8]">
			{/* Hero */}
			<section className="kissi-gradient text-white py-16 md:py-24 px-4">
				<div className="max-w-4xl mx-auto">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#c5972c] mb-8"
					>
						<ArrowLeft className="size-4" />
						Back to Home
					</Link>

					<p className="text-xs tracking-[0.3em] uppercase text-[#c5972c] font-medium mb-4">
						OUR WHY
					</p>
					<h1 className="text-4xl md:text-5xl font-bold mb-6">
						Building Legacy Through
						<br />
						<span className="text-[#c5972c]">Strategic Real Estate</span>
					</h1>
					<p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
						The Kissi Kingdom's approach to global real estate portfolio
						management is rooted in principles of sovereignty, integrity, and
						generational wealth building.
					</p>
				</div>
			</section>

			{/* Values */}
			<section className="py-16 md:py-24 px-4">
				<div className="max-w-5xl mx-auto">
					<div className="grid md:grid-cols-2 gap-12">
						{[
							{
								icon: <Shield className="size-8 text-[#c5972c]" />,
								title: "Sovereignty & Self-Determination",
								desc: "As the sovereign authority of the Royal House of Kissi, our portfolio reflects the autonomy and self-determination of our people. Every acquisition is strategic, every investment deliberate.",
							},
							{
								icon: <Users className="size-8 text-[#c5972c]" />,
								title: "Community & Empowerment",
								desc: "Our investments near historically Black colleges and universities reflect our commitment to community development and educational empowerment.",
							},
							{
								icon: <Globe className="size-8 text-[#c5972c]" />,
								title: "Global Presence",
								desc: "With properties spanning 164 countries, the Royal World Trust maintains a global footprint that ensures diversified, resilient holdings across every continent.",
							},
							{
								icon: <Heart className="size-8 text-[#c5972c]" />,
								title: "Generational Wealth",
								desc: "Every property acquired is a brick in the foundation of generational wealth — from mineral rights to farmland, from commercial towers to luxury estates.",
							},
						].map((item) => (
							<div key={item.title} className="flex gap-5">
								<div className="w-16 h-16 rounded-lg bg-[#0f1d3a] flex items-center justify-center shrink-0">
									{item.icon}
								</div>
								<div>
									<h3 className="text-xl font-semibold text-[#0f1d3a] mb-2">
										{item.title}
									</h3>
									<p className="text-gray-600 leading-relaxed">{item.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="kissi-gradient text-white py-16 px-4 text-center">
				<div className="max-w-2xl mx-auto space-y-6">
					<h2 className="text-3xl font-bold">Ready to Partner?</h2>
					<p className="text-gray-300">
						Access the broker portal to explore available properties and begin
						the acquisition process.
					</p>
					<Link to="/broker-portal">
						<Button className="bg-[#c5972c] hover:bg-[#d4a94a] text-white px-8 py-3">
							Enter Broker Portal
						</Button>
					</Link>
				</div>
			</section>

			<footer className="bg-[#0a1428] text-gray-400 py-8 px-4 text-center text-xs">
				<p>
					© {new Date().getFullYear()} Kissi Kingdom — Sovereign Authority of
					the Royal House of Kissi™. All rights reserved.
				</p>
			</footer>
		</div>
	);
}
