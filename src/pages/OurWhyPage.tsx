import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Users, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OurWhyPage() {
	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf8]">
			{/* Hero */}
			<section className="kissi-gradient text-white py-16 md:py-24 px-4 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
				<div className="max-w-4xl mx-auto relative z-10">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#c5972c] mb-8"
					>
						<ArrowLeft className="size-4" />
						Back to Home
					</Link>

					<p className="text-[10px] tracking-[0.35em] uppercase text-[#c5972c]/80 font-medium mb-4">
						OUR WHY
					</p>
					<h1 className="text-3xl md:text-4xl font-bold mb-6">
						Building Legacy Through
						<br />
						<span className="bg-gradient-to-r from-[#c5972c] via-[#e0c060] to-[#c5972c] bg-clip-text text-transparent">
							Strategic Real Estate
						</span>
					</h1>
					<p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
						The Kissi Kingdom&apos;s approach to global real estate portfolio
						management is rooted in principles of sovereignty, integrity, and
						generational wealth building.
					</p>
				</div>
			</section>

			{/* Cross River Gorilla Section */}
			<section className="bg-[#060e1e] py-12 px-4 relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Cross_River_Gorilla_%28Gorilla_gorilla_diehli%29.jpg/1280px-Cross_River_Gorilla_%28Gorilla_gorilla_diehli%29.jpg')] bg-cover bg-center opacity-[0.08]" />
				<div className="max-w-4xl mx-auto relative z-10 text-center">
					<p className="text-[10px] tracking-[0.35em] uppercase text-[#c5972c]/60 font-medium mb-3">
						GUARDIAN OF THE FOREST
					</p>
					<h2 className="text-xl md:text-2xl font-bold text-white/90 mb-4">
						The Western Lowland Gorilla
					</h2>
					<p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
						The forests of the Kissi homeland — spanning the border regions of Guinea, Sierra Leone, and Liberia — are home to the critically endangered Western Lowland Gorilla (<em className="text-[#c5972c]/60">Gorilla gorilla gorilla</em>). These magnificent creatures, the largest living primates, represent the strength, dignity, and quiet power of the land the Kissi people have stewarded for centuries. Their protection is integral to the Kissi Kingdom&apos;s environmental stewardship mission.
					</p>
				</div>
			</section>

			{/* Values */}
			<section className="py-16 md:py-24 px-4 bg-gradient-to-b from-[#faf9f6] to-[#f5f3ee]">
				<div className="max-w-5xl mx-auto">
					<div className="grid md:grid-cols-2 gap-10">
						{[
							{
								icon: <Shield className="size-6 text-[#c5972c]" />,
								title: "Sovereignty & Self-Determination",
								desc: "As the sovereign authority of the Royal House of Kissi, our portfolio reflects the autonomy and self-determination of our people. Every acquisition is strategic, every investment deliberate.",
							},
							{
								icon: <Users className="size-6 text-[#c5972c]" />,
								title: "Community & Empowerment",
								desc: "Our investments near historically Black colleges and universities reflect our commitment to community development and educational empowerment.",
							},
							{
								icon: <Globe className="size-6 text-[#c5972c]" />,
								title: "Global Presence",
								desc: "With properties spanning 164 countries, the Royal World Trust maintains a global footprint that ensures diversified, resilient holdings across every continent.",
							},
							{
								icon: <Heart className="size-6 text-[#c5972c]" />,
								title: "Generational Wealth",
								desc: "Every property acquired is a brick in the foundation of generational wealth — from mineral rights to farmland, from commercial towers to luxury estates.",
							},
						].map((item) => (
							<div key={item.title} className="flex gap-4">
								<div className="w-12 h-12 rounded-lg bg-gradient-to-b from-[#0f1d3a] to-[#162850] flex items-center justify-center shrink-0">
									{item.icon}
								</div>
								<div>
									<h3 className="text-sm font-semibold text-[#0f1d3a] mb-2">
										{item.title}
									</h3>
									<p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="kissi-gradient text-white py-16 px-4 text-center relative">
				<div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
				<div className="max-w-2xl mx-auto space-y-5 relative z-10">
					<h2 className="text-2xl font-bold">Ready to Partner?</h2>
					<p className="text-sm text-gray-400">
						Access the broker portal to explore available properties and begin
						the acquisition process.
					</p>
					<Link to="/broker-portal">
						<Button className="bg-gradient-to-r from-[#c5972c] to-[#a67c1e] hover:from-[#d4a94a] hover:to-[#c5972c] text-white px-8 py-3 text-sm shadow-lg shadow-[#c5972c]/20">
							Enter Broker Portal
						</Button>
					</Link>
				</div>
			</section>

			<footer className="bg-[#060e1e] text-gray-500 py-8 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<img
						src="/royal-seal.png"
						alt="Royal Seal"
						className="w-10 h-10 object-contain mx-auto mb-3 opacity-30"
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
