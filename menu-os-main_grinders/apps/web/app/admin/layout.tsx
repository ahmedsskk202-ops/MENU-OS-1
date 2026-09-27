import { LocaleProvider } from "@/lib/LocaleContext";

// Staff Console (login + dashboard) shares the customer app's LocaleProvider: English by
// default, Arabic with RTL when a staff member toggles it (remembered per device).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <LocaleProvider defaultLocale="en">{children}</LocaleProvider>;
}
