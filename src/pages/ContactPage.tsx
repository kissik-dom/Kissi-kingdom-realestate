import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Building, Phone, Globe } from "lucide-react";

export function ContactPage() {
	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf8]">
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
						CONTACT US
					</p>
					<h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
					<p className="text-lg text-gray-300 max-w-xl">
						For broker inquiries, portfolio access, or general questions, reach
						out through any of the channels below.
					</p>
				</div>
			</section>

			<section className="py-16 px-4 flex-1">
				<div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
					{[
						{
							icon: <Mail className="size-6 text-[#c5972c]" />,
							title: "Email",
							detail: "kissikingdomoffice@gmail.com",
							link: "mailto:kissikingdomoffice@gmail.com",
						},
						{
							icon: <Building className="size-6 text-[#c5972c]" />,
							title: "Legal Oversight",
							detail: "Timothy Daniel, Esq.\nOhio Bar No. 18978\nCivil Securities LLC",
						},
						{
							icon: <Globe className="size-6 text-[#c5972c]" />,
							title: "Global Operations",
							detail: "Portfolio spanning 164 countries\n24/7 Portal Access",
						},
						{
							icon: <Phone className="size-6 text-[#c5972c]" />,
							title: "Office",
							detail: "By appointment only.\nContact via email for scheduling.",
						},
					].map((item) => (
						<div
							key={item.title}
							className="bg-white border border-[#e0d8cc] rounded-lg p-6 hover:shadow-md transition-shadow"
						>
							<div className="w-12 h-12 rounded-lg bg-[#0f1d3a] flex items-center justify-center mb-4">
								{item.icon}
							</div>
							<h3 className="text-lg font-semibold text-[#0f1d3a] mb-2">
								{item.title}
							</h3>
							{item.link ? (
								<a
									href={item.link}
									className="text-sm text-[#c5972c] hover:underline"
								>
									{item.detail}
								</a>
							) : (
								<p className="text-sm text-gray-600 whitespace-pre-line">
									{item.detail}
								</p>
							)}
						</div>
					))}
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
