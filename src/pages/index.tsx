import * as React from "react";
import Cytoscape from "cytoscape";
import type { HeadFC, PageProps } from "gatsby";

const IndexPage: React.FC<PageProps> = () => {
  const [inputData, setInputData] = React.useState("");
  const [selectedState, setSelectedState] = React.useState<{ id: string; label: string } | null>(null);
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

    interface NodeElement {
      data: {
      id: string;
      label: string;
      };
    }

    interface EdgeElement {
      data: {
      source: string;
      target: string;
      label: string;
      };
    }

    const elements: (NodeElement | EdgeElement)[] = [];

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
      const [source, target, label, prob] = transition.split(" ", 4);
      elements.push({
        data: { source, target, label: `${label} (${prob})` },
      });
    });

    // Initialize Cytoscape
    const cy = Cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#0074D9",
            label: "data(id)",
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "line-color": "#FF4136",
            "target-arrow-color": "#FF4136",
            "text-wrap": "wrap",
            "label": "data(label)",
          },
        },
      ],
      layout: {
        name: "breadthfirst",
        directed: true,
        padding: 10,
      },
    });

    cy.on("select", "node", (event) => {
      const node = event.target;
      setSelectedState({ id: node.data("id"), label: node.data("label") });
    });

    cy.on("unselect", "node", () => {
      setSelectedState(null);
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "20%", padding: "1rem", borderRight: "1px solid #ccc" }}>
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
      <div ref={containerRef} style={{ flex: 1, borderRight: "1px solid #ccc" }}></div>
      <div style={{ width: "20%", padding: "1rem" }}>
        <h2>選択された状態</h2>
        {selectedState ? (
          <div>
            <p><strong>ID:</strong> {selectedState.id}</p>
            <p><strong>LMNtal グラフ:</strong> {selectedState.label}</p>
          </div>
        ) : (
          <p>状態が選択されていません。</p>
        )}
      </div>
    </div>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>lmntal state viewer</title>;
