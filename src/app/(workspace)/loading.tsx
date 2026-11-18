import { RoomLoading } from "@/components/ui/RoomLoading";

export default function WorkspaceLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <RoomLoading size="lg" text="Loading Workspace..." />
    </div>
  );
}
