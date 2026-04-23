import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
	Search,
	Filter,
	MapPin,
	LogOut,
	Grid3X3,
	List,
	ExternalLink,
	Mail,
	Phone,
	Users,
	Building,
	Lock,
	Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORIES, PROPERTY_TYPES, ADMIN_ACCESS_CODE } from "@/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

export function BrowsePage() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [selectedCountry, setSelectedCountry] = useState<string>("all");
	const [selectedType, setSelectedType] = useState<string>("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showPropertyDetail, setShowPropertyDetail] = useState<any>(null);

	// Check broker session
	const brokerAgent = useMemo(() => {
		const stored = sessionStorage.getItem("brokerAgent");
		return stored ? JSON.parse(stored) : null;
	}, []);

	const isAdmin = brokerAgent?.role === "admin";

	useEffect(() => {
		if (!brokerAgent) {
			navigate("/broker-portal");
		}
	}, [brokerAgent, navigate]);

	// For agents: fetch their assigned properties
	const agentAssignments = useQuery(
		api.pipeline.getAgentProperties,
		!isAdmin && brokerAgent?.agentId
			? { agentId: brokerAgent.agentId as Id<"agents"> }
			: "skip",
	);

	// For admin: fetch all properties with filters
	const adminProperties = useQuery(
		isAdmin
			? api.properties.list
			: ("skip" as any),
		isAdmin
			? {
					category:
						selectedCategory !== "all"
							? selectedCategory
							: undefined,
					country:
						selectedCountry !== "all"
							? selectedCountry
							: undefined,
					propertyType:
						selectedType !== "all" ? selectedType : undefined,
					limit: 100,
				}
			: "skip",
	);

	const adminSearchResults = useQuery(
		api.properties.search,
		isAdmin && searchQuery.length > 2
			? {
					searchQuery,
					category:
						selectedCategory !== "all"
							? selectedCategory
							: undefined,
					country:
						selectedCountry !== "all"
							? selectedCountry
							: undefined,
				}
			: "skip",
	);

	const countries = useQuery(api.properties.getCountries, {
		category:
			selectedCategory !== "all" ? selectedCategory : undefined,
	});

	// Determine display properties based on role
	const displayProperties = useMemo(() => {
		if (isAdmin) {
			if (searchQuery.length > 2) return adminSearchResults ?? [];
			return adminProperties?.properties ?? [];
		}
		// Agent: filter assigned properties client-side
		if (!agentAssignments) return [];
		let props = agentAssignments
			.filter((a: any) => a.property)
			.map((a: any) => ({ ...a.property, _pipelineStatus: a.pipelineStatus, _assignmentId: a._id }));

		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			props = props.filter(
				(p: any) =>
					p.title?.toLowerCase().includes(q) ||
					p.city?.toLowerCase().includes(q) ||
					p.country?.toLowerCase().includes(q),
			);
		}
		if (selectedCategory !== "all") {
			props = props.filter((p: any) => p.category === selectedCategory);
		}
		if (selectedCountry !== "all") {
			props = props.filter((p: any) => p.country === selectedCountry);
		}
		if (selectedType !== "all") {
			props = props.filter(
				(p: any) => p.propertyType === selectedType,
			);
		}
		return props;
	}, [
		isAdmin,
		searchQuery,
		adminSearchResults,
		adminProperties,
		agentAssignments,
		selectedCategory,
		selectedCountry,
		selectedType,
	]);

	const handleLogout = () => {
		sessionStorage.removeItem("brokerAgent");
		navigate("/broker-portal");
	};

	const formatPrice = (price?: number, label?: string, currency?: string) => {
		if (label) return label;
		if (!price) return "Contact for Price";
		if (price >= 1_000_000) return `${currency || "USD"} ${(price / 1_000_000).toFixed(1)}M`;
		if (price >= 1_000) return `${currency || "USD"} ${(price / 1_000).toFixed(0)}K`;
		return `${currency || "USD"} ${price.toLocaleString()}`;
	};

	const getCategoryLabel = (val: string) =>
		CATEGORIES.find((c) => c.value === val)?.label ?? val;
	const getCategoryIcon = (val: string) =>
		CATEGORIES.find((c) => c.value === val)?.icon ?? "📍";

	if (!brokerAgent) return null;

	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#fafaf8]">
			{/* Top Bar */}
			<div className="bg-[#0f1d3a] text-white px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="text-lg">👑</span>
					<span className="font-semibold text-sm tracking-wide">
						KISSI KINGDOM
					</span>
				</div>
				<div className="flex items-center gap-4">
					{isAdmin && (
						<Badge className="bg-[#c5972c] text-white text-[10px]">
							ADMIN
						</Badge>
					)}
					<span className="text-sm text-gray-300">
						Welcome, {brokerAgent.name}
					</span>
					{!isAdmin && (
						<span className="text-xs text-gray-500">
							{agentAssignments?.length ?? 0} assigned properties
						</span>
					)}
					{isAdmin && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate("/admin")}
							className="text-[#c5972c] hover:text-white hover:bg-white/10 text-xs"
						>
							Admin Panel →
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={handleLogout}
						className="text-gray-400 hover:text-white hover:bg-white/10"
					>
						<LogOut className="size-4 mr-1" /> Exit
					</Button>
				</div>
			</div>

			{/* Agent notice */}
			{!isAdmin && (
				<div className="bg-[#c5972c]/10 border-b border-[#c5972c]/20 px-4 py-2 flex items-center gap-2">
					<Lock className="size-3 text-[#c5972c]" />
					<span className="text-xs text-[#c5972c] font-medium">
						You are viewing properties assigned to you by the
						administrator. Contact admin for additional access.
					</span>
				</div>
			)}

			{/* Search & Filters */}
			<div className="bg-white border-b border-[#e0d8cc] px-4 py-4">
				<div className="max-w-7xl mx-auto space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder={
								isAdmin
									? "Search all properties by name, location..."
									: "Search your assigned properties..."
							}
							className="pl-10 h-11 bg-[#fafaf8] border-[#e0d8cc]"
						/>
					</div>

					<div className="flex flex-wrap gap-3 items-center">
						<Filter className="size-4 text-gray-400" />

						<Select
							value={selectedCategory}
							onValueChange={setSelectedCategory}
						>
							<SelectTrigger className="w-[200px] h-9 text-sm bg-[#fafaf8]">
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Categories
								</SelectItem>
								{CATEGORIES.map((cat) => (
									<SelectItem
										key={cat.value}
										value={cat.value}
									>
										{cat.icon} {cat.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={selectedCountry}
							onValueChange={setSelectedCountry}
						>
							<SelectTrigger className="w-[180px] h-9 text-sm bg-[#fafaf8]">
								<SelectValue placeholder="All Countries" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Countries
								</SelectItem>
								{(countries ?? []).map((c) => (
									<SelectItem key={c} value={c}>
										{c}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={selectedType}
							onValueChange={setSelectedType}
						>
							<SelectTrigger className="w-[160px] h-9 text-sm bg-[#fafaf8]">
								<SelectValue placeholder="All Types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Types
								</SelectItem>
								{PROPERTY_TYPES.map((t) => (
									<SelectItem key={t.value} value={t.value}>
										{t.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="ml-auto flex gap-1">
							<Button
								variant={
									viewMode === "grid" ? "default" : "ghost"
								}
								size="sm"
								onClick={() => setViewMode("grid")}
								className="h-9 w-9 p-0"
							>
								<Grid3X3 className="size-4" />
							</Button>
							<Button
								variant={
									viewMode === "list" ? "default" : "ghost"
								}
								size="sm"
								onClick={() => setViewMode("list")}
								className="h-9 w-9 p-0"
							>
								<List className="size-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Results */}
			<div className="flex-1 overflow-y-auto px-4 py-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-4">
						<p className="text-sm text-gray-500">
							{displayProperties.length} properties
							{!isAdmin && " assigned to you"}
						</p>
					</div>

					{viewMode === "grid" ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{displayProperties.map((prop: any) => (
								<div
									key={prop._id}
									className="bg-white border border-[#e0d8cc] rounded-lg overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
									onClick={() =>
										setShowPropertyDetail(prop)
									}
								>
									<div className="h-40 bg-gradient-to-br from-[#0f1d3a] to-[#162850] flex items-center justify-center relative">
										<span className="text-5xl opacity-30">
											{getCategoryIcon(prop.category)}
										</span>
										<Badge className="absolute top-2 right-2 bg-[#c5972c] text-white text-[10px]">
											{prop.status}
										</Badge>
										{prop._pipelineStatus && (
											<Badge className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px]">
												{prop._pipelineStatus}
											</Badge>
										)}
									</div>

									<div className="p-4 space-y-2">
										<h3 className="font-semibold text-sm text-[#0f1d3a] line-clamp-2 group-hover:text-[#c5972c] transition-colors">
											{prop.title}
										</h3>
										<div className="flex items-center gap-1 text-xs text-gray-500">
											<MapPin className="size-3" />
											{prop.city}, {prop.country}
										</div>
										<div className="flex items-center justify-between pt-1">
											<span className="text-sm font-bold text-[#c5972c]">
												{formatPrice(
													prop.price,
													prop.priceLabel,
													prop.currency,
												)}
											</span>
											<Badge
												variant="outline"
												className="text-[10px] border-[#e0d8cc]"
											>
												{getCategoryLabel(
													prop.category,
												).split(" ")[0]}
											</Badge>
										</div>
										{prop.acreage && (
											<p className="text-xs text-gray-400">
												{prop.acreage.toLocaleString()}{" "}
												acres
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="space-y-2">
							{displayProperties.map((prop: any) => (
								<div
									key={prop._id}
									className="bg-white border border-[#e0d8cc] rounded-lg px-4 py-3 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
									onClick={() =>
										setShowPropertyDetail(prop)
									}
								>
									<div className="w-12 h-12 bg-[#0f1d3a] rounded-lg flex items-center justify-center shrink-0">
										<span className="text-xl">
											{getCategoryIcon(prop.category)}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-sm text-[#0f1d3a] truncate">
											{prop.title}
										</h3>
										<div className="flex items-center gap-1 text-xs text-gray-500">
											<MapPin className="size-3" />
											{prop.city}, {prop.country}
										</div>
									</div>
									{prop._pipelineStatus && (
										<Badge className="bg-emerald-500 text-white text-[10px] shrink-0">
											{prop._pipelineStatus}
										</Badge>
									)}
									<Badge
										variant="outline"
										className="text-[10px] border-[#e0d8cc] shrink-0"
									>
										{getCategoryLabel(
											prop.category,
										).split(" ")[0]}
									</Badge>
									<span className="text-sm font-bold text-[#c5972c] shrink-0 w-28 text-right">
										{formatPrice(
											prop.price,
											prop.priceLabel,
											prop.currency,
										)}
									</span>
									<Badge className="bg-[#c5972c]/10 text-[#c5972c] text-[10px] shrink-0">
										{prop.status}
									</Badge>
								</div>
							))}
						</div>
					)}

					{displayProperties.length === 0 && (
						<div className="text-center py-20 text-gray-400">
							{!isAdmin ? (
								<>
									<Lock className="size-12 mx-auto mb-3 opacity-40" />
									<p className="text-lg">
										No properties assigned yet
									</p>
									<p className="text-sm mt-2">
										Your administrator will assign properties
										for you to work on.
									</p>
								</>
							) : (
								<>
									<Building className="size-12 mx-auto mb-3 opacity-40" />
									<p className="text-lg">
										No properties found
									</p>
									<p className="text-sm mt-2">
										Try adjusting your filters or search query
									</p>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Property Detail Dialog */}
			{showPropertyDetail && (
				<PropertyDetailDialog
					property={showPropertyDetail}
					onClose={() => setShowPropertyDetail(null)}
				/>
			)}
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
// Property Detail Dialog
// ─────────────────────────────────────────────────────────────
function PropertyDetailDialog({
	property,
	onClose,
}: {
	property: any;
	onClose: () => void;
}) {
	const p = property;

	return (
		<Dialog open={!!property} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-[#0f1d3a] text-lg">
						{p.title}
					</DialogTitle>
				</DialogHeader>

				<div className="h-48 bg-gradient-to-br from-[#0f1d3a] to-[#162850] rounded-lg flex items-center justify-center">
					<span className="text-7xl opacity-30">
						{CATEGORIES.find((c) => c.value === p.category)?.icon ??
							"🏠"}
					</span>
				</div>

				<div className="grid grid-cols-2 gap-4 mt-4">
					<InfoBox
						label="Price"
						value={
							p.priceLabel ||
							(p.price
								? `${p.currency || "USD"} ${p.price.toLocaleString()}`
								: "Contact Broker")
						}
						highlight
					/>
					<InfoBox label="Status" value={p.status} />
					<InfoBox
						label="Location"
						value={`${p.city}, ${p.country}`}
					/>
					{p.address && (
						<InfoBox label="Address" value={p.address} />
					)}
					{p.acreage && (
						<InfoBox
							label="Acreage"
							value={`${p.acreage.toLocaleString()} acres`}
						/>
					)}
					{p.squareFeet && (
						<InfoBox
							label="Square Feet"
							value={`${p.squareFeet.toLocaleString()} sq ft`}
						/>
					)}
					<InfoBox
						label="Category"
						value={
							CATEGORIES.find((c) => c.value === p.category)
								?.label ?? p.category
						}
					/>
					<InfoBox
						label="Type"
						value={p.propertyType}
						capitalize
					/>
				</div>

				{p.description && (
					<div className="mt-4">
						<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
							Description
						</h4>
						<p className="text-sm text-gray-700 leading-relaxed">
							{p.description}
						</p>
					</div>
				)}

				{(p.brokerName || p.brokerEmail || p.brokerPhone) && (
					<div className="mt-4 bg-[#fafaf8] border border-[#e0d8cc] rounded-lg p-4">
						<h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
							Broker Contact
						</h4>
						<div className="space-y-2">
							{p.brokerName && (
								<div className="flex items-center gap-2 text-sm">
									<Users className="size-4 text-[#c5972c]" />
									<span className="font-medium">
										{p.brokerName}
									</span>
								</div>
							)}
							{p.brokerCompany && (
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Building className="size-4 text-gray-400" />
									{p.brokerCompany}
								</div>
							)}
							{p.brokerEmail && (
								<div className="flex items-center gap-2 text-sm">
									<Mail className="size-4 text-gray-400" />
									<a
										href={`mailto:${p.brokerEmail}`}
										className="text-[#c5972c] hover:underline"
									>
										{p.brokerEmail}
									</a>
								</div>
							)}
							{p.brokerPhone && (
								<div className="flex items-center gap-2 text-sm">
									<Phone className="size-4 text-gray-400" />
									<a
										href={`tel:${p.brokerPhone}`}
										className="text-[#c5972c] hover:underline"
									>
										{p.brokerPhone}
									</a>
								</div>
							)}
						</div>
					</div>
				)}

				{p.listingUrl && (
					<a
						href={p.listingUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="mt-4 flex items-center justify-center gap-2 bg-[#0f1d3a] text-white rounded-lg py-3 hover:bg-[#1a2d5a] transition-colors"
					>
						<ExternalLink className="size-4" /> View Original
						Listing
					</a>
				)}
			</DialogContent>
		</Dialog>
	);
}

function InfoBox({
	label,
	value,
	highlight,
	capitalize: cap,
}: {
	label: string;
	value: string;
	highlight?: boolean;
	capitalize?: boolean;
}) {
	return (
		<div className="bg-[#fafaf8] rounded-lg p-3">
			<div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
				{label}
			</div>
			<div
				className={`text-sm font-medium mt-0.5 ${highlight ? "text-[#c5972c] text-lg font-bold" : "text-[#0f1d3a]"} ${cap ? "capitalize" : ""}`}
			>
				{value}
			</div>
		</div>
	);
}
