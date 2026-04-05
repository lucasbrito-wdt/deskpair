import { ServerControl } from "@/components/dashboard/ServerControl";
import { ConnectionInfo } from "@/components/dashboard/ConnectionInfo";
import { QRCodeCard } from "@/components/dashboard/QRCode";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ClientList } from "@/components/dashboard/ClientList";

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto h-full">
      <ServerControl />

      <div className="grid grid-cols-3 gap-4">
        <ConnectionInfo />
        <QRCodeCard />
        <StatsCards />
      </div>

      <ClientList />
    </div>
  );
}
