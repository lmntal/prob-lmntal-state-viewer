import * as React from "react";
import Cytoscape from "cytoscape";
import type { HeadFC, PageProps } from "gatsby";

const IndexPage: React.FC<PageProps> = () => {
  const [inputData, setInputData] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputData(event.target.value);
  };

  const handleRenderGraph = () => {
    if (!containerRef.current) return;

    const lines = inputData.trim().split("\n");
    const [n, t] = lines[0].split(" ").map(Number);
    const transitions = lines.slice(1, t + 1);
    const states = lines.slice(t + 1);

    const elements = [];

    // Add nodes
    states.forEach(state => {
      const match = state.match(/^\S+/);
      if (match) {
        const [_, id, label] = state.match(/^(\S+)\s+(.+)$/) || [];
        elements.push({
          data: { id, label },
        });
      }
    });

    // Add edges
    transitions.forEach(transition => {
      const [source, target, , label] = transition.split(" ", 4);
      elements.push({
        data: { source, target, label },
      });
    });

    // Initialize Cytoscape
    Cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0074D9",
            label: "data(id)", // Display state ID as the label
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "line-color": "#FF4136",
            "target-arrow-color": "#FF4136",
            label: "data(label)",
          },
        },
        {
          selector: "node:selected",
          style: {
            "background-color": "#FF851B",
            label: "data(label)", // Display state label when clicked
          },
        },
      ],
      layout: {
        name: "breadthfirst",
        directed: true,
        padding: 10,
      },
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "30%", padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h2>lmntal state viewer</h2>
        <textarea
          style={{ width: "100%", height: "70%" }}
          value={inputData}
          onChange={handleInputChange}
        />
        <button style={{ marginTop: "1rem" }} onClick={handleRenderGraph}>
          グラフを描画
        </button>
      </div>
      <div ref={containerRef} style={{ flex: 1 }}></div>
    </div>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>状態遷移グラフ</title>;
