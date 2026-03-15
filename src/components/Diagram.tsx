import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';

interface DiagramProps {
  type?: 'devops-loop' | 'cicd-flow' | 'aiops-cycle' | 'mlops-pipeline' | 'data-drift' | 'governance-dashboard' | 'concept-map' | 'aia-steps' | 'terraform-module';
  mermaid?: string;
  data?: any;
}

export const Diagram: React.FC<DiagramProps> = ({ type, mermaid, data }) => {
  const [tooltip, setTooltip] = useState<{ x: number, y: number, title: string, desc: string } | null>(null);

  return (
    <div className="w-full bg-white border border-slate-200 p-8 rounded-[2rem] overflow-hidden shadow-sm relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
            {mermaid ? 'Mermaid Diagram' : 'Interactive Visualization'}
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-100" />
          <div className="w-2 h-2 rounded-full bg-slate-100" />
          <div className="w-2 h-2 rounded-full bg-slate-100" />
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={type || mermaid}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.23, 1, 0.32, 1],
            opacity: { duration: 0.3 }
          }}
          className="w-full min-h-[300px] relative z-10 flex items-center justify-center"
        >
          <DiagramContent type={type} mermaid={mermaid} setTooltip={setTooltip} data={data} />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -120%)',
              zIndex: 100,
            }}
            className="pointer-events-none"
          >
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 max-w-[200px]">
              <div className="text-xs font-black uppercase tracking-widest mb-1 text-brand-400">{tooltip.title}</div>
              <div className="text-[10px] leading-relaxed text-slate-300 font-medium">{tooltip.desc}</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center relative z-10">
        Interactive Concept Map • Click for Details
      </div>
    </div>
  );
};

