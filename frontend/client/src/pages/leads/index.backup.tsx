import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, Users, TrendingUp, Award, Plus, Search, Filter,
  Phone, Mail, Calendar, MessageCircle, Send, Clock, Edit,
  CheckCircle, XCircle, AlertCircle, BarChart3, Zap, User, 
  Settings, GitBranch, Flag, MapPin, Paperclip, Trash2, Eye, 
  ArrowRight, Upload, FileText, X, ChevronDown, MoreVertical,
  Grid3x3, Columns3, LayoutGrid, Star, Flame, Download, Import,
  Bell, Activity, SlidersHorizontal, Tag as TagIcon, DollarSign,
  Building2, Globe, Linkedin, Twitter, Facebook, Video, Copy,
  CheckCheck, AlertTriangle, Sparkles, Brain, TrendingDown,
  ArrowUpRight, ArrowDownRight, Clock3, Users2, FileCheck,
  MessageSquare, PlusCircle, Save, Briefcase, MapPinned, History,
  Loader2, UserCheck
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ==================== TYPES ====================
interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  addedDate: string;
}

interface Activity {
  id: string;
  type: "email" | "call" | "meeting" | "status_change" | "note" | "task";
  title: string;
  description: string;
  timestamp: string;
  user: string;
  icon?: any;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  assignedTo: string;
}

interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  priority: "high" | "medium" | "low";
  assignedTo: string;
  createdDate: string;
  lastContact: string;
  tags?: string[];
  address?: string;
  position?: string;
  city?: string;
  state?: string;
  website?: string;
  country?: string;
  zipCode?: string;
  leadValue?: number;
  leadScore?: number; // 0-100
  temperature?: "cold" | "warm" | "hot";
  defaultLanguage?: string;
  description?: string;
  dateContacted?: string;
  isPublic?: boolean;
  contactedToday?: boolean;
  attachments?: Attachment[];
  activities?: Activity[];
  tasks?: Task[];
  notes?: Note[];
  aiSummary?: string;
  // New fields for enhanced lead management
  industry?: string;
  companySize?: string;
  budget?: number;
  decisionTimeline?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  facebookPage?: string;
  alternatePhone?: string;
  alternateEmail?: string;
  preferredContactMethod?: "email" | "phone" | "linkedin" | "meeting";
  lastActivity?: string;
  nextFollowUp?: string;
  campaignSource?: string;
  referredBy?: string;
}

type ViewMode = "table" | "kanban" | "grid";

