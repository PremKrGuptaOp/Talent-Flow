import { KanbanBoard } from "./kanban-board";
import { useAppStore } from "../../../lib/store";
import { Kanban } from "lucide-react";

export const KanbanPage = () => {
  const { candidates } = useAppStore();

  return (
    <div className="h-full">
      <div className="p-6 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 shadow-lg">
            <Kanban className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Kanban Board</h2>
            <p className="text-gray-400">
              Manage candidates through different hiring stages
            </p>
          </div>
        </div>
      </div>
      <KanbanBoard candidates={candidates} />
    </div>
  );
};