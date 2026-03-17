import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { GraphData, GraphNode } from '../data/hkCaseLaws';
import * as THREE from 'three';

interface GraphGalaxyProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onBackgroundClick: () => void;
  highlightNodes: Set<string>;
  filterNodeIds: Set<string> | null;
}

// Create a text sprite for node labels
function createTextSprite(text: string, color: string, fontSize: number = 3): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas size
  const scale = 4;
  canvas.width = 512 * scale;
  canvas.height = 64 * scale;
  
  ctx.scale(scale, scale);
  ctx.font = `500 ${fontSize * 4}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw text with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 32, 500);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(40, 5, 1);
  
  return sprite;
}

// Abbreviate case name for label
function abbreviateName(name: string, type: string): string {
  if (type !== 'case') return name;
  // Remove common words and shorten
  return name
    .replace(/\s*\[.*?\]\s*/g, '')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/ v /g, ' v. ')
    .trim()
    .substring(0, 30);
}

export default function GraphGalaxy({ data, onNodeClick, onBackgroundClick, highlightNodes, filterNodeIds }: GraphGalaxyProps) {
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Filter graph data based on filterNodeIds
  const filteredData = useMemo(() => {
    if (!filterNodeIds || filterNodeIds.size === 0) return data;
    
    // Include the filtered nodes plus their connected topic/tag nodes
    const visibleNodeIds = new Set(filterNodeIds);
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      if (visibleNodeIds.has(sourceId)) visibleNodeIds.add(targetId);
      if (visibleNodeIds.has(targetId)) visibleNodeIds.add(sourceId);
    });

    return {
      nodes: data.nodes.filter(n => visibleNodeIds.has(n.id)),
      links: data.links.filter(l => {
        const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
      }),
    };
  }, [data, filterNodeIds]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNodeColor = useCallback((node: GraphNode) => {
    if (highlightNodes.size > 0) {
      return highlightNodes.has(node.id) ? getNodeBaseColor(node) : 'rgba(255,255,255,0.05)';
    }
    return getNodeBaseColor(node);
  }, [highlightNodes]);

  const getNodeBaseColor = (node: GraphNode) => {
    switch (node.type) {
      case 'case': return '#3b82f6'; // blue-500
      case 'topic': return '#10b981'; // emerald-500
      case 'tag': return '#a855f7'; // purple-500
      default: return '#ffffff';
    }
  };

  const getNodeSize = (node: GraphNode) => {
    // Court hierarchy sizing for cases
    if (node.type === 'case' && node.metadata?.court) {
      switch (node.metadata.court) {
        case 'CFA': return node.val * 1.4;
        case 'PC': return node.val * 1.3;
        case 'CA': return node.val * 1.1;
        default: return node.val;
      }
    }
    return node.val;
  };

  const nodeThreeObject = useCallback((node: any) => {
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
    const color = getNodeColor(node);
    const size = getNodeSize(node);
    
    const group = new THREE.Group();

    // Core sphere
    const geometry = new THREE.SphereGeometry(size / 2, 16, 16);
    const material = new THREE.MeshLambertMaterial({ 
      color,
      transparent: true,
      opacity: isHighlighted ? 0.9 : 0.15,
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // Add a glow effect if highlighted
    if (isHighlighted) {
      const glowGeometry = new THREE.SphereGeometry((size / 2) * 1.4, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);
    }

    // Add text label
    if (isHighlighted) {
      const labelColor = node.type === 'case' ? '#93c5fd' :
                         node.type === 'topic' ? '#6ee7b7' : '#c4b5fd';
      const label = createTextSprite(
        abbreviateName(node.name, node.type),
        labelColor,
        node.type === 'topic' ? 3.5 : 3
      );
      label.position.y = (size / 2) + 6;
      group.add(label);
    }

    return group;
  }, [getNodeColor, highlightNodes]);

  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node as GraphNode);
    
    const distance = 40;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        3000
      );
    }
  }, [onNodeClick]);

  // Public method to navigate to a specific node
  useEffect(() => {
    (window as any).__graphNavigateToNode = (nodeId: string) => {
      const node = filteredData.nodes.find(n => n.id === nodeId);
      if (node && node.x !== undefined && fgRef.current) {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x!, node.y!, node.z!);
        fgRef.current.cameraPosition(
          { x: node.x! * distRatio, y: node.y! * distRatio, z: node.z! * distRatio },
          node,
          2000
        );
      }
    };
    return () => { delete (window as any).__graphNavigateToNode; };
  }, [filteredData]);

  const getLinkColor = (link: any) => {
    switch (link.linkType) {
      case 'citation': return 'rgba(239, 68, 68, 0.6)';
      case 'hierarchy': return 'rgba(16, 185, 129, 0.25)';
      case 'thematic': return 'rgba(255, 255, 255, 0.08)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  };

  const getLinkWidth = (link: any) => {
    switch (link.linkType) {
      case 'citation': return 2;
      case 'hierarchy': return 1;
      case 'thematic': return 0.3;
      default: return 1;
    }
  };

  const getLinkCurvature = (link: any) => {
    switch (link.linkType) {
      case 'citation': return 0;
      case 'hierarchy': return 0.1;
      case 'thematic': return 0.3;
      default: return 0;
    }
  };

  const getLinkDirectionalParticles = (link: any) => {
    switch (link.linkType) {
      case 'citation': return 4;
      case 'hierarchy': return 1;
      case 'thematic': return 0;
      default: return 0;
    }
  };

  return (
    <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={filteredData}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="name"
        nodeThreeObject={nodeThreeObject}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkCurvature={getLinkCurvature}
        linkDirectionalParticles={getLinkDirectionalParticles}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.008}
        linkDirectionalParticleColor={(link: any) => link.linkType === 'citation' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.5)'}
        onNodeClick={handleNodeClick}
        onBackgroundClick={onBackgroundClick}
        backgroundColor="#020617"
        showNavInfo={false}
        linkLabel={(link: any) => link.linkType === 'citation' ? link.label : ''}
      />
    </div>
  );
}
