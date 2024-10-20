import {
  Handle,
  NodeProps,
  NodeResizer,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";

let id = 0;
const getId = () => `new-nodexxx-${id++}`;

export default function CustomNode({
  id,
  selected,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps) {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  const { getHandleConnections, addNodes, addEdges } = useReactFlow();

  function addNewNode(handleParams: {
    type: "source" | "target";
    id: string;
    nodeId: string;
  }) {
    const { type, id, nodeId } = handleParams;
    const handleConnections = getHandleConnections({
      type,
      id,
      nodeId,
    });
    if (handleConnections.length > 0) return;
    const newNodeId = getId();
    const newNode = {
      id: newNodeId,
      position: { x: positionAbsoluteX, y: positionAbsoluteY + 150 },
      data: { label: "New Node" },
      style: { color: "#000000" },
      draggable: true,
      selectable: true,
    };
    const newEdge = {
      id: `edgexxx-${nodeId}-${newNodeId}`,
      source: nodeId,
      target: newNodeId,
      sourceHandle: `handle-${Position.Bottom}`,
    };
    addNodes(newNode);
    addEdges(newEdge);
  }

  return (
    <div style={{ position: "relative" }}>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={100}
        handleStyle={{
          width: "10px",
          height: "10px",
          border: "1px solid #00C8FF",
          background: "#FFFFFF",
        }}
        onResize={(event, params) => {
          const { width, height } = params;
          setWidth(width);
          setHeight(height);
        }}
      />
      <Handle
        id={Position.Top}
        type="source"
        position={Position.Top}
        style={{
          position: "absolute",
          top: -5,
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#00C8FF",
        }}
        // onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={true}
        onClick={() =>
          addNewNode({
            type: "target",
            id: `handle-${Position.Top}`,
            nodeId: id,
          })
        }
        onMouseEnter={(e) => {
          e.currentTarget.style.width = "10px";
          e.currentTarget.style.height = "10px";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.width = "6px";
          e.currentTarget.style.height = "6px";
        }}
      />
      <Handle
        id={Position.Bottom}
        type="source"
        position={Position.Bottom}
        style={{
          position: "absolute",
          bottom: -5,
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#00C8FF",
        }}
        // onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={true}
        onMouseEnter={(e) => {
          e.currentTarget.style.width = "10px";
          e.currentTarget.style.height = "10px";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.width = "6px";
          e.currentTarget.style.height = "6px";
        }}
        onClick={() =>
          addNewNode({
            type: "source",
            id: `handle-${Position.Bottom}`,
            nodeId: id,
          })
        }
      />
      <Handle
        id={Position.Left}
        type="source"
        position={Position.Left}
        style={{
          position: "absolute",
          left: -5,
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#00C8FF",
        }}
        // onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={true}
        onMouseEnter={(e) => {
          e.currentTarget.style.width = "10px";
          e.currentTarget.style.height = "10px";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.width = "6px";
          e.currentTarget.style.height = "6px";
        }}
      />
      <Handle
        id={Position.Right}
        type="source"
        position={Position.Right}
        style={{
          position: "absolute",
          right: -5,
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#00C8FF",
        }}
        // onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={true}
        onMouseEnter={(e) => {
          e.currentTarget.style.width = "10px";
          e.currentTarget.style.height = "10px";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.width = "6px";
          e.currentTarget.style.height = "6px";
        }}
      />
      <div
        style={{ width, height, background: "blue" }}
        onMouseEnter={(e) => console.log(e)}
        // className="nodrag"
      >
        this is a custom node
      </div>
    </div>
  );
}
