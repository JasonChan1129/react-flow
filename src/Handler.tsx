import React, { useState, useRef, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

type Props = {
  id: string;
  x: number;
  y: number;
  handleDrag: (id: string, dx: number, dy: number) => void;
  handleDragEnd: () => void;
};

const Handler = ({ id, x, y, handleDrag, handleDragEnd }: Props) => {
  const dragItemRef = useRef<HTMLDivElement | null>(null);
  const currentPosition = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const element = dragItemRef.current;
    if (!element) return;

    // Get mouse position and the offset between element position and mouse
    currentPosition.current = {
      x: e.clientX,
      y: e.clientY,
    };

    // Add event listeners for mousemove and mouseup
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Calculate dx, dy
    const dx = e.clientX - currentPosition.current.x;
    const dy = e.clientY - currentPosition.current.y;

    currentPosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
    handleDrag(id, dx, dy);
  }, []);

  const handleMouseUp = useCallback(() => {
    // Remove the event listeners when the mouse is released
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    handleDragEnd();
  }, [handleMouseMove]);

  return (
    <div
      id={id}
      ref={dragItemRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%)`,
        background: "#ffcc00",
        width: 10,
        height: 10,
        borderRadius: "50%",
        pointerEvents: "all",
      }}
      className="nopan nodrag"
    />
  );
};

export default Handler;
