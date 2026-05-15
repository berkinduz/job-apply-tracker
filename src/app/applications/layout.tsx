import type { Metadata } from "next";
import { JtAuthShell } from "@/components/jt/auth-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JtAuthShell>{children}</JtAuthShell>;
}
