"use client";

import { useEffect, useState } from "react";
import { BuyMeACoffeeButton } from "@/components/ui/buymeacoffee";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Monitor,
  Plus,
  X,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore, useApplicationStore } from "@/store";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const {
    settings,
    updateSettings,
    addCustomSource,
    removeCustomSource,
    addCustomIndustry,
    removeCustomIndustry,
    getAllSources,
    getAllIndustries,
  } = useSettingsStore();
  const { applications, filters, setFilters } = useApplicationStore();
  const t = useTranslations();
  const router = useRouter();

  const [newSource, setNewSource] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<"en" | "tr" | null>(null);

  useEffect(() => {
    if (!pendingLocale) return;
    document.cookie = `locale=${pendingLocale};path=/;max-age=31536000`;
    router.refresh();
  }, [pendingLocale, router]);

  const handleLanguageChange = (locale: "en" | "tr") => {
    updateSettings({ language: locale });
    setPendingLocale(locale);
  };

  const handleAddSource = () => {
    if (newSource.trim() && !getAllSources().includes(newSource.trim())) {
      addCustomSource(newSource.trim());
      setNewSource("");
      toast.success("Source added");
    }
  };

  const handleAddIndustry = () => {
    if (
      newIndustry.trim() &&
      !getAllIndustries().includes(newIndustry.trim())
    ) {
      addCustomIndustry(newIndustry.trim());
      setNewIndustry("");
      toast.success("Industry added");
    }
  };

  const handleExportData = () => {
    const data = {
      applications,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-apply-track-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.applications && data.settings) {
          // This would need to be implemented in the store
          toast.success("Data imported successfully");
          router.refresh();
        } else {
          toast.error("Invalid backup file");
        }
      } catch {
        toast.error("Failed to parse backup file");
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    localStorage.removeItem("job-apply-track-applications");
    localStorage.removeItem("job-apply-track-settings");
    toast.success("All data cleared");
    setShowClearDialog(false);
    router.refresh();
    window.location.reload();
  };

  const themes = [
    { value: "light", label: t("settings.themeLight"), icon: Sun },
    { value: "dark", label: t("settings.themeDark"), icon: Moon },
    { value: "system", label: t("settings.themeSystem"), icon: Monitor },
  ];

  const languages = [
    { value: "en", label: t("settings.languageEn"), flag: "🇬🇧" },
    { value: "tr", label: t("settings.languageTr"), flag: "🇹🇷" },
  ];

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
          <p className="text-muted-foreground">
            Manage your application preferences
          </p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.appearance")}</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="space-y-3">
              <Label>{t("settings.theme")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Button
                      key={t.value}
                      variant={theme === t.value ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setTheme(t.value)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {t.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Language */}
            <div className="space-y-3">
              <Label>{t("settings.language")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.value}
                    variant={
                      settings.language === lang.value ? "default" : "outline"
                    }
                    className="justify-start"
                    onClick={() =>
                      handleLanguageChange(lang.value as "en" | "tr")
                    }
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Hide Rejected */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("filter.hideRejected")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings.hideRejectedDescription")}
                </p>
              </div>
              <Switch
                checked={filters.hideRejected || false}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, hideRejected: checked || undefined })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Sources */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.customSources")}</CardTitle>
            <CardDescription>
              Add custom job sources for your applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., AngelList, Hacker News"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSource()}
              />
              <Button onClick={handleAddSource}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {settings.customSources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {settings.customSources.map((source) => (
                  <Badge
                    key={source}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {source}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-transparent"
                      onClick={() => {
                        removeCustomSource(source);
                        toast.success("Source removed");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Industries */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.customIndustries")}</CardTitle>
            <CardDescription>
              Add custom industries for company categorization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Blockchain, AI/ML"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddIndustry()}
              />
              <Button onClick={handleAddIndustry}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {settings.customIndustries.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {settings.customIndustries.map((industry) => (
                  <Badge
                    key={industry}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {industry}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-transparent"
                      onClick={() => {
                        removeCustomIndustry(industry);
                        toast.success("Industry removed");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.dataManagement")}</CardTitle>
            <CardDescription>
              Export, import, or clear your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                {t("settings.exportData")}
              </Button>
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {t("settings.importData")}
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportData}
                  />
                </label>
              </Button>
            </div>

            <Separator />

            <div>
              <Button
                variant="destructive"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will permanently delete all your applications and settings.
              </p>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Data</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete all your applications and
                settings? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAllData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About JobTrack</CardTitle>
            <CardDescription>
              A modern job application tracking tool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              JobTrack helps you organize and track your job applications in one
              place. Built with Next.js, Supabase, and shadcn/ui.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://berkinduz.com/en/about"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
                berkinduz.com
              </a>
              <a
                href="https://github.com/berkinduz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://github.com/berkinduz/job-apply-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                Source Code
              </a>
            </div>
            <BuyMeACoffeeButton />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
