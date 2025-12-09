import * as React from "react";
import Cytoscape from "cytoscape";
import type { HeadFC, PageProps } from "gatsby";

const IndexPage: React.FC<PageProps> = () => {
  const [inputData, setInputData] = React.useState(`15 16
0 1 head 0.5
0 2 tail 0.5
1 3 head 0.5
1 4 tail 0.5
2 5 head 0.5
2 6 tail 0.5
3 7 head 0.5
3 8 tail 0.5
4 9 head 0.5
4 10 tail 0.5
5 11 head 0.5
5 12 tail 0.5
6 13 head 0.5
6 14 tail 0.5
7 1 head2 1
14 2 tail2 1
0 {toss. toss. toss. coin([]).}
1 {toss. toss. coin([h]).}
2 {toss. toss. coin([t]).}
3 {toss. coin([h,h]).}
4 {toss. coin([t,h]).}
5 {toss. coin([h,t]).}
6 {toss. coin([t,t]).}
7 {coin([h,h,h]).}
8 {coin([t,h,h]).} one
9 {coin([h,t,h]).} two
10 {coin([t,t,h]).} three
11 {coin([h,h,t]).} four
12 {coin([t,h,t]).} five
13 {coin([h,t,t]).} six
14 {coin([t,t,t]).}
`);
  const [selectedState, setSelectedState] = React.useState<{ id: string;  content: string; label: string } | null>(null);
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
        content: string;
        label: string;
        idWithLabel: string;
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
        const [_, id, graph, label] = state.match(/^(\S+)\s+(\{.*\})(?:\s+(.*))?$/)!;
        elements.push({
          data: { id, content: graph, label: label || '', idWithLabel: label ? `${id} (${label})` : id },
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
            label: "data(idWithLabel)",
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
      setSelectedState({ id: node.data("id"), content: node.data("content"), label: node.data("label") });
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
            <p><strong>LMNtal グラフ:</strong> {selectedState.content}</p>
            <p><strong>ラベル:</strong> {selectedState.label}</p>
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
