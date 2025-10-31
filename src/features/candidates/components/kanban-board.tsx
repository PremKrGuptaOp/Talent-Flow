import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { Users } from "lucide-react";
import { useAppStore } from "../../../lib/store";
import { KanbanColumn } from "./kanban-column";
import { DragOverlayCard } from "./drag-overlay-card";
import type { Candidate } from "../../../types";

const HIRING_STAGES = [
  {
    id: "applied",
    label: "Applied",
    color: "bg-blue-600/20 text-blue-400 border-blue-500/30",
    lightColor: "bg-blue-600/10",
    darkColor: "bg-blue-600/20",
  },
  {
    id: "screen",
    label: "Phone Screen",
    color: "bg-amber-600/20 text-amber-400 border-amber-500/30",
    lightColor: "bg-amber-600/10",
    darkColor: "bg-amber-600/20",
  },
  {
    id: "tech",
    label: "Technical Interview",
    color: "bg-purple-600/20 text-purple-400 border-purple-500/30",
    lightColor: "bg-purple-600/10",
    darkColor: "bg-purple-600/20",
  },
  {
    id: "offer",
    label: "Offer",
    color: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
    lightColor: "bg-emerald-600/10",
    darkColor: "bg-emerald-600/20",
  },
  {
    id: "hired",
    label: "Hired",
    color: "bg-green-600/20 text-green-400 border-green-500/30",
    lightColor: "bg-green-600/10",
    darkColor: "bg-green-600/20",
  },
  {
    id: "rejected",
    label: "Rejected",
    color: "bg-red-600/20 text-red-400 border-red-500/30",
    lightColor: "bg-red-600/10",
    darkColor: "bg-red-600/20",
  },
] as const;

interface KanbanBoardProps {
  candidates: Candidate[];
  onCandidateClick?: (candidate: Candidate) => void;
}

export const KanbanBoard = ({
  candidates,
  onCandidateClick,
}: KanbanBoardProps) => {
  const { updateCandidate } = useAppStore();
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Lower the activation distance to make it easier to start dragging
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Lower the delay to make it more responsive on touch devices
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group candidates by stage
  const candidatesByStage = useMemo(() => {
    const grouped = HIRING_STAGES.reduce((acc, stage) => {
      acc[stage.id] = candidates.filter(
        (candidate) => candidate.stage === stage.id
      );
      return acc;
    }, {} as Record<string, Candidate[]>);
    return grouped;
  }, [candidates]);

  // Get all candidate IDs for the SortableContext
  const candidateIds = useMemo(
    () => candidates.map((candidate) => candidate.id),
    [candidates]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidate = candidates.find((c) => c.id === active.id);
    if (candidate) {
      // Set the active candidate for the drag overlay
      setActiveCandidate(candidate);
      // Add a class to the body to prevent scrolling during drag
      document.body.classList.add('dragging');
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Improved visual feedback during drag
    const { active, over } = event;
    
    if (active && over) {
      const activeId = active.id as string;
      const overId = over.id as string;
      
      // We could implement more sophisticated visual feedback here
      // For now, we'll just ensure the event is properly handled
      console.log("Dragging over:", overId);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset state and remove body class
    setActiveCandidate(null);
    document.body.classList.remove('dragging');

    if (!over || !active) {
      console.log("No valid drop target found");
      return;
    }

    const candidateId = active.id as string;
    const newStage = over.id as Candidate["stage"];

    // Find the candidate being dragged
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) {
      console.error("Candidate not found:", candidateId);
      return;
    }

    // Skip if the stage hasn't changed
    if (candidate.stage === newStage) {
      console.log("Stage unchanged:", candidate.stage);
      return;
    }

    // Set updating state to show loading indicator
    setIsUpdating(candidateId);

    try {
      // Update the candidate's stage
      await updateCandidate(candidateId, { stage: newStage });
      console.log("Successfully updated candidate stage");
    } catch (error) {
      console.error("Failed to update candidate stage:", error);
      // The store's optimistic update will handle rollback
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={candidateIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex gap-6 min-w-max pb-4">
              {HIRING_STAGES.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  candidates={candidatesByStage[stage.id] || []}
                  onCandidateClick={onCandidateClick}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          </div>
        </SortableContext>

        <DragOverlay>
          {activeCandidate ? (
            <DragOverlayCard candidate={activeCandidate} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
