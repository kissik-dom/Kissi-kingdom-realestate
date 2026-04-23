import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
	Search,
	MapPin,
	Building,
	FileText,
	ChevronRight,
	Plus,
	CheckCircle,
	Clock,
	XCircle,
	ArrowRight,
	Users,
	BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CATEGORIES, PIPELINE_STEPS } from "@/lib/constants";
import type { Id } from "../../convex/_generated/dataModel";

const STEP_ICONS: Record<string, React.ReactNode> = {
	new: <Clock className="size-4" />,
	contacted: <ArrowRight className="size-4" />,
	verified: <CheckCircle className="size-4" />,
	agent_spoken: <Users className="size-4" />,
	intro_sent: <FileText className="size-4" />,
	offer_sent: <FileText className="size-4" />,
	pre_deposit: <Building className="size-4" />,
	contract: <FileText className="size-4" />,
	payment_pending: <Clock className="size-4" />,
	payment_accepted: <CheckCircle className="size-4" />,
	payment_rejected: <XCircle className="size-4" />,
	closed: <CheckCircle className="size-4" />,
};

export function DashboardPage() {
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
	const [noteStep, setNoteStep] = useState("");
	const [noteText, setNoteText] = useState("");
	const [showNoteDialog, setShowNoteDialog] = useState(false);

	// For now, use the first agent from the list (in production, this would be the logged-in agent)
	const agents = useQuery(api.agents.list, { role: "agent" });
	const firstAgent = agents?.[0];

	const agentProperties = useQuery(
		api.pipeline.getAgentProperties,
		firstAgent ? { agentId: firstAgent._id, status: selectedStatus !== "all" ? selectedStatus : undefined } : "skip",
	);

	const pipelineStats = useQuery(api.pipeline.pipelineStats, {});
	const propertyStats = useQuery(api.properties.stats, {});

	const updateStatus = useMutation(api.pipeline.updateStatus);
	const addNote = useMutation(api.pipeline.addNote);

	const handleStatusChange = async (id: Id<"agentProperties">, newStatus: string) => {
		try {
			await updateStatus({ id, pipelineStatus: newStatus });
			toast.success("Pipeline status updated");
		} catch {
			toast.error("Failed to update status");
		}
	};

	const handleAddNote = async () => {
		if (!selectedAssignment || !noteStep || !noteText.trim()) return;
		try {
			await addNote({
				agentPropertyId: selectedAssignment as Id<"agentProperties">,
				step: noteStep,
				note: noteText.trim(),
				createdBy: firstAgent?.name,
			});
			toast.success("Note added");
			setShowNoteDialog(false);
			setNoteText("");
			setNoteStep("");
		} catch {
			toast.error("Failed to add note");
		}
	};

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
				<h1 className="text-2xl font-bold text-[#0f1d3a]">Agent Dashboard</h1>
				<p className="text-sm text-gray-500 mt-1">
					{firstAgent ? `Welcome back, ${firstAgent.name}` : "Loading..."}
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<BarChart3 className="size-3" /> Total Properties
					</div>
					<div className="text-2xl font-bold text-[#0f1d3a]">
						{propertyStats?.totalProperties ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<Building className="size-3" /> My Assignments
					</div>
					<div className="text-2xl font-bold text-[#c5972c]">
						{agentProperties?.length ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<CheckCircle className="size-3" /> In Contract
					</div>
					<div className="text-2xl font-bold text-emerald-600">
						{pipelineStats?.byStatus?.contract ?? 0}
					</div>
				</div>
				<div className="bg-white border border-[#e0d8cc] rounded-lg p-4">
					<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
						<Clock className="size-3" /> Pending
					</div>
					<div className="text-2xl font-bold text-amber-500">
						{pipelineStats?.byStatus?.payment_pending ?? 0}
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap gap-3 items-center">
				<div className="relative flex-1 min-w-[200px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
					<Input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search your properties..."
						className="pl-10 h-10 bg-white border-[#e0d8cc]"
					/>
				</div>
				<Select value={selectedStatus} onValueChange={setSelectedStatus}>
					<SelectTrigger className="w-[200px] h-10 bg-white">
						<SelectValue placeholder="All Statuses" />
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

			{/* Property Pipeline Cards */}
			<div className="space-y-3">
				{(agentProperties ?? [])
					.filter((ap: any) =>
						searchQuery
							? ap.property?.title?.toLowerCase().includes(searchQuery.toLowerCase())
							: true,
					)
					.map((ap: any) => {
						const stepInfo = getStepInfo(ap.pipelineStatus);
						return (
							<div
								key={ap._id}
								className="bg-white border border-[#e0d8cc] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
							>
								<div className="flex items-stretch">
									{/* Status indicator */}
									<div className={`w-1.5 ${stepInfo.color}`} />

									{/* Main content */}
									<div className="flex-1 p-4">
										<div className="flex items-start justify-between gap-3">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-lg">
														{getCategoryIcon(ap.property?.category)}
													</span>
													<h3 className="font-semibold text-[#0f1d3a] truncate">
														{ap.property?.title ?? "Loading..."}
													</h3>
												</div>
												<div className="flex items-center gap-3 text-xs text-gray-500">
													<span className="flex items-center gap-1">
														<MapPin className="size-3" />
														{ap.property?.city}, {ap.property?.country}
													</span>
													<span className="font-medium text-[#c5972c]">
														{formatPrice(
															ap.property?.price,
															ap.property?.priceLabel,
														)}
													</span>
												</div>
											</div>

											<div className="flex items-center gap-2 shrink-0">
												<Badge className={`${stepInfo.color} text-white text-xs`}>
													{STEP_ICONS[ap.pipelineStatus]}
													<span className="ml-1">{stepInfo.label}</span>
												</Badge>
											</div>
										</div>

										{/* Pipeline Progress Bar */}
										<div className="mt-3 flex gap-0.5">
											{PIPELINE_STEPS.map((step, i) => {
												const currentIdx = PIPELINE_STEPS.findIndex(
													(s) => s.key === ap.pipelineStatus,
												);
												const isCompleted = i <= currentIdx;
												return (
													<div
														key={step.key}
														className={`h-1.5 flex-1 rounded-full transition-colors ${isCompleted ? stepInfo.color : "bg-gray-200"}`}
														title={step.label}
													/>
												);
											})}
										</div>

										{/* Actions */}
										<div className="mt-3 flex items-center gap-2">
											<Select
												value={ap.pipelineStatus}
												onValueChange={(val) =>
													handleStatusChange(ap._id, val)
												}
											>
												<SelectTrigger className="h-8 text-xs w-[180px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{PIPELINE_STEPS.map((s) => (
														<SelectItem key={s.key} value={s.key}>
															{s.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<Button
												variant="outline"
												size="sm"
												className="h-8 text-xs border-[#e0d8cc]"
												onClick={() => {
													setSelectedAssignment(ap._id);
													setNoteStep(ap.pipelineStatus);
													setShowNoteDialog(true);
												}}
											>
												<Plus className="size-3 mr-1" /> Add Note
											</Button>

											{ap.property?.listingUrl && (
												<a
													href={ap.property.listingUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 text-xs text-[#c5972c]"
													>
														View Listing <ChevronRight className="size-3 ml-1" />
													</Button>
												</a>
											)}
										</div>
									</div>
								</div>
							</div>
						);
					})}

				{agentProperties?.length === 0 && (
					<div className="text-center py-16 text-gray-400">
						<Building className="size-12 mx-auto mb-3 opacity-40" />
						<p>No properties assigned yet</p>
					</div>
				)}
			</div>

			{/* Add Note Dialog */}
			<Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add Pipeline Note</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<Select value={noteStep} onValueChange={setNoteStep}>
							<SelectTrigger>
								<SelectValue placeholder="Select step" />
							</SelectTrigger>
							<SelectContent>
								{PIPELINE_STEPS.map((s) => (
									<SelectItem key={s.key} value={s.key}>
										{s.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Textarea
							value={noteText}
							onChange={(e) => setNoteText(e.target.value)}
							placeholder="Enter your note..."
							rows={4}
						/>
						<Button
							onClick={handleAddNote}
							className="w-full bg-[#c5972c] hover:bg-[#d4a94a] text-white"
						>
							Save Note
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
