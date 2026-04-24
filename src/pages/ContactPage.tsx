import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Building, Phone, Globe } from "lucide-react";

export function ContactPage() {
	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf8]">
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
						CONTACT US
					</p>
					<h1 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h1>
					<p className="text-sm text-gray-400 max-w-xl">
						All correspondence must be initiated through email. Calls are arranged by appointment
						after proper documentation is established. Strict confidentiality protocols apply.
					</p>
				</div>
			</section>

			<section className="py-14 px-4 flex-1 bg-gradient-to-b from-[#faf9f6] to-[#f5f3ee]">
				<div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
					{[
						{
							icon: <Mail className="size-5 text-[#c5972c]" />,
							title: "Email",
							detail: "legal@kissikingdom.com",
							link: "mailto:legal@kissikingdom.com",
						},
						{
							icon: <Building className="size-5 text-[#c5972c]" />,
							title: "Legal Oversight",
							detail: "Timothy Daniel, Esq.\nOhio Bar No. 18978\nCivil Securities LLC",
						},
						{
							icon: <Globe className="size-5 text-[#c5972c]" />,
							title: "Global Operations",
							detail: "Portfolio spanning 164 countries\n24/7 Portal Access",
						},
						{
							icon: <Phone className="size-5 text-[#c5972c]" />,
							title: "Office",
							detail: "By appointment only.\nContact via email for scheduling.",
						},
					].map((item) => (
						<div
							key={item.title}
							className="bg-white border border-[#e0d8cc]/60 rounded-lg p-6 hover:shadow-lg hover:shadow-[#c5972c]/5 transition-all"
						>
							<div className="w-10 h-10 rounded-lg bg-gradient-to-b from-[#0f1d3a] to-[#162850] flex items-center justify-center mb-3">
								{item.icon}
							</div>
							<h3 className="text-sm font-semibold text-[#0f1d3a] mb-2">
								{item.title}
							</h3>
							{item.link ? (
								<a
									href={item.link}
									className="text-xs text-[#c5972c] hover:underline"
								>
									{item.detail}
								</a>
							) : (
								<p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">
									{item.detail}
								</p>
							)}
						</div>
					))}
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
