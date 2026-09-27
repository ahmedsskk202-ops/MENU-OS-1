import { PoweredByFooter } from "@/components/customer/PoweredByFooter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function InvalidCode() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
      <ThemeToggle className="fixed top-4 end-4" />
      <h1 className="font-display text-2xl font-semibold">Code not recognized</h1>
      <p className="text-muted-foreground max-w-xs">
        This QR code is invalid or has been deactivated. Please ask a member of staff for help.
      </p>
      <PoweredByFooter />
    </div>
  );
}