const DiagramContent: React.FC<{ type?: DiagramProps['type'], mermaid?: string, setTooltip: any, data?: any }> = ({ type, mermaid, setTooltip, data }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous content
    d3.select(containerRef.current).selectAll("*").remove();
    containerRef.current.innerHTML = '';

    if (mermaid) {
      import('mermaid').then((m) => {
        const mermaidLib = m.default;
        mermaidLib.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif',
        });
        
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        mermaidLib.render(id, mermaid).then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            // Make the SVG responsive
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) {
              svgElement.setAttribute('width', '100%');
              svgElement.setAttribute('height', '100%');
              svgElement.style.maxWidth = '100%';
            }
          }
        });
      });
      return;
    }

    if (!type) return;
    
    const width = containerRef.current.clientWidth;
    const height = 300;
    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible")
      .on("click", () => setTooltip(null)); // Close tooltip on background click

    if (type === 'devops-loop') {
      renderDevOpsLoop(svg, width, height);
    } else if (type === 'cicd-flow') {
      renderCICDFlow(svg, width, height);
    } else if (type === 'aiops-cycle') {
      renderAIOpsCycle(svg, width, height);
    } else if (type === 'mlops-pipeline') {
      renderMLOpsPipeline(svg, width, height);
    } else if (type === 'data-drift') {
      renderDataDrift(svg, width, height);
    } else if (type === 'concept-map') {
      renderConceptMap(svg, width, height, setTooltip, data);
    } else if (type === 'governance-dashboard') {
      renderGovernanceDashboard(svg, width, height);
    } else if (type === 'aia-steps') {
      renderAIASteps(svg, width, height, setTooltip);
    } else if (type === 'terraform-module') {
      renderTerraformModule(svg, width, height, setTooltip);
    }
  }, [type, setTooltip, data]);

  const renderTerraformModule = (svg: any, width: number, height: number, setTooltip: any) => {
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Main Module Box
    const moduleBox = g.append("rect")
      .attr("x", chartWidth * 0.25)
      .attr("y", 0)
      .attr("width", chartWidth * 0.5)
      .attr("height", chartHeight)
      .attr("rx", 20)
      .attr("fill", "white")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 10px 15px rgba(0,0,0,0.05))");

    g.append("text")
      .attr("x", chartWidth * 0.5)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("fill", "#1e293b")
      .text("Terraform Module");

    // Inputs (Variables)
    const inputs = ["Region", "Instance Type", "VPC ID"];
    inputs.forEach((input, i) => {
      const y = 80 + i * 50;
      
      // Arrow
      g.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", chartWidth * 0.25)
        .attr("y2", y)
        .attr("stroke", "#94a3b8")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

      g.append("text")
        .attr("x", 10)
        .attr("y", y - 10)
        .attr("font-size", "10px")
        .attr("fill", "#64748b")
        .text(input);
    });

    // Internal Resources
    const resources = ["EC2 Instance", "Security Group", "EBS Volume"];
    resources.forEach((res, i) => {
      const y = 80 + i * 50;
      g.append("rect")
        .attr("x", chartWidth * 0.3)
        .attr("y", y - 20)
        .attr("width", chartWidth * 0.4)
        .attr("height", 30)
        .attr("rx", 5)
        .attr("fill", "#f8fafc")
        .attr("stroke", "#e2e8f0");

      g.append("text")
        .attr("x", chartWidth * 0.5)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#475569")
        .text(res);
    });

    // Outputs
    const outputs = ["Public IP", "Instance ID"];
    outputs.forEach((output, i) => {
      const y = 100 + i * 60;
      
      // Arrow
      g.append("line")
        .attr("x1", chartWidth * 0.75)
        .attr("y1", y)
        .attr("x2", chartWidth)
        .attr("y2", y)
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead-green)");

      g.append("text")
        .attr("x", chartWidth - 10)
        .attr("y", y - 10)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("fill", "#059669")
        .text(output);
    });

    // Define Arrowheads
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    svg.append("defs").append("marker")
      .attr("id", "arrowhead-green")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#10b981");
  };

  const renderAIASteps = (svg: any, width: number, height: number, setTooltip: any) => {
    const steps = [
      { id: 1, title: "Stakeholders", icon: "👥", desc: "Identify all parties affected by the AI system's decisions, including vulnerable groups." },
      { id: 2, title: "Harm Assessment", icon: "⚠️", desc: "Analyze potential negative impacts: bias, privacy loss, financial harm, or safety risks." },
      { id: 3, title: "Mitigation", icon: "🛡️", desc: "Design and implement technical and procedural safeguards to reduce identified risks." },
      { id: 4, title: "Monitoring", icon: "📊", desc: "Establish continuous feedback loops to detect performance drift and new emerging risks." }
    ];

    const margin = { left: 60, right: 60 };
    const chartWidth = width - margin.left - margin.right;
    const stepWidth = chartWidth / (steps.length - 1);
    const centerY = height / 2;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, 0)`);

    // Draw connecting lines
    g.selectAll(".line")
      .data(steps.slice(0, -1))
      .enter()
      .append("line")
      .attr("x1", (d: any, i: number) => i * stepWidth)
      .attr("y1", centerY)
      .attr("x2", (d: any, i: number) => (i + 1) * stepWidth)
      .attr("y2", centerY)
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", "8,8");

    // Draw steps
    const stepNodes = g.selectAll(".step")
      .data(steps)
      .enter()
      .append("g")
      .attr("class", "step")
      .attr("transform", (d: any, i: number) => `translate(${i * stepWidth}, ${centerY})`)
      .style("cursor", "pointer")
      .on("mouseenter", (event: any, d: any) => {
        const [x, y] = d3.pointer(event, svg.node());
        setTooltip({ x, y: y - 20, title: d.title, desc: d.desc });
      })
      .on("mouseleave", () => setTooltip(null));

    stepNodes.append("circle")
      .attr("r", 35)
      .attr("fill", "white")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.05))");

    stepNodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "24px")
      .text((d: any) => d.icon);

    stepNodes.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 55)
      .attr("font-size", "10px")
      .attr("font-weight", "800")
      .attr("text-transform", "uppercase")
      .attr("letter-spacing", "0.1em")
      .attr("fill", "#64748b")
      .text((d: any) => d.title);

    // Add step numbers
    stepNodes.append("circle")
      .attr("cx", 25)
      .attr("cy", -25)
      .attr("r", 10)
      .attr("fill", "#4f46e5");

    stepNodes.append("text")
      .attr("x", 25)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text((d: any) => d.id);
  };

  const renderGovernanceDashboard = (svg: any, width: number, height: number) => {
    const margin = { top: 20, right: 40, bottom: 20, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    const widgets = [
      { title: "Model Development", value: "85%", color: "#4f46e5", icon: "🏗️", status: "Healthy", desc: "Current progress of active model training jobs." },
      { title: "Token Usage", value: "$1.2k", color: "#10b981", icon: "🪙", status: "On Track", desc: "Total token consumption costs across all LLM providers." },
      { title: "Security Risk", value: "Low", color: "#f43f5e", icon: "🛡️", status: "Secure", desc: "Real-time security posture based on prompt injection scans." },
      { title: "Bottlenecks", value: "2", color: "#f59e0b", icon: "🚦", status: "Warning", desc: "Identified performance issues in the inference pipeline." }
    ];

    const widgetWidth = (chartWidth - 40) / 2;
    const widgetHeight = (chartHeight - 40) / 2;

    widgets.forEach((widget, i) => {
      const x = (i % 2) * (widgetWidth + 40);
      const y = Math.floor(i / 2) * (widgetHeight + 40);

      const card = g.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this).select(".bg-rect")
            .transition().duration(200)
            .attr("stroke", widget.color)
            .attr("stroke-width", 2)
            .attr("transform", "translate(-2, -2)");
        })
        .on("mouseout", function() {
          d3.select(this).select(".bg-rect")
            .transition().duration(200)
            .attr("stroke", "#f1f5f9")
            .attr("stroke-width", 1)
            .attr("transform", "translate(0, 0)");
        })
        .on("click", (event: any) => {
          event.stopPropagation();
          setTooltip({ x: event.clientX, y: event.clientY, title: widget.title, desc: widget.desc });
        });

      card.append("rect")
        .attr("class", "bg-rect")
        .attr("width", widgetWidth)
        .attr("height", widgetHeight)
        .attr("rx", 20)
        .attr("fill", "white")
        .attr("stroke", "#f1f5f9")
        .attr("stroke-width", 1)
        .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.02))");

      card.append("text")
        .text(widget.icon)
        .attr("x", 20)
        .attr("y", 35)
        .attr("font-size", "20px");

      card.append("text")
        .text(widget.title)
        .attr("x", 50)
        .attr("y", 32)
        .attr("font-size", "11px")
        .attr("font-weight", "800")
        .attr("fill", "#64748b");

      card.append("text")
        .text(widget.value)
        .attr("x", 20)
        .attr("y", 75)
        .attr("font-size", "28px")
        .attr("font-weight", "900")
        .attr("fill", widget.color);

      const statusBadge = card.append("g")
        .attr("transform", `translate(20, 90)`);

      statusBadge.append("rect")
        .attr("width", 60)
        .attr("height", 18)
        .attr("rx", 9)
        .attr("fill", widget.color)
        .attr("opacity", 0.1);

      statusBadge.append("text")
        .text(widget.status)
        .attr("x", 30)
        .attr("y", 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("font-weight", "900")
        .attr("fill", widget.color);
        
      // Add a small sparkline-like element
      const sparklineData = d3.range(10).map(() => Math.random());
      const sx = d3.scaleLinear().domain([0, 9]).range([widgetWidth - 80, widgetWidth - 20]);
      const sy = d3.scaleLinear().domain([0, 1]).range([75, 45]);
      
      const sparkline = d3.line<number>()
        .x((_, i) => sx(i))
        .y(d => sy(d))
        .curve(d3.curveBasis);
        
      card.append("path")
        .datum(sparklineData)
        .attr("fill", "none")
        .attr("stroke", widget.color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.3)
        .attr("d", sparkline as any);
    });
  };

  const renderConceptMap = (svg: any, width: number, height: number, setTooltip: any, data?: any) => {
    const defaultNodes = [
      { id: 'core', x: width / 2, y: height / 2, label: 'Core Concept', desc: 'The central idea of this lesson.' },
      { id: 'n1', x: width / 2 - 120, y: height / 2 - 60, label: 'Strategy', desc: 'How we approach the problem.' },
      { id: 'n2', x: width / 2 + 120, y: height / 2 - 60, label: 'Tools', desc: 'The technology used.' },
      { id: 'n3', x: width / 2 - 120, y: height / 2 + 60, label: 'Impact', desc: 'The result of the action.' },
      { id: 'n4', x: width / 2 + 120, y: height / 2 + 60, label: 'Risk', desc: 'Potential downsides.' },
    ];

    const nodes = data?.nodes || defaultNodes;
    const links = data?.links || nodes.filter((n: any) => n.id !== 'core').map((n: any) => ({ source: 'core', target: n.id }));

  // Draw links
  svg.selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("x1", (d: any) => nodes.find(n => n.id === d.source)!.x)
    .attr("y1", (d: any) => nodes.find(n => n.id === d.source)!.y)
    .attr("x2", (d: any) => nodes.find(n => n.id === d.target)!.x)
    .attr("y2", (d: any) => nodes.find(n => n.id === d.target)!.y)
    .attr("stroke", "#e2e8f0")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4,4");

  // Draw nodes
  const nodeGroups = svg.selectAll("g")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`)
    .style("cursor", "pointer")
    .on("click", (event: any, d: any) => {
      event.stopPropagation();
      setTooltip({ x: event.clientX, y: event.clientY, title: d.label, desc: d.desc });
    });

  nodeGroups.append("circle")
    .attr("r", (d: any) => d.id === 'core' ? 40 : 30)
    .attr("fill", (d: any) => d.id === 'core' ? "#6366f1" : "white")
    .attr("stroke", "#6366f1")
    .attr("stroke-width", 2)
    .style("filter", "drop-shadow(0 4px 6px rgba(99, 102, 241, 0.1))");

  nodeGroups.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .attr("fill", (d: any) => d.id === 'core' ? "white" : "#1e293b")
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .text((d: any) => d.label);

  // Animation
  nodeGroups.style("opacity", 0)
    .transition()
    .duration(800)
    .delay((d: any, i: number) => i * 100)
    .style("opacity", 1);
};

