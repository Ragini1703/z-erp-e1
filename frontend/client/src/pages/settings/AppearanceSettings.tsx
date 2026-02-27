import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { ChevronLeft, Save, Sun, Moon, Monitor, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";
type Density = "compact" | "comfortable" | "spacious";

const ACCENT_COLORS = [
  { name: "Indigo", value: "indigo", cls: "bg-indigo-500" },
  { name: "Violet", value: "violet", cls: "bg-violet-500" },
  { name: "Blue", value: "blue", cls: "bg-blue-500" },
  { name: "Sky", value: "sky", cls: "bg-sky-500" },
  { name: "Emerald", value: "emerald", cls: "bg-emerald-500" },
  { name: "Rose", value: "rose", cls: "bg-rose-500" },
  { name: "Amber", value: "amber", cls: "bg-amber-500" },
  { name: "Slate", value: "slate", cls: "bg-slate-600" },
];

const AppearanceSettings = () => {
  const { toast } = useToast();

  const [theme, setTheme] = useState<Theme>("light");
  const [accentColor, setAccentColor] = useState("indigo");
  const [fontSize, setFontSize] = useState([14]);
  const [density, setDensity] = useState<Density>("comfortable");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);

  const handleSave = () => {
    toast({
      title: "Appearance updated",
      description: "Your appearance preferences have been saved.",
    });
  };

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const densityOptions: { value: Density; label: string; description: string }[] = [
    { value: "compact", label: "Compact", description: "Tighter spacing, more content visible." },
    { value: "comfortable", label: "Comfortable", description: "Balanced spacing for everyday use." },
    { value: "spacious", label: "Spacious", description: "Relaxed layout with generous whitespace." },
  ];

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
          <span className="text-sm font-medium text-slate-700">Appearance</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appearance</h1>
          <p className="mt-1 text-sm text-slate-500">Customize the visual style and layout of your workspace.</p>
        </div>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Theme</CardTitle>
            <CardDescription>Choose between light, dark or system-synced theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
                    theme === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  <Icon size={22} />
                  {label}
                  {theme === value && (
                    <span className="absolute top-2 right-2">
                      <Check size={14} className="text-indigo-600" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accent Color */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accent Color</CardTitle>
            <CardDescription>Used for buttons, links and active states.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  title={color.name}
                  className={cn(
                    "h-9 w-9 rounded-full transition-all ring-offset-2",
                    color.cls,
                    accentColor === color.value ? "ring-2 ring-slate-600 scale-110" : "hover:scale-105"
                  )}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Selected: <span className="font-medium capitalize">{accentColor}</span>
            </p>
          </CardContent>
        </Card>

        {/* Font Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Font Size</CardTitle>
            <CardDescription>Adjust the base font size across the interface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400">A</span>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={12}
                max={18}
                step={1}
                className="flex-1"
              />
              <span className="text-lg font-medium text-slate-600">A</span>
            </div>
            <p className="text-xs text-slate-500">Current: <span className="font-medium">{fontSize[0]}px</span></p>
          </CardContent>
        </Card>

        {/* Layout Density */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Layout Density</CardTitle>
            <CardDescription>Controls spacing and padding throughout the UI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {densityOptions.map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => setDensity(value)}
                  className={cn(
                    "relative rounded-xl border-2 p-4 text-left transition-all",
                    density === value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <p className={cn("text-sm font-semibold", density === value ? "text-indigo-700" : "text-slate-800")}>
                    {label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{description}</p>
                  {density === value && (
                    <span className="absolute top-2 right-2">
                      <Check size={14} className="text-indigo-600" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* UI Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">UI Preferences</CardTitle>
            <CardDescription>Fine-tune interface elements and interactions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Enable animations</p>
                <p className="text-xs text-slate-500 mt-0.5">Page transitions and micro-interactions.</p>
              </div>
              <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Compact sidebar</p>
                <p className="text-xs text-slate-500 mt-0.5">Always keep the sidebar in icon-only mode.</p>
              </div>
              <Switch checked={compactSidebar} onCheckedChange={setCompactSidebar} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">Show breadcrumbs</p>
                <p className="text-xs text-slate-500 mt-0.5">Display navigation trail in page headers.</p>
              </div>
              <Switch checked={showBreadcrumbs} onCheckedChange={setShowBreadcrumbs} />
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

export default AppearanceSettings;
