import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { ChevronLeft, Save, Mail, Pencil, Eye, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  trigger: string;
  subject: string;
  body: string;
  category: string;
  lastEdited: string;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    trigger: "On user registration",
    subject: "Welcome to {{workspace_name}}!",
    body: "Hi {{first_name}},\n\nWelcome aboard! Your account is ready.\n\nLogin at: {{login_url}}\n\nBest regards,\n{{workspace_name}} Team",
    category: "Auth",
    lastEdited: "Feb 20, 2026",
  },
  {
    id: "payslip",
    name: "Payslip Notification",
    trigger: "On payroll processing",
    subject: "Your payslip for {{month}} is ready",
    body: "Hi {{first_name}},\n\nYour payslip for {{month}} {{year}} has been generated.\n\nNet Pay: {{currency}} {{net_pay}}\n\nLogin to download your payslip.\n\nHR Team",
    category: "HRM",
    lastEdited: "Feb 18, 2026",
  },
  {
    id: "leave_approved",
    name: "Leave Approved",
    trigger: "On leave approval",
    subject: "Your leave request has been approved",
    body: "Hi {{first_name}},\n\nYour leave from {{start_date}} to {{end_date}} has been approved by {{approver_name}}.\n\nEnjoy your time off!\n\nHR Team",
    category: "HRM",
    lastEdited: "Feb 15, 2026",
  },
  {
    id: "leave_rejected",
    name: "Leave Rejected",
    trigger: "On leave rejection",
    subject: "Leave request update",
    body: "Hi {{first_name}},\n\nUnfortunately your leave request from {{start_date}} to {{end_date}} could not be approved.\n\nReason: {{rejection_reason}}\n\nPlease contact HR for more details.",
    category: "HRM",
    lastEdited: "Feb 15, 2026",
  },
  {
    id: "lead_assigned",
    name: "Lead Assigned",
    trigger: "On lead assignment",
    subject: "New lead assigned: {{lead_name}}",
    body: "Hi {{first_name}},\n\nA new lead has been assigned to you.\n\nLead: {{lead_name}}\nCompany: {{company}}\nPhone: {{phone}}\n\nLogin to view details.\n\nSales Team",
    category: "CRM",
    lastEdited: "Feb 10, 2026",
  },
  {
    id: "interview_invite",
    name: "Interview Invitation",
    trigger: "On interview scheduled",
    subject: "Interview scheduled — {{job_title}} at {{workspace_name}}",
    body: "Dear {{candidate_name}},\n\nWe are pleased to invite you for an interview.\n\nRole: {{job_title}}\nDate: {{interview_date}}\nTime: {{interview_time}}\nMode: {{interview_mode}}\n\nPlease confirm your attendance.\n\n{{workspace_name}} Recruitment Team",
    category: "Recruitment",
    lastEdited: "Feb 05, 2026",
  },
];

const categoryColors: Record<string, string> = {
  Auth: "bg-blue-100 text-blue-700",
  HRM: "bg-green-100 text-green-700",
  CRM: "bg-indigo-100 text-indigo-700",
  Recruitment: "bg-purple-100 text-purple-700",
};

const EmailTemplatesSettings = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [previewing, setPreviewing] = useState<EmailTemplate | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(defaultTemplates.map(t => t.category)))];

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter(t => t.category === activeCategory);

  const openEdit = (t: EmailTemplate) => setEditing({ ...t });

  const saveEdit = () => {
    if (!editing) return;
    setTemplates(prev =>
      prev.map(t => t.id === editing.id ? { ...editing, lastEdited: "Feb 27, 2026" } : t)
    );
    setEditing(null);
    toast({ title: "Template saved", description: `"${editing.name}" updated successfully.` });
  };

  const resetTemplate = (id: string) => {
    const original = defaultTemplates.find(t => t.id === id);
    if (!original) return;
    setTemplates(prev => prev.map(t => t.id === id ? { ...original } : t));
    toast({ title: "Template reset", description: "Template restored to default." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900 px-2">
              <ChevronLeft size={16} /> Settings
            </Button>
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-sm font-medium text-slate-700">Email Templates</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customize transactional emails sent by the system. Use <code className="bg-slate-100 px-1 rounded text-xs">{"{{variable}}"}</code> placeholders for dynamic content.
          </p>
        </div>

        {/* Tabs by category */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="h-9">
            {categories.map(c => (
              <TabsTrigger key={c} value={c} className="capitalize text-xs">{c}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((t) => (
                <Card key={t.id} className="border border-slate-200 hover:border-indigo-300 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <CardTitle className="text-sm font-semibold text-slate-800">{t.name}</CardTitle>
                      </div>
                      <Badge className={`text-xs ${categoryColors[t.category] ?? "bg-slate-100 text-slate-600"}`}>
                        {t.category}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1">{t.trigger}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-slate-500 mb-3 truncate">Subject: {t.subject}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Edited: {t.lastEdited}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewing(t)}>
                          <Eye size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => resetTemplate(t.id)}>
                          <RotateCcw size={13} />
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => openEdit(t)}>
                          <Pencil size={12} /> Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Template — {editing?.name}</DialogTitle>
              <DialogDescription>
                Trigger: {editing?.trigger}
              </DialogDescription>
            </DialogHeader>
            {editing && (
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input
                    value={editing.subject}
                    onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Body</Label>
                  <Textarea
                    value={editing.body}
                    onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                    rows={10}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button onClick={saveEdit} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Save size={14} /> Save Template
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewing} onOpenChange={(open) => !open && setPreviewing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview — {previewing?.name}</DialogTitle>
              <DialogDescription>Subject: {previewing?.subject}</DialogDescription>
            </DialogHeader>
            {previewing && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {previewing.body}
                </pre>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EmailTemplatesSettings;
