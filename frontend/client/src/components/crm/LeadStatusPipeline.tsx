import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  Award,
  Loader2
} from "lucide-react";
import {
  LeadStatus,
  LEAD_STATUS_CONFIG,
  LEAD_STATUS_LABELS,
  getStatusLabel,
  isValidStatusTransition,
  getStatusProgress,
  STATUS_PIPELINE_STAGES
} from "@/lib/lead-status-config";
import { cn } from "@/lib/utils";

interface LeadStatusPipelineProps {
  currentStatus: LeadStatus;
  onStatusChange?: (newStatus: LeadStatus, note?: string) => void;
  isInteractive?: boolean;
  showProgress?: boolean;
  compactMode?: boolean;
}

export default function LeadStatusPipeline({
  currentStatus,
  onStatusChange,
  isInteractive = true,
  showProgress = true,
  compactMode = false
}: LeadStatusPipelineProps) {
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const [note, setNote] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentConfig = LEAD_STATUS_CONFIG[currentStatus];
  const progress = getStatusProgress(currentStatus);

  const handleStatusClick = async (status: LeadStatus) => {
    if (!isInteractive || status === currentStatus || isProcessing) return;

    const isValid = isValidStatusTransition(currentStatus, status);
    if (!isValid) {
      return;
    }

    const statusConfig = LEAD_STATUS_CONFIG[status];
    if (statusConfig.requiresNote) {
      setSelectedStatus(status);
      setIsDialogOpen(true);
    } else {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief animation delay
      onStatusChange?.(status);
      setIsProcessing(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (selectedStatus && note.trim()) {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      onStatusChange?.(selectedStatus, note);
      setNote("");
      setSelectedStatus(null);
      setIsDialogOpen(false);
      setIsProcessing(false);
    }
  };

  const getStageStatus = (stageStatuses: LeadStatus[]) => {
    if (stageStatuses.includes(currentStatus)) return "current";
    
    const currentOrder = currentConfig.order;
    const maxStageOrder = Math.max(...stageStatuses.map(s => LEAD_STATUS_CONFIG[s].order));
    const minStageOrder = Math.min(...stageStatuses.map(s => LEAD_STATUS_CONFIG[s].order));
    
    if (currentOrder > maxStageOrder) return "completed";
    if (currentOrder < minStageOrder) return "upcoming";
    return "upcoming";
  };

  if (compactMode) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {Object.entries(LEAD_STATUS_CONFIG).map(([status, config]) => {
          const isActive = status === currentStatus;
          const isNextPossible = currentConfig.nextStatuses.includes(status as LeadStatus);
          const Icon = config.icon;

          return (
            <TooltipProvider key={status}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleStatusClick(status as LeadStatus)}
                    disabled={!isInteractive || (!isActive && !isNextPossible) || isProcessing}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300",
                      "touch-manipulation min-h-[2.5rem]", // Touch-friendly sizing
                      isActive ? `${config.bgColor} ${config.textColor} ${config.borderColor} border-2 shadow-md` : "bg-gray-100 text-gray-500",
                      isNextPossible && isInteractive && "hover:scale-110 cursor-pointer hover:shadow-lg active:scale-95",
                      !isActive && !isNextPossible && "opacity-50 cursor-not-allowed",
                      isProcessing && "opacity-70 pointer-events-none"
                    )}
                  >
                    {isProcessing && isActive ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                    {config.label}
                    {isActive && (
                      <span className="flex h-1.5 w-1.5 relative ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <Card className="border-t-4" style={{ borderTopColor: currentConfig.color }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Lead Status Pipeline</CardTitle>
              <CardDescription>
                Current stage: <span className="font-semibold">{currentConfig.label}</span>
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {progress}% Complete
            </Badge>
          </div>
          {showProgress && (
            <Progress value={progress} className="h-2 mt-2" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Pipeline Stages */}
            {STATUS_PIPELINE_STAGES.map((stage, stageIndex) => {
              const stageStatus = getStageStatus(stage.statuses);
              
              return (
                <div key={stage.id} className="space-y-3">
                  {/* Stage Header */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold",
                      stageStatus === "completed" && "bg-green-500",
                      stageStatus === "current" && "bg-blue-500 ring-4 ring-blue-100",
                      stageStatus === "upcoming" && "bg-gray-300"
                    )}>
                      {stageStatus === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span>{stageIndex + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="ml-4 pl-8 border-l-2 border-gray-200 space-y-2 pb-2">
                    {stage.statuses.map((status, idx) => {
                      const config = LEAD_STATUS_CONFIG[status];
                      const isActive = status === currentStatus;
                      const isNextPossible = currentConfig.nextStatuses.includes(status);
                      const isClickable = isInteractive && (isActive || isNextPossible);
                      const Icon = config.icon;

                      return (
                        <TooltipProvider key={status}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleStatusClick(status)}
                                disabled={!isClickable || isProcessing}
                                className={cn(
                                  "w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300 group",
                                  "touch-manipulation min-h-[4.5rem]", // Touch-friendly
                                  isActive && `${config.bgColor} ${config.borderColor} shadow-lg ring-2 ring-offset-2`,
                                  !isActive && isNextPossible && "border-dashed border-gray-300 hover:border-solid hover:border-blue-500 hover:bg-blue-50 hover:scale-[1.01]",
                                  !isActive && !isNextPossible && "border-gray-200 opacity-60",
                                  isClickable && "cursor-pointer hover:shadow-xl active:scale-[0.99]",
                                  isProcessing && "opacity-70 pointer-events-none"
                                )}
                              >
                                <div className={cn(
                                  "flex items-center justify-center w-12 h-12 rounded-full transition-all",
                                  isActive ? `${config.bgColor} shadow-md animate-pulse` : "bg-gray-100"
                                )}>
                                  {isProcessing && isActive ? (
                                    <Loader2 className={cn("h-6 w-6 animate-spin", config.textColor)} />
                                  ) : (
                                    <Icon className={cn(
                                      "h-6 w-6",
                                      isActive ? config.textColor : "text-gray-500"
                                    )} />
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className={cn(
                                    "font-semibold text-sm sm:text-base",
                                    isActive ? config.textColor : "text-gray-700"
                                  )}>
                                    {config.label}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {config.description}
                                  </div>
                                </div>
                                {isActive && (
                                  <div className="flex flex-col items-center gap-1">
                                    <Badge variant="default" className="bg-green-500 shadow-sm">
                                      Current
                                    </Badge>
                                    <span className="flex h-2 w-2 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                  </div>
                                )}
                                {!isActive && isNextPossible && (
                                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-2 transition-all duration-200" />
                                )}
                                {config.requiresNote && isNextPossible && !isActive && (
                                  <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="font-medium">{config.label}</p>
                              <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                              {isNextPossible && !isActive && (
                                <p className="text-xs text-blue-500 mt-2">
                                  Click to move to this status
                                </p>
                              )}
                              {config.requiresNote && (
                                <p className="text-xs text-amber-500 mt-1">
                                  <AlertCircle className="h-3 w-3 inline mr-1" />
                                  Requires note
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress}%</div>
              <div className="text-xs text-gray-600">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentConfig.order}</div>
              <div className="text-xs text-gray-600">Current Stage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentConfig.nextStatuses.length}
              </div>
              <div className="text-xs text-gray-600">Next Options</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change Status to {selectedStatus && getStatusLabel(selectedStatus)}
            </DialogTitle>
            <DialogDescription>
              {selectedStatus && LEAD_STATUS_CONFIG[selectedStatus].description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-note">
                Note <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="status-note"
                placeholder="Add a note about this status change..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Please provide details about this status change
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                setNote("");
                setSelectedStatus(null);
              }}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmStatusChange}
              disabled={!note.trim() || isProcessing}
              className="w-full sm:w-auto transition-all hover:scale-105"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Confirm Change
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
