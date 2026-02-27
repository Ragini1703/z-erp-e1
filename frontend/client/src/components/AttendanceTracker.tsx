import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  LogIn,
  LogOut,
  Coffee,
  Play,
  Pause,
  Clock,
  MapPin,
  Home,
  Building2,
  Briefcase,
  Wifi,
  CheckCircle,
  Timer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type WorkLocation = "office" | "remote" | "home" | "field";
type AttendanceStatus = "not-checked-in" | "checked-in" | "on-break" | "checked-out";

interface AttendanceSession {
  checkInTime: Date;
  checkInLocation: WorkLocation;
  checkInNote?: string;
  breaks: BreakSession[];
  checkOutTime?: Date;
  checkOutNote?: string;
}

interface BreakSession {
  startTime: Date;
  endTime?: Date;
  breakType: string;
}

const locationOptions = [
  { value: "office", label: "Office", icon: Building2, color: "blue" },
  { value: "home", label: "Work From Home", icon: Home, color: "green" },
  { value: "remote", label: "Remote", icon: Wifi, color: "purple" },
  { value: "field", label: "Field Work", icon: Briefcase, color: "orange" },
];

const breakTypes = [
  { value: "lunch", label: "Lunch Break", duration: 60 },
  { value: "tea", label: "Tea Break", duration: 15 },
  { value: "short", label: "Short Break", duration: 10 },
  { value: "meeting", label: "Meeting Break", duration: 30 },
  { value: "other", label: "Other", duration: 0 },
];

