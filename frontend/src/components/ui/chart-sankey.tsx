"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface SankeyNodeData { name: string; category?: string; }
export interface SankeyLinkData { source: number; target: number; value: number; }
export interface SankeyData { nodes: SankeyNodeData[]; links: SankeyLinkData[]; }

interface SankeyContextType {
  data: SankeyData;
  nodeWidth: number;
  nodePadding: number;
  width: number;
  height: number;
  nodePositions: { x: number; y: number; width: number; height: number; value: number }[];
  hoveredNode: number | null;
  setHoveredNode: (idx: number | null) => void;
  animationDuration: number;
}

const SankeyContext = createContext<SankeyContextType | null>(null);

export function useSankey() {
  const ctx = useContext(SankeyContext);
  if (!ctx) throw new Error("useSankey must be used within <SankeyChart />");
  return ctx;
}

interface SankeyChartProps {
  data: SankeyData;
  nodeWidth?: number;
  nodePadding?: number;
  animationDuration?: number;
  height?: number | string;
  className?: string;
  children: React.ReactNode;
}

export function SankeyChart({
  data,
  nodeWidth = 16,
  nodePadding = 24,
  animationDuration = 1100,
  height = 300,
  className = "",
  children,
}: SankeyChartProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const width = 1000;
  const svgHeight = typeof height === "number" ? height : 300;
  const padding = { top: 20, right: 100, bottom: 20, left: 20 };

  const nodePositions = useMemo(() => {
    // Simple linear layout for the 5-Whys use case
    const positions: any[] = [];
    const maxVal = Math.max(...data.links.map(l => l.value), 1);
    
    data.nodes.forEach((_, i) => {
      // Find total value for this node
      const inValue = data.links.filter(l => l.target === i).reduce((sum, l) => sum + l.value, 0);
      const outValue = data.links.filter(l => l.source === i).reduce((sum, l) => sum + l.value, 0);
      const nodeValue = Math.max(inValue, outValue, 10);
      
      const colWidth = (width - padding.left - padding.right) / Math.max(data.nodes.length - 1, 1);
      const x = padding.left + i * colWidth;
      const nodeHeight = (nodeValue / Math.max(maxVal, 100)) * (svgHeight - padding.top - padding.bottom);
      const y = (svgHeight - nodeHeight) / 2; // Center vertically
      
      positions.push({ x, y, width: nodeWidth, height: nodeHeight, value: nodeValue });
    });
    return positions;
  }, [data, width, svgHeight, nodeWidth, padding]);

  return (
    <SankeyContext.Provider
      value={{ data, nodeWidth, nodePadding, width, height: svgHeight, nodePositions, hoveredNode, setHoveredNode, animationDuration }}
    >
      <div className={cn("relative w-full overflow-hidden", className)} style={{ height }}>
        <svg viewBox={`0 0 ${width} ${svgHeight}`} className="w-full h-full overflow-visible">
          {children}
        </svg>
      </div>
    </SankeyContext.Provider>
  );
}

export function SankeyLink({ opacity = 0.5, hoverOpacity = 0.8 }: { opacity?: number; hoverOpacity?: number }) {
  const { data, nodePositions, hoveredNode, animationDuration } = useSankey();

  const colors = ['#d8cfbc', '#78c51c', '#bed4fb', '#f59e0b', '#a855f7'];

  return (
    <g>
      {data.links.map((link, i) => {
        const sourcePos = nodePositions[link.source];
        const targetPos = nodePositions[link.target];
        if (!sourcePos || !targetPos) return null;

        const isHovered = hoveredNode === link.source || hoveredNode === link.target;
        const isFaded = hoveredNode !== null && !isHovered;
        
        const strokeW = Math.max(2, sourcePos.height * (link.value / sourcePos.value));

        const x0 = sourcePos.x + sourcePos.width;
        const x1 = targetPos.x;
        const y0 = sourcePos.y + sourcePos.height / 2;
        const y1 = targetPos.y + targetPos.height / 2;

        const path = `M ${x0} ${y0} C ${(x0 + x1) / 2} ${y0}, ${(x0 + x1) / 2} ${y1}, ${x1} ${y1}`;

        const sourceColor = colors[link.source % colors.length];
        const targetColor = colors[link.target % colors.length];

        return (
          <React.Fragment key={i}>
            <defs>
              <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={sourceColor} />
                <stop offset="100%" stopColor={targetColor} />
              </linearGradient>
            </defs>
            <motion.path
              d={path}
              fill="none"
              stroke={`url(#grad-${i})`}
              strokeWidth={strokeW}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: isFaded ? opacity * 0.3 : (isHovered ? hoverOpacity : opacity) 
              }}
              transition={{
                pathLength: { duration: animationDuration / 1000, ease: "easeInOut" },
                opacity: { duration: 0.3 }
              }}
              className="transition-opacity"
            />
          </React.Fragment>
        );
      })}
    </g>
  );
}

export function SankeyNode({
  lineCap = 4,
  fadedOpacity = 0.4,
  showLabels = true,
  showValueLabels = true,
  labelOrientation = 'horizontal',
  getNodeColor,
}: {
  lineCap?: number;
  fadedOpacity?: number;
  showLabels?: boolean;
  showValueLabels?: boolean;
  labelOrientation?: 'horizontal' | 'vertical';
  getNodeColor?: (node: SankeyNodeData, index: number) => string;
}) {
  const { data, nodePositions, hoveredNode, setHoveredNode } = useSankey();
  const colors = ['#d8cfbc', '#78c51c', '#bed4fb', '#f59e0b', '#a855f7'];

  return (
    <g>
      {data.nodes.map((node, i) => {
        const pos = nodePositions[i];
        if (!pos) return null;

        const isHovered = hoveredNode === i;
        const isFaded = hoveredNode !== null && !isHovered;
        const color = getNodeColor ? getNodeColor(node, i) : colors[i % colors.length];

        return (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isFaded ? fadedOpacity : 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onMouseEnter={() => setHoveredNode(i)}
            onMouseLeave={() => setHoveredNode(null)}
            className="cursor-pointer"
          >
            <rect
              x={pos.x}
              y={pos.y}
              width={pos.width}
              height={pos.height}
              fill={color}
              rx={lineCap}
              className={cn("transition-all", isHovered && "filter brightness-125")}
            />
            {showLabels && (
              <text
                x={pos.x + pos.width / 2}
                y={pos.y - 8}
                fill="currentColor"
                fontSize={10}
                fontWeight="bold"
                textAnchor="middle"
                className="text-foreground font-mono"
              >
                {node.name}
              </text>
            )}
            {showValueLabels && (
              <text
                x={pos.x + pos.width / 2}
                y={pos.y + pos.height + 14}
                fill="currentColor"
                fontSize={9}
                textAnchor="middle"
                className="text-muted-foreground font-mono"
              >
                {pos.value}
              </text>
            )}
          </motion.g>
        );
      })}
    </g>
  );
}

export function SankeyTooltip() {
  const { data, nodePositions, hoveredNode } = useSankey();

  return (
    <AnimatePresence>
      {hoveredNode !== null && nodePositions[hoveredNode] && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute z-50 bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-xl text-xs font-sans min-w-[120px] pointer-events-none"
          style={{
            left: nodePositions[hoveredNode].x + 20,
            top: nodePositions[hoveredNode].y - 40,
          }}
        >
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Node Details</div>
          <div className="font-bold text-foreground">{data.nodes[hoveredNode].name}</div>
          <div className="font-mono text-muted-foreground mt-1">Weight: {nodePositions[hoveredNode].value}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
