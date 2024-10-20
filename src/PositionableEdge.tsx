import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  Position,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { SVGCommand, SVGPathData, SVGPathDataParser } from "svg-pathdata";
import { produce } from "immer";
import Handler from "./Handler";

type PositionHandler = {
  id: string;
  x: number;
  y: number;
  line: Line;
  movableDirection: "vertical" | "horizontal";
};

type Path = string;

type EdgeSegment = {
  id: string;
  path: string;
};

export default function PositionableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const edgeSegments = useRef<EdgeSegment[]>([]);
  const prevSourceX = useRef(sourceX);
  const prevSourceY = useRef(sourceY);
  const prevTargetX = useRef(targetX);
  const prevTargetY = useRef(targetY);

  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY });
  const striaghtLines = getStraightLinesFromPath(edgePath);
  const defaultHandlers = getPositionHandlers(striaghtLines);

  const [positionHandlers, setPositionHandlers] =
    useState<PositionHandler[]>(defaultHandlers);

  const edgeSegmentsCount = positionHandlers.length + 1;

  const parser = new SVGPathDataParser();

  const handleHandlerDrag = (id: string, dx: number, dy: number) => {
    const targetID = id;
    setPositionHandlers((prev) =>
      produce(prev, (draft) => {
        const targetIndex = draft.findIndex((h) => h.id === targetID);
        const target = targetIndex === -1 ? null : draft[targetIndex];
        if (target?.movableDirection === "horizontal") {
          target.x += dx;
        }
        if (target?.movableDirection === "vertical") {
          target.y += dy;
        }
        if (dx !== 0 && target?.movableDirection === "horizontal") {
          // adjust prev and next handler position to the center of the edge
          const next = draft?.[targetIndex + 1];
          const nextNext = draft?.[targetIndex + 2] ?? { x: targetX };
          if (next) {
            const middleOfNextLine = (target.x + dx + nextNext.x) / 2;
            next.x = middleOfNextLine;
          }

          const prev = draft?.[targetIndex - 1];
          const prevPrev = draft?.[targetIndex - 2] ?? { x: sourceX };
          if (prev) {
            const middleOfPrevLine = (target.x + dx + prevPrev.x) / 2;
            prev.x = middleOfPrevLine;
          }

          // if (dx > 0 && next) {
          //   const lengthOfNextLine = Math.abs(target.x + dx - nextNext.x);
          //   if (lengthOfNextLine < 30) {
          //     draft.splice(targetIndex + 1, 1);
          //   }
          // }

          // if (dx < 0 && prev) {
          //   const lengthOfPrevLine = Math.abs(target.x + dx - prevPrev.x);
          //   if (lengthOfPrevLine < 30) {
          //     draft.splice(targetIndex - 1, 1);
          //   }
          // }
        }
        if (dy !== 0 && target?.movableDirection === "vertical") {
          // adjust prev and next handler position to the center of the edge
          const next = draft?.[targetIndex + 1];
          const nextNext = draft?.[targetIndex + 2] ?? { y: targetY };
          if (next) {
            next.y = (target.y + dy + nextNext.y) / 2;
          }

          const prev = draft?.[targetIndex - 1];
          const prevPrev = draft?.[targetIndex - 2] ?? { y: sourceY };
          if (prev) {
            prev.y = (target.y + dy + prevPrev.y) / 2;
          }

          // if (dy > 0) {
          //   const lengthOfNextLine = Math.abs(target.y + dy - nextNext.y);
          //   if (lengthOfNextLine < 30) {
          //     draft.splice(targetIndex, 1);
          //     draft.splice(targetIndex + 1, 1);
          //   }
          // }
          // if (dy < 0) {
          //   const lengthOfPrevLine = Math.abs(target.y + dy - prevPrev.y);
          //   if (lengthOfPrevLine < 30) {
          //     draft.splice(targetIndex, 1);
          //     draft.splice(targetIndex - 1, 1);
          //   }
          // }
        }
      })
    );
  };

  const handleHandlerDragEnd = () => {
    console.log(edgeSegments.current);
    // combine edge segments to one edge
    const totalPath = combinePathSegments(edgeSegments.current);
    console.log(totalPath);
    const parsedTotalPath = parser.parse(`${totalPath}z`);
    console.log(parsedTotalPath);
    // get striaght lines
    const straightLines = extractLines(parsedTotalPath);
    console.log(straightLines);
    // get all handlers
    const newPositionHandlers = getPositionHandlers(straightLines);
    console.log(newPositionHandlers);
    setPositionHandlers(newPositionHandlers);
  };

  useEffect(() => {
    if (sourceX === targetX) return

    if (sourceX !== prevSourceX.current) {
      const dx = sourceX - prevSourceX.current;
      setPositionHandlers((prev) =>
        produce(prev, (draft) => {
          draft[0].x += dx;
          const firstHorizontalLineLength = Math.abs(sourceX - draft?.[2]?.x);
          if (firstHorizontalLineLength < 25) {
            draft.splice(0, 2);
          }
        })
      );
    }
    if (targetX !== prevTargetX.current) {
      const dx = targetX - prevTargetX.current;
      setPositionHandlers((prev) =>
        produce(prev, (draft) => {
          draft[draft.length - 1].x += dx;

          // const lastHorizontalLineLength = Math.abs(
          //   targetX - draft?.[draft.length - 3]?.x
          // );
          // if (lastHorizontalLineLength < 25) {
          //   draft.splice(draft.length - 2, 1);
          //   draft.splice(draft.length - 2, 1);
          // }
        })
      );
    }
    setPositionHandlers((prev) =>
      produce(prev, (draft) => {
        draft.forEach((h, index) => {
          if (h.movableDirection === "horizontal") {
            if (index === 0) {
              h.y = (sourceY + draft[index + 1]?.y) / 2;
            }
            if (index === draft.length - 1) {
              h.y = (targetY + draft[draft.length - 2]?.y) / 2;
            }
          }
          if (h.movableDirection === "vertical") {
            h.x = (draft?.[index - 1]?.x + draft?.[index + 1]?.x) / 2;
          }
        });
      })
    );
  }, [sourceX, targetX, sourceY, targetY]);

  useEffect(() => {
    prevSourceX.current = sourceX;
    prevSourceY.current = sourceY;
    prevTargetX.current = targetX;
    prevTargetY.current = targetY;
  }, [sourceX, sourceY, targetX, targetY]);

  // Update edge paths on position handlers OR source OR target position change
  const newEdgeSegments = [] as EdgeSegment[];
  let lastTargetPosition: Position;
  for (let i = 0; i < edgeSegmentsCount; i++) {
    let segmentSourceX,
      segmentSourceY,
      segmentTargetX,
      segmentTargetY,
      sourcePosition,
      targetPosition;

    if (i === 0) {
      segmentSourceX = sourceX;
      segmentSourceY = sourceY;
      sourcePosition = Position.Bottom;
      targetPosition = Position.Top;
    } else {
      const handler = positionHandlers[i - 1];
      segmentSourceX = handler.x;
      segmentSourceY = handler.y;
    }

    if (i === edgeSegmentsCount - 1) {
      segmentTargetX = targetX;
      segmentTargetY = targetY;
      sourcePosition = getSourcePosition(lastTargetPosition);
      targetPosition = Position.Top;
    } else {
      const handler = positionHandlers[i];
      segmentTargetX = handler.x;
      segmentTargetY = handler.y;
      sourcePosition = getSourcePosition(lastTargetPosition);
      targetPosition = getTargetPosition(
        sourcePosition,
        segmentSourceX,
        segmentSourceY,
        segmentTargetX,
        segmentTargetY
      );
    }

    lastTargetPosition = targetPosition;

    // console.log(
    //   i,
    //   segmentSourceX,
    //   segmentSourceY,
    //   sourcePosition,
    //   segmentTargetX,
    //   segmentTargetY,
    //   targetPosition
    // );

    const [path, labelX, labelY] = getSmoothStepPath({
      sourceX: segmentSourceX,
      sourceY: segmentSourceY,
      sourcePosition: sourcePosition,
      targetX: segmentTargetX,
      targetY: segmentTargetY,
      targetPosition: targetPosition,
    });
    const uuid = uuidv4();
    newEdgeSegments.push({ id: uuid, path });
  }

  edgeSegments.current = newEdgeSegments;

  console.log(edgeSegments.current);

  //   console.log("edgePath", edgePath);
  //   console.log("lines", lines);
  //   console.log("defaultHandlers", defaultHandlers);

  return (
    <>
      {edgeSegments.current.map((segement) => {
        return (
          <BaseEdge
            key={segement.id}
            id={segement.id}
            path={segement.path}
            className="nopan"
          />
        );
      })}

      {positionHandlers.map((handler) => (
        <EdgeLabelRenderer key={handler.id}>
          <Handler
            id={handler.id}
            x={handler.x}
            y={handler.y}
            handleDrag={handleHandlerDrag}
            handleDragEnd={handleHandlerDragEnd}
          />
        </EdgeLabelRenderer>
      ))}
    </>
  );
}

