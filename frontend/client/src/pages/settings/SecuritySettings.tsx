import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
    ChevronLeft,
    Save,
    Shield,
    Lock,
    Smartphone,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Monitor,
    Trash2,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const activeSessions = [
    {
        id: "1",
        device: "Chrome on Windows",
        location: "Mumbai, India",
        lastActive: "Now",
        current: true,
        icon: Monitor,
    },
    {
        id: "2",
        device: "Safari on iPhone",
        location: "Pune, India",
        lastActive: "2 hours ago",
        current: false,
        icon: Smartphone,
    },
    {
        id: "3",
        device: "Firefox on macOS",
        location: "Bengaluru, India",
        lastActive: "1 day ago",
        current: false,
        icon: Monitor,
    },
];

const loginHistory = [
    { date: "27 Feb 2026, 11:30 AM", location: "Mumbai, India", status: "success", device: "Chrome / Windows" },
    { date: "26 Feb 2026, 9:15 AM", location: "Mumbai, India", status: "success", device: "Chrome / Windows" },
    { date: "25 Feb 2026, 6:42 PM", location: "Unknown", status: "failed", device: "Unknown browser" },
    { date: "25 Feb 2026, 3:00 PM", location: "Pune, India", status: "success", device: "Safari / iPhone" },
];

const SecuritySettings = () => {
    const { toast } = useToast();

    // Password Policy
    const [minLength, setMinLength] = useState("8");
    const [requireUppercase, setRequireUppercase] = useState(true);
    const [requireNumbers, setRequireNumbers] = useState(true);
    const [requireSymbols, setRequireSymbols] = useState(false);
    const [passwordExpiry, setPasswordExpiry] = useState("never");

    // 2FA
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState("totp");

    // Session
    const [sessionTimeout, setSessionTimeout] = useState("30");
    const [singleSession, setSingleSession] = useState(false);

    const handleSave = () => {
        toast({
            title: "Security settings saved",
            description: "Your security preferences have been updated successfully.",
        });
    };

    const handleRevokeSession = (id: string) => {
        toast({
            title: "Session revoked",
            description: "The selected session has been terminated.",
        });
    };

    const handleRevokeAllSessions = () => {
        toast({
            title: "All other sessions revoked",
            description: "All sessions except the current one have been terminated.",
        });
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
                    <span className="text-sm font-medium text-slate-700">Security</span>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Security</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage password policy, two-factor authentication, and active sessions.
                    </p>
                </div>

                {/* Password Policy */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock size={18} className="text-red-600" />
                            <CardTitle className="text-base">Password Policy</CardTitle>
                        </div>
                        <CardDescription>Set requirements for user passwords across the workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="min-length">Minimum Password Length</Label>
                                <Select value={minLength} onValueChange={setMinLength}>
                                    <SelectTrigger id="min-length">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["6", "8", "10", "12", "16"].map((v) => (
                                            <SelectItem key={v} value={v}>{v} characters</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Password Expiry</Label>
                                <Select value={passwordExpiry} onValueChange={setPasswordExpiry}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never">Never</SelectItem>
                                        <SelectItem value="30">Every 30 days</SelectItem>
                                        <SelectItem value="60">Every 60 days</SelectItem>
                                        <SelectItem value="90">Every 90 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            {[
                                { label: "Require uppercase letters", description: "At least one A–Z character.", checked: requireUppercase, setter: setRequireUppercase },
                                { label: "Require numbers", description: "At least one digit 0–9.", checked: requireNumbers, setter: setRequireNumbers },
                                { label: "Require special symbols", description: "At least one symbol like !@#$%.", checked: requireSymbols, setter: setRequireSymbols },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                                    </div>
                                    <Switch checked={item.checked} onCheckedChange={item.setter} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Two-Factor Authentication */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Smartphone size={18} className="text-indigo-600" />
                            <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                        </div>
                        <CardDescription>Add an extra layer of security to all user accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-800">Enable 2FA for workspace</p>
                                <p className="text-xs text-slate-500 mt-0.5">Require all users to set up two-factor authentication.</p>
                            </div>
                            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                        </div>
                        {twoFactorEnabled && (
                            <>
                                <Separator />
                                <div className="space-y-1.5">
                                    <Label>Authentication Method</Label>
                                    <Select value={twoFactorMethod} onValueChange={setTwoFactorMethod}>
                                        <SelectTrigger className="w-60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="totp">Authenticator App (TOTP)</SelectItem>
                                            <SelectItem value="sms">SMS One-Time Password</SelectItem>
                                            <SelectItem value="email">Email One-Time Password</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700">
                                        Enabling 2FA will require all users to re-authenticate. They will be prompted on next login.
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Session Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-teal-600" />
                            <CardTitle className="text-base">Session Management</CardTitle>
                        </div>
                        <CardDescription>Control how long users stay logged in and manage active sessions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Session Timeout (minutes)</Label>
                                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="60">1 hour</SelectItem>
                                        <SelectItem value="240">4 hours</SelectItem>
                                        <SelectItem value="480">8 hours</SelectItem>
                                        <SelectItem value="0">Never</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-800">Single active session</p>
                                <p className="text-xs text-slate-500 mt-0.5">Automatically log out other sessions when a new one is started.</p>
                            </div>
                            <Switch checked={singleSession} onCheckedChange={setSingleSession} />
                        </div>
                    </CardContent>
                </Card>

                {/* Active Sessions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Activity size={18} className="text-blue-600" />
                                    <CardTitle className="text-base">Active Sessions</CardTitle>
                                </div>
                                <CardDescription className="mt-1">All devices currently logged into your account.</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs"
                                onClick={handleRevokeAllSessions}
                            >
                                Revoke All Others
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {activeSessions.map((session) => {
                            const Icon = session.icon;
                            return (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                                            <Icon size={16} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{session.device}</p>
                                            <p className="text-xs text-slate-500">{session.location} · {session.lastActive}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {session.current ? (
                                            <Badge className="bg-green-100 text-green-700 border-0 text-xs">Current</Badge>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleRevokeSession(session.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Login History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Recent Login Activity</CardTitle>
                        <CardDescription>A log of the last 10 sign-in attempts to your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100">
                            {loginHistory.map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3 py-3">
                                    <div className="flex items-center gap-3">
                                        {entry.status === "success" ? (
                                            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                        ) : (
                                            <AlertTriangle size={16} className="text-red-500 shrink-0" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{entry.date}</p>
                                            <p className="text-xs text-slate-500">{entry.device} · {entry.location}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={entry.status === "success"
                                            ? "border-green-200 text-green-700 bg-green-50 text-xs"
                                            : "border-red-200 text-red-700 bg-red-50 text-xs"}
                                    >
                                        {entry.status === "success" ? "Success" : "Failed"}
                                    </Badge>
                                </div>
                            ))}
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

export default SecuritySettings;
