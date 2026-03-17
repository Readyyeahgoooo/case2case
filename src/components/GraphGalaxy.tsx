import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { GraphData, GraphNode } from '../data/hkCaseLaws';
import * as THREE from 'three';

interface GraphGalaxyProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onBackgroundClick: () => void;
  highlightNodes: Set<string>;
}

export default function GraphGalaxy({ data, onNodeClick, onBackgroundClick, highlightNodes }: GraphGalaxyProps) {
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

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

  const nodeThreeObject = useCallback((node: any) => {
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
    const color = getNodeColor(node);
    
    // Create a group to hold the sphere and the glow
    const group = new THREE.Group();

    // Core sphere
    const geometry = new THREE.SphereGeometry(node.val / 2, 16, 16);
    const material = new THREE.MeshLambertMaterial({ 
      color,
      transparent: true,
      opacity: isHighlighted ? 0.9 : 0.2,
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // Add a glow effect if highlighted
    if (isHighlighted) {
      const glowGeometry = new THREE.SphereGeometry((node.val / 2) * 1.4, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);
    }

    return group;
  }, [getNodeColor, highlightNodes]);

  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node as GraphNode);
    
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    }
  }, [onNodeClick]);

  const getLinkColor = (link: any) => {
    switch (link.linkType) {
      case 'citation': return 'rgba(239, 68, 68, 0.6)'; // red-500 (solid line)
      case 'hierarchy': return 'rgba(16, 185, 129, 0.3)'; // emerald-500 (faded)
      case 'thematic': return 'rgba(255, 255, 255, 0.1)'; // white (blurred)
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  };

  const getLinkWidth = (link: any) => {
    switch (link.linkType) {
      case 'citation': return 2;
      case 'hierarchy': return 1;
      case 'thematic': return 0.5;
      default: return 1;
    }
  };

  const getLinkDirectionalParticles = (link: any) => {
    switch (link.linkType) {
      case 'citation': return 3;
      case 'hierarchy': return 1;
      case 'thematic': return 0;
      default: return 0;
    }
  };

  return (
    <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="name"
        nodeThreeObject={nodeThreeObject}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkDirectionalParticles={getLinkDirectionalParticles}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={(link: any) => link.linkType === 'citation' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.5)'}
        onNodeClick={handleNodeClick}
        onBackgroundClick={onBackgroundClick}
        backgroundColor="#020617" // slate-950
        showNavInfo={false}
      />
    </div>
  );
}
