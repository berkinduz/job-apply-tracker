"use client";

import { useState, useRef, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, MapPin, Briefcase } from "lucide-react";
import {
  STATUS_ORDER,
  STATUS_CONFIG,
  WORK_TYPE_CONFIG,
} from "@/config/constants";
import { ApplicationStatus, JobApplication } from "@/types";
import { useApplicationStore } from "@/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface KanbanBoardProps {
  applications: JobApplication[];
}

export function KanbanBoard({ applications }: KanbanBoardProps) {
  const t = useTranslations();
  const { updateApplicationStatus } = useApplicationStore();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus | null>(
    null
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    applicationId: string
  ) => {
    event.dataTransfer.setData("text/plain", applicationId);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(applicationId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setActiveStatus(null);
  };

  const handleBoardDragOver = (event: DragEvent<HTMLDivElement>) => {
    const container = boardRef.current;
    if (!container) return;
    const { left, right } = container.getBoundingClientRect();
    const edgeThreshold = 80;
    const maxSpeed = 22;
    if (event.clientX < left + edgeThreshold) {
      const distance = Math.max(0, event.clientX - left);
      const speed = Math.ceil(((edgeThreshold - distance) / edgeThreshold) * maxSpeed);
      container.scrollLeft -= speed;
    } else if (event.clientX > right - edgeThreshold) {
      const distance = Math.max(0, right - event.clientX);
      const speed = Math.ceil(((edgeThreshold - distance) / edgeThreshold) * maxSpeed);
      container.scrollLeft += speed;
    }
  };

  const handleDrop = async (
    event: DragEvent<HTMLDivElement>,
    status: ApplicationStatus
  ) => {
    event.preventDefault();
    const applicationId = event.dataTransfer.getData("text/plain");
    if (!applicationId) return;
    const application = applications.find((app) => app.id === applicationId);
    if (!application || application.status === status) return;
    await updateApplicationStatus(applicationId, status);
    setActiveStatus(null);
  };

  return (
    <div
      ref={boardRef}
      onDragOver={handleBoardDragOver}
      className="jt-kanban-scroll flex gap-4 overflow-x-auto pb-3"
    >
      {STATUS_ORDER.map((status) => {
        const statusApps = applications.filter(
          (application) => application.status === status
        );
        const statusConfig = STATUS_CONFIG[status];

        return (
          <div
            key={status}
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => setActiveStatus(status)}
            onDragLeave={() => setActiveStatus(null)}
            onDrop={(event) => handleDrop(event, status)}
            className={cn(
              "w-72 shrink-0 rounded-xl border border-border bg-card/60 backdrop-blur-sm transition-colors",
              activeStatus === status && "border-primary/60 ring-1 ring-primary/20"
            )}
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {t(`status.${status}`)}
                </span>
                <Badge
                  className={cn(
                    statusConfig.bgColor,
                    statusConfig.color,
                    "border-0 text-xs"
                  )}
                >
                  {statusApps.length}
                </Badge>
              </div>
            </div>
            <div className="p-3 space-y-3 min-h-[120px]">
              {statusApps.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t("common.noResults")}
                </p>
              ) : (
                statusApps.map((application) => (
                  <KanbanCard
                    key={application.id}
                    application={application}
                    isDragging={draggingId === application.id}
                    pinnedLabel={t("common.pinned")}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface KanbanCardProps {
  application: JobApplication;
  isDragging: boolean;
  pinnedLabel: string;
  onDragStart: (
    event: DragEvent<HTMLDivElement>,
    applicationId: string
  ) => void;
  onDragEnd: () => void;
}

function KanbanCard({
  application,
  isDragging,
  pinnedLabel,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const router = useRouter();
  const t = useTranslations();
  const workTypeConfig = WORK_TYPE_CONFIG[application.workType];

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(event) => onDragStart(event, application.id)}
      onDragEnd={onDragEnd}
      onClick={() => router.push(`/applications/${application.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          router.push(`/applications/${application.id}`);
        }
      }}
      className={cn(
        "rounded-lg border border-border bg-background p-3 shadow-sm cursor-pointer transition-all hover:shadow-md",
        isDragging && "opacity-60"
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold truncate">
          {application.companyName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {application.position}
        </p>
      </div>

      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 truncate">
          <MapPin className="h-3 w-3" />
          {application.companyLocation}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(new Date(application.applicationDate), "MMM d")}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          {workTypeConfig.icon} {t(`workType.${application.workType}`)}
        </span>
      </div>

      {application.isPinned && (
        <p className="mt-2 text-[11px] font-medium text-primary">
          {pinnedLabel}
        </p>
      )}
    </div>
  );
}
