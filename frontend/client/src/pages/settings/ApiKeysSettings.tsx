import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ChevronLeft,
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permission: string;
  created: string;
  lastUsed: string;
  active: boolean;
}

const randomKey = () =>
  "zk_" + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("");

const initialKeys: ApiKey[] = [
  {
    id: "1",
    name: "Mobile App Integration",
    key: randomKey(),
    permission: "read",
    created: "Jan 10, 2026",
    lastUsed: "Feb 26, 2026",
    active: true,
  },
  {
    id: "2",
    name: "Reporting Dashboard",
    key: randomKey(),
    permission: "read_write",
    created: "Dec 05, 2025",
    lastUsed: "Feb 20, 2026",
    active: true,
  },
  {
    id: "3",
    name: "Legacy CRM Sync",
    key: randomKey(),
    permission: "read",
    created: "Oct 01, 2025",
    lastUsed: "Nov 15, 2025",
    active: false,
  },
];

const permissionLabels: Record<string, { label: string; color: string }> = {
  read: { label: "Read Only", color: "bg-blue-100 text-blue-700" },
  read_write: { label: "Read & Write", color: "bg-amber-100 text-amber-700" },
  admin: { label: "Admin", color: "bg-red-100 text-red-700" },
};

const ApiKeysSettings = () => {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPermission, setNewPermission] = useState("read");
  const [justCreated, setJustCreated] = useState<string | null>(null);

  const toggleVisible = (id: string) =>
    setVisibleKeys(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied to clipboard" });
  };

  const toggleActive = (id: string) =>
    setKeys(prev => prev.map(k => k.id === id ? { ...k, active: !k.active } : k));

  const deleteKey = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
    toast({ title: "API key deleted" });
  };

  const createKey = () => {
    if (!newName.trim()) {
      toast({ title: "Enter a key name", variant: "destructive" });
      return;
    }
    const key = randomKey();
    const created: ApiKey = {
      id: Date.now().toString(),
      name: newName.trim(),
      key,
      permission: newPermission,
      created: "Feb 27, 2026",
      lastUsed: "Never",
      active: true,
    };
    setKeys(prev => [created, ...prev]);
    setJustCreated(key);
    setNewName("");
    setNewPermission("read");
    setCreateOpen(false);
    toast({ title: "API key created", description: "Copy it now — it won't be shown again." });
  };

  const maskKey = (key: string) => key.slice(0, 6) + "•".repeat(26) + key.slice(-4);

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
          <span className="text-sm font-medium text-slate-700">API Keys</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
            <p className="mt-1 text-sm text-slate-500">
              Authenticate external apps and services with scoped API keys.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Plus size={16} /> New API Key
          </Button>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <ShieldCheck size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            API keys grant access to your workspace data. Keep them secret and rotate regularly. Never commit keys to source control.
          </p>
        </div>

        {/* Newly created key */}
        {justCreated && (
          <Card className="border-emerald-300 bg-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-emerald-800">Key created — copy it now!</CardTitle>
              <CardDescription className="text-xs text-emerald-700">
                This is the only time it will be displayed in full.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-white border border-emerald-200 px-3 py-2 text-xs font-mono text-slate-700 break-all">
                  {justCreated}
                </code>
                <Button variant="outline" size="icon" className="shrink-0" onClick={() => copyKey(justCreated)}>
                  <Copy size={14} />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="mt-2 text-xs text-emerald-700" onClick={() => setJustCreated(null)}>
                I've copied it, dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Keys list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Keys ({keys.filter(k => k.active).length})</CardTitle>
            <CardDescription>Manage all API keys for this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {keys.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-slate-500">No API keys yet.</p>
            )}
            {keys.map((k) => {
              const perm = permissionLabels[k.permission] ?? permissionLabels.read;
              const shown = visibleKeys.has(k.id);
              return (
                <div key={k.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Key size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-800">{k.name}</span>
                      <Badge className={`text-xs ${perm.color}`}>{perm.label}</Badge>
                      {!k.active && <Badge variant="outline" className="text-xs text-slate-400">Inactive</Badge>}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <code className="text-xs font-mono text-slate-500">
                        {shown ? k.key : maskKey(k.key)}
                      </code>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Created {k.created} · Last used {k.lastUsed}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVisible(k.id)}>
                      {shown ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyKey(k.key)}>
                      <Copy size={14} />
                    </Button>
                    <Switch checked={k.active} onCheckedChange={() => toggleActive(k.id)} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteKey(k.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Create Key Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>Give your key a descriptive name and choose its permission scope.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Key Name *</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mobile App, Reporting Tool"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Permission</Label>
                <Select value={newPermission} onValueChange={setNewPermission}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only — safe for public dashboards</SelectItem>
                    <SelectItem value="read_write">Read & Write — can modify data</SelectItem>
                    <SelectItem value="admin">Admin — full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={createKey} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Key size={14} /> Generate Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ApiKeysSettings;