type Point = {
  x: number;
  y: number;
};

type Line = {
  start: Point;
  end: Point;
  type: "vertical" | "horizontal";
};

function getStraightLinesFromPath(path: string): Line[] {
  const lines: Line[] = [];

  // Split the path string into commands and coordinates
  const commands = path.match(/[MLLQHVCSZ][^MLLQHVCSZ]*/g);

  if (!commands) return lines;

  let currentPoint: Point = { x: 0, y: 0 };
  let previousLine: Line | null = null;

  for (const command of commands) {
    const type = command[0];
    const coords = command.slice(1).trim().split(/[ ,]+/).map(Number);

    switch (type) {
      case "M":
      case "L":
        if (coords.length >= 2) {
          const newPoint: Point = { x: coords[0], y: coords[1] };
          let newLine: Line | null = null;

          // Check if it's a vertical or horizontal line
          if (currentPoint.x === newPoint.x) {
            // Vertical line
            newLine = {
              start: { ...currentPoint },
              end: { ...newPoint },
              type: "vertical",
            };
          } else if (currentPoint.y === newPoint.y) {
            // Horizontal line
            newLine = {
              start: { ...currentPoint },
              end: { ...newPoint },
              type: "horizontal",
            };
          }

          // Combine consecutive vertical or horizontal lines
          if (newLine && previousLine && previousLine.type === newLine.type) {
            if (
              (newLine.type === "vertical" &&
                previousLine.start.x === newLine.start.x) ||
              (newLine.type === "horizontal" &&
                previousLine.start.y === newLine.start.y)
            ) {
              // Extend the previous line
              previousLine.end = newLine.end;
            } else {
              // Add previous line and start a new one
              lines.push(previousLine);
              previousLine = newLine;
            }
          } else if (newLine) {
            if (previousLine) {
              lines.push(previousLine);
            }
            previousLine = newLine;
          }

          currentPoint = newPoint; // Update the current point to the new point
        }
        break;
      case "Q":
        if (coords.length >= 4) {
          const controlPoint: Point = { x: coords[0], y: coords[1] };
          const endPoint: Point = { x: coords[2], y: coords[3] };
          currentPoint = endPoint; // Update the current point after the curve
        }
        break;
      default:
        break;
    }
  }

  // Add the last line if any
  if (previousLine) {
    lines.push(previousLine);
  }

  return lines;
}

