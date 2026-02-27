import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Flag, User, Building2, Phone, Mail, Calendar, 
  Clock, TrendingUp, TrendingDown, CheckCircle, XCircle,
  ArrowRight, Edit, Eye, MoreVertical, Sparkles,
  Filter, Search, Download, RefreshCw, History,
  Target, Award, AlertCircle, PlayCircle, StopCircle,
  Loader2, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Status type definition
type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal Sent" | "Won" | "Lost";

// Status configuration with colors and icons
const STATUS_CONFIG: Record<LeadStatus, { color: string; bgColor: string; icon: any }> = {
  "New": { color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200", icon: PlayCircle },
  "Contacted": { color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200", icon: Phone },
  "Qualified": { color: "text-indigo-600", bgColor: "bg-indigo-50 border-indigo-200", icon: Target },
  "Proposal Sent": { color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200", icon: Mail },
  "Won": { color: "text-green-600", bgColor: "bg-green-50 border-green-200", icon: Award },
  "Lost": { color: "text-red-600", bgColor: "bg-red-50 border-red-200", icon: XCircle },
};

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  value: number;
  source: string;
  assignedTo: string;
  createdAt: Date;
  lastUpdated: Date;
}

interface StatusHistory {
  id: string;
  leadId: string;
  leadName: string;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus;
  notes: string;
  updatedBy: string;
  updatedAt: Date;
}

export default function LeadStatusPage() {
  const { toast } = useToast();
  
  // Demo leads data
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "L001",
      name: "John Smith",
      company: "Tech Corp",
      email: "john@techcorp.com",
      phone: "+1-555-0101",
      status: "New",
      value: 50000,
      source: "Website",
      assignedTo: "Sarah Johnson",
      createdAt: new Date(2026, 1, 10),
      lastUpdated: new Date(2026, 1, 10),
    },
    {
      id: "L002",
      name: "Emily Davis",
      company: "Digital Solutions",
      email: "emily@digitalsol.com",
      phone: "+1-555-0102",
      status: "Contacted",
      value: 75000,
      source: "Referral",
      assignedTo: "Mike Chen",
      createdAt: new Date(2026, 1, 8),
      lastUpdated: new Date(2026, 1, 12),
    },
    {
      id: "L003",
      name: "Michael Brown",
      company: "Innovation Inc",
      email: "michael@innovation.com",
      phone: "+1-555-0103",
      status: "Qualified",
      value: 100000,
      source: "LinkedIn",
      assignedTo: "Sarah Johnson",
      createdAt: new Date(2026, 1, 5),
      lastUpdated: new Date(2026, 1, 14),
    },
    {
      id: "L004",
      name: "Sarah Wilson",
      company: "Future Systems",
      email: "sarah@futuresys.com",
      phone: "+1-555-0104",
      status: "Proposal Sent",
      value: 120000,
      source: "Conference",
      assignedTo: "Mike Chen",
      createdAt: new Date(2026, 1, 1),
      lastUpdated: new Date(2026, 1, 15),
    },
    {
      id: "L005",
      name: "David Lee",
      company: "Smart Enterprises",
      email: "david@smartent.com",
      phone: "+1-555-0105",
      status: "Won",
      value: 150000,
      source: "Cold Call",
      assignedTo: "Sarah Johnson",
      createdAt: new Date(2026, 0, 20),
      lastUpdated: new Date(2026, 1, 13),
    },
    {
      id: "L006",
      name: "Lisa Anderson",
      company: "Global Tech",
      email: "lisa@globaltech.com",
      phone: "+1-555-0106",
      status: "Lost",
      value: 80000,
      source: "Email Campaign",
      assignedTo: "Mike Chen",
      createdAt: new Date(2026, 0, 25),
      lastUpdated: new Date(2026, 1, 11),
    },
    {
      id: "L007",
      name: "Robert Taylor",
      company: "NextGen Solutions",
      email: "robert@nextgen.com",
      phone: "+1-555-0107",
      status: "New",
      value: 60000,
      source: "Website",
      assignedTo: "Sarah Johnson",
      createdAt: new Date(2026, 1, 14),
      lastUpdated: new Date(2026, 1, 14),
    },
    {
      id: "L008",
      name: "Jennifer White",
      company: "Cloud Dynamics",
      email: "jennifer@clouddyn.com",
      phone: "+1-555-0108",
      status: "Contacted",
      value: 90000,
      source: "Referral",
      assignedTo: "Mike Chen",
      createdAt: new Date(2026, 1, 9),
      lastUpdated: new Date(2026, 1, 13),
    },
  ]);

  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([
    {
      id: "H001",
      leadId: "L005",
      leadName: "David Lee",
      fromStatus: "Proposal Sent",
      toStatus: "Won",
      notes: "Client signed the contract! Excellent outcome.",
      updatedBy: "Sarah Johnson",
      updatedAt: new Date(2026, 1, 13, 14, 30),
    },
    {
      id: "H002",
      leadId: "L006",
      leadName: "Lisa Anderson",
      fromStatus: "Proposal Sent",
      toStatus: "Lost",
      notes: "Client chose competitor due to pricing.",
      updatedBy: "Mike Chen",
      updatedAt: new Date(2026, 1, 11, 10, 15),
    },
    {
      id: "H003",
      leadId: "L004",
      leadName: "Sarah Wilson",
      fromStatus: "Qualified",
      toStatus: "Proposal Sent",
      notes: "Sent comprehensive proposal with custom pricing.",
      updatedBy: "Mike Chen",
      updatedAt: new Date(2026, 1, 15, 16, 45),
    },
  ]);

  // State management
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<LeadStatus>("New");
  const [statusNotes, setStatusNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "All">("All");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate statistics
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "New").length,
    contacted: leads.filter(l => l.status === "Contacted").length,
    qualified: leads.filter(l => l.status === "Qualified").length,
    proposalSent: leads.filter(l => l.status === "Proposal Sent").length,
    won: leads.filter(l => l.status === "Won").length,
    lost: leads.filter(l => l.status === "Lost").length,
    totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
    wonValue: leads.filter(l => l.status === "Won").reduce((sum, lead) => sum + lead.value, 0),
    lostValue: leads.filter(l => l.status === "Lost").reduce((sum, lead) => sum + lead.value, 0),
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === "Won").length / leads.length) * 100).toFixed(1) : "0",
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedLead) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add to history
    const historyEntry: StatusHistory = {
      id: `H${String(statusHistory.length + 1).padStart(3, '0')}`,
      leadId: selectedLead.id,
      leadName: selectedLead.name,
      fromStatus: selectedLead.status,
      toStatus: newStatus,
      notes: statusNotes,
      updatedBy: "Current User",
      updatedAt: new Date(),
    };

    setStatusHistory([historyEntry, ...statusHistory]);

    // Update lead status
    setLeads(leads.map(lead => 
      lead.id === selectedLead.id 
        ? { ...lead, status: newStatus, lastUpdated: new Date() }
        : lead
    ));

    setIsLoading(false);
    setStatusDialogOpen(false);
    setStatusNotes("");

    toast({
      title: "Status Updated",
      description: `Lead "${selectedLead.name}" moved to ${newStatus}`,
    });
  };

  // Open status update dialog
  const openStatusDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setStatusNotes("");
    setStatusDialogOpen(true);
  };

  // Open detail dialog
  const openDetailDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || lead.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group leads by status
  const leadsByStatus = (status: LeadStatus) => 
    filteredLeads.filter(lead => lead.status === status);

  // Format currency
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Format date
  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Flag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CRM - Lead Status</h1>
              <p className="text-sm text-gray-600">Track and manage lead progression through the sales pipeline</p>
            </div>
          </div>
        </div>

        {/* Enhancement Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Enhanced Lead Status Pipeline</h3>
              <p className="text-sm text-green-700">
                🎯 Visual pipeline board • 📊 Real-time statistics • 📝 Status history tracking • 🔄 Quick status updates • 🎨 Color-coded stages
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Pipeline value: {formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Won Deals</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.won}</p>
                  <p className="text-xs text-green-600 mt-1">Revenue: {formatCurrency(stats.wonValue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lost Deals</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.lost}</p>
                  <p className="text-xs text-red-600 mt-1">Lost value: {formatCurrency(stats.lostValue)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.conversionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">Won / Total leads</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pipeline" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="pipeline" className="gap-2">
              <Flag className="w-4 h-4" />
              Pipeline Board
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <User className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Status History
            </TabsTrigger>
          </TabsList>

          {/* Pipeline Board View */}
          <TabsContent value="pipeline" className="space-y-4">
            {/* Search and Filter */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search leads by name, company, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as LeadStatus | "All")}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {(["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"] as LeadStatus[]).map((status) => {
                const statusLeads = leadsByStatus(status);
                const statusValue = statusLeads.reduce((sum, lead) => sum + lead.value, 0);
                const StatusIcon = STATUS_CONFIG[status].icon;

                return (
                  <Card key={status} className={`border-2 ${STATUS_CONFIG[status].bgColor}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[status].color}`} />
                          <CardTitle className={`text-sm font-semibold ${STATUS_CONFIG[status].color}`}>
                            {status}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {statusLeads.length}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {formatCurrency(statusValue)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {statusLeads.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <StatusIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">No leads</p>
                        </div>
                      ) : (
                        statusLeads.map((lead) => (
                          <Card key={lead.id} className="border hover:shadow-md transition-shadow bg-white">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 truncate">
                                      {lead.name}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                      {lead.company}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openStatusDialog(lead)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Update Status
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openDetailDialog(lead)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{lead.email}</span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Phone className="w-3 h-3" />
                                  <span>{lead.phone}</span>
                                </div>

                                <div className="pt-2 border-t space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Value:</span>
                                    <span className="font-semibold text-gray-900">
                                      {formatCurrency(lead.value)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Assigned:</span>
                                    <span className="text-gray-900">{lead.assignedTo}</span>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2 h-7 text-xs"
                                  onClick={() => openStatusDialog(lead)}
                                >
                                  <ArrowRight className="w-3 h-3 mr-1" />
                                  Move Status
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>All Leads</CardTitle>
                <CardDescription>Complete list of leads with status information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredLeads.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Flag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No leads found</p>
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredLeads.map((lead) => {
                      const StatusIcon = STATUS_CONFIG[lead.status].icon;
                      
                      return (
                        <Card key={lead.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                    <Building2 className="w-3 h-3" />
                                    {lead.company}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Mail className="w-3 h-3" />
                                    {lead.email}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Phone className="w-3 h-3" />
                                    {lead.phone}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs text-gray-600">
                                    Value: <span className="font-semibold text-gray-900">{formatCurrency(lead.value)}</span>
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Assigned: <span className="text-gray-900">{lead.assignedTo}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Badge 
                                  className={`${STATUS_CONFIG[lead.status].bgColor} ${STATUS_CONFIG[lead.status].color} border flex items-center gap-1 px-3 py-1`}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {lead.status}
                                </Badge>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openStatusDialog(lead)}
                                  className="gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Update
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDetailDialog(lead)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status History */}
          <TabsContent value="history" className="space-y-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Status Change History</CardTitle>
                <CardDescription>Track all status transitions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {statusHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No history yet</p>
                    <p className="text-sm mt-2">Status changes will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {statusHistory.map((entry) => {
                      const FromIcon = entry.fromStatus ? STATUS_CONFIG[entry.fromStatus].icon : null;
                      const ToIcon = STATUS_CONFIG[entry.toStatus].icon;

                      return (
                        <Card key={entry.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="w-4 h-4 text-gray-600" />
                                  <span className="font-semibold text-gray-900">{entry.leadName}</span>
                                  <span className="text-xs text-gray-500">#{entry.leadId}</span>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  {entry.fromStatus ? (
                                    <>
                                      <Badge className={`${STATUS_CONFIG[entry.fromStatus].bgColor} ${STATUS_CONFIG[entry.fromStatus].color} border text-xs`}>
                                        {FromIcon && <FromIcon className="w-3 h-3 mr-1" />}
                                        {entry.fromStatus}
                                      </Badge>
                                      <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </>
                                  ) : (
                                    <span className="text-xs text-gray-500">New lead →</span>
                                  )}
                                  <Badge className={`${STATUS_CONFIG[entry.toStatus].bgColor} ${STATUS_CONFIG[entry.toStatus].color} border text-xs`}>
                                    <ToIcon className="w-3 h-3 mr-1" />
                                    {entry.toStatus}
                                  </Badge>
                                </div>

                                {entry.notes && (
                                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    "{entry.notes}"
                                  </p>
                                )}
                              </div>

                              <div className="text-right space-y-1">
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <User className="w-3 h-3" />
                                  {entry.updatedBy}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(entry.updatedAt)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Lead Status</DialogTitle>
              <DialogDescription>
                Change the status of {selectedLead?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Current Status */}
              {selectedLead && (() => {
                const CurrentStatusIcon = STATUS_CONFIG[selectedLead.status].icon;
                return (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Current Status</p>
                    <Badge className={`${STATUS_CONFIG[selectedLead.status].bgColor} ${STATUS_CONFIG[selectedLead.status].color} border`}>
                      <CurrentStatusIcon className="w-3 h-3 mr-1" />
                      {selectedLead.status}
                    </Badge>
                  </div>
                );
              })()}

              {/* New Status */}
              <div className="space-y-2">
                <Label htmlFor="new-status">New Status *</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as LeadStatus)}>
                  <SelectTrigger id="new-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"] as LeadStatus[]).map((status) => {
                      const StatusIcon = STATUS_CONFIG[status].icon;
                      return (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[status].color}`} />
                            {status}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Notes */}
              <div className="space-y-2">
                <Label htmlFor="status-notes">Notes</Label>
                <Textarea
                  id="status-notes"
                  placeholder="Add notes about this status change (optional)..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {statusNotes.length} / 500 characters
                </p>
              </div>

              {/* Quick Notes Templates */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Quick Notes</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Initial contact made",
                    "Follow-up scheduled",
                    "Requirements discussed",
                    "Proposal sent via email",
                    "Deal won!",
                    "Lost to competitor",
                  ].map((template) => (
                    <Button
                      key={template}
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-auto py-2"
                      onClick={() => setStatusNotes(template)}
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lead Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedLead?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="font-medium">{selectedLead.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Company</p>
                    <p className="font-medium">{selectedLead.company}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Status</p>
                    {(() => {
                      const DetailStatusIcon = STATUS_CONFIG[selectedLead.status].icon;
                      return (
                        <Badge className={`${STATUS_CONFIG[selectedLead.status].bgColor} ${STATUS_CONFIG[selectedLead.status].color} border w-fit`}>
                          <DetailStatusIcon className="w-3 h-3 mr-1" />
                          {selectedLead.status}
                        </Badge>
                      );
                    })()}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Deal Value</p>
                    <p className="font-medium text-green-600">{formatCurrency(selectedLead.value)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Source</p>
                    <p className="font-medium">{selectedLead.source}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Assigned To</p>
                    <p className="font-medium">{selectedLead.assignedTo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Created</p>
                    <p className="font-medium text-sm">{formatDate(selectedLead.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Last Updated</p>
                    <p className="font-medium text-sm">{formatDate(selectedLead.lastUpdated)}</p>
                  </div>
                </div>

                {/* Status History for this lead */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-3">Status History</p>
                  <div className="space-y-2">
                    {statusHistory
                      .filter(h => h.leadId === selectedLead.id)
                      .map(entry => (
                        <div key={entry.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            {entry.fromStatus && (
                              <>
                                <span className={STATUS_CONFIG[entry.fromStatus].color}>{entry.fromStatus}</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                            <span className={`font-medium ${STATUS_CONFIG[entry.toStatus].color}`}>{entry.toStatus}</span>
                          </div>
                          {entry.notes && <p className="text-xs text-gray-600 mb-1">"{entry.notes}"</p>}
                          <p className="text-xs text-gray-500">{formatDate(entry.updatedAt)} by {entry.updatedBy}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setDetailDialogOpen(false);
                if (selectedLead) openStatusDialog(selectedLead);
              }} className="gap-2">
                <Edit className="w-4 h-4" />
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