// ==================== COMPONENT ====================
export default function LeadsModule() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("overview");
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [assignedFilter, setAssignedFilter] = useState<string[]>([]);
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Demo data
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      company: "TechCorp Solutions",
      email: "sarah.j@techcorp.com",
      phone: "+1 (555) 123-4567",
      source: "Website",
      status: "qualified",
      priority: "high",
      assignedTo: "John Smith",
      createdDate: "Feb 10, 2026",
      lastContact: "2 hours ago",
      leadValue: 50000,
      leadScore: 85,
      temperature: "hot",
      position: "VP of Sales",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      tags: ["Enterprise", "SaaS", "High Priority"],
      aiSummary: "Sarah Johnson is VP of Sales at TechCorp Solutions. High-value enterprise lead with strong buying signals. Recently engaged with pricing page and requested demo.",
      activities: [
        {
          id: "a1",
          type: "email",
          title: "Email sent",
          description: "Sent pricing proposal",
          timestamp: "2 hours ago",
          user: "John Smith"
        },
        {
          id: "a2",
          type: "meeting",
          title: "Demo scheduled",
          description: "Product demo scheduled for Feb 15",
          timestamp: "1 day ago",
          user: "John Smith"
        },
        {
          id: "a3",
          type: "status_change",
          title: "Status changed",
          description: "Changed from Contacted to Qualified",
          timestamp: "2 days ago",
          user: "John Smith"
        }
      ],
      tasks: [
        {
          id: "t1",
          title: "Follow up on proposal",
          dueDate: "Feb 14, 2026",
          priority: "high",
          completed: false,
          assignedTo: "John Smith"
        },
        {
          id: "t2",
          title: "Prepare demo environment",
          dueDate: "Feb 15, 2026",
          priority: "medium",
          completed: false,
          assignedTo: "John Smith"
        }
      ],
      notes: [
        {
          id: "n1",
          content: "Very interested in enterprise plan. Mentioned they're evaluating 3 solutions.",
          createdBy: "John Smith",
          createdAt: "Feb 12, 2026 at 3:45 PM"
        }
      ]
    },
    {
      id: "2",
      name: "Michael Chen",
      company: "Startup Inc",
      email: "m.chen@startup.io",
      phone: "+1 (555) 234-5678",
      source: "LinkedIn",
      status: "new",
      priority: "medium",
      assignedTo: "Emily Davis",
      createdDate: "Feb 11, 2026",
      lastContact: "5 hours ago",
      leadValue: 15000,
      leadScore: 45,
      temperature: "warm",
      position: "Founder & CEO",
      city: "Austin",
      state: "TX",
      country: "USA",
      tags: ["Startup", "SMB"],
      aiSummary: "Michael Chen is Founder at Startup Inc. Mid-value startup lead. Initial contact made via LinkedIn. Needs follow-up.",
      activities: [],
      tasks: [],
      notes: []
    },
    {
      id: "3",
      name: "Emma Rodriguez",
      company: "Global Manufacturing Co",
      email: "e.rodriguez@global-mfg.com",
      phone: "+1 (555) 345-6789",
      source: "Referral",
      status: "proposal",
      priority: "high",
      assignedTo: "John Smith",
      createdDate: "Feb 8, 2026",
      lastContact: "1 day ago",
      leadValue: 120000,
      leadScore: 92,
      temperature: "hot",
      position: "Director of Operations",
      city: "Chicago",
      state: "IL",
      country: "USA",
      tags: ["Manufacturing", "Enterprise", "Referral"],
      aiSummary: "Emma Rodriguez is Director of Operations at Global Manufacturing. High-value referral lead with urgent timeline. Proposal sent, awaiting response.",
      activities: [],
      tasks: [],
      notes: []
    },
    {
      id: "4",
      name: "David Park",
      company: "E-Commerce Plus",
      email: "d.park@ecomplus.com",
      phone: "+1 (555) 456-7890",
      source: "Trade Show",
      status: "contacted",
      priority: "medium",
      assignedTo: "Emily Davis",
      createdDate: "Feb 9, 2026",
      lastContact: "3 days ago",
      leadValue: 30000,
      leadScore: 62,
      temperature: "warm",
      position: "CTO",
      city: "Seattle",
      state: "WA",
      country: "USA",
      tags: ["E-Commerce", "Tech"],
      aiSummary: "David Park is CTO at E-Commerce Plus. Met at recent trade show. Moderate interest, needs nurturing.",
      activities: [],
      tasks: [],
      notes: []
    },
    {
      id: "5",
      name: "Lisa Anderson",
      company: "Healthcare Solutions",
      email: "l.anderson@healthsol.com",
      phone: "+1 (555) 567-8901",
      source: "Cold Call",
      status: "negotiation",
      priority: "high",
      assignedTo: "John Smith",
      createdDate: "Feb 5, 2026",
      lastContact: "Just now",
      leadValue: 85000,
      leadScore: 88,
      temperature: "hot",
      position: "VP of Technology",
      city: "Boston",
      state: "MA",
      country: "USA",
      tags: ["Healthcare", "Enterprise", "Hot Lead"],
      aiSummary: "Lisa Anderson is VP of Technology at Healthcare Solutions. In final negotiation stage. Price negotiation ongoing.",
      activities: [],
      tasks: [],
      notes: []
    }
  ]);

  // ==================== COMPUTED VALUES ====================
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(lead.status);
    const matchesSource = sourceFilter.length === 0 || sourceFilter.includes(lead.source);
    const matchesAssigned = assignedFilter.length === 0 || assignedFilter.includes(lead.assignedTo);
    const matchesScore = (lead.leadScore || 0) >= scoreRange[0] && (lead.leadScore || 0) <= scoreRange[1];

    return matchesSearch && matchesStatus && matchesSource && matchesAssigned && matchesScore;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    qualified: leads.filter(l => l.status === "qualified").length,
    won: leads.filter(l => l.status === "won").length,
    avgScore: Math.round(leads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / leads.length),
    totalValue: leads.reduce((sum, l) => sum + (l.leadValue || 0), 0),
    hotLeads: leads.filter(l => l.temperature === "hot").length,
  };

  // ==================== HANDLERS ====================
  const openDetailModal = (lead: Lead) => {
    setSelectedLead(lead);
    setActiveDetailTab("overview");
    setDetailModalOpen(true);
  };

  const openAddLeadModal = () => {
    setFormData({
      status: "new",
      priority: "medium",
      assignedTo: "John Smith",
      country: "USA",
      temperature: "warm",
      leadScore: 50,
    });
    setTags([]);
    setTagsInput("");
    setAddLeadModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setFormData({
      ...lead,
    });
    setTags(lead.tags || []);
    setSelectedLead(lead);
    setAddLeadModalOpen(true);
  };

  // Contact Actions
  const handleCall = (lead: Lead, e?: React.MouseEvent) => {
    e?.stopPropagation();
    console.log("📞 Initiating call to:", lead.name, lead.phone);
    
    if (!lead.phone) {
      toast({
        title: "⚠️ No Phone Number",
        description: `${lead.name} doesn't have a phone number on record.`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // In a real app, this would integrate with a phone system (Twilio, etc.)
    toast({
      title: "📞 Calling " + lead.name,
      description: `Dialing ${lead.phone}...`,
      duration: 4000,
    });

    // Add activity
    setLeads(prev => prev.map(l => {
      if (l.id === lead.id) {
        return {
          ...l,
          lastContact: "Just now",
          activities: [{
            id: String(Date.now()),
            type: "call" as const,
            title: "Phone Call",
            description: `Outbound call to ${lead.phone}`,
            timestamp: "Just now",
            user: "Current User"
          }, ...(l.activities || [])]
        };
      }
      return l;
    }));

    // Simulate opening phone dialer
    window.location.href = `tel:${lead.phone}`;
  };

  const handleEmail = (lead: Lead, e?: React.MouseEvent) => {
    e?.stopPropagation();
    console.log("📧 Composing email to:", lead.name, lead.email);
    
    if (!lead.email) {
      toast({
        title: "⚠️ No Email Address",
        description: `${lead.name} doesn't have an email address on record.`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    toast({
      title: "✉️ Opening Email",
      description: `Composing email to ${lead.name}...`,
      duration: 3000,
    });

    // Add activity
    setLeads(prev => prev.map(l => {
      if (l.id === lead.id) {
        return {
          ...l,
          lastContact: "Just now",
          activities: [{
            id: String(Date.now()),
            type: "email" as const,
            title: "Email Sent",
            description: `Email sent to ${lead.email}`,
            timestamp: "Just now",
            user: "Current User"
          }, ...(l.activities || [])]
        };
      }
      return l;
    }));

    // Open email client with pre-filled data
    const subject = encodeURIComponent(`Following up - ${lead.company || 'Your Inquiry'}`);
    const body = encodeURIComponent(`Hi ${lead.name.split(' ')[0]},\n\nI wanted to follow up with you regarding...`);
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = (lead: Lead, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lead.phone) {
      toast({
        title: "⚠️ No Phone Number",
        description: "Cannot open WhatsApp without a phone number.",
        variant: "destructive",
      });
      return;
    }

    const phoneNumber = lead.phone.replace(/\D/g, ''); // Remove non-digits
    const message = encodeURIComponent(`Hi ${lead.name.split(' ')[0]}, following up on your inquiry...`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    
    toast({
      title: "💬 Opening WhatsApp",
      description: `Messaging ${lead.name}...`,
      duration: 3000,
    });
  };

  // CRUD Actions
  const handleDelete = (leadId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead) return;

    if (confirm(`Are you sure you want to delete ${lead.name}? This action cannot be undone.`)) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
      
      toast({
        title: "🗑️ Lead Deleted",
        description: `${lead.name} has been removed from your leads.`,
        duration: 3000,
      });

      // Close detail modal if it's open for this lead
      if (selectedLead?.id === leadId) {
        setDetailModalOpen(false);
        setSelectedLead(null);
      }
    }
  };

  const handleDuplicate = (lead: Lead, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    const duplicatedLead: Lead = {
      ...lead,
      id: String(Date.now()),
      name: `${lead.name} (Copy)`,
      createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastContact: "Never",
      activities: [],
      tasks: [],
      notes: [],
    };

    setLeads(prev => [duplicatedLead, ...prev]);

    toast({
      title: "📋 Lead Duplicated",
      description: `Created a copy of ${lead.name}`,
      duration: 3000,
    });
  };

  const handleConvertToCustomer = (lead: Lead) => {
    console.log("🔄 Converting lead to customer:", lead.name);
    
    // Store lead data in localStorage to pass to customer page
    const customerData = {
      companyName: lead.company || lead.name,
      primaryContact: lead.name,
      primaryEmail: lead.email || "",
      phone: lead.phone || "",
      vatNumber: "",
      website: lead.website || "",
      address: lead.address || "",
      city: lead.city || "",
      state: lead.state || "",
      zipCode: lead.zipCode || "",
      country: lead.country || "USA",
      position: lead.position || "",
      leadSource: lead.source,
      convertedFrom: "lead",
      leadId: lead.id,
      convertedDate: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem('newCustomerData', JSON.stringify(customerData));
    
    toast({
      title: "✅ Converting to Customer",
      description: `Redirecting to create customer from ${lead.name}...`,
      duration: 3000,
    });

    // Navigate to customers page after a brief delay
    setTimeout(() => {
      setLocation('/customers');
    }, 1000);
  };

  // Import/Export
  const handleImport = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        toast({
          title: "📥 Importing Leads",
          description: `Processing ${file.name}...`,
          duration: 3000,
        });

        // In a real app, this would parse the CSV/Excel file
        // For now, just show success
        setTimeout(() => {
          toast({
            title: "✅ Import Complete",
            description: "Leads have been imported successfully.",
            duration: 3000,
          });
        }, 1500);
      }
    };
    
    input.click();
  };

  const handleExport = () => {
    const csvHeaders = "Name,Company,Email,Phone,Status,Source,Priority,Lead Value,Score,Assigned To\n";
    const csvData = filteredLeads.map(lead => 
      `"${lead.name}","${lead.company || ''}","${lead.email}","${lead.phone}","${lead.status}","${lead.source}","${lead.priority}","${lead.leadValue || 0}","${lead.leadScore || 0}","${lead.assignedTo}"`
    ).join('\n');
    
    const csv = csvHeaders + csvData;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "📥 Export Complete",
      description: `Exported ${filteredLeads.length} leads to CSV`,
      duration: 3000,
    });
  };

  // Bulk Actions
  const handleBulkAssign = (assignTo: string) => {
    toast({
      title: "👥 Bulk Assignment",
      description: `This feature will assign selected leads to ${assignTo}`,
      duration: 3000,
    });
  };

  const handleBulkStatusChange = (newStatus: string) => {
    toast({
      title: "🔄 Status Update",
      description: `This feature will change status of selected leads to ${newStatus}`,
      duration: 3000,
    });
  };

  const handleBulkAddTags = () => {
    toast({
      title: "🏷️ Bulk Tag Addition",
      description: "This feature will add tags to selected leads",
      duration: 3000,
    });
  };

  const handleBulkDelete = () => {
    if (confirm("Are you sure you want to delete the selected leads?")) {
      toast({
        title: "🗑️ Bulk Delete",
        description: "Selected leads will be deleted",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const createLeadObject = (): Lead => {
    return {
      id: String(Date.now()),
      name: formData.name || "",
      company: formData.company || "",
      email: formData.email || "",
      phone: formData.phone || "",
      source: formData.source || "",
      status: (formData.status as Lead["status"]) || "new",
      priority: (formData.priority as Lead["priority"]) || "medium",
      assignedTo: formData.assignedTo || "John Smith",
      createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastContact: "Just now",
      leadValue: formData.leadValue,
      leadScore: formData.leadScore || 50,
      temperature: (formData.temperature as Lead["temperature"]) || "warm",
      position: formData.position,
      city: formData.city,
      state: formData.state,
      country: formData.country || "USA",
      website: formData.website,
      zipCode: formData.zipCode,
      address: formData.address,
      description: formData.description,
      tags,
      activities: [],
      tasks: [],
      notes: [],
    };
  };

  const resetForm = () => {
    setFormData({
      status: "new",
      priority: "medium",
      assignedTo: "John Smith",
      country: "USA",
      temperature: "warm",
      leadScore: 50,
    });
    setTags([]);
    setTagsInput("");
  };

  const saveNewLead = async () => {
    const isEditing = !!formData.id;
    console.log(isEditing ? "✏️ saveNewLead (EDIT MODE)" : "🔥 saveNewLead (CREATE MODE)", { formData, name: formData.name, source: formData.source });
    
    if (!formData.name || !formData.source) {
      console.log("❌ Validation failed", { name: formData.name, source: formData.source });
      
      // Scroll to top to show required fields
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = 0;
      }
      
      toast({
        title: "⚠️ Missing Required Fields",
        description: !formData.name && !formData.source 
          ? "Please fill in both Full Name and Lead Source to continue." 
          : !formData.name 
          ? "Please enter the lead's Full Name."
          : "Please select where this lead came from (Lead Source).",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    console.log("✅ Validation passed, starting to save...");
    setIsSaving(true);
    
    try {
      // Small delay for UX (shows loading state)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (isEditing) {
        // UPDATE existing lead
        console.log("📝 Updating existing lead:", formData.id);
        setLeads(prev => prev.map(l => {
          if (l.id === formData.id) {
            return {
              ...l,
              ...formData,
              tags: tags,
            };
          }
          return l;
        }));
        
        console.log("🎉 Lead update complete!");
        toast({
          title: "✅ Lead Updated Successfully!",
          description: `${formData.name} has been updated.`,
          duration: 3000,
        });
      } else {
        // CREATE new lead
        console.log("💾 Creating new lead object...");
        const newLead = createLeadObject();
        console.log("📝 New lead created:", newLead);
        
        setLeads(prev => {
          console.log("📋 Current leads count:", prev.length);
          const updated = [newLead, ...prev];
          console.log("📋 Updated leads count:", updated.length);
          return updated;
        });
        
        console.log("🎉 Lead save complete!");
        toast({
          title: "✨ Lead Created Successfully!",
          description: `${newLead.name} from ${newLead.company || 'Unknown Company'} has been added to your pipeline.`,
          duration: 5000,
        });
      }
      
      // Close modal and reset
      setAddLeadModalOpen(false);
      resetForm();
      setSelectedLead(null);
      
    } catch (error) {
      console.error("❌ Error saving lead:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} lead. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAndAddAnother = async () => {
    console.log("🔄 saveAndAddAnother called", { formData });
    
    if (!formData.name || !formData.source) {
      // Scroll to top to show required fields
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = 0;
      }
      
      toast({
        title: "⚠️ Missing Required Fields",
        description: !formData.name && !formData.source 
          ? "Please fill in both Full Name and Lead Source to continue." 
          : !formData.name 
          ? "Please enter the lead's Full Name."
          : "Please select where this lead came from (Lead Source).",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create lead
      const newLead = createLeadObject();
      console.log("📝 New lead created:", newLead);
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLeads(prev => [newLead, ...prev]);
      
      // Reset form but keep modal open
      resetForm();
      
      // Success toast
      toast({
        title: "✅ Lead Saved!",
        description: `${newLead.name} has been saved. Ready to add another lead.`,
        duration: 3000,
      });
      
      // Scroll to top of form
      const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = 0;
      }
      
      console.log("🎉 Lead saved, ready for next entry");
    } catch (error) {
      console.error("❌ Error saving lead:", error);
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = (value: string) => {
    const v = value.trim();
    if (!v || tags.includes(v)) return;
    setTags(prev => [...prev, v]);
    setTagsInput("");
  };

  const removeTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagsInput);
    } else if (e.key === "Backspace" && tagsInput === "") {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const removeFilter = (type: string, value?: string) => {
    if (type === "status" && value) {
      setStatusFilter(prev => prev.filter(s => s !== value));
    } else if (type === "source" && value) {
      setSourceFilter(prev => prev.filter(s => s !== value));
    } else if (type === "assigned" && value) {
      setAssignedFilter(prev => prev.filter(s => s !== value));
    }
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setSourceFilter([]);
    setAssignedFilter([]);
    setScoreRange([0, 100]);
    setSearchTerm("");
  };

  // ==================== HELPER FUNCTIONS ====================
  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      qualified: "bg-purple-500",
      proposal: "bg-orange-500",
      negotiation: "bg-pink-500",
      won: "bg-green-500",
      lost: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusColorText = (status: string) => {
    const colors = {
      new: "text-blue-600 bg-blue-50",
      contacted: "text-yellow-600 bg-yellow-50",
      qualified: "text-purple-600 bg-purple-50",
      proposal: "text-orange-600 bg-orange-50",
      negotiation: "text-pink-600 bg-pink-50",
      won: "text-green-600 bg-green-50",
      lost: "text-red-600 bg-red-50",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-50";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "text-red-600 bg-red-50 border-red-200",
      medium: "text-amber-600 bg-amber-50 border-amber-200",
      low: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[priority as keyof typeof colors] || "text-gray-600 bg-gray-50";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTemperatureIcon = (temp?: string) => {
    if (temp === "hot") return <Flame className="w-4 h-4 text-red-500" />;
    if (temp === "warm") return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-blue-500" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ==================== RENDER ====================
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
                <p className="text-gray-500 mt-1">Manage and track all sales leads</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleImport} className="hover:bg-blue-50 hover:border-blue-500">
                  <Import className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="hover:bg-green-50 hover:border-green-500">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-500">
                      <MoreVertical className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Bulk Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-gray-500 font-semibold">Bulk Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAssign("John Smith")}>
                      <User className="w-4 h-4 mr-2" />
                      Assign to user
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange("qualified")}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Change status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkAddTags}>
                      <TagIcon className="w-4 h-4 mr-2" />
                      Add tags
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={openAddLeadModal} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Leads</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
                  <p className="text-sm text-gray-600">New</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.qualified}</p>
                  <p className="text-sm text-gray-600">Qualified</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.won}</p>
                  <p className="text-sm text-gray-600">Won</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Flame className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.hotLeads}</p>
                  <p className="text-sm text-gray-600">Hot Leads</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgScore}</p>
                  <p className="text-sm text-gray-600">Avg Score</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                  <p className="text-sm text-gray-600">Total Value</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search leads by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-gray-50 border-gray-300"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-11"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {(statusFilter.length + sourceFilter.length + assignedFilter.length) > 0 && (
                  <Badge className="ml-2 bg-blue-600">
                    {statusFilter.length + sourceFilter.length + assignedFilter.length}
                  </Badge>
                )}
              </Button>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-gray-50">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="h-9"
                      >
                        <Columns3 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Table View</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "kanban" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("kanban")}
                        className="h-9"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Kanban View</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-9"
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Grid View</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <Select onValueChange={(v) => setStatusFilter(prev => prev.includes(v) ? prev : [...prev, v])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Source</Label>
                    <Select onValueChange={(v) => setSourceFilter(prev => prev.includes(v) ? prev : [...prev, v])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Trade Show">Trade Show</SelectItem>
                        <SelectItem value="Cold Call">Cold Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Assigned To</Label>
                    <Select onValueChange={(v) => setAssignedFilter(prev => prev.includes(v) ? prev : [...prev, v])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="John Smith">John Smith</SelectItem>
                        <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Lead Score Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={scoreRange[0]}
                        onChange={(e) => setScoreRange([parseInt(e.target.value) || 0, scoreRange[1]])}
                        className="w-20"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={scoreRange[1]}
                        onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value) || 100])}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(statusFilter.length + sourceFilter.length + assignedFilter.length) > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Active filters:</span>
                    {statusFilter.map(status => (
                      <Badge key={status} variant="secondary" className="gap-1">
                        Status: {status}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("status", status)} />
                      </Badge>
                    ))}
                    {sourceFilter.map(source => (
                      <Badge key={source} variant="secondary" className="gap-1">
                        Source: {source}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("source", source)} />
                      </Badge>
                    ))}
                    {assignedFilter.map(assigned => (
                      <Badge key={assigned} variant="secondary" className="gap-1">
                        Assigned: {assigned}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("assigned", assigned)} />
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6">
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <div className="space-y-3">
              {filteredLeads.map(lead => (
                <Card 
                  key={lead.id} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 bg-white"
                  onClick={() => openDetailModal(lead)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-6">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {getInitials(lead.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base truncate">{lead.name}</h3>
                            {lead.temperature && getTemperatureIcon(lead.temperature)}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{lead.company}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tags & Badges */}
                      <div className="flex items-center gap-2 flex-wrap max-w-xs">
                        <Badge className={`${getStatusColor(lead.status)} text-white font-medium capitalize`}>
                          {lead.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                        {lead.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Score */}
                      <div className="text-center min-w-[80px]">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className={`text-2xl font-bold ${getScoreColor(lead.leadScore || 0)}`}>
                            {lead.leadScore}
                          </div>
                        </div>
                        <Progress value={lead.leadScore} className="h-2 w-16 mx-auto" />
                        <p className="text-xs text-gray-500 mt-1">Score</p>
                      </div>

                      {/* Value */}
                      <div className="text-right min-w-[100px]">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(lead.leadValue || 0)}
                        </p>
                        <p className="text-xs text-gray-500">Lead Value</p>
                      </div>

                      {/* Assigned */}
                      <div className="text-center min-w-[120px]">
                        <Avatar className="w-8 h-8 mx-auto mb-1">
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {getInitials(lead.assignedTo)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-gray-600 truncate">{lead.assignedTo}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => handleCall(lead, e)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Call {lead.name}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => handleEmail(lead, e)}
                                className="hover:bg-purple-50 hover:text-purple-600"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Email {lead.name}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetailModal(lead); }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(lead); }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleDuplicate(lead, e)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleConvertToCustomer(lead); }}
                              className="text-green-600 focus:text-green-600 focus:bg-green-50 font-semibold"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Convert to Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDelete(lead.id, e)} 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLeads.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No leads found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your filters or add a new lead</p>
                    <Button onClick={openAddLeadModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lead
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* KANBAN VIEW */}
          {viewMode === "kanban" && (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"].map(status => {
                  const statusLeads = filteredLeads.filter(l => l.status === status);
                  const totalValue = statusLeads.reduce((sum, l) => sum + (l.leadValue || 0), 0);
                  
                  return (
                    <div key={status} className="w-80 flex-shrink-0">
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                              <CardTitle className="text-base capitalize">{status}</CardTitle>
                            </div>
                            <Badge variant="secondary">{statusLeads.length}</Badge>
                          </div>
                          {totalValue > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {formatCurrency(totalValue)}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-3">
                              {statusLeads.map(lead => (
                                <Card 
                                  key={lead.id}
                                  className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
                                  onClick={() => openDetailModal(lead)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                      <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                                          {getInitials(lead.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 mb-1">
                                          <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                                          {lead.temperature && getTemperatureIcon(lead.temperature)}
                                        </div>
                                        <p className="text-xs text-gray-600 truncate">{lead.company}</p>
                                      </div>
                                    </div>
                                    
                                    {lead.leadValue && (
                                      <div className="bg-green-50 rounded px-2 py-1 mb-2">
                                        <p className="text-sm font-semibold text-green-700">
                                          {formatCurrency(lead.leadValue)}
                                        </p>
                                      </div>
                                    )}

                                    {lead.leadScore !== undefined && (
                                      <div className="mb-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                          <span className="text-gray-600">Score</span>
                                          <span className={`font-semibold ${getScoreColor(lead.leadScore)}`}>
                                            {lead.leadScore}/100
                                          </span>
                                        </div>
                                        <Progress value={lead.leadScore} className="h-1.5" />
                                      </div>
                                    )}

                                    {lead.tags && lead.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        {lead.tags.slice(0, 2).map(tag => (
                                          <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t">
                                      <div className="flex items-center gap-1">
                                        <Avatar className="w-5 h-5">
                                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                            {getInitials(lead.assignedTo)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-gray-600">{lead.assignedTo.split(' ')[0]}</span>
                                      </div>
                                      <span className="text-xs text-gray-500">{lead.lastContact}</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              
                              {statusLeads.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                  No leads
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLeads.map(lead => (
                <Card 
                  key={lead.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200"
                  onClick={() => openDetailModal(lead)}
                >
                  <CardContent className="p-5">
                    <div className="text-center mb-4">
                      <Avatar className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                        {lead.temperature && getTemperatureIcon(lead.temperature)}
                      </div>
                      <p className="text-sm text-gray-600">{lead.position}</p>
                      <p className="text-sm text-gray-500">{lead.company}</p>
                      <Badge className={`${getStatusColor(lead.status)} text-white mt-2 capitalize`}>
                        {lead.status}
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.leadValue && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(lead.leadValue)}
                          </span>
                        </div>
                      )}
                    </div>

                    {lead.leadScore !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Lead Score</span>
                          <span className={`font-semibold ${getScoreColor(lead.leadScore)}`}>
                            {lead.leadScore}/100
                          </span>
                        </div>
                        <Progress value={lead.leadScore} className="h-2" />
                      </div>
                    )}

                    {lead.tags && lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {lead.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {getInitials(lead.assignedTo)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">{lead.assignedTo}</span>
                      </div>
                      <span className="text-xs text-gray-500">{lead.lastContact}</span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700" 
                        onClick={(e) => handleCall(lead, e)}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700" 
                        onClick={(e) => handleEmail(lead, e)}
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(lead); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDuplicate(lead, e)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleConvertToCustomer(lead); }}
                            className="text-green-600 focus:text-green-600 focus:bg-green-50 font-semibold"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Convert
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => handleDelete(lead.id, e)} 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLeads.length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No leads found</h3>
                      <p className="text-gray-500 mb-4">Try adjusting your filters or add a new lead</p>
                      <Button onClick={openAddLeadModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lead
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ENHANCED ADD LEAD MODAL WITH ADVANCED FEATURES */}
        <Dialog open={addLeadModalOpen} onOpenChange={setAddLeadModalOpen}>
          <DialogContent 
            className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[95vh] sm:max-h-[92vh] overflow-hidden flex flex-col p-0"
            onKeyDown={(e) => {
              // Ctrl/Cmd + Enter to save
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (formData.name && formData.source && !isSaving) {
                  console.log("⏎ Keyboard shortcut triggered!");
                  saveNewLead();
                }
              }
            }}
          >
            {/* Header - Fixed */}
            <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    {formData.id ? '✏️ Edit Lead' : '✨ Add New Lead'}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-xs sm:text-sm text-gray-700 font-medium">
                    {formData.id ? 'Update lead information and keep your pipeline organized' : 'Create a new lead and start tracking your sales opportunity'}
                    <span className="hidden sm:inline text-blue-700 ml-2 font-semibold">• Press Ctrl+Enter to save quickly ⚡</span>
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  {formData.name && formData.source && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs sm:text-sm px-3 py-1.5 shadow-md">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      <span className="hidden sm:inline font-semibold">Ready to Save</span>
                      <span className="sm:hidden font-semibold">Ready</span>
                    </Badge>
                  )}
                </div>
              </div>
              {/* Progress Indicator */}
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Form Completion
                  </span>
                  <span className="font-bold text-blue-700">
                    {Math.round(
                      (Object.values(formData).filter(v => v !== undefined && v !== "").length / 15) * 100
                    )}%
                  </span>
                </div>
                <Progress 
                  value={Math.round(
                    (Object.values(formData).filter(v => v !== undefined && v !== "").length / 15) * 100
                  )}
                  className="h-2.5 bg-gray-200"
                />
              </div>
            </DialogHeader>
            
            {/* Scrollable Content with Fixed Height */}
            <ScrollArea className="h-[calc(95vh-280px)] sm:h-[calc(92vh-280px)] px-4 sm:px-6 overflow-y-auto">
              <div className="space-y-5 sm:space-y-6 py-5 sm:py-6 pb-8">
                
                {/* Quick Guide Alert */}
                {(!formData.name || !formData.source) && (
                  <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-white text-sm sm:text-base mb-2 flex items-center gap-2">
                        Quick Start Guide
                        <Badge className="bg-white/30 backdrop-blur-sm text-white border-0 text-xs font-bold">Required Fields</Badge>
                      </h4>
                      <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
                        Start by filling in <span className="font-extrabold">Full Name</span> and <span className="font-extrabold">Lead Source</span>. 
                        All other fields are optional but recommended!
                      </p>
                    </div>
                  </div>
                )}

                {/* Personal & Contact Information - Streamlined */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-t-xl">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-extrabold">Personal Information</span>
                        <p className="text-xs text-white/80 font-medium mt-0.5">Basic contact details</p>
                      </div>
                      <Badge className="bg-red-500 text-white border-0 text-xs font-bold shadow-md">
                        <span className="mr-1">*</span> Required
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    {/* Full Name - Required */}
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                        <User className="w-4 h-4 text-blue-600" />
                        Full Name <span className="text-red-500 text-lg">*</span>
                        {formData.name && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., John Doe"
                        className={`h-12 text-base transition-all duration-200 ${!formData.name ? 'border-2 border-red-400 focus:border-red-600 focus:ring-4 focus:ring-red-100' : 'border-2 border-green-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 bg-green-50/40'}`}
                        autoFocus
                      />
                      {!formData.name && (
                        <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          This field is required
                        </p>
                      )}
                    </div>

                    {/* Email & Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                          <Mail className="w-4 h-4 text-purple-600" />
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john.doe@company.com"
                            className="h-12 pl-12 text-base border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                          <Phone className="w-4 h-4 text-green-600" />
                          Contact Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                            className="h-12 pl-12 text-base border-2 border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company & Position Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Company Name
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="company"
                            value={formData.company || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="e.g., TechCorp Inc."
                            className="h-12 pl-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="position" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                          Job Position
                        </Label>
                        <Input
                          id="position"
                          value={formData.position || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="e.g., CEO, VP of Sales"
                          className="h-12 text-base border-2 border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                    </div>

                    {/* Place & Website Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                          <MapPin className="w-4 h-4 text-red-600" />
                          Place / Location
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="city"
                            value={formData.city || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="e.g., San Francisco, CA"
                            className="h-12 pl-12 text-base border-2 border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="website" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                          <Globe className="w-4 h-4 text-cyan-600" />
                          Website Link
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="website"
                            value={formData.website || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://company.com"
                            className="h-12 pl-12 text-base border-2 border-gray-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Management - Streamlined */}
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader className="pb-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-t-xl">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-extrabold">Lead Management</span>
                        <p className="text-xs text-white/80 font-medium mt-0.5">Status and assignment</p>
                      </div>
                      <Badge className="bg-red-500 text-white border-0 text-xs font-bold shadow-md">
                        <span className="mr-1">*</span> Required
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    {/* Lead Source - Required */}
                    <div>
                      <Label htmlFor="source" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                        <Star className="w-4 h-4 text-yellow-600" />
                        Lead Source <span className="text-red-500 text-lg">*</span>
                        {formData.source && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                      </Label>
                      <Select value={formData.source || ""} onValueChange={(v) => setFormData(prev => ({ ...prev, source: v }))}>
                        <SelectTrigger className={`h-12 text-base transition-all duration-200 ${!formData.source ? 'border-2 border-red-400 focus:border-red-600 focus:ring-4 focus:ring-red-100' : 'border-2 border-green-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 bg-green-50/40'}`}>
                          <SelectValue placeholder="🎯 Select where this lead came from *" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <SelectItem value="Website" className="text-base py-3">🌐 Website</SelectItem>
                          <SelectItem value="LinkedIn" className="text-base py-3">💼 LinkedIn</SelectItem>
                          <SelectItem value="Referral" className="text-base py-3">🤝 Referral</SelectItem>
                          <SelectItem value="Trade Show" className="text-base py-3">🎪 Trade Show</SelectItem>
                          <SelectItem value="Cold Call" className="text-base py-3">📞 Cold Call</SelectItem>
                          <SelectItem value="Email Campaign" className="text-base py-3">📧 Email Campaign</SelectItem>
                          <SelectItem value="Social Media" className="text-base py-3">📱 Social Media</SelectItem>
                          <SelectItem value="Advertisement" className="text-base py-3">📺 Advertisement</SelectItem>
                          <SelectItem value="Partner" className="text-base py-3">🔗 Partner</SelectItem>
                          <SelectItem value="Other" className="text-base py-3">📋 Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {!formData.source && (
                        <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Please select a lead source
                        </p>
                      )}
                    </div>

                    {/* Lead Status & Assigned To Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                          <Activity className="w-4 h-4 text-blue-600" />
                          Lead Status
                        </Label>
                        <Select value={formData.status || "new"} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as Lead["status"] }))}>
                          <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                                <span className="font-medium">New</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="contacted" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                                <span className="font-medium">Contacted</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="qualified" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></div>
                                <span className="font-medium">Qualified</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="proposal" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
                                <span className="font-medium">Proposal Sent</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="negotiation" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-pink-500 shadow-sm"></div>
                                <span className="font-medium">Negotiation</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="won" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                                <span className="font-medium">Won</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="lost" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                                <span className="font-medium">Lost</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="assignedTo" className="flex items-center gap-2 font-bold text-gray-800 mb-2.5 text-sm">
                          <Users className="w-4 h-4 text-purple-600" />
                          Assigned To
                        </Label>
                        <Select value={formData.assignedTo || "John Smith"} onValueChange={(v) => setFormData(prev => ({ ...prev, assignedTo: v }))}>
                          <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100">
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="John Smith" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="text-sm bg-blue-100 text-blue-700 font-bold">JS</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">John Smith</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Emily Davis" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="text-sm bg-purple-100 text-purple-700 font-bold">ED</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">Emily Davis</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Michael Chen" className="text-base py-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="text-sm bg-green-100 text-green-700 font-bold">MC</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">Michael Chen</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            {/* Footer - Fixed */}
            <Separator className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" />
            <DialogFooter className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 border-t-2 border-gray-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 justify-center sm:justify-start bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 shadow-sm">
                  {!formData.name || !formData.source ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">
                        {!formData.name && !formData.source ? 'Fill Name & Source' : 
                         !formData.name ? 'Name is required' : 'Source is required'}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-green-700 font-bold text-xs sm:text-sm">✓ Ready to {formData.id ? 'update' : 'create'} lead</span>
                    </>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={(e) => {
                      e.preventDefault();
                      setAddLeadModalOpen(false);
                    }}
                    disabled={isSaving}
                    className="w-full sm:w-auto order-3 sm:order-1 bg-white hover:bg-red-50 hover:border-red-500 hover:text-red-700 transition-all duration-200 border-2 shadow-sm hover:shadow-md"
                  >
                    <X className="w-4 h-4 mr-2" />
                    <span className="text-xs sm:text-sm font-semibold">Cancel</span>
                  </Button>
                  <Button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("🖱️ Save & Add Another clicked!", e);
                      saveAndAddAnother();
                    }}
                    disabled={!formData.name || !formData.source || isSaving}
                    variant="outline"
                    className="bg-white hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 cursor-pointer w-full sm:w-auto order-2 transition-all duration-200 border-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-xs sm:text-sm font-semibold">Saving...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        <span className="text-xs sm:text-sm font-semibold">Save & Add Another</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("🖱️ Create Lead Button clicked!", e);
                      console.log("Form data at click:", formData);
                      saveNewLead();
                    }}
                    disabled={!formData.name || !formData.source || isSaving}
                    className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg cursor-pointer w-full sm:w-auto order-1 sm:order-3 transition-all duration-300 ${
                      formData.name && formData.source && !isSaving 
                        ? 'hover:scale-105 shadow-purple-400/50 ring-2 ring-purple-300/50 hover:ring-purple-400' 
                        : ''
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-xs sm:text-sm font-medium">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="text-xs sm:text-sm font-semibold">
                          {formData.id ? 'Update Lead' : 'Create Lead'}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* LEAD DETAIL MODAL - Continuing from Part 1 */}
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            activeTab={activeDetailTab}
            onTabChange={setActiveDetailTab}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onCall={handleCall}
            onEmail={handleEmail}
            onWhatsApp={handleWhatsApp}
            onConvertToCustomer={handleConvertToCustomer}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// ==================== LEAD DETAIL MODAL COMPONENT ====================
function LeadDetailModal({
  lead,
  open,
  onOpenChange,
  activeTab,
  onTabChange,
  onEdit,
  onDelete,
  onCall,
  onEmail,
  onWhatsApp,
  onConvertToCustomer,
}: {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onConvertToCustomer?: (lead: Lead) => void;
}) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      qualified: "bg-purple-500",
      proposal: "bg-orange-500",
      negotiation: "bg-pink-500",
      won: "bg-green-500",
      lost: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      email: <Mail className="w-4 h-4" />,
      call: <Phone className="w-4 h-4" />,
      meeting: <Video className="w-4 h-4" />,
      status_change: <Activity className="w-4 h-4" />,
      note: <MessageSquare className="w-4 h-4" />,
      task: <CheckCheck className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <Activity className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] sm:max-w-6xl max-h-[95vh] overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] h-full max-h-[95vh]">
          {/* LEFT PANEL - Lead Profile */}
          <div className="bg-gradient-to-br from-gray-50 to-white border-b md:border-b-0 md:border-r border-gray-200">
            <ScrollArea className="h-full max-h-[95vh]">
              <div className="p-4 sm:p-6">
                {/* Lead Identity Card */}
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 ring-4 ring-blue-100">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl sm:text-2xl">
                      {getInitials(lead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{lead.name}</h2>
                  {lead.position && <p className="text-gray-600 mb-1 capitalize text-sm sm:text-base">{lead.position}</p>}
                  {lead.company && (
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-500 text-sm">{lead.company}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <Badge className={`${getStatusColor(lead.status)} text-white capitalize`}>
                      {lead.status}
                    </Badge>
                    {lead.priority && (
                      <Badge variant="outline" className={`${
                        lead.priority === 'high' ? 'border-red-500 text-red-700' :
                        lead.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                        'border-gray-500 text-gray-700'
                      }`}>
                        {lead.priority === 'high' && '🔴'}
                        {lead.priority === 'medium' && '🟡'}
                        {lead.priority === 'low' && '⚪'}
                        {' '}{lead.priority}
                      </Badge>
                    )}
                    {lead.temperature === "hot" && (
                      <Badge className="bg-red-100 text-red-700">
                        <Flame className="w-3 h-3 mr-1" />
                        Hot Lead
                      </Badge>
                    )}
                    {lead.temperature === "warm" && (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Warm
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mb-4">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700"
                        onClick={() => {
                          onEdit(lead);
                          onOpenChange(false);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-red-50 hover:border-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm(`Delete ${lead.name}?`)) {
                            onDelete(lead.id);
                            onOpenChange(false);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>

                  {/* Convert to Customer Button */}
                  {onConvertToCustomer && (
                    <Button
                      className="w-full mb-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => {
                        onConvertToCustomer(lead);
                        onOpenChange(false);
                      }}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Convert to Customer
                    </Button>
                  )}

                  {/* Lead Score */}
                  {lead.leadScore !== undefined && (
                    <div className="bg-white rounded-xl p-4 mb-4 shadow-md border-2 border-gray-100">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className={`text-3xl sm:text-4xl font-bold ${getScoreColor(lead.leadScore)}`}>
                          {lead.leadScore}
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-semibold">Lead Score</p>
                          <p className="text-xs text-gray-400">out of 100</p>
                        </div>
                      </div>
                      <Progress value={lead.leadScore} className="h-2.5" />
                      <p className="text-xs text-center mt-2 text-gray-500">
                        {lead.leadScore >= 80 ? '🎯 Excellent' :
                         lead.leadScore >= 60 ? '✅ Good' :
                         lead.leadScore >= 40 ? '⚠️ Fair' : '📉 Needs attention'}
                      </p>
                    </div>
                  )}

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all"
                      onClick={(e) => { e.stopPropagation(); onCall?.(lead); }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 transition-all"
                      onClick={(e) => { e.stopPropagation(); onEmail?.(lead); }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all"
                      onClick={(e) => { e.stopPropagation(); onWhatsApp?.(lead); }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Key Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Key Information
                  </h3>
                  
                  {lead.leadValue && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wide">Deal Value</p>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(lead.leadValue)}</p>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    {/* Email */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </p>
                      <p className="text-gray-900 font-medium break-all">{lead.email}</p>
                    </div>
                    
                    {/* Phone */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </p>
                      <p className="text-gray-900 font-medium">{lead.phone}</p>
                    </div>
                    
                    {/* Alternate Email */}
                    {lead.alternateEmail && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Alternate Email
                        </p>
                        <p className="text-gray-900 font-medium break-all">{lead.alternateEmail}</p>
                      </div>
                    )}
                    
                    {/* Alternate Phone */}
                    {lead.alternatePhone && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Alternate Phone
                        </p>
                        <p className="text-gray-900 font-medium">{lead.alternatePhone}</p>
                      </div>
                    )}
                    
                    {/* Website */}
                    {lead.website && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Website
                        </p>
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline break-all">
                          {lead.website}
                        </a>
                      </div>
                    )}
                    
                    {/* LinkedIn */}
                    {lead.linkedinUrl && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <Linkedin className="w-3 h-3" /> LinkedIn
                        </p>
                        <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline break-all">
                          {lead.linkedinUrl}
                        </a>
                      </div>
                    )}
                    
                    {/* Source */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Source</p>
                      <Badge variant="outline" className="font-medium">{lead.source}</Badge>
                    </div>
                    
                    {/* Industry */}
                    {lead.industry && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Industry
                        </p>
                        <Badge variant="secondary" className="font-medium">{lead.industry}</Badge>
                      </div>
                    )}
                    
                    {/* Company Size */}
                    {lead.companySize && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <Users2 className="w-3 h-3" /> Company Size
                        </p>
                        <p className="text-gray-900 font-medium">{lead.companySize}</p>
                      </div>
                    )}
                    
                    {/* Budget */}
                    {lead.budget && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> Budget Range
                        </p>
                        <p className="text-gray-900 font-bold">{formatCurrency(lead.budget)}</p>
                      </div>
                    )}
                    
                    {/* Decision Timeline */}
                    {lead.decisionTimeline && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Decision Timeline
                        </p>
                        <Badge variant="outline" className="font-medium">{lead.decisionTimeline}</Badge>
                      </div>
                    )}
                    
                    {/* Assigned To */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Assigned To</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {getInitials(lead.assignedTo)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-900 font-medium">{lead.assignedTo}</span>
                      </div>
                    </div>
                    
                    {/* Created Date */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Created
                      </p>
                      <p className="text-gray-900 font-medium">{lead.createdDate}</p>
                    </div>
                    
                    {/* Last Contact */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Last Contact
                      </p>
                      <p className="text-gray-900 font-medium">{lead.lastContact}</p>
                    </div>
                    
                    {/* Next Follow-up */}
                    {lead.nextFollowUp && (
                      <div className="bg-amber-50 rounded-lg p-3 border-2 border-amber-200">
                        <p className="text-xs text-amber-600 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                          <Bell className="w-3 h-3" /> Next Follow-up
                        </p>
                        <p className="text-amber-900 font-bold">{lead.nextFollowUp}</p>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {lead.tags && lead.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold flex items-center gap-1">
                        <TagIcon className="w-3 h-3" /> Tags
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {lead.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {(lead.address || lead.city) && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Address
                      </p>
                      <p className="text-gray-900 text-sm leading-relaxed">
                        {[lead.address, lead.city, lead.state, lead.zipCode, lead.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT PANEL - Tabbed Content */}
          <div className="flex flex-col overflow-hidden h-full max-h-[95vh]">
            <div className="border-b border-gray-200 px-4 sm:px-6 pt-4 sm:pt-6 bg-white sticky top-0 z-10">
              <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-7 h-auto bg-gray-100">
                  <TabsTrigger value="overview" className="text-xs py-2 data-[state=active]:bg-white">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs py-2 data-[state=active]:bg-white">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Activity</span>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="text-xs py-2 data-[state=active]:bg-white">
                    <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="proposals" className="text-xs py-2 data-[state=active]:bg-white">
                    <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Proposals</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs py-2 data-[state=active]:bg-white">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Notes</span>
                  </TabsTrigger>
                  <TabsTrigger value="files" className="text-xs py-2 data-[state=active]:bg-white">
                    <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Files</span>
                  </TabsTrigger>
                  <TabsTrigger value="reminders" className="text-xs py-2 data-[state=active]:bg-white">
                    <Bell className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Reminders</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1 px-4 sm:px-6 py-4">
              <Tabs value={activeTab}>
                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="mt-0 space-y-4 sm:space-y-6">
                  {/* AI Summary */}
                  {lead.aiSummary && (
                    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          AI-Powered Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{lead.aiSummary}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Upcoming Tasks */}
                  {lead.tasks && lead.tasks.length > 0 && (
                    <Card className="border-2 border-purple-200 shadow-md">
                      <CardHeader className="pb-3 bg-purple-50 rounded-t-lg">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2 text-purple-900">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                              <CheckCheck className="w-4 h-4 text-white" />
                            </div>
                            Upcoming Tasks
                          </span>
                          <Badge className="bg-purple-600 text-white">{lead.tasks.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {lead.tasks.map(task => (
                            <div key={task.id} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-purple-300 transition-all">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                className="mt-1 w-4 h-4"
                                readOnly
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm sm:text-base">{task.title}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {task.dueDate}
                                  </span>
                                  <Badge variant="outline" className={`text-xs ${
                                    task.priority === 'high' ? 'border-red-500 text-red-700 bg-red-50' :
                                    task.priority === 'medium' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                    'border-gray-500 text-gray-700 bg-gray-50'
                                  }`}>
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Activity Preview */}
                  {lead.activities && lead.activities.length > 0 && (
                    <Card className="border-2 border-green-200 shadow-md">
                      <CardHeader className="pb-3 bg-green-50 rounded-t-lg">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2 text-green-900">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                              <History className="w-4 h-4 text-white" />
                            </div>
                            Recent Activity
                          </span>
                          <Badge variant="outline" className="border-green-600 text-green-700">Last {lead.activities.slice(0, 3).length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {lead.activities.slice(0, 3).map(activity => (
                            <div key={activity.id} className="flex gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-green-300 transition-all">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">{activity.title}</p>
                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Description */}
                  {lead.description && (
                    <Card className="border-2 border-gray-200 shadow-md">
                      <CardHeader className="pb-3 bg-gray-50 rounded-t-lg">
                        <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          Description & Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{lead.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* ACTIVITY TAB */}
                <TabsContent value="activity" className="mt-0">
                  <div className="space-y-4 sm:space-y-6">
                    {lead.activities && lead.activities.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-pink-300"></div>
                        <div className="space-y-4 sm:space-y-6">
                          {lead.activities.map((activity, index) => (
                            <div key={activity.id} className="relative flex gap-3 sm:gap-4">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 relative z-10 text-white shadow-md ring-2 ring-white">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-1 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm sm:text-base text-gray-900">{activity.title}</h4>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">{activity.description}</p>
                                  </div>
                                  <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {activity.timestamp}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                                  <Avatar className="w-5 h-5 ring-1 ring-gray-200">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                                      {getInitials(activity.user)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{activity.user}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16 text-gray-400">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <Activity className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sm sm:text-base font-medium">No activity yet</p>
                        <p className="text-xs mt-1">Activity will appear here as you interact with the lead</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TASKS TAB */}
                <TabsContent value="tasks" className="mt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add New Task
                    </Button>
                    {lead.tasks && lead.tasks.length > 0 ? (
                      lead.tasks.map(task => (
                        <Card key={task.id} className={`border-2 transition-all hover:shadow-md ${
                          task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200 hover:border-blue-300'
                        }`}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                className="mt-1 w-4 h-4 rounded border-gray-300"
                                readOnly
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-sm sm:text-base ${
                                  task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                                }`}>{task.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                                  <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {task.dueDate}
                                  </span>
                                  <Badge variant="outline" className={`text-xs ${
                                    task.priority === 'high' ? 'border-red-500 text-red-700 bg-red-50' :
                                    task.priority === 'medium' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                    'border-gray-500 text-gray-700 bg-gray-50'
                                  }`}>
                                    {task.priority === 'high' ? '🔴 ' : task.priority === 'medium' ? '🟡 ' : '⚪ '}
                                    {task.priority}
                                  </Badge>
                                  <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {task.assignedTo}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 sm:py-16 text-gray-400">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <CheckCheck className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sm sm:text-base font-medium">No tasks yet</p>
                        <p className="text-xs mt-1">Create tasks to track your work with this lead</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* PROPOSALS TAB */}
                <TabsContent value="proposals" className="mt-0">
                  <div className="text-center py-12 sm:py-16 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <FileCheck className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm sm:text-base font-medium">No proposals yet</p>
                    <p className="text-xs mt-1 mb-4">Create proposals to send to this lead</p>
                    <Button className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Proposal
                    </Button>
                  </div>
                </TabsContent>

                {/* NOTES TAB */}
                <TabsContent value="notes" className="mt-0 space-y-4 sm:space-y-6">
                  <Card className="border-2 border-blue-200 shadow-md">
                    <CardContent className="p-3 sm:p-4">
                      <Textarea 
                        placeholder="Add a note about this lead..."
                        rows={3}
                        className="mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
                      />
                      <div className="flex justify-end">
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md">
                          <Save className="w-4 h-4 mr-2" />
                          Save Note
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  {lead.notes && lead.notes.length > 0 ? (
                    <div className="space-y-3">
                      {lead.notes.map(note => (
                        <Card key={note.id} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                          <CardContent className="p-3 sm:p-4">
                            <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                              <Avatar className="w-5 h-5 ring-1 ring-gray-200">
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                                  {getInitials(note.createdBy)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{note.createdBy}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {note.createdAt}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16 text-gray-400">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm sm:text-base font-medium">No notes yet</p>
                      <p className="text-xs mt-1">Add notes to keep track of important information</p>
                    </div>
                  )}
                </TabsContent>

                {/* FILES TAB */}
                <TabsContent value="files" className="mt-0">
                  <div className="text-center py-12 sm:py-16 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                      <Paperclip className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-sm sm:text-base font-medium">No files yet</p>
                    <p className="text-xs mt-1 mb-4">Upload files related to this lead</p>
                    <Button className="mt-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </TabsContent>

                {/* REMINDERS TAB */}
                <TabsContent value="reminders" className="mt-0">
                  <div className="text-center py-12 sm:py-16 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                      <Bell className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-sm sm:text-base font-medium">No reminders set</p>
                    <p className="text-xs mt-1 mb-4">Set reminders to follow up with this lead</p>
                    <Button className="mt-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-md">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Set Reminder
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