// Define the constants as per the SVGPathData library
const MOVE_TO = 2;
const LINE_TO = 16;
const QUAD_TO = 128;

function extractLines(pathData: SVGCommand[]): Line[] {
  const lines: Line[] = [];
  let currentX: number | undefined;
  let currentY: number | undefined;
  for (const segment of pathData) {
    switch (segment.type) {
      case MOVE_TO:
        currentX = segment.x;
        currentY = segment.y;
        break;
      case LINE_TO:
        if (currentX !== undefined && currentY !== undefined) {
          const endX = segment.x;
          const endY = segment.y;
          addLine(currentX, currentY, endX, endY, lines);
          currentX = endX;
          currentY = endY;
        }
        break;
      case QUAD_TO:
        currentX = segment.x;
        currentY = segment.y;
        break;
    }
  }

  const straightLines = lines.filter(
    (l) => l.type === "vertical" || l.type === "horizontal"
  );

  return straightLines;
}

function addLine(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  lines: Line[]
) {
  const type =
    startX === endX ? "vertical" : startY === endY ? "horizontal" : "unknown";

  const newLine: Line = {
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    type,
  };

  if (lines.length > 0) {
    const lastLine = lines[lines.length - 1];

    // Check for merging vertical lines
    if (
      type === "vertical" &&
      lastLine.type === "vertical" &&
      lastLine.start.x === newLine.start.x
    ) {
      lastLine.end.y = newLine.end.y; // Extend the end y
    }
    // Check for merging horizontal lines
    else if (
      type === "horizontal" &&
      lastLine.type === "horizontal" &&
      lastLine.start.y === newLine.start.y
    ) {
      lastLine.end.x = newLine.end.x; // Extend the end x
    } else {
      // Push new line if not mergeable
      lines.push(newLine);
    }
  } else {
    lines.push(newLine);
  }
}

