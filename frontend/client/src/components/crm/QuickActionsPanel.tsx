import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  FileText,
  UserPlus,
  Upload,
  Download,
  TrendingUp,
  Target,
  Users,
  CheckSquare,
  BookOpen
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  onClick: () => void;
}

interface QuickActionsPanelProps {
  onAddLead: () => void;
  onBulkImport: () => void;
  onExport: () => void;
  onShowWorkflow: () => void;
  stats: {
    total: number;
    new: number;
    qualified: number;
    won: number;
  };
}

export default function QuickActionsPanel({
  onAddLead,
  onBulkImport,
  onExport,
  onShowWorkflow,
  stats
}: QuickActionsPanelProps) {
  const quickActions: QuickAction[] = [
    {
      id: "add-lead",
      label: "Add New Lead",
      description: "Manually create a single lead",
      icon: UserPlus,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: onAddLead
    },
    {
      id: "bulk-import",
      label: "Bulk Import",
      description: "Upload CSV file with multiple leads",
      icon: Upload,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: onBulkImport
    },
    {
      id: "export",
      label: "Export Data",
      description: "Download leads as CSV",
      icon: Download,
      color: "bg-green-500 hover:bg-green-600",
      onClick: onExport
    },
    {
      id: "workflow",
      label: "View Workflow",
      description: "Learn the lead conversion process",
      icon: BookOpen,
      color: "bg-amber-500 hover:bg-amber-600",
      onClick: onShowWorkflow
    }
  ];

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Pipeline Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Leads</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-amber-600">{stats.new}</div>
              <div className="text-xs text-gray-600">New Leads</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.qualified}</div>
              <div className="text-xs text-gray-600">Qualified</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.won}</div>
              <div className="text-xs text-gray-600">Won</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks to manage your leads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={action.onClick}
                variant="outline"
                className="w-full justify-start h-auto py-3 hover:bg-gray-50"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mr-3 flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Today's Focus */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-600" />
            Today's Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Follow-ups due</span>
            <Badge variant="outline" className="bg-white">5</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Proposals pending</span>
            <Badge variant="outline" className="bg-white">3</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Hot leads</span>
            <Badge variant="outline" className="bg-white">{stats.qualified}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
