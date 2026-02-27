import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  FileText,
  UserPlus,
  TrendingUp,
  X,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: "completed" | "current" | "upcoming";
  tips?: string[];
  actions?: { label: string; onClick: () => void }[];
}

interface WorkflowGuideProps {
  onClose?: () => void;
  onStartLead?: () => void;
}

export default function WorkflowGuide({ onClose, onStartLead }: WorkflowGuideProps) {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: WorkflowStep[] = [
    {
      id: "capture",
      title: "Capture Lead",
      description: "Add new leads to your CRM from various sources",
      icon: UserPlus,
      status: currentStep === 0 ? "current" : currentStep > 0 ? "completed" : "upcoming",
      tips: [
        "Use the 'Add Lead' button to manually create leads",
        "Import bulk leads from CSV files",
        "Leads can come from website, LinkedIn, referrals, etc."
      ],
      actions: [
        { label: "Add First Lead", onClick: () => onStartLead?.() }
      ]
    },
    {
      id: "qualify",
      title: "Qualify Lead",
      description: "Assess lead quality and potential value",
      icon: Target,
      status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "upcoming",
      tips: [
        "Make initial contact via phone, email, or WhatsApp",
        "Ask qualifying questions about budget, timeline, and needs",
        "Update lead score based on engagement and fit",
        "Set priority level (High, Medium, Low)"
      ]
    },
    {
      id: "engage",
      title: "Engage & Nurture",
      description: "Build relationship and understand needs",
      icon: Phone,
      status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "upcoming",
      tips: [
        "Log all calls and interactions in the activity timeline",
        "Schedule follow-up reminders",
        "Add detailed notes about conversations",
        "Share relevant content and resources"
      ]
    },
    {
      id: "propose",
      title: "Create Proposal",
      description: "Send custom proposal or quote",
      icon: FileText,
      status: currentStep === 3 ? "current" : currentStep > 3 ? "completed" : "upcoming",
      tips: [
        "Create detailed proposals with line items",
        "Set valid until date for urgency",
        "Track when proposal is viewed",
        "Follow up after sending"
      ]
    },
    {
      id: "negotiate",
      title: "Negotiate & Close",
      description: "Handle objections and close the deal",
      icon: TrendingUp,
      status: currentStep === 4 ? "current" : currentStep > 4 ? "completed" : "upcoming",
      tips: [
        "Address concerns and objections promptly",
        "Offer customizations if needed",
        "Get commitment on timeline",
        "Prepare contract or agreement"
      ]
    },
    {
      id: "won",
      title: "Mark as Won",
      description: "Celebrate the win and onboard customer",
      icon: CheckCircle2,
      status: currentStep === 5 ? "current" : currentStep > 5 ? "completed" : "upcoming",
      tips: [
        "Update lead status to 'Won'",
        "Convert lead to customer account",
        "Schedule onboarding session",
        "Set up customer success plan"
      ]
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">CRM Lead Workflow Guide</DialogTitle>
                <DialogDescription>
                  Step-by-step process to convert leads into customers
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Progress Bar */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Workflow Progress</span>
                  <span className="text-muted-foreground">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Workflow Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";
              const isUpcoming = step.status === "upcoming";

              return (
                <Card
                  key={step.id}
                  className={`relative transition-all ${
                    isCurrent
                      ? "border-2 border-blue-500 shadow-lg bg-blue-50/50"
                      : isCompleted
                      ? "border-green-200 bg-green-50/30"
                      : "border-gray-200 bg-gray-50/30"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {index + 1}. {step.title}
                          </CardTitle>
                          {isCompleted && (
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              Completed
                            </Badge>
                          )}
                          {isCurrent && (
                            <Badge className="bg-blue-500">Current Step</Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  {(isCurrent || isCompleted) && step.tips && (
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                        <Lightbulb className="w-4 h-4" />
                        <span>Tips & Best Practices:</span>
                      </div>
                      <ul className="space-y-2 ml-6">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-gray-700 flex items-start gap-2">
                            <Circle className="w-2 h-2 mt-1.5 flex-shrink-0 fill-current" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrent && step.actions && (
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          {step.actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              onClick={() => {
                                action.onClick();
                                handleClose();
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {action.label}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          ))}
                          {index < steps.length - 1 && (
                            <Button
                              variant="outline"
                              onClick={() => setCurrentStep(currentStep + 1)}
                            >
                              Next Step
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous Step
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Close Guide
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
