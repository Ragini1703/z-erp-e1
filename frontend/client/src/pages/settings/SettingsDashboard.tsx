import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Settings,
  Palette,
  Bell,
  Shield,
  Users,
  CreditCard,
  Globe,
  Database,
  ChevronRight,
  Building2,
  Key,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const settingsSections = [
  {
    title: "General",
    description: "Workspace name, timezone, language and basic preferences.",
    icon: Settings,
    path: "/settings/general",
    badge: null,
    color: "text-slate-600 bg-slate-100",
  },
  {
    title: "Appearance",
    description: "Theme, accent color, font size and layout density.",
    icon: Palette,
    path: "/settings/appearance",
    badge: null,
    color: "text-purple-600 bg-purple-100",
  },
  {
    title: "Notifications",
    description: "Email, in-app and push notification preferences.",
    icon: Bell,
    path: "/settings/notifications",
    badge: null,
    color: "text-amber-600 bg-amber-100",
  },
  {
    title: "Security",
    description: "Password policy, two-factor auth and session management.",
    icon: Shield,
    path: "/settings/security",
    badge: null,
    color: "text-red-600 bg-red-100",
  },
  {
    title: "Team & Permissions",
    description: "Manage roles, access levels and team member permissions.",
    icon: Users,
    path: "/settings/team",
    badge: null,
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "Billing & Plans",
    description: "Subscription plan, invoices and payment methods.",
    icon: CreditCard,
    path: "/settings/billing",
    badge: "Soon",
    color: "text-emerald-600 bg-emerald-100",
  },
  {
    title: "Integrations",
    description: "Connect third-party apps, APIs and Webhooks.",
    icon: Globe,
    path: "/settings/integrations",
    badge: null,
    color: "text-indigo-600 bg-indigo-100",
  },
  {
    title: "Data & Backup",
    description: "Export data, import records and configure backups.",
    icon: Database,
    path: "/settings/data",
    badge: null,
    color: "text-teal-600 bg-teal-100",
  },
  {
    title: "Organization",
    description: "Company profile, logo and contact information.",
    icon: Building2,
    path: "/settings/organization",
    badge: null,
    color: "text-orange-600 bg-orange-100",
  },
  {
    title: "API Keys",
    description: "Manage API keys and developer access tokens.",
    icon: Key,
    path: "/settings/api-keys",
    badge: null,
    color: "text-pink-600 bg-pink-100",
  },
  {
    title: "Email Templates",
    description: "Customize transactional and notification email templates.",
    icon: Mail,
    path: "/settings/email-templates",
    badge: null,
    color: "text-cyan-600 bg-cyan-100",
  },
];

const SettingsDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your workspace configuration, preferences and customization options.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isAvailable = !section.badge;

            const CardEl = (
              <Card
                className={`group relative transition-all duration-200 border border-slate-200 ${isAvailable
                  ? "hover:shadow-md hover:border-indigo-300 cursor-pointer"
                  : "opacity-60 cursor-default"
                  }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${section.color}`}>
                      <Icon size={20} />
                    </div>
                    {section.badge && (
                      <Badge variant="outline" className="text-xs text-slate-500">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 text-base font-semibold text-slate-800">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500 leading-snug">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                {isAvailable && (
                  <CardContent className="pt-0">
                    <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:underline">
                      Configure <ChevronRight size={14} />
                    </span>
                  </CardContent>
                )}
              </Card>
            );

            return isAvailable ? (
              <Link key={section.title} href={section.path}>
                {CardEl}
              </Link>
            ) : (
              <div key={section.title}>{CardEl}</div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsDashboard;
