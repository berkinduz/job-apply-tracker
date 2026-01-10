"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pin,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { JobApplication } from "@/types";
import { STATUS_CONFIG, WORK_TYPE_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApplicationStore } from "@/store";
import { useTranslations } from "next-intl";
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
import { useState } from "react";
import { toast } from "sonner";

interface ApplicationCardProps {
  application: JobApplication;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const router = useRouter();
  const { togglePin, deleteApplication } = useApplicationStore();
  const t = useTranslations();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const statusConfig = STATUS_CONFIG[application.status];
  const workTypeConfig = WORK_TYPE_CONFIG[application.workType];

  const handleCardClick = () => {
    router.push(`/applications/${application.id}`);
  };

  const handlePinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePin(application.id);
  };

  const handleDelete = async () => {
    await deleteApplication(application.id);
    toast.success(t("application.deleteSuccess"));
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card
        className={cn(
          "group relative transition-all duration-200 hover:shadow-md cursor-pointer",
          application.isPinned && "ring-2 ring-primary/20 bg-primary/5"
        )}
        onClick={handleCardClick}
      >
        {/* Pin button - visible on hover or when pinned */}
        <button
          className={cn(
            "absolute -top-2 -right-2 z-10 rounded-full p-1.5 transition-all duration-200 cursor-pointer",
            application.isPinned
              ? "bg-primary text-primary-foreground opacity-100"
              : "bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
          )}
          onClick={handlePinClick}
        >
          <Pin
            className={cn("h-3 w-3", application.isPinned && "fill-current")}
          />
        </button>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-lg truncate">
                  {application.companyName}
                </span>
              </div>

              <p className="text-muted-foreground font-medium mb-2 truncate">
                {application.position}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {application.companyLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {application.companyIndustry}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(application.applicationDate), "MMM d, yyyy")}
                </span>
                {/* Skills */}
                {application.skills && application.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {application.skills.slice(0, 3).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs font-normal bg-muted/50"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {application.skills.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs font-normal bg-muted/50"
                      >
                        +{application.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1">
                {application.jobPostingUrl && (
                  <a
                    href={
                      application.jobPostingUrl.startsWith("http")
                        ? application.jobPostingUrl
                        : `https://${application.jobPostingUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/applications/${application.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("common.edit")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Badge
                className={cn(
                  statusConfig.bgColor,
                  statusConfig.color,
                  "border-0"
                )}
              >
                {t(`status.${application.status}`)}
              </Badge>

              <Badge variant="outline" className="text-xs">
                {workTypeConfig.icon} {t(`workType.${application.workType}`)}
              </Badge>
            </div>
          </div>

          {/* Notes */}
          {application.notes && (
            <div className="mt-3 pt-3 border-t pr-16">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {application.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("application.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
