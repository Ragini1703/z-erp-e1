import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  User, Building2, Phone, Mail, Calendar, 
  Clock, TrendingUp, TrendingDown, CheckCircle, XCircle,
  ArrowRight, Edit, Eye, MoreVertical, Sparkles,
  Filter, Search, Download, RefreshCw, History,
  Target, Award, AlertCircle, Loader2, Save,
  Users, DollarSign, FileText, BarChart3, GitBranch
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import LeadStatusPipeline from "@/components/crm/LeadStatusPipeline";
import {
  LeadStatus,
  LEAD_STATUS_CONFIG,
  LEAD_STATUS_LABELS,
  getStatusLabel,
  isValidStatusTransition,
  getAllStatusesSorted,
  calculateConversionRate,
  getStatusProgress,
  STATUS_PIPELINE_STAGES
} from "@/lib/lead-status-config";

// ==================== TYPES ====================

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
  course?: string;
  intake?: string;
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

// ==================== MAIN COMPONENT ====================

export default function LeadStatusManagementPage() {
  const { toast } = useToast();
  
  // State Management
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "L001",
      name: "Priya Sharma",
      company: "Student",
      email: "priya.sharma@email.com",
      phone: "+91-9876543210",
      status: "new_lead",
      value: 50000,
      source: "Website",
      assignedTo: "Rajesh Kumar",
      course: "B.Tech Computer Science",
      intake: "Fall 2026",
      createdAt: new Date(2026, 1, 10),
      lastUpdated: new Date(2026, 1, 10),
    },
    {
      id: "L002",
      name: "Amit Patel",
      company: "Student",
      email: "amit.patel@email.com",
      phone: "+91-9876543211",
      status: "contacted",
      value: 45000,
      source: "Referral",
      assignedTo: "Priya Singh",
      course: "MBA",
      intake: "Spring 2027",
      createdAt: new Date(2026, 1, 8),
      lastUpdated: new Date(2026, 1, 12),
    },
    {
      id: "L003",
      name: "Sneha Reddy",
      company: "Student",
      email: "sneha.reddy@email.com",
      phone: "+91-9876543212",
      status: "follow_up",
      value: 55000,
      source: "Education Fair",
      assignedTo: "Rajesh Kumar",
      course: "M.Tech AI & ML",
      intake: "Fall 2026",
      createdAt: new Date(2026, 1, 5),
      lastUpdated: new Date(2026, 1, 14),
    },
    {
      id: "L004",
      name: "Rahul Verma",
      company: "Student",
      email: "rahul.verma@email.com",
      phone: "+91-9876543213",
      status: "counselling_done",
      value: 60000,
      source: "Walk-in",
      assignedTo: "Priya Singh",
      course: "BBA",
      intake: "Fall 2026",
      createdAt: new Date(2026, 1, 1),
      lastUpdated: new Date(2026, 1, 15),
    },
    {
      id: "L005",
      name: "Kavya Krishnan",
      company: "Student",
      email: "kavya.k@email.com",
      phone: "+91-9876543214",
      status: "interested",
      value: 70000,
      source: "Social Media",
      assignedTo: "Rajesh Kumar",
      course: "B.Tech Electronics",
      intake: "Fall 2026",
      createdAt: new Date(2026, 0, 20),
      lastUpdated: new Date(2026, 1, 13),
    },
    {
      id: "L006",
      name: "Arjun Singh",
      company: "Student",
      email: "arjun.singh@email.com",
      phone: "+91-9876543215",
      status: "admission_confirmed",
      value: 65000,
      source: "Email Campaign",
      assignedTo: "Priya Singh",
      course: "B.Sc Data Science",
      intake: "Fall 2026",
      createdAt: new Date(2026, 0, 25),
      lastUpdated: new Date(2026, 1, 16),
    },
    {
      id: "L007",
      name: "Meera Iyer",
      company: "Student",
      email: "meera.iyer@email.com",
      phone: "+91-9876543216",
      status: "admission_completed",
      value: 55000,
      source: "Referral",
      assignedTo: "Rajesh Kumar",
      course: "MBA Finance",
      intake: "Spring 2026",
      createdAt: new Date(2026, 0, 15),
      lastUpdated: new Date(2026, 1, 1),
    },
    {
      id: "L008",
      name: "Vikram Mehta",
      company: "Student",
      email: "vikram.mehta@email.com",
      phone: "+91-9876543217",
      status: "not_interested",
      value: 50000,
      source: "Cold Call",
      assignedTo: "Priya Singh",
      course: "B.Tech Civil",
      intake: "Fall 2026",
      createdAt: new Date(2026, 1, 9),
      lastUpdated: new Date(2026, 1, 13),
    },
    {
      id: "L009",
      name: "Anjali Desai",
      company: "Student",
      email: "anjali.desai@email.com",
      phone: "+91-9876543218",
      status: "lost_lead",
      value: 45000,
      source: "Website",
      assignedTo: "Rajesh Kumar",
      course: "B.Arch",
      intake: "Fall 2026",
      createdAt: new Date(2026, 1, 3),
      lastUpdated: new Date(2026, 1, 10),
    },
  ]);

  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([
    {
      id: "H001",
      leadId: "L007",
      leadName: "Meera Iyer",
      fromStatus: "admission_confirmed",
      toStatus: "admission_completed",
      notes: "All documentation completed and fees paid. Welcome aboard!",
      updatedBy: "Rajesh Kumar",
      updatedAt: new Date(2026, 1, 1, 14, 30),
    },
    {
      id: "H002",
      leadId: "L009",
      leadName: "Anjali Desai",
      fromStatus: "follow_up",
      toStatus: "lost_lead",
      notes: "Student chose another institution. Competitor offered better scholarship.",
      updatedBy: "Rajesh Kumar",
      updatedAt: new Date(2026, 1, 10, 10, 15),
    },
    {
      id: "H003",
      leadId: "L006",
      leadName: "Arjun Singh",
      fromStatus: "interested",
      toStatus: "admission_confirmed",
      notes: "Received confirmation and partial payment. Documents verified.",
      updatedBy: "Priya Singh",
      updatedAt: new Date(2026, 1, 16, 16, 45),
    },
  ]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [pipelineViewLead, setPipelineViewLead] = useState<Lead | null>(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "All">("All");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedNewStatus, setSelectedNewStatus] = useState<LeadStatus | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate comprehensive statistics
  const stats = {
    total: leads.length,
    byStatus: Object.keys(LEAD_STATUS_CONFIG).reduce((acc, status) => {
      acc[status as LeadStatus] = leads.filter(l => l.status === status).length;
      return acc;
    }, {} as Record<LeadStatus, number>),
    totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
    completedValue: leads.filter(l => l.status === "admission_completed").reduce((sum, lead) => sum + lead.value, 0),
    confirmedValue: leads.filter(l => l.status === "admission_confirmed").reduce((sum, lead) => sum + lead.value, 0),
    lostValue: leads.filter(l => l.status === "lost_lead").reduce((sum, lead) => sum + lead.value, 0),
    conversionRate: calculateConversionRate(
      leads.length,
      leads.filter(l => l.status === "admission_completed").length
    ),
    confirmationRate: calculateConversionRate(
      leads.length,
      leads.filter(l => l.status === "admission_confirmed" || l.status === "admission_completed").length
    ),
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.phone.includes(searchQuery) ||
                         (lead.course && lead.course.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === "All" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle status update
  const handleUpdateStatus = async (newStatus: LeadStatus, note?: string) => {
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
      notes: note || statusNotes,
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
      title: "Status Updated Successfully",
      description: `Lead "${selectedLead.name}" moved to ${getStatusLabel(newStatus)}`,
    });
  };

  // Open pipeline view
  const openPipelineView = (lead: Lead) => {
    setPipelineViewLead(lead);
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  // Handle export functionality
  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const csvContent = [
      ['ID', 'Name', 'Email', 'Phone', 'Status', 'Course', 'Value', 'Source'].join(','),
      ...filteredLeads.map(lead => 
        [lead.id, lead.name, lead.email, lead.phone, getStatusLabel(lead.status), lead.course || '', lead.value, lead.source].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    setIsExporting(false);
    toast({
      title: "Export Successful",
      description: `Exported ${filteredLeads.length} leads to CSV`,
    });
  };

  // Handle refresh functionality
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Lead data has been updated",
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Status Management</h1>
            <p className="text-gray-600 mt-1">
              Track and manage your admissions pipeline efficiently
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              disabled={isExporting || filteredLeads.length === 0}
              className="transition-all hover:scale-105"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="transition-all hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.total}</div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total Value: {formatCurrency(stats.totalValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">{stats.conversionRate}%</div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.byStatus.admission_completed} completed admissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Confirmed Admissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-purple-600">{stats.byStatus.admission_confirmed}</div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Value: {formatCurrency(stats.confirmedValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.byStatus.contacted + stats.byStatus.follow_up + stats.byStatus.counselling_done + stats.byStatus.interested}
                </div>
                <Target className="h-8 w-8 text-amber-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                In progress pipeline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
            <TabsTrigger value="history">Status History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Leads Overview</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as LeadStatus | "All")}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        {getAllStatusesSorted().map(status => (
                          <SelectItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredLeads.map(lead => {
                      const config = LEAD_STATUS_CONFIG[lead.status];
                      const Icon = config.icon;

                      return (
                        <Card key={lead.id} className="border-l-4" style={{ borderLeftColor: config.color }}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${config.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${config.textColor}`} />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{lead.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {lead.email}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {lead.phone}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                  <Badge className={config.bgColor + " " + config.textColor} variant="outline">
                                    {config.label}
                                  </Badge>
                                  {lead.course && (
                                    <span className="text-gray-600">
                                      <FileText className="h-3 w-3 inline mr-1" />
                                      {lead.course}
                                    </span>
                                  )}
                                  {lead.intake && (
                                    <span className="text-gray-600">
                                      <Calendar className="h-3 w-3 inline mr-1" />
                                      {lead.intake}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>ID: {lead.id}</span>
                                  <span>Source: {lead.source}</span>
                                  <span>Assigned: {lead.assignedTo}</span>
                                  <span>Value: {formatCurrency(lead.value)}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <span>Pipeline Progress</span>
                                    <span>{getStatusProgress(lead.status)}%</span>
                                  </div>
                                  <Progress value={getStatusProgress(lead.status)} className="h-2" />
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="transition-all hover:scale-110 hover:bg-gray-100"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem 
                                      onClick={() => openPipelineView(lead)}
                                      className="cursor-pointer"
                                    >
                                      <GitBranch className="h-4 w-4 mr-2" />
                                      View Pipeline
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setSelectedLead(lead);
                                        setSelectedNewStatus(null);
                                        setStatusNotes("");
                                        setStatusDialogOpen(true);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Update Status
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        navigator.clipboard.writeText(lead.email);
                                        toast({
                                          title: "Email Copied",
                                          description: `${lead.email} copied to clipboard`,
                                        });
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Mail className="h-4 w-4 mr-2" />
                                      Copy Email
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        navigator.clipboard.writeText(lead.phone);
                                        toast({
                                          title: "Phone Copied",
                                          description: `${lead.phone} copied to clipboard`,
                                        });
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Phone className="h-4 w-4 mr-2" />
                                      Copy Phone
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <span className="text-xs text-gray-500">
                                  Updated {formatDate(lead.lastUpdated)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {filteredLeads.length === 0 && (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No leads found matching your criteria</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline View Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {STATUS_PIPELINE_STAGES.map(stage => (
                <Card key={stage.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{stage.label}</span>
                      <Badge variant="secondary">
                        {stage.statuses.reduce((sum, status) => sum + stats.byStatus[status], 0)} leads
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {stage.statuses.map(status => {
                        const config = LEAD_STATUS_CONFIG[status];
                        const Icon = config.icon;
                        const count = stats.byStatus[status];

                        return (
                          <Card key={status} className={`${config.bgColor} border-2 ${config.borderColor}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg bg-white`}>
                                  <Icon className={`h-6 w-6 ${config.textColor}`} />
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-semibold ${config.textColor}`}>{config.label}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary">{count} leads</Badge>
                                    <span className="text-xs text-gray-600">
                                      {formatCurrency(
                                        leads.filter(l => l.status === status).reduce((sum, l) => sum + l.value, 0)
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Status History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Status Change History
                </CardTitle>
                <CardDescription>
                  Track all status changes across your leads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {statusHistory.map(history => {
                      const toConfig = LEAD_STATUS_CONFIG[history.toStatus];
                      const fromConfig = history.fromStatus ? LEAD_STATUS_CONFIG[history.fromStatus] : null;
                      const ToIcon = toConfig.icon;
                      const FromIcon = fromConfig?.icon;

                      return (
                        <Card key={history.id} className="border-l-4" style={{ borderLeftColor: toConfig.color }}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex items-center gap-2">
                                {fromConfig && FromIcon && (
                                  <div className={`p-2 rounded-full ${fromConfig.bgColor}`}>
                                    <FromIcon className={`h-4 w-4 ${fromConfig.textColor}`} />
                                  </div>
                                )}
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                <div className={`p-2 rounded-full ${toConfig.bgColor}`}>
                                  <ToIcon className={`h-4 w-4 ${toConfig.textColor}`} />
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{history.leadName}</h4>
                                  <span className="text-xs text-gray-500">({history.leadId})</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm mb-2">
                                  {history.fromStatus && (
                                    <>
                                      <Badge variant="outline" className="text-xs">
                                        {getStatusLabel(history.fromStatus)}
                                      </Badge>
                                      <ArrowRight className="h-3 w-3" />
                                    </>
                                  )}
                                  <Badge className={toConfig.bgColor + " " + toConfig.textColor}>
                                    {toConfig.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{history.notes}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {history.updatedBy}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(history.updatedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Current lead distribution across statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getAllStatusesSorted().map(status => {
                      const config = LEAD_STATUS_CONFIG[status];
                      const count = stats.byStatus[status];
                      const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      const Icon = config.icon;

                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${config.textColor}`} />
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Admission Completion Rate</span>
                      <span className="text-lg font-bold text-green-600">{stats.conversionRate}%</span>
                    </div>
                    <Progress value={stats.conversionRate} className="h-3" />
                    <p className="text-xs text-gray-500">
                      {stats.byStatus.admission_completed} of {stats.total} leads completed admission
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confirmation Rate</span>
                      <span className="text-lg font-bold text-purple-600">{stats.confirmationRate}%</span>
                    </div>
                    <Progress value={stats.confirmationRate} className="h-3" />
                    <p className="text-xs text-gray-500">
                      {stats.byStatus.admission_confirmed + stats.byStatus.admission_completed} leads confirmed or completed
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatCurrency(stats.completedValue)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Total Revenue (Completed)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        {formatCurrency(stats.confirmedValue)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Confirmed Pipeline</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">
                        {formatCurrency(stats.lostValue)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Lost Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Action Dialog for Status Update */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Lead Status</DialogTitle>
              <DialogDescription>
                {selectedLead && `Change status for ${selectedLead.name}`}
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-2">
                    <Badge className={LEAD_STATUS_CONFIG[selectedLead.status].bgColor}>
                      {getStatusLabel(selectedLead.status)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Status Transitions</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LEAD_STATUS_CONFIG[selectedLead.status].nextStatuses.map(status => {
                      const config = LEAD_STATUS_CONFIG[status];
                      const Icon = config.icon;
                      const isSelected = selectedNewStatus === status;
                      return (
                        <Button
                          key={status}
                          variant={isSelected ? "default" : "outline"}
                          className={`justify-start transition-all ${isSelected ? 'ring-2 ring-blue-500' : config.bgColor} hover:scale-105`}
                          onClick={() => setSelectedNewStatus(status)}
                        >
                          <Icon className={`h-4 w-4 mr-2 ${config.textColor}`} />
                          <span className="flex-1 text-left">{config.label}</span>
                          {config.requiresNote && (
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  {selectedNewStatus && LEAD_STATUS_CONFIG[selectedNewStatus].requiresNote && (
                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      This status change requires a note
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-notes">
                    Notes {selectedNewStatus && LEAD_STATUS_CONFIG[selectedNewStatus]?.requiresNote && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <Textarea
                    id="status-notes"
                    placeholder="Add notes about this status change..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    {statusNotes.length} / 500 characters
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusDialogOpen(false);
                  setSelectedNewStatus(null);
                  setStatusNotes("");
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedNewStatus) {
                    handleUpdateStatus(selectedNewStatus, statusNotes);
                    setSelectedNewStatus(null);
                  }
                }}
                disabled={
                  !selectedNewStatus ||
                  isLoading ||
                  (selectedNewStatus && 
                   LEAD_STATUS_CONFIG[selectedNewStatus]?.requiresNote && 
                   !statusNotes.trim())
                }
                className="w-full sm:w-auto transition-all hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pipeline Full View Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Pipeline View</DialogTitle>
              <DialogDescription>
                {pipelineViewLead && `Complete status pipeline for ${pipelineViewLead.name}`}
              </DialogDescription>
            </DialogHeader>
            {pipelineViewLead && selectedLead && (
              <div className="space-y-6">
                {/* Lead Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{pipelineViewLead.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Course</p>
                        <p className="font-semibold">{pipelineViewLead.course || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{pipelineViewLead.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{pipelineViewLead.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pipeline */}
                <LeadStatusPipeline
                  currentStatus={pipelineViewLead.status}
                  onStatusChange={handleUpdateStatus}
                  isInteractive={true}
                  showProgress={true}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
