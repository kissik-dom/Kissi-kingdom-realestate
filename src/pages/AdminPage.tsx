import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
	Search,
	Users,
	Building,
	BarChart3,
	MapPin,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Globe,
	Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, PIPELINE_STEPS } from "@/lib/constants";

export function AdminPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPipelineStatus, setSelectedPipelineStatus] = useState<string>("all");
	const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

	const agents = useQuery(api.agents.list, {});
	const agentStats = useQuery(api.agents.stats, {});
	const propertyStats = useQuery(api.properties.stats, {});
	const pipelineStats = useQuery(api.pipeline.pipelineStats, {});
	const allAssignments = useQuery(api.pipeline.listAll, {
		status: selectedPipelineStatus !== "all" ? selectedPipelineStatus : undefined,
		limit: 200,
	});

	const properties = useQuery(api.properties.list, { limit: 100 });

	const filteredAgents = (agents ?? []).filter(
		(a: any) =>
			!searchQuery ||
			a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			a.email.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const getStepInfo = (key: string) =>
		PIPELINE_STEPS.find((s) => s.key === key) ?? { key, label: key, color: "bg-gray-500" };

	const getCategoryIcon = (val: string) =>
		CATEGORIES.find((c) => c.value === val)?.icon ?? "📍";

	const formatPrice = (price?: number, label?: string) => {
		if (label) return label;
		if (!price) return "Contact";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(price);
	};

	return (
		<div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-[#0f1d3a]">
					Admin Command Center
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					Full oversight of all agents, properties, and pipeline activity
				</p>
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<Users className="size-3" /> Total Agents
					</div>
					<div className="text-2xl font-bold text-[#0f1d3a]">
						{agentStats?.totalAgents ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<Building className="size-3" /> Properties
					</div>
					<div className="text-2xl font-bold text-[#c5972c]">
						{propertyStats?.totalProperties ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<Globe className="size-3" /> Countries
					</div>
					<div className="text-2xl font-bold text-[#0f1d3a]">
						{propertyStats?.totalCountries ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<BarChart3 className="size-3" /> In Pipeline
					</div>
					<div className="text-2xl font-bold text-emerald-600">
						{pipelineStats?.total ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<CheckCircle className="size-3" /> Accepted
					</div>
					<div className="text-2xl font-bold text-green-600">
						{pipelineStats?.byStatus?.payment_accepted ?? 0}
					</div>
				</div>
			</div>

			{/* Pipeline Status Breakdown */}
			{pipelineStats && (
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<h3 className="text-sm font-semibold text-[#0f1d3a] mb-3">
						Pipeline Status Distribution
					</h3>
					<div className="flex flex-wrap gap-2">
						{PIPELINE_STEPS.map((step) => {
							const count = pipelineStats.byStatus?.[step.key] ?? 0;
							if (count === 0) return null;
							return (
								<Badge
									key={step.key}
									className={`${step.color} text-white text-xs px-3 py-1`}
								>
									{step.label}: {count}
								</Badge>
							);
						})}
					</div>
				</div>
			)}

			{/* Tabs */}
			<Tabs defaultValue="agents" className="space-y-4">
				<TabsList className="bg-white border border-[#e0d8cc]">
					<TabsTrigger value="agents" className="data-[state=active]:bg-[#0f1d3a] data-[state=active]:text-white">
						<Users className="size-3 mr-1" /> Agents
					</TabsTrigger>
					<TabsTrigger value="pipeline" className="data-[state=active]:bg-[#0f1d3a] data-[state=active]:text-white">
						<BarChart3 className="size-3 mr-1" /> Pipeline
					</TabsTrigger>
					<TabsTrigger value="properties" className="data-[state=active]:bg-[#0f1d3a] data-[state=active]:text-white">
						<Building className="size-3 mr-1" /> All Properties
					</TabsTrigger>
				</TabsList>

				{/* Agents Tab */}
				<TabsContent value="agents" className="space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search agents by name or email..."
							className="pl-10 h-10 bg-white border-[#e0d8cc]"
						/>
					</div>

					<div className="space-y-2">
						{filteredAgents.map((agent: any) => (
							<div
								key={agent._id}
								className="bg-white border border-[#e0d8cc] rounded-lg overflow-hidden"
							>
								<button
									type="button"
									className="w-full flex items-center gap-3 p-4 hover:bg-[#fafaf8] transition-colors text-left"
									onClick={() =>
										setExpandedAgent(
											expandedAgent === agent._id ? null : agent._id,
										)
									}
								>
									<div className="w-10 h-10 rounded-full bg-[#0f1d3a] flex items-center justify-center text-white text-sm font-medium shrink-0">
										{agent.avatarInitials || agent.name.slice(0, 2).toUpperCase()}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-semibold text-sm text-[#0f1d3a]">
											{agent.name}
										</div>
										<div className="text-xs text-gray-500">{agent.email}</div>
									</div>
									<Badge
										variant="outline"
										className={`text-[10px] shrink-0 ${agent.role === "admin" ? "border-[#c5972c] text-[#c5972c]" : "border-[#e0d8cc]"}`}
									>
										{agent.role}
									</Badge>
									<div className="text-xs text-gray-400 shrink-0">
										Code: {agent.accessCode}
									</div>
									{expandedAgent === agent._id ? (
										<ChevronDown className="size-4 text-gray-400 shrink-0" />
									) : (
										<ChevronRight className="size-4 text-gray-400 shrink-0" />
									)}
								</button>

								{expandedAgent === agent._id && (
									<AgentDetail agentId={agent._id} />
								)}
							</div>
						))}
					</div>
				</TabsContent>

				{/* Pipeline Tab */}
				<TabsContent value="pipeline" className="space-y-4">
					<div className="flex gap-3 items-center">
						<Filter className="size-4 text-gray-400" />
						<Select
							value={selectedPipelineStatus}
							onValueChange={setSelectedPipelineStatus}
						>
							<SelectTrigger className="w-[220px] h-10 bg-white">
								<SelectValue placeholder="All Pipeline Statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								{PIPELINE_STEPS.map((s) => (
									<SelectItem key={s.key} value={s.key}>
										{s.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						{(allAssignments ?? []).map((ap: any) => {
							const stepInfo = getStepInfo(ap.pipelineStatus);
							return (
								<div
									key={ap._id}
									className="bg-white border border-[#e0d8cc] rounded-lg p-4 flex items-center gap-4"
								>
									<div className={`w-1.5 h-12 rounded-full ${stepInfo.color}`} />
									<div className="w-10 h-10 bg-[#0f1d3a] rounded-lg flex items-center justify-center shrink-0">
										<span>{getCategoryIcon(ap.property?.category)}</span>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-sm text-[#0f1d3a] truncate">
											{ap.property?.title ?? "Loading..."}
										</h3>
										<div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
											<span className="flex items-center gap-1">
												<MapPin className="size-3" />
												{ap.property?.city}, {ap.property?.country}
											</span>
											<span>
												Agent: {ap.agent?.name ?? "Unknown"}
											</span>
										</div>
									</div>
									<span className="text-sm font-bold text-[#c5972c] shrink-0">
										{formatPrice(ap.property?.price, ap.property?.priceLabel)}
									</span>
									<Badge
										className={`${stepInfo.color} text-white text-xs shrink-0`}
									>
										{stepInfo.label}
									</Badge>
								</div>
							);
						})}

						{(allAssignments ?? []).length === 0 && (
							<div className="text-center py-16 text-gray-400">
								<BarChart3 className="size-12 mx-auto mb-3 opacity-40" />
								<p>No pipeline items found</p>
							</div>
						)}
					</div>
				</TabsContent>

				{/* Properties Tab */}
				<TabsContent value="properties" className="space-y-4">
					<div className="space-y-2">
						{(properties?.properties ?? []).map((prop: any) => (
							<div
								key={prop._id}
								className="bg-white border border-[#e0d8cc] rounded-lg p-4 flex items-center gap-4"
							>
								<div className="w-10 h-10 bg-[#0f1d3a] rounded-lg flex items-center justify-center shrink-0">
									<span>{getCategoryIcon(prop.category)}</span>
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-sm text-[#0f1d3a] truncate">
										{prop.title}
									</h3>
									<div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
										<span className="flex items-center gap-1">
											<MapPin className="size-3" />
											{prop.city}, {prop.country}
										</span>
										{prop.brokerName && (
											<span>Broker: {prop.brokerName}</span>
										)}
									</div>
								</div>
								<Badge variant="outline" className="text-[10px] shrink-0">
									{CATEGORIES.find((c) => c.value === prop.category)?.label?.split(" ")[0]}
								</Badge>
								<span className="text-sm font-bold text-[#c5972c] shrink-0">
									{formatPrice(prop.price, prop.priceLabel)}
								</span>
								<Badge
									className={`text-xs shrink-0 ${
										prop.status === "available"
											? "bg-emerald-500 text-white"
											: prop.status === "pending"
												? "bg-amber-500 text-white"
												: "bg-gray-500 text-white"
									}`}
								>
									{prop.status}
								</Badge>
							</div>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

// Sub-component: Agent's properties when expanded
function AgentDetail({ agentId }: { agentId: any }) {
	const agentProperties = useQuery(api.pipeline.getAgentProperties, {
		agentId,
	});

	const getStepInfo = (key: string) =>
		PIPELINE_STEPS.find((s) => s.key === key) ?? { key, label: key, color: "bg-gray-500" };

	const getCategoryIcon = (val: string) =>
		CATEGORIES.find((c) => c.value === val)?.icon ?? "📍";

	if (!agentProperties) {
		return (
			<div className="px-4 pb-4 text-sm text-gray-400">Loading...</div>
		);
	}

	if (agentProperties.length === 0) {
		return (
			<div className="px-4 pb-4 text-sm text-gray-400">
				No properties assigned
			</div>
		);
	}

	return (
		<div className="px-4 pb-4 border-t border-[#e0d8cc] pt-3 space-y-2">
			{agentProperties.map((ap: any) => {
				const stepInfo = getStepInfo(ap.pipelineStatus);
				return (
					<div
						key={ap._id}
						className="flex items-center gap-3 bg-[#fafaf8] rounded-lg p-3"
					>
						<span className="text-lg">{getCategoryIcon(ap.property?.category)}</span>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-[#0f1d3a] truncate">
								{ap.property?.title}
							</div>
							<div className="text-xs text-gray-500">
								{ap.property?.city}, {ap.property?.country}
							</div>
						</div>
						<Badge className={`${stepInfo.color} text-white text-[10px]`}>
							{stepInfo.label}
						</Badge>
					</div>
				);
			})}
		</div>
	);
}
