import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { 
  LeadStatus, 
  LEAD_STATUS_CONFIG, 
  STATUS_PIPELINE_STAGES,
  getStatusLabel 
} from "@/lib/lead-status-config";

interface Lead {
  status: LeadStatus | string;
  [key: string]: any;
}

interface LeadJourneyProps {
  lead: Lead;
  onStatusChange?: (newStatus: LeadStatus) => void;
}

// Educational institution journey stages
const journeyStages = [
  { 
    id: "new_lead" as LeadStatus, 
    label: "New Lead", 
    color: "bg-blue-500",
    description: "Lead just received"
  },
  { 
    id: "contacted" as LeadStatus, 
    label: "Contacted", 
    color: "bg-purple-500",
    description: "Initial contact made"
  },
  { 
    id: "follow_up" as LeadStatus, 
    label: "Follow-up", 
    color: "bg-amber-500",
    description: "Following up with lead"
  },
  { 
    id: "counselling_done" as LeadStatus, 
    label: "Counselling", 
    color: "bg-cyan-500",
    description: "Counselling completed"
  },
  { 
    id: "interested" as LeadStatus, 
    label: "Interested", 
    color: "bg-green-500",
    description: "Lead shows interest"
  },
  { 
    id: "admission_confirmed" as LeadStatus, 
    label: "Confirmed", 
    color: "bg-purple-600",
    description: "Admission confirmed"
  },
  { 
    id: "admission_completed" as LeadStatus, 
    label: "Completed", 
    color: "bg-emerald-600",
    description: "Admission completed"
  }
];

export default function LeadJourney({ lead, onStatusChange }: LeadJourneyProps) {
  const currentStatus = lead.status as LeadStatus;
  const currentStageIndex = journeyStages.findIndex(s => s.id === currentStatus);
  const currentConfig = LEAD_STATUS_CONFIG[currentStatus] || LEAD_STATUS_CONFIG.new_lead;

  // Check if lead is in a negative status
  const isNegativeStatus = currentStatus === "not_interested" || currentStatus === "lost_lead";
  const Icon = currentConfig.icon;

  return (
    <Card className={`${isNegativeStatus ? 'bg-gradient-to-r from-red-50 to-pink-50' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${currentConfig.textColor}`} />
              <span className="text-sm font-medium text-gray-700">Lead Journey</span>
            </div>
            {isNegativeStatus && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Inactive
              </Badge>
            )}
          </div>
          
          {/* Desktop Journey View */}
          <div className="hidden md:flex items-center justify-between gap-1">
            {journeyStages.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = stage.id === currentStatus;
              const isUpcoming = index > currentStageIndex;
              const canTransition = currentConfig.nextStatuses.includes(stage.id);

              return (
                <div key={stage.id} className="flex items-center flex-1">
                  <div
                    className={`flex flex-col items-center flex-1 transition-all ${
                      isCurrent ? "scale-110" : ""
                    } ${canTransition ? "cursor-pointer hover:scale-105" : ""}`}
                    onClick={() => canTransition && onStatusChange?.(stage.id)}
                    title={stage.description}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white shadow-md"
                          : isCurrent
                          ? `${stage.color} text-white shadow-lg ring-4 ring-blue-100`
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div
                      className={`mt-2 text-xs font-medium text-center ${
                        isCurrent ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {stage.label}
                    </div>
                  </div>
                  {index < journeyStages.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-300 -mt-8 mx-1">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        }`}
                        style={{
                          width: isCompleted ? "100%" : "0%"
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Journey View */}
          <div className="md:hidden space-y-2">
            {journeyStages.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = stage.id === currentStatus;
              const canTransition = currentConfig.nextStatuses.includes(stage.id);

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCurrent ? "bg-white shadow-md border-2 border-blue-200" : "bg-white/50"
                  } ${canTransition ? "cursor-pointer hover:shadow-md" : ""}`}
                  onClick={() => canTransition && onStatusChange?.(stage.id)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? `${stage.color} text-white`
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium ${
                        isCurrent ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {stage.label}
                    </span>
                    <p className="text-xs text-gray-500">{stage.description}</p>
                  </div>
                  {isCurrent && (
                    <Badge className="ml-auto bg-blue-500">Current</Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
            <span>
              {isNegativeStatus ? "Journey Ended" : `Stage ${currentStageIndex + 1} of ${journeyStages.length}`}
            </span>
            <span className="font-medium">
              {Math.round(((currentStageIndex + 1) / journeyStages.length) * 100)}% Progress
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