function getPositionHandlers(lines: Line[]) {
  const positionHandlers = [] as PositionHandler[];
  for (const line of lines) {
    if (
      Math.sqrt(
        Math.abs(line.start.x - line.end.x) ** 2 +
          Math.abs(line.start.y - line.end.y) ** 2
      ) < 40
    )
      continue;

    const uuid = uuidv4();
    const centerPoint = {
      x: (line.start.x + line.end.x) / 2,
      y: (line.start.y + line.end.y) / 2,
    };
    positionHandlers.push({
      ...centerPoint,
      id: uuid,
      line: line,
      movableDirection: line.type === "horizontal" ? "vertical" : "horizontal",
    });
  }

  return positionHandlers;
}

function getSourcePosition(targetPosition: Position) {
  let sourcePosition: Position;
  switch (targetPosition) {
    case Position.Bottom:
      sourcePosition = Position.Top;
      break;
    case Position.Top:
      sourcePosition = Position.Bottom;
      break;
    case Position.Right:
      sourcePosition = Position.Left;
      break;
    case Position.Left:
      sourcePosition = Position.Right;
      break;
  }
  return sourcePosition;
}

function getTargetPosition(
  sourcePosition: Position,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
) {
  if (sourcePosition === Position.Top || sourcePosition === Position.Bottom) {
    return sourceX > targetX ? Position.Right : Position.Left;
  } else {
    return sourceY > targetY ? Position.Bottom : Position.Top;
  }
}

function combinePathSegments(edgeSegments: { path: string }[]): string {
  if (!edgeSegments || edgeSegments.length === 0) {
    return ""; // Return an empty string if there are no segments
  }

  let combinedPath = "";

  for (let i = 0; i < edgeSegments.length; i++) {
    const currentPath = edgeSegments[i].path;

    if (i === 0) {
      // For the first segment, directly append the path
      combinedPath = currentPath;
    } else {
      // For subsequent segments, make sure the starting point matches the previous segment's endpoint
      // This example assumes segments are already continuous. Otherwise, you may need to explicitly connect them.
      combinedPath += " " + currentPath;
    }
  }

  return combinedPath;
}