export default function AttendanceTracker({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  
  // Attendance State
  const [status, setStatus] = useState<AttendanceStatus>("not-checked-in");
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [activeBreak, setActiveBreak] = useState<BreakSession | null>(null);
  
  // Form State
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation>("office");
  const [checkInNote, setCheckInNote] = useState("");
  const [checkOutNote, setCheckOutNote] = useState("");
  const [selectedBreakType, setSelectedBreakType] = useState("lunch");
  
  // Timer State
  const [workingTime, setWorkingTime] = useState(0); // in seconds
  const [breakTime, setBreakTime] = useState(0); // in seconds
  const [totalBreakTime, setTotalBreakTime] = useState(0); // Total break time today

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "checked-in" && currentSession) {
      interval = setInterval(() => {
        const now = new Date();
        const workStart = currentSession.checkInTime;
        const totalWork = Math.floor((now.getTime() - workStart.getTime()) / 1000);
        setWorkingTime(totalWork - totalBreakTime);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, currentSession, totalBreakTime]);

  // Break Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "on-break" && activeBreak) {
      interval = setInterval(() => {
        const now = new Date();
        const breakStart = activeBreak.startTime;
        const elapsed = Math.floor((now.getTime() - breakStart.getTime()) / 1000);
        setBreakTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, activeBreak]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle Check In
  const handleCheckIn = () => {
    const now = new Date();
    const session: AttendanceSession = {
      checkInTime: now,
      checkInLocation: selectedLocation,
      checkInNote: checkInNote,
      breaks: [],
    };

    setCurrentSession(session);
    setStatus("checked-in");
    setWorkingTime(0);
    setTotalBreakTime(0);
    setCheckInNote("");

    toast({
      title: "✅ Checked In Successfully",
      description: `You've checked in at ${now.toLocaleTimeString()} - ${locationOptions.find(l => l.value === selectedLocation)?.label}`,
      duration: 3000,
    });

    onOpenChange(false);
  };

  // Handle Start Break
  const handleStartBreak = () => {
    const now = new Date();
    const breakSession: BreakSession = {
      startTime: now,
      breakType: selectedBreakType,
    };

    setActiveBreak(breakSession);
    setStatus("on-break");
    setBreakTime(0);

    toast({
      title: "☕ Break Started",
      description: `${breakTypes.find(b => b.value === selectedBreakType)?.label} started at ${now.toLocaleTimeString()}`,
      duration: 3000,
    });

    onOpenChange(false);
  };

  // Handle End Break
  const handleEndBreak = () => {
    if (!activeBreak || !currentSession) return;

    const now = new Date();
    const completedBreak = {
      ...activeBreak,
      endTime: now,
    };

    // Update session breaks
    setCurrentSession({
      ...currentSession,
      breaks: [...currentSession.breaks, completedBreak],
    });

    // Update total break time
    const breakDuration = Math.floor((now.getTime() - activeBreak.startTime.getTime()) / 1000);
    setTotalBreakTime(prev => prev + breakDuration);

    setActiveBreak(null);
    setStatus("checked-in");

    toast({
      title: "✅ Break Ended",
      description: `Break duration: ${formatTime(breakDuration)}`,
      duration: 3000,
    });

    onOpenChange(false);
  };

  // Handle Check Out
  const handleCheckOut = () => {
    if (!currentSession) return;

    const now = new Date();
    const updatedSession = {
      ...currentSession,
      checkOutTime: now,
      checkOutNote: checkOutNote,
    };

    // Calculate total working time
    const totalWork = Math.floor((now.getTime() - currentSession.checkInTime.getTime()) / 1000);
    const netWorkTime = totalWork - totalBreakTime;

    setCurrentSession(updatedSession);
    setStatus("checked-out");
    setCheckOutNote("");

    toast({
      title: "👋 Checked Out Successfully",
      description: `Total working time: ${formatTime(netWorkTime)} | Breaks: ${formatTime(totalBreakTime)}`,
      duration: 5000,
    });

    // Reset after a delay
    setTimeout(() => {
      setCurrentSession(null);
      setStatus("not-checked-in");
      setWorkingTime(0);
      setTotalBreakTime(0);
      onOpenChange(false);
    }, 2000);
  };

  // Get location icon
  const getLocationIcon = (location: WorkLocation) => {
    const option = locationOptions.find(l => l.value === location);
    if (!option) return <Building2 className="w-4 h-4" />;
    const Icon = option.icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Attendance Tracker
          </DialogTitle>
          <DialogDescription>
            {status === "not-checked-in" && "Start your workday"}
            {status === "checked-in" && "You're currently working"}
            {status === "on-break" && "You're on a break"}
            {status === "checked-out" && "You've checked out for the day"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Time Display */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant={status === "checked-in" ? "default" : status === "on-break" ? "secondary" : "outline"}
              className={`text-sm px-4 py-2 ${
                status === "checked-in" ? "bg-green-600" :
                status === "on-break" ? "bg-yellow-600" :
                status === "checked-out" ? "bg-gray-600" :
                "bg-slate-600"
              }`}
            >
              {status === "not-checked-in" && "Not Checked In"}
              {status === "checked-in" && "✓ Working"}
              {status === "on-break" && "☕ On Break"}
              {status === "checked-out" && "✓ Checked Out"}
            </Badge>
          </div>

          {/* Working Time Display */}
          {(status === "checked-in" || status === "on-break" || status === "checked-out") && currentSession && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-green-700 font-medium mb-1">Working Time</div>
                <div className="text-lg font-bold text-green-600">{formatTime(workingTime)}</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-700 font-medium mb-1">Break Time</div>
                <div className="text-lg font-bold text-orange-600">{formatTime(totalBreakTime + breakTime)}</div>
              </div>
            </div>
          )}

          {/* Break Timer Display (when on break) */}
          {status === "on-break" && activeBreak && (
            <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    {breakTypes.find(b => b.value === activeBreak.breakType)?.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {formatTime(breakTime)}
                </div>
              </div>
            </div>
          )}

          {/* Check In Form */}
          {status === "not-checked-in" && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Work Location</Label>
                <div className="grid grid-cols-2 gap-2">
                  {locationOptions.map((location) => {
                    const Icon = location.icon;
                    return (
                      <button
                        key={location.value}
                        onClick={() => setSelectedLocation(location.value as WorkLocation)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedLocation === location.value
                            ? `border-${location.color}-500 bg-${location.color}-50`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${
                          selectedLocation === location.value ? `text-${location.color}-600` : "text-gray-500"
                        }`} />
                        <div className={`text-xs font-medium ${
                          selectedLocation === location.value ? `text-${location.color}-700` : "text-gray-700"
                        }`}>
                          {location.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="checkin-note" className="text-sm">Note (Optional)</Label>
                <Textarea
                  id="checkin-note"
                  placeholder="Add a note about your work location or plan for today..."
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <Button 
                onClick={handleCheckIn}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Check In Now
              </Button>
            </div>
          )}

          {/* Break Management (when checked in) */}
          {status === "checked-in" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Working from: </span>
                <Badge variant="outline" className="gap-1">
                  {getLocationIcon(currentSession!.checkInLocation)}
                  {locationOptions.find(l => l.value === currentSession!.checkInLocation)?.label}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Start Break</Label>
                <Select value={selectedBreakType} onValueChange={setSelectedBreakType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {breakTypes.map((breakType) => (
                      <SelectItem key={breakType.value} value={breakType.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{breakType.label}</span>
                          {breakType.duration > 0 && (
                            <span className="text-xs text-gray-500 ml-2">~{breakType.duration}min</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleStartBreak}
                  variant="outline"
                  className="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  Start Break
                </Button>
                <Button 
                  onClick={() => {
                    setCheckOutNote("");
                    // Switch to checkout view without closing dialog
                  }}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              </div>
            </div>
          )}

          {/* End Break (when on break) */}
          {status === "on-break" && (
            <div className="space-y-3">
              <Button 
                onClick={handleEndBreak}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                End Break & Resume Work
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Keep Break Running
              </Button>
            </div>
          )}

          {/* Check Out Confirmation */}
          {status === "checked-in" && checkOutNote !== undefined && checkOutNote !== null && (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <Label htmlFor="checkout-note" className="text-sm">Check Out Note (Optional)</Label>
                <Textarea
                  id="checkout-note"
                  placeholder="Add a note about your day's work..."
                  value={checkOutNote}
                  onChange={(e) => setCheckOutNote(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <Button 
                onClick={handleCheckOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Confirm Check Out
              </Button>
            </div>
          )}

          {/* Today's Summary (when checked out) */}
          {status === "checked-out" && currentSession && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">Day Complete!</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check In:</span>
                  <span className="font-medium">{currentSession.checkInTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check Out:</span>
                  <span className="font-medium">{currentSession.checkOutTime?.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Work:</span>
                  <span className="font-medium text-green-600">{formatTime(workingTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Breaks:</span>
                  <span className="font-medium">{currentSession.breaks.length} ({formatTime(totalBreakTime)})</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
