import { useEffect, useRef, useState } from "react";
import { BaseEdge, getSmoothStepPath } from "@xyflow/react";
import { drag } from "d3-drag";
import { select } from "d3-selection";

const CustomEditableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}) => {
  // middle of the 1st vertical line
  const [controlPoint1, setControlPoint1] = useState({
    x: sourceX,
    y: sourceY + (targetY - sourceY) / 4,
  });
  // middle of the horizontal line
  const [controlPoint2, setControlPoint2] = useState({
    x: sourceX + (targetX - sourceX) / 2,
    y: sourceY + (targetY - sourceY) / 2,
  });
  // middle of the 2nd vertical line
  const [controlPoint3, setControlPoint3] = useState({
    x: targetX,
    y: sourceY + ((targetY - sourceY) * 3) / 4,
  });

  useEffect(() => {
    setControlPoint1({
      x: sourceX,
      y: sourceY + (targetY - sourceY) / 4,
    });
    setControlPoint2({
      x: sourceX + (targetX - sourceX) / 2,
      y: sourceY + (targetY - sourceY) / 2,
    });
    setControlPoint3({
      x: targetX,
      y: sourceY + ((targetY - sourceY) * 3) / 4,
    });
  }, [sourceX, sourceY, targetX, targetY]);

  const controlPoint1Ref = (node) => {
    if (node) {
      const d3Selection = select(node);

      d3Selection.call(
        drag().on("drag", (e) => {
          console.log(e.dx, e.dy);
          const { dx, dy } = e;
          setControlPoint1((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        })
      );
    }
  };

  const controlPoint2Ref = (node) => {
    if (node) {
      const d3Selection = select(node);

      d3Selection.call(
        drag().on("drag", (e) => {
          console.log(e.dx, e.dy);
          const { dx, dy } = e;
          setControlPoint2((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        })
      );
    }
  };

  const controlPoint3Ref = (node) => {
    if (node) {
      const d3Selection = select(node);

      d3Selection.call(
        drag().on("drag", (e) => {
          console.log(e.dx, e.dy);
          const { dx, dy } = e;
          setControlPoint3((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        })
      );
    }
  };

  // Update the path when control point changes
  const [edgePathTest] = getSmoothStepPath({
    sourceX,
    sourceY,
    // sourcePosition: Position.,
    targetX,
    targetY,
    // targetPosition: "left",
    borderRadius: 50,
  });

  console.log(edgePathTest);

  //   const generateThreePartSmoothStepPathWithRadius = (
  //     sourceX,
  //     sourceY,
  //     targetX,
  //     targetY,
  //     radius
  //   ) => {
  //     // Midpoint on the Y-axis (middle between source and target)
  //     const midY = (sourceY + targetY) / 2;

  //     // Start point
  //     let path = `M${sourceX},${sourceY}`;

  //     // 1. Vertical line down to the point just before the corner
  //     const cornerY = midY - radius; // Move up slightly to make room for the arc
  //     path += `L${sourceX},${cornerY}`;

  //     // 2. Arc (smooth corner) from vertical to horizontal
  //     path += `A${radius},${radius} 0 0 0 ${sourceX + radius},${midY}`;

  //     // 3. Horizontal line to just before the next corner
  //     const cornerX = targetX - radius;
  //     path += `L${cornerX},${midY}`;

  //     // 4. Arc (smooth corner) from horizontal to vertical
  //     path += `A${radius},${radius} 0 0 1 ${targetX},${midY + radius}`;

  //     // 5. Final vertical line down to the target
  //     path += `L${targetX},${targetY}`;

  //     return path;
  //   };
  const generateThreePartSmoothStepPathWithRadius = (
    sourceX,
    sourceY,
    targetX,
    targetY,
    radius
  ) => {
    // Calculate the middle point on the Y-axis
    const midY = (sourceY + targetY) / 2;

    // Start building the path
    let path = `M${sourceX},${sourceY}`; // Move to the source point

    // 1. From source to control point 1
    path += `L${controlPoint1.x},${controlPoint1.y}`;

    // 2. From control point 1 to the middle of source and target Y
    path += `L${sourceX},${midY - radius}`;

    // 3. Arc (smooth corner) for radius
    path += `A${radius},${radius} 0 0 0 ${sourceX + radius},${midY}`;

    // 4. From the arc to control point 2
    path += `L${controlPoint2.x},${controlPoint2.y}`;

    // 5. From control point 2 to the middle of source and target Y
    path += `L${targetX - radius},${midY}`;

    // 6. Arc (smooth corner) for radius
    path += `A${radius},${radius} 0 0 1 ${targetX},${midY + radius}`;

    // 7. From the arc to control point 3
    path += `L${controlPoint3.x},${controlPoint3.y}`;

    // 8. From control point 3 to the target
    path += `L${targetX},${targetY}`;

    return path;
  };

  const edgePath = generateThreePartSmoothStepPathWithRadius(
    sourceX,
    sourceY,
    targetX,
    targetY,
    10
  );

  return (
    <>
      <BaseEdge path={edgePath} />
      <circle
        ref={controlPoint1Ref}
        cx={controlPoint1.x}
        cy={controlPoint1.y}
        r={5}
        fill="blue"
        style={{ pointerEvents: "all" }}
      />
      <circle
        ref={controlPoint2Ref}
        cx={controlPoint2.x}
        cy={controlPoint2.y}
        r={5}
        fill="blue"
        style={{ pointerEvents: "all" }}
      />
      <circle
        ref={controlPoint3Ref}
        cx={controlPoint3.x}
        cy={controlPoint3.y}
        r={5}
        fill="blue"
        style={{ pointerEvents: "all" }}
      />
    </>
  );
};

export default CustomEditableEdge;
