import { useReactFlow } from "@xyflow/react";
import { useDnD } from "./DndContext";

export default () => {
  const [_, setType] = useDnD();
  const { getNodes, getEdges } = useReactFlow();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSave = () => {
    const nodes = getNodes();
    const edges = getEdges();
    const nodesWithCustomData = nodes.map((n) => ({
      ...n,
      custom_data: { foo: "bar" },
    }));
    const edgesWithCustomData = edges.map((e) => ({
      ...e,
      custom_data: { foo: "bar" },
    }));
    const taskContent = {
      nodes: nodesWithCustomData,
      edges: edgesWithCustomData,
    };
    console.log(taskContent);
    localStorage.setItem("taskContent", JSON.stringify(taskContent));
  };

  return (
    <aside style={{ position: "relative" }}>
      <button
        style={{
          textAlign: "center",
          cursor: "pointer",
          position: "absolute",
          top: 10,
        }}
        onClick={handleSave}
      >
        Save
      </button>
      <div
        style={{
          width: "100px",
          height: "50px",
          background: "purple",
          textAlign: "center",
          cursor: "pointer",
          position: "absolute",
          top: 100,
        }}
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        Wait
      </div>
      <div
        style={{
          width: "100px",
          height: "50px",
          background: "blue",
          textAlign: "center",
          cursor: "pointer",
          position: "absolute",
          top: 200,
        }}
        onDragStart={(event) => onDragStart(event, "customNode")}
        draggable
      >
        Custom Node
      </div>
    </aside>
  );
};
