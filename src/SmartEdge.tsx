import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  Position,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { useEffect } from "react";

export default function SmartEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceHandleId,
  targetHandleId,
  data,
}: EdgeProps) {
  const { updateEdge, getEdges, getNode } = useReactFlow();

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: HandlerPosition[sourceHandleId],
    targetPosition: HandlerPosition[targetHandleId],
  });

  return (
    <>
      <BaseEdge key={id} id={id} path={edgePath} />
    </>
  );
}

const HandlerPosition = {
  top: Position.Top,
  bottom: Position.Bottom,
  left: Position.Left,
  right: Position.Right,
};
