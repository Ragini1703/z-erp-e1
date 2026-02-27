/**
 * EmailTemplateDialog Component
 * 
 * A fully responsive email composition dialog with professional templates.
 * 
 * Features:
 * - 6 pre-built professional email templates
 * - Real-time placeholder replacement (firstName, company)
 * - Compose and Preview modes
 * - Copy to clipboard and save draft functionality
 * - Fully responsive design
 * 
 * Responsive Breakpoints:
 * - Mobile: < 640px (sm) - Compact layout, icon-only buttons
 * - Tablet: 640px - 1024px (sm-lg) - Balanced layout
 * - Desktop: > 1024px (lg+) - Full layout with all text labels
 * 
 * @param open - Controls dialog visibility
 * @param onOpenChange - Callback when dialog open state changes
 * @param leadName - Lead's full name
 * @param leadEmail - Lead's email address
 * @param leadCompany - Lead's company name (optional)
 * @param onSend - Callback when email is sent (subject, body)
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, Send, Copy, Save, Eye, Sparkles, 
  FileText, MailOpen, Clock, Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  leadEmail: string;
  leadCompany?: string;
  onSend: (subject: string, body: string) => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  icon: any;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "follow-up",
    name: "Follow-up Email",
    category: "engagement",
    subject: "Following Up - {company}",
    body: `Hi {firstName},

I wanted to follow up on our previous conversation about how we can help {company} achieve its goals.

I'd love to schedule a brief call to discuss your specific needs and show you how our solution can benefit your organization.

Are you available for a 15-minute call this week? I'm flexible with timing to accommodate your schedule.

Looking forward to hearing from you!

Best regards,
[Your Name]`,
    icon: MailOpen
  },
  {
    id: "introduction",
    name: "Introduction Email",
    category: "outreach",
    subject: "Introducing {yourCompany} - Solutions for {company}",
    body: `Hi {firstName},

My name is [Your Name] from [Your Company]. I'm reaching out because I believe we can help {company} with [specific benefit/solution].

We specialize in helping companies like yours to:
• [Key benefit 1]
• [Key benefit 2]
• [Key benefit 3]

I'd love to schedule a quick 15-minute call to learn more about your needs and see if there's a good fit.

Would you be open to a brief conversation next week?

Best regards,
[Your Name]
[Your Title]
[Your Company]
[Contact Information]`,
    icon: Mail
  },
  {
    id: "demo",
    name: "Demo Invitation",
    category: "engagement",
    subject: "Quick Demo - See How We Can Help {company}",
    body: `Hi {firstName},

Thank you for your interest in [Your Product/Service]!

I'd like to invite you to a personalized demo where I'll show you exactly how our solution can help {company} achieve [specific goal/benefit].

The demo will cover:
✓ Key features relevant to your needs
✓ Real-world use cases
✓ Implementation process
✓ ROI analysis
✓ Q&A session

The demo typically takes 30 minutes. Here are some available time slots:
• [Time slot 1]
• [Time slot 2]
• [Time slot 3]

Please let me know which time works best for you, or suggest an alternative.

Looking forward to showing you what we can do!

Best regards,
[Your Name]`,
    icon: Eye
  },
  {
    id: "proposal",
    name: "Proposal Email",
    category: "sales",
    subject: "Proposal for {company} - [Solution Name]",
    body: `Hi {firstName},

Thank you for taking the time to discuss {company}'s needs with me.

Based on our conversation, I've prepared a customized proposal that outlines:

1. Your Current Challenges
2. Our Recommended Solution
3. Implementation Timeline
4. Investment Details
5. Expected ROI

I've attached the detailed proposal for your review. I'm confident this solution will help you achieve [specific goals discussed].

I'm available to discuss any questions you might have. Would you like to schedule a call to walk through the proposal together?

Best regards,
[Your Name]`,
    icon: FileText
  },
  {
    id: "thank-you",
    name: "Thank You Email",
    category: "engagement",
    subject: "Thank You - Great Speaking with You!",
    body: `Hi {firstName},

Thank you for taking the time to speak with me today about {company}'s needs.

I really enjoyed our conversation and learning more about [specific topics discussed]. It's clear that [observation/insight from the conversation].

As discussed, here are the next steps:
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]

I'll follow up with you [timeframe] with [deliverable/information].

If you have any questions in the meantime, please don't hesitate to reach out.

Looking forward to working together!

Best regards,
[Your Name]`,
    icon: Sparkles
  },
  {
    id: "meeting-reminder",
    name: "Meeting Reminder",
    category: "engagement",
    subject: "Reminder: Meeting Tomorrow at [Time]",
    body: `Hi {firstName},

This is a friendly reminder about our scheduled meeting tomorrow.

Meeting Details:
📅 Date: [Date]
🕐 Time: [Time] [Timezone]
⏱️ Duration: [Duration]
📍 Location: [Meeting Link/Location]

Agenda:
• [Agenda item 1]
• [Agenda item 2]
• [Agenda item 3]

Please let me know if you need to reschedule or if you have any questions before our meeting.

Looking forward to speaking with you!

Best regards,
[Your Name]`,
    icon: Clock
  }
];

export default function EmailTemplateDialog({
  open,
  onOpenChange,
  leadName,
  leadEmail,
  leadCompany = "",
  onSend
}: EmailTemplateDialogProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("compose");

  const firstName = leadName.split(" ")[0];

  // Apply template
  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(templateId);
    
    // Replace placeholders
    let processedSubject = template.subject
      .replace("{company}", leadCompany || "your company")
      .replace("{yourCompany}", "[Your Company]")
      .replace("{firstName}", firstName);

    let processedBody = template.body
      .replace(/{firstName}/g, firstName)
      .replace(/{company}/g, leadCompany || "your company")
      .replace(/{yourCompany}/g, "[Your Company]");

    setSubject(processedSubject);
    setBody(processedBody);
    setActiveTab("compose");

    toast({
      title: "✅ Template Applied",
      description: `${template.name} template loaded successfully`,
      duration: 2000,
    });
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    const fullEmail = `To: ${leadEmail}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullEmail);
    
    toast({
      title: "📋 Copied!",
      description: "Email content copied to clipboard",
      duration: 2000,
    });
  };

  // Save as draft
  const handleSaveDraft = () => {
    // In a real app, save to backend
    toast({
      title: "💾 Draft Saved",
      description: "Email draft saved successfully",
      duration: 2000,
    });
  };

  // Send email
  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please enter both subject and email body",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSend(subject, body);
    
    // Reset form
    setSubject("");
    setBody("");
    setSelectedTemplate("");
    setPreviewMode(false);
    setIsSending(false);
    setActiveTab("templates");
  };

  // Group templates by category
  const categorizedTemplates = emailTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl max-h-[95vh] md:max-h-[90vh] p-0 gap-0">
        <div className="flex flex-col max-h-[95vh] md:max-h-[90vh]">
          <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <Mail className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Compose Email to {leadName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              <span className="block md:inline">
                Send to: <span className="font-medium text-foreground break-all">{leadEmail}</span>
              </span>
              {leadCompany && (
                <span className="block md:inline md:ml-2 mt-1 md:mt-0">
                  • <span className="font-medium text-foreground">{leadCompany}</span>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9 md:h-10">
                <TabsTrigger value="templates" className="text-xs md:text-sm">
                  <FileText className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">Templates</span>
                </TabsTrigger>
                <TabsTrigger value="compose" className="text-xs md:text-sm">
                  <Mail className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                  <span className="hidden md:inline">Compose</span>
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-3 md:space-y-4 mt-3 md:mt-4">
                <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span>Choose a professional template to get started</span>
                </div>

                {Object.entries(categorizedTemplates).map(([category, templates]) => (
                  <div key={category} className="space-y-2 md:space-y-3">
                    <h3 className="text-xs md:text-sm font-semibold capitalize text-muted-foreground">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {templates.map((template) => {
                        const Icon = template.icon;
                        return (
                          <div
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-blue-500 active:scale-98 ${
                              selectedTemplate === template.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                : "hover:bg-accent"
                            }`}
                          >
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                                <Icon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-xs md:text-sm">{template.name}</h4>
                                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {template.subject}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Compose Tab */}
              <TabsContent value="compose" className="space-y-3 md:space-y-4 mt-3 md:mt-4">
                {selectedTemplate && (
                  <Badge variant="secondary" className="text-[10px] md:text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Using: {emailTemplates.find(t => t.id === selectedTemplate)?.name}
                  </Badge>
                )}

                {/* Preview Mode Toggle */}
                <div className="flex justify-between items-center">
                  <Label className="text-xs md:text-sm font-medium">
                    {previewMode ? "Preview" : "Edit Mode"}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="h-8 md:h-9 text-xs md:text-sm"
                  >
                    <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    {previewMode ? "Edit" : "Preview"}
                  </Button>
                </div>

                {!previewMode ? (
                  <>
                    {/* Subject Field */}
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="email-subject" className="text-xs md:text-sm">Subject *</Label>
                      <Input
                        id="email-subject"
                        placeholder="Enter email subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="font-medium text-sm md:text-base h-9 md:h-10"
                      />
                    </div>

                    {/* Body Field */}
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="email-body" className="text-xs md:text-sm">Message *</Label>
                      <Textarea
                        id="email-body"
                        placeholder="Type your email message here..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={8}
                        className="font-mono text-xs md:text-sm resize-none min-h-[200px] md:min-h-[300px]"
                      />
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {body.length} characters • {body.split(/\s+/).filter(Boolean).length} words
                      </p>
                    </div>
                  </>
                ) : (
                  /* Preview Mode */
                  <div className="border rounded-lg p-4 md:p-6 bg-muted/30 space-y-3 md:space-y-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="text-[10px] md:text-xs text-muted-foreground">To:</div>
                      <div className="font-medium text-xs md:text-sm break-all">{leadEmail}</div>
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="text-[10px] md:text-xs text-muted-foreground">Subject:</div>
                      <div className="font-semibold text-xs md:text-sm">{subject || "(No subject)"}</div>
                    </div>
                    <div className="border-t pt-3 md:pt-4">
                      <div className="whitespace-pre-wrap text-xs md:text-sm">
                        {body || "(No message)"}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 px-4 md:px-6 py-3 md:py-4 border-t bg-muted/30">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                disabled={!subject || !body}
                className="flex-1 sm:flex-none h-9 text-xs md:text-sm"
              >
                <Copy className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={!subject || !body}
                className="flex-1 sm:flex-none h-9 text-xs md:text-sm"
              >
                <Save className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none h-9 text-xs md:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !subject.trim() || !body.trim()}
                className="flex-1 sm:flex-none h-9 text-xs md:text-sm bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-2 animate-spin" />
                    <span className="hidden xs:inline">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    <span>Send</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
