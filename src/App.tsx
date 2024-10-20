import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  StraightEdge,
  Connection,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DnDProvider, useDnD } from "./DndContext";
import Sidebar from "./Sidebar.tsx";
import CustomNode from "./CustomNode.tsx";
import CustomEdge from "./CustomEdge.tsx";
import PositionableEdge from "./PositionableEdge.tsx";
import SmartEdge from "./SmartEdge.tsx";

const initialNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Start" },
    style: { color: "#000000" },
    draggable: true,
  },
  {
    id: "2",
    position: { x: 100, y: 400 },
    data: { label: "End" },
    style: { color: "#000000" },
    draggable: true,
  },
  // {
  //   id: "custom-node-3",
  //   position: { x: 100, y: 200 },
  //   data: { label: "This is a custom node" },
  //   style: { color: "#000000" },
  //   draggable: true,
  //   type: "customNode",
  // },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  straight: StraightEdge,
  custom: CustomEdge,
  positionable: PositionableEdge,
  smart: SmartEdge,
};

function mapEdgesPosition(edges, nodes) {
  const edgesPosition = [];
  edges.forEach((e) => {
    const sourceNode = nodes.find((n) => n.id === e.source);
    const targetNode = nodes.find((n) => n.id === e.target);

    const start = {
      x: sourceNode.position.x + sourceNode.measured.width / 2,
      y: sourceNode.position.y + sourceNode.measured.height,
    };
    const end = {
      x: targetNode.position.x + targetNode.measured.width / 2,
      y: targetNode.position.y,
    };
    edgesPosition.push({
      start,
      end,
      id: e.id,
      source: e.source,
      target: e.target,
    });
  });
  return edgesPosition;
}

function getDroppedNodeInterceptedEdge(node, edgesPosition) {
  const interceptedEdge = edgesPosition.filter((e) => {
    return e.start.y <= node.position.y && e.end.y >= node.position.y;
  });
  return interceptedEdge?.[0];
}

function DnDFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  useEffect(() => {
    const cachedTaskContentString = localStorage.getItem("taskContent");
    const cachedTaskContent = cachedTaskContentString
      ? JSON.parse(cachedTaskContentString)
      : null;
    const nodes = cachedTaskContent?.nodes;
    const edges = cachedTaskContent?.edges;
    if (nodes) {
      setNodes(nodes);
    }
    if (edges) {
      setEdges(edges);
    }
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      // map a edges array with start and end position => [{start: {x, y}, end: {x, y}}]
      const edgesPosition = mapEdgesPosition(edges, nodes);

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: "Wait" },
        style: { color: "#000000" },
        draggable: true,
        selectable: true,
      };

      const interceptedEdge = getDroppedNodeInterceptedEdge(
        newNode,
        edgesPosition
      );

      // if has interceptedEdgeID, remove the edge and create 2 new edges
      if (interceptedEdge) {
        const newEdges = [
          {
            id: `${interceptedEdge.source}-${newNode.id}`,
            source: interceptedEdge.source,
            target: newNode.id,
          },
          {
            id: `${newNode.id}-${interceptedEdge.target}`,
            source: newNode.id,
            target: interceptedEdge.target,
          },
        ];
        console.log(newEdges);
        setEdges((edges) =>
          edges.filter((e) => e.id !== interceptedEdge.id).concat(newEdges)
        );
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type, nodes, edges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      console.log(connection);
      const newEdge = {
        type: "positionable",
        ...connection,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex" }}>
      <div style={{ width: "70vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          connectionMode={ConnectionMode.Loose}
          snapToGrid
        >
          <Background />
        </ReactFlow>
      </div>
      <div>
        <Sidebar />
      </div>
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <DnDFlow />
      </DnDProvider>
    </ReactFlowProvider>
  );
}

export default App;
