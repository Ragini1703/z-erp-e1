import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { ChevronLeft, Save, Bell, Mail, Smartphone, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type NotifChannel = { email: boolean; inApp: boolean; push: boolean };

const makeChannel = (email = true, inApp = true, push = false): NotifChannel => ({ email, inApp, push });

const NotificationsSettings = () => {
  const { toast } = useToast();

  // Per-event toggles
  const [taskAssigned, setTaskAssigned] = useState(makeChannel(true, true, true));
  const [leadsUpdated, setLeadsUpdated] = useState(makeChannel(true, true, false));
  const [payrollProcessed, setPayrollProcessed] = useState(makeChannel(true, false, false));
  const [leaveApproval, setLeaveApproval] = useState(makeChannel(true, true, true));
  const [meetingReminder, setMeetingReminder] = useState(makeChannel(false, true, true));
  const [systemAlerts, setSystemAlerts] = useState(makeChannel(true, true, false));

  // Global settings
  const [digestFrequency, setDigestFrequency] = useState("daily");
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopEnabled, setDesktopEnabled] = useState(true);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<NotifChannel>>,
    key: keyof NotifChannel
  ) => setter(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    toast({ title: "Notification preferences saved", description: "Your changes have been applied." });
  };

  const Row = ({
    label,
    description,
    state,
    setter,
  }: {
    label: string;
    description: string;
    state: NotifChannel;
    setter: React.Dispatch<React.SetStateAction<NotifChannel>>;
  }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <Mail size={14} className="text-slate-400" />
          <Switch checked={state.email} onCheckedChange={() => toggle(setter, "email")} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Monitor size={14} className="text-slate-400" />
          <Switch checked={state.inApp} onCheckedChange={() => toggle(setter, "inApp")} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Smartphone size={14} className="text-slate-400" />
          <Switch checked={state.push} onCheckedChange={() => toggle(setter, "push")} />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-slate-900 px-2">
              <ChevronLeft size={16} /> Settings
            </Button>
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-sm font-medium text-slate-700">Notifications</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Control how and when you receive alerts across all channels.</p>
        </div>

        {/* Channel legend */}
        <div className="flex items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><Mail size={13} /> Email</div>
          <div className="flex items-center gap-1.5"><Monitor size={13} /> In-App</div>
          <div className="flex items-center gap-1.5"><Smartphone size={13} /> Push</div>
        </div>

        {/* Per-event table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Events</CardTitle>
            <CardDescription>Choose which events trigger notifications per channel.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            <Row label="Task Assigned" description="When a task is assigned to you." state={taskAssigned} setter={setTaskAssigned} />
            <Row label="Lead Updated" description="When a CRM lead is updated or moved in the pipeline." state={leadsUpdated} setter={setLeadsUpdated} />
            <Row label="Payroll Processed" description="When payroll is run or a payslip is generated." state={payrollProcessed} setter={setPayrollProcessed} />
            <Row label="Leave Approved / Rejected" description="Status updates on leave requests." state={leaveApproval} setter={setLeaveApproval} />
            <Row label="Meeting Reminder" description="Reminders 30 minutes before a scheduled meeting." state={meetingReminder} setter={setMeetingReminder} />
            <Row label="System Alerts" description="Critical system updates and maintenance notices." state={systemAlerts} setter={setSystemAlerts} />
          </CardContent>
        </Card>

        {/* Email Digest */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Digest</CardTitle>
            <CardDescription>Receive a summary email instead of individual notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Digest Frequency</Label>
              <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time (no digest)</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Do-not-disturb */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quiet Hours</CardTitle>
            <CardDescription>Mute all notifications during specified hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Enable quiet hours</p>
                <p className="text-xs text-slate-500 mt-0.5">No push or in-app notifications during this window.</p>
              </div>
              <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
            </div>
            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Start</Label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End</Label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Notification sounds</p>
                <p className="text-xs text-slate-500 mt-0.5">Play a sound when an in-app notification arrives.</p>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Desktop notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">Show browser desktop alerts when the tab is in the background.</p>
              </div>
              <Switch checked={desktopEnabled} onCheckedChange={setDesktopEnabled} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsSettings;