const renderDevOpsLoop = (svg: any, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 60;
    const offset = 50;

    const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    // Infinity loop path
    const path = "M -50,0 C -50,-60 50,-60 50,0 C 50,60 -50,60 -50,0 Z M 50,0 C 50,-60 150,-60 150,0 C 150,60 50,60 50,0 Z";
    
    // Adjust path to center it better
    const loopPath = `M -100,0 C -100,-80 0,-80 0,0 C 0,80 -100,80 -100,0 Z M 0,0 C 0,-80 100,-80 100,0 C 100,80 0,80 0,0 Z`;

    g.append("path")
      .attr("d", loopPath)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .style("opacity", 0.2);

    const stages = [
      { name: "Plan", x: -80, y: -40, color: "#4f46e5", desc: "Define project requirements and roadmap." },
      { name: "Code", x: -110, y: 0, color: "#6366f1", desc: "Write and review application code." },
      { name: "Build", x: -80, y: 40, color: "#818cf8", desc: "Compile code and create artifacts." },
      { name: "Test", x: -30, y: 20, color: "#a5b4fc", desc: "Run automated tests for quality assurance." },
      { name: "Release", x: 30, y: -20, color: "#10b981", desc: "Prepare the artifact for deployment." },
      { name: "Deploy", x: 80, y: -40, color: "#059669", desc: "Push the artifact to target environments." },
      { name: "Operate", x: 110, y: 0, color: "#047857", desc: "Manage the application in production." },
      { name: "Monitor", x: 80, y: 40, color: "#065f46", desc: "Track performance and user feedback." },
    ];

    stages.forEach((stage, i) => {
      const node = g.append("g")
        .attr("transform", `translate(${stage.x}, ${stage.y})`);

      node.append("circle")
        .attr("r", 25)
        .attr("fill", "white")
        .attr("stroke", stage.color)
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this).transition().duration(200)
            .attr("fill", stage.color)
            .attr("stroke", "white")
            .attr("r", 30);
          d3.select(this.parentNode).select("text").transition().duration(200)
            .attr("fill", "white")
            .attr("font-size", "10px");
        })
        .on("mouseout", function() {
          d3.select(this).transition().duration(200)
            .attr("fill", "white")
            .attr("stroke", stage.color)
            .attr("r", 25);
          d3.select(this.parentNode).select("text").transition().duration(200)
            .attr("fill", "#1e293b")
            .attr("font-size", "9px");
        })
        .on("click", (event: any) => {
          event.stopPropagation();
          setTooltip({ x: event.clientX, y: event.clientY, title: stage.name, desc: stage.desc });
        });

      node.append("text")
        .text(stage.name)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", "9px")
        .attr("font-weight", "700")
        .attr("pointer-events", "none")
        .attr("fill", "#1e293b");
    });

    // Center "DevOps" text
    g.append("text")
      .text("DEVOPS")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "14px")
      .attr("font-weight", "900")
      .attr("letter-spacing", "3px")
      .attr("fill", "#4f46e5");
  };

  const renderCICDFlow = (svg: any, width: number, height: number) => {
    const stages = [
      { name: "Source", icon: "📝", desc: "Code Commit", color: "#4f46e5" },
      { name: "Build", icon: "🏗️", desc: "Compile & Package", color: "#6366f1" },
      { name: "Test", icon: "🧪", desc: "Unit & Integration", color: "#8b5cf6" },
      { name: "Deploy", icon: "🚀", desc: "Staging/Prod", color: "#10b981" },
      { name: "Monitor", icon: "📊", desc: "Health Checks", color: "#059669" }
    ];
    const stepWidth = width / (stages.length + 1);
    const centerY = height / 2;

    const g = svg.append("g");

    // Define arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    stages.forEach((stage, i) => {
      const x = stepWidth * (i + 1);
      
      // Arrow
      if (i < stages.length - 1) {
        const line = g.append("line")
          .attr("x1", x + 40)
          .attr("y1", centerY)
          .attr("x2", x + stepWidth - 40)
          .attr("y2", centerY)
          .attr("stroke", "#cbd5e1")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4")
          .attr("marker-end", "url(#arrowhead)");

        // Animate flow
        const animateFlow = () => {
          line.attr("stroke-dashoffset", 16)
            .transition()
            .duration(1500)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .on("end", animateFlow);
        };
        animateFlow();
      }

      const node = g.append("g")
        .attr("transform", `translate(${x}, ${centerY})`);

      // Node background
      const rect = node.append("rect")
        .attr("x", -40)
        .attr("y", -30)
        .attr("width", 80)
        .attr("height", 60)
        .attr("fill", "white")
        .attr("stroke", stage.color)
        .attr("stroke-width", 2)
        .attr("rx", 12)
        .style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this).interrupt().transition().duration(200)
            .attr("fill", stage.color)
            .attr("stroke-width", 3)
            .attr("x", -45)
            .attr("y", -35)
            .attr("width", 90)
            .attr("height", 70);
          d3.select(this.parentNode).selectAll("text").transition().duration(200).attr("fill", "white");
          d3.select(this.parentNode).select(".desc").transition().duration(200).style("opacity", 1);
        })
        .on("mouseout", function() {
          d3.select(this).transition().duration(200)
            .attr("fill", "white")
            .attr("stroke-width", 2)
            .attr("x", -40)
            .attr("y", -30)
            .attr("width", 80)
            .attr("height", 60);
          d3.select(this.parentNode).selectAll("text").transition().duration(200).attr("fill", "#1e293b");
          d3.select(this.parentNode).select(".desc").transition().duration(200).style("opacity", 0.5);
          pulse();
        })
        .on("click", (event: any) => {
          event.stopPropagation();
          setTooltip({ x: event.clientX, y: event.clientY, title: stage.name, desc: stage.desc });
        });

      // Subtle pulse animation
      const pulse = () => {
        rect.transition()
          .duration(2000 + Math.random() * 1000)
          .attr("stroke-opacity", 0.4)
          .attr("stroke-width", 4)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .attr("stroke-opacity", 1)
          .attr("stroke-width", 2)
          .on("end", pulse);
      };
      pulse();

      // Icon
      node.append("text")
        .text(stage.icon)
        .attr("text-anchor", "middle")
        .attr("y", -10)
        .attr("font-size", "18px");

      // Stage Name
      node.append("text")
        .text(stage.name)
        .attr("text-anchor", "middle")
        .attr("y", 12)
        .attr("font-size", "11px")
        .attr("font-weight", "800")
        .attr("fill", "#1e293b")
        .attr("pointer-events", "none");

      // Description
      node.append("text")
        .attr("class", "desc")
        .text(stage.desc)
        .attr("text-anchor", "middle")
        .attr("y", 24)
        .attr("font-size", "8px")
        .attr("opacity", 0.5)
        .attr("fill", "#1e293b")
        .attr("pointer-events", "none");
    });

    // Feedback Loop
    const firstX = stepWidth;
    const lastX = stepWidth * stages.length;
    
    g.append("path")
      .attr("d", `M ${lastX},${centerY + 30} C ${lastX},${centerY + 80} ${firstX},${centerY + 80} ${firstX},${centerY + 30}`)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0.2);

    g.append("text")
      .text("CONTINUOUS FEEDBACK")
      .attr("x", width / 2)
      .attr("y", centerY + 90)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("font-weight", "800")
      .attr("letter-spacing", "2px")
      .attr("fill", "#4f46e5")
      .attr("opacity", 0.4);
  };

  const renderAIOpsCycle = (svg: any, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 90;

    const g = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    const stages = [
      { name: "Observe", icon: "👁️", angle: 0, desc: "Data Collection" },
      { name: "Engage", icon: "🤝", angle: 120, desc: "Analysis & Collab" },
      { name: "Act", icon: "⚡", angle: 240, desc: "Auto-Remediation" },
    ];

    // Define arrow marker for the cycle
    svg.append("defs").append("marker")
      .attr("id", "cycle-arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#4f46e5")
      .style("opacity", 0.3);

    // Connecting arcs
    g.append("circle")
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0.1);

    // Draw arrows between stages
    stages.forEach((stage, i) => {
      const nextStage = stages[(i + 1) % stages.length];
      const startAngle = (stage.angle - 90 + 25) * (Math.PI / 180);
      const endAngle = (nextStage.angle - 90 - 25) * (Math.PI / 180);
      
      const arcGenerator = d3.arc()
        .innerRadius(radius)
        .outerRadius(radius)
        .startAngle(startAngle + Math.PI/2)
        .endAngle(endAngle + Math.PI/2);

      g.append("path")
        .attr("d", arcGenerator({} as any))
        .attr("fill", "none")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#cycle-arrow)")
        .style("opacity", 0.3);
    });

    // Add a subtle rotation to the group of nodes
    const nodesGroup = g.append("g");

    stages.forEach((stage) => {
      const rad = (stage.angle - 90) * (Math.PI / 180);
      const x = radius * Math.cos(rad);
      const y = radius * Math.sin(rad);

      const node = nodesGroup.append("g")
        .attr("transform", `translate(${x}, ${y})`);

      const circle = node.append("circle")
        .attr("r", 38)
        .attr("fill", "white")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this).transition().duration(200)
            .attr("fill", "#4f46e5")
            .attr("r", 45);
          d3.select(this.parentNode).selectAll("text").transition().duration(200).attr("fill", "white");
          d3.select(this.parentNode).select(".desc").transition().duration(200).style("opacity", 1);
        })
        .on("mouseout", function() {
          d3.select(this).transition().duration(200)
            .attr("fill", "white")
            .attr("r", 38);
          d3.select(this.parentNode).selectAll("text").transition().duration(200).attr("fill", "#1e293b");
          d3.select(this.parentNode).select(".desc").transition().duration(200).style("opacity", 0.5);
        })
        .on("click", (event: any) => {
          event.stopPropagation();
          setTooltip({ x: event.clientX, y: event.clientY, title: stage.name, desc: stage.desc });
        });

      // Orbit animation
      const orbit = () => {
        node.transition()
          .duration(10000 + Math.random() * 5000)
          .ease(d3.easeLinear)
          .attrTween("transform", function() {
            return function(t) {
              const currentAngle = stage.angle + t * 360;
              const r = (currentAngle - 90) * (Math.PI / 180);
              const nx = radius * Math.cos(r);
              const ny = radius * Math.sin(r);
              return `translate(${nx}, ${ny})`;
            };
          })
          .on("end", orbit);
      };
      // orbit(); // Disabled for now to keep it readable, but can be enabled if requested

      node.append("text")
        .text(stage.icon)
        .attr("text-anchor", "middle")
        .attr("y", -8)
        .attr("font-size", "18px");

      node.append("text")
        .text(stage.name)
        .attr("text-anchor", "middle")
        .attr("y", 12)
        .attr("font-size", "11px")
        .attr("font-weight", "800")
        .attr("fill", "#1e293b")
        .attr("pointer-events", "none");

      node.append("text")
        .attr("class", "desc")
        .text(stage.desc)
        .attr("text-anchor", "middle")
        .attr("y", 24)
        .attr("font-size", "8px")
        .attr("opacity", 0.5)
        .attr("fill", "#1e293b")
        .attr("pointer-events", "none");
    });

    // Center AI Core
    const core = g.append("g");
    
    const coreCircle = core.append("circle")
      .attr("r", 28)
      .attr("fill", "#4f46e5")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 0 8px rgba(79,70,229,0.4))");

    // Breathing animation for AI Core
    const breathe = () => {
      coreCircle.transition()
        .duration(2000)
        .attr("r", 32)
        .style("filter", "drop-shadow(0 0 15px rgba(79,70,229,0.6))")
        .transition()
        .duration(2000)
        .attr("r", 28)
        .style("filter", "drop-shadow(0 0 8px rgba(79,70,229,0.4))")
        .on("end", breathe);
    };
    breathe();
    
    core.append("text")
      .text("AI")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.1em")
      .attr("fill", "white")
      .attr("font-size", "14px")
      .attr("font-weight", "900")
      .attr("letter-spacing", "1px");

    core.append("text")
      .text("CORE")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", "white")
      .attr("font-size", "7px")
      .attr("font-weight", "900")
      .attr("opacity", 0.8);
  };

  const renderMLOpsPipeline = (svg: any, width: number, height: number) => {
    const stages = [
      { name: "Data", desc: "Data ingestion and preprocessing." },
      { name: "Train", desc: "Model training and hyperparameter tuning." },
      { name: "Evaluate", desc: "Model validation and performance testing." },
      { name: "Deploy", desc: "Serving the model as an API." },
      { name: "Monitor", desc: "Tracking drift and performance in production." }
    ];
    const stepWidth = width / (stages.length + 1);
    const centerY = height / 2;

    const g = svg.append("g");

    stages.forEach((stage, i) => {
      const x = stepWidth * (i + 1);
      
      // Connection
      if (i < stages.length - 1) {
        g.append("line")
          .attr("x1", x + 30)
          .attr("y1", centerY)
          .attr("x2", x + stepWidth - 30)
          .attr("y2", centerY)
          .attr("stroke", "#cbd5e1")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4");
      }

      const node = g.append("g")
        .attr("transform", `translate(${x}, ${centerY})`);

      node.append("polygon")
        .attr("points", "-35,-20 35,-20 45,0 35,20 -35,20 -45,0")
        .attr("fill", "white")
        .attr("stroke", "#4f46e5")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function() {
          d3.select(this).transition().duration(200)
            .attr("fill", "#4f46e5")
            .attr("transform", "scale(1.15)");
          d3.select(this.parentNode).select("text").transition().duration(200)
            .attr("fill", "white")
            .attr("font-size", "11px");
        })
        .on("mouseout", function() {
          d3.select(this).transition().duration(200)
            .attr("fill", "white")
            .attr("transform", "scale(1)");
          d3.select(this.parentNode).select("text").transition().duration(200)
            .attr("fill", "#1e293b")
            .attr("font-size", "9px");
        })
        .on("click", (event: any) => {
          event.stopPropagation();
          setTooltip({ x: event.clientX, y: event.clientY, title: stage.name, desc: stage.desc });
        });

      node.append("text")
        .text(stage.name)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", "9px")
        .attr("font-weight", "800")
        .attr("fill", "#1e293b")
        .attr("pointer-events", "none");
    });

    // Feedback loop
    const lastX = stepWidth * stages.length;
    const firstX = stepWidth;
    
    const arc = d3.arc()
      .innerRadius(60)
      .outerRadius(61)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", `M ${lastX},${centerY + 25} C ${lastX},${centerY + 60} ${firstX},${centerY + 60} ${firstX},${centerY + 25}`)
      .attr("fill", "none")
      .attr("stroke", "#141414")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .style("opacity", 0.5);
    
    g.append("text")
      .text("Retrain Loop")
      .attr("x", width / 2)
      .attr("y", centerY + 75)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("font-style", "italic")
      .attr("opacity", 0.5);
  };

  const renderDataDrift = (svg: any, width: number, height: number) => {
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const centerY = height / 2;

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const x = d3.scaleLinear().domain([0, 10]).range([0, chartWidth]);
    const y = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0]);

    // Normal distribution curves
    const normal = (x: number, mu: number, sigma: number) => {
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    };

    const line = d3.line()
      .x((d: any) => x(d.x))
      .y((d: any) => y(d.y))
      .curve(d3.curveBasis);

    const data1 = d3.range(0, 10, 0.1).map(v => ({ x: v, y: normal(v, 4, 1) }));
    const data2 = d3.range(0, 10, 0.1).map(v => ({ x: v, y: normal(v, 7, 1.2) }));

    // Training Data Curve
    g.append("path")
      .datum(data1)
      .attr("fill", "#4f46e5")
      .attr("fill-opacity", 0.1)
      .attr("stroke", "#4f46e5")
      .attr("stroke-width", 3)
      .attr("d", line);

    g.append("text")
      .attr("x", x(4))
      .attr("y", y(0.45))
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .attr("fill", "#4f46e5")
      .text("Training Data");

    // Production Data Curve (Drifted)
    g.append("path")
      .datum(data2)
      .attr("fill", "#f43f5e")
      .attr("fill-opacity", 0.05)
      .attr("stroke", "#f43f5e")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "6,4")
      .attr("opacity", 0.6)
      .attr("d", line);

    g.append("text")
      .attr("x", x(7))
      .attr("y", y(0.35))
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .attr("fill", "#f43f5e")
      .attr("opacity", 0.7)
      .text("Production Data (Drifted)");

    // Drift Arrow
    g.append("line")
      .attr("x1", x(4.5))
      .attr("y1", centerY - 50)
      .attr("x2", x(6.5))
      .attr("y2", centerY - 50)
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    g.append("text")
      .attr("x", x(5.5))
      .attr("y", centerY - 65)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "900")
      .attr("fill", "#1e293b")
      .attr("letter-spacing", "2px")
      .text("DRIFT");

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x).ticks(0));
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(0));
  };

  return <div ref={containerRef} className="w-full h-[300px] relative z-10" />;
};
