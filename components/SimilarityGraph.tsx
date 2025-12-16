import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Translation, SimulationNode, SimulationLink } from '../types';
import { ZoomIn, ZoomOut, RefreshCw, Maximize } from 'lucide-react';

interface SimilarityGraphProps {
  data: Translation[];
  sourceWord: string;
  isDarkMode?: boolean;
}

const SimilarityGraph: React.FC<SimilarityGraphProps> = ({ data, sourceWord, isDarkMode = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Helper to identify key languages
  const isKeyLanguage = (lang: string) => {
    const l = lang.toLowerCase();
    return l.includes('egypt') || l.includes('coptic') || l.includes('kemetic');
  };

  const isManding = (lang: string) => {
    const l = lang.toLowerCase();
    return l.includes('bambara') || l.includes('manding') || l.includes('dioula') || l.includes('malinke');
  };

  // Prepare graph data
  const graphData = useMemo(() => {
    const nodes: SimulationNode[] = [
      { id: 'ROOT', group: 0, family: 'Source', language: 'Source', word: sourceWord, r: 45 }
    ];
    
    // Create nodes
    data.forEach((t, i) => {
      let r = 18; // Base size
      if (isKeyLanguage(t.language)) r = 35; // Egyptian/Coptic larger
      if (isManding(t.language)) r = 30; // Bambara larger

      nodes.push({
        id: `node-${i}`,
        group: t.similarityGroup,
        family: t.family,
        language: t.language,
        word: t.translatedWord,
        r: r
      });
    });

    const links: SimulationLink[] = [];

    // 1. Link everything to ROOT (Gravity) - Weak links
    data.forEach((t, i) => {
       links.push({ source: 'ROOT', target: `node-${i}`, value: 1 });
    });

    // 2. Intra-cluster links (High Density)
    // Link nodes within the same similarityGroup strongly
    const nodesByGroup = new Map<number, string[]>();
    data.forEach((t, i) => {
      const g = t.similarityGroup;
      if (!nodesByGroup.has(g)) nodesByGroup.set(g, []);
      nodesByGroup.get(g)?.push(`node-${i}`);
    });

    nodesByGroup.forEach((ids, group) => {
      // Connect all nodes in group to the first node in the group (Star topology for cluster)
      if (ids.length > 1) {
        const centerId = ids[0]; 
        for (let k = 1; k < ids.length; k++) {
          links.push({ source: centerId, target: ids[k], value: 8 }); // Strong value for cognates
        }
        // Also add some random cross links for organic shape
        for (let k = 0; k < ids.length - 1; k++) {
           links.push({ source: ids[k], target: ids[k+1], value: 4 });
        }
      }
    });

    return { nodes, links };
  }, [data, sourceWord]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || graphData.nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = 600; // Intrinsic height

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Group for zoom content
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });
    
    zoomBehavior.current = zoom;
    svg.call(zoom);

    // Initial center transform
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    // Force Simulation
    const simulation = d3.forceSimulation<SimulationNode>(graphData.nodes)
      .force("link", d3.forceLink<SimulationNode, SimulationLink>(graphData.links)
        .id(d => d.id)
        .distance(d => d.value > 5 ? 40 : 250) // Short distance for cognates, Long for Root connection
        .strength(d => d.value > 5 ? 0.8 : 0.05) // Weak pull to center, strong pull to cognates
      )
      .force("charge", d3.forceManyBody().strength(-350)) // Strong repulsion to spread clusters
      .force("collide", d3.forceCollide().radius(d => (d.r || 20) + 10).iterations(2))
      .force("x", d3.forceX().strength(0.04))
      .force("y", d3.forceY().strength(0.04));

    // Draw Links
    const link = g.append("g")
      .attr("stroke", isDarkMode ? "#719cb9" : "#d0b380")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Draw Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(graphData.nodes)
      .join("g")
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node Circles
    node.append("circle")
      .attr("r", d => d.r || 20)
      .attr("fill", d => {
        if (d.id === 'ROOT') return isDarkMode ? '#163040' : '#5a412c'; // Dark Earth
        if (isKeyLanguage(d.language)) return isDarkMode ? '#2a7f87' : '#1e4d68'; // Egypt Blue/Teal
        if (isManding(d.language)) return '#9c4332'; // Clay/Red
        return colorScale(String(d.group));
      })
      .attr("stroke", d => {
        if (isKeyLanguage(d.language)) return "#c59a5b"; // Gold stroke
        return isDarkMode ? "#0d1d26" : "#fff";
      })
      .attr("stroke-width", d => isKeyLanguage(d.language) ? 4 : 2)
      .attr("class", "cursor-pointer transition-all shadow-lg");

    // Labels
    node.append("text")
      .text(d => d.id === 'ROOT' ? d.word.toUpperCase() : d.word)
      .attr("dy", d => (d.r || 20) + 12)
      .attr("text-anchor", "middle")
      .attr("class", d => `
        font-sans font-bold pointer-events-none 
        ${d.id === 'ROOT' ? 'text-lg tracking-widest' : 'text-[10px]'}
        ${isKeyLanguage(d.language) ? 'text-sm uppercase' : ''}
      `)
      .attr("fill", d => {
          if (isKeyLanguage(d.language)) return isDarkMode ? '#c59a5b' : '#1e4d68';
          return isDarkMode ? '#cddce6' : '#5a412c';
      })
      .style("text-shadow", isDarkMode ? "0px 1px 3px rgba(0,0,0,0.9)" : "0px 1px 3px rgba(255,255,255,0.8)");
      
    // Language Labels (Smaller under word)
    node.append("text")
      .text(d => d.id === 'ROOT' ? '' : d.language)
      .attr("dy", d => (d.r || 20) + 24)
      .attr("text-anchor", "middle")
      .attr("class", "text-[8px] font-serif uppercase tracking-wider pointer-events-none")
      .attr("fill", isDarkMode ? "#719cb9" : "#c59a5b");


    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as SimulationNode).x!)
        .attr("y1", d => (d.source as SimulationNode).y!)
        .attr("x2", d => (d.target as SimulationNode).x!)
        .attr("y2", d => (d.target as SimulationNode).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: SimulationNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: SimulationNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: SimulationNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [graphData, isDarkMode]); // Added isDarkMode dependency

  const handleResetZoom = () => {
    if (!svgRef.current || !containerRef.current || !zoomBehavior.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = 600;
    
    svg.transition().duration(750).call(
      zoomBehavior.current.transform, 
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
    );
  };

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehavior.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehavior.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.current.scaleBy, 0.7);
  };

  return (
    <div className={`relative w-full h-[600px] rounded-xl border shadow-inner overflow-hidden group transition-colors ${isDarkMode ? 'bg-night-900 border-night-700' : 'bg-papyrus-50 border-papyrus-200'}`}>
       <div className={`absolute top-4 left-4 z-10 backdrop-blur-sm p-4 rounded-lg border text-xs shadow-sm max-w-[200px] transition-colors ${isDarkMode ? 'bg-night-800/90 border-night-600 text-night-200' : 'bg-white/90 border-papyrus-200 text-papyrus-800'}`}>
        <h4 className={`font-display font-bold mb-2 ${isDarkMode ? 'text-egypt-teal' : 'text-egypt-blue'}`}>Map Legend</h4>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-[#163040]' : 'bg-[#5a412c]'}`}></div>
          <span>Root Concept</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full border-2 ${isDarkMode ? 'bg-[#2a7f87] border-[#c59a5b]' : 'bg-[#1e4d68] border-[#c59a5b]'}`}></div>
          <span>Egyptian / Coptic</span>
        </div>
         <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#9c4332]"></div>
          <span>Bambara / Manding</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Cognate Clusters</span>
        </div>
        <div className={`mt-3 pt-2 border-t text-[10px] italic ${isDarkMode ? 'border-night-700 text-night-400' : 'border-papyrus-200 text-papyrus-500'}`}>
          <p>Scroll or pinch to zoom. Drag to pan.</p>
          <p>Clusters indicate sound mutations.</p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn} className={`p-2 rounded-full border shadow-sm transition-colors ${isDarkMode ? 'bg-night-800 border-night-600 text-night-200 hover:bg-night-700' : 'bg-white border-papyrus-300 text-papyrus-700 hover:bg-papyrus-100'}`} title="Zoom In">
          <ZoomIn size={18} />
        </button>
        <button onClick={handleZoomOut} className={`p-2 rounded-full border shadow-sm transition-colors ${isDarkMode ? 'bg-night-800 border-night-600 text-night-200 hover:bg-night-700' : 'bg-white border-papyrus-300 text-papyrus-700 hover:bg-papyrus-100'}`} title="Zoom Out">
          <ZoomOut size={18} />
        </button>
        <button onClick={handleResetZoom} className={`p-2 rounded-full border shadow-sm transition-colors ${isDarkMode ? 'bg-night-800 border-night-600 text-night-200 hover:bg-night-700' : 'bg-white border-papyrus-300 text-papyrus-700 hover:bg-papyrus-100'}`} title="Reset View">
          <RefreshCw size={18} />
        </button>
      </div>
      
      <div ref={containerRef} className="w-full h-full cursor-move active:cursor-grabbing">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  );
};

export default SimilarityGraph;