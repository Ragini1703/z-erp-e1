import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ChevronLeft,
  Download,
  Upload,
  Database,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const backupHistory = [
  { id: 1, date: "Feb 27, 2026  02:00 AM", size: "14.2 MB", status: "success", type: "Auto" },
  { id: 2, date: "Feb 26, 2026  02:00 AM", size: "13.8 MB", status: "success", type: "Auto" },
  { id: 3, date: "Feb 25, 2026  02:00 AM", size: "13.5 MB", status: "failed", type: "Auto" },
  { id: 4, date: "Feb 24, 2026  11:43 AM", size: "13.1 MB", status: "success", type: "Manual" },
];

const exportModules = [
  { key: "leads", label: "CRM / Leads" },
  { key: "hrm", label: "HRM (Employees, Attendance, Payroll)" },
  { key: "recruitment", label: "Recruitment" },
  { key: "profile", label: "Employee Profiles" },
];

const DataBackupSettings = () => {
  const { toast } = useToast();

  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFreq, setBackupFreq] = useState("daily");
  const [backupRetention, setBackupRetention] = useState("30");
  const [selectedExports, setSelectedExports] = useState<string[]>(["leads", "hrm"]);
  const [exportFormat, setExportFormat] = useState("csv");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const toggleExport = (key: string) =>
    setSelectedExports(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );

  const runManualBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setBackupProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsBackingUp(false);
        toast({ title: "Backup complete", description: "Manual backup created successfully." });
      }
    }, 400);
  };

  const handleExport = () => {
    if (selectedExports.length === 0) {
      toast({ title: "Select at least one module", variant: "destructive" });
      return;
    }
    toast({ title: "Export started", description: `Exporting ${selectedExports.length} module(s) as ${exportFormat.toUpperCase()}.` });
  };

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
          <span className="text-sm font-medium text-slate-700">Data & Backup</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data & Backup</h1>
          <p className="mt-1 text-sm text-slate-500">Export records, manage backups and keep your data safe.</p>
        </div>

        {/* Storage overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Storage Usage</CardTitle>
            <CardDescription>Current workspace data footprint.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Used: <span className="font-semibold text-slate-800">14.2 MB</span></span>
              <span className="text-slate-500">Limit: 1 GB</span>
            </div>
            <Progress value={2} className="h-2" />
            <p className="text-xs text-slate-500">985.8 MB available</p>
          </CardContent>
        </Card>

        {/* Auto backup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Automatic Backups</CardTitle>
            <CardDescription>Schedule recurring backups to protect your data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Enable auto-backup</p>
                <p className="text-xs text-slate-500 mt-0.5">Backups run in the background without interruption.</p>
              </div>
              <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
            </div>
            {autoBackup && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Frequency</Label>
                    <Select value={backupFreq} onValueChange={setBackupFreq}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Retain backups for</Label>
                    <Select value={backupRetention} onValueChange={setBackupRetention}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Manual backup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manual Backup</CardTitle>
            <CardDescription>Create an on-demand snapshot of all workspace data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isBackingUp ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <RefreshCw size={14} className="animate-spin" /> Creating backup…
                </div>
                <Progress value={backupProgress} className="h-2" />
              </div>
            ) : (
              <Button onClick={runManualBackup} variant="outline" className="gap-2">
                <Database size={16} /> Create Backup Now
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Backup history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Backup History</CardTitle>
            <CardDescription>Last 4 backups. Older ones are pruned per retention policy.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {backupHistory.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {b.status === "success" ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{b.date}</p>
                      <p className="text-xs text-slate-500">{b.size} · {b.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={b.status === "success" ? "text-emerald-600" : "text-red-500"}>
                      {b.status}
                    </Badge>
                    {b.status === "success" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download size={14} className="text-slate-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Data</CardTitle>
            <CardDescription>Download a copy of selected module data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {exportModules.map((m) => (
                <label
                  key={m.key}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${
                    selectedExports.includes(m.key)
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedExports.includes(m.key)}
                    onChange={() => toggleExport(m.key)}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-slate-700">{m.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-end gap-3">
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExport} variant="outline" className="gap-2 mb-0.5">
                <Download size={16} /> Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import Data</CardTitle>
            <CardDescription>Upload a CSV or Excel file to bulk-import records.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all">
              <Upload size={24} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Click to upload or drag & drop</span>
              <span className="text-xs text-slate-400">CSV, XLSX up to 10 MB</span>
              <input type="file" accept=".csv,.xlsx" className="hidden" />
            </label>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible operations — proceed with caution.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Delete all workspace data</p>
              <p className="text-xs text-slate-500 mt-0.5">Permanently removes all records. This cannot be undone.</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Trash2 size={14} /> Delete
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DataBackupSettings;
