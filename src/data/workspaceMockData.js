export const workTemplates = {
  python: {
    name: "🐍 Python CLI Tool",
    description: "Basic script layout with argparser, error handlers, and requests utilities.",
    files: [
      {
        name: "main.py",
        language: "python",
        content: `import sys
import argparse
from helper import greeting
from data_loader import load_csv

def main():
    parser = argparse.ArgumentParser(description="AI Agent Command Line Loader")
    parser.add_argument("--name", type=str, default="Antigravity", help="Name to greet")
    parser.add_argument("--file", type=str, default="data.csv", help="CSV data file path")
    args = parser.parse_args()

    print("🤖 Initializing AI CLI Workspace...")
    print(greeting(args.name))
    
    try:
        data = load_csv(args.file)
        print(f"📊 Successfully loaded {len(data)} rows from {args.file}!")
    except FileNotFoundError:
        print(f"⚠️ Warning: Could not find '{args.file}'. Please create it in explorer.")

if __name__ == "__main__":
    main()
`
      },
      {
        name: "helper.py",
        language: "python",
        content: `def greeting(name: str) -> str:
    """Returns a formatted greeting string from the AI system."""
    return f"Greetings, {name}! Your workspace agent is fully active and ready to build."
`
      },
      {
        name: "data_loader.py",
        language: "python",
        content: `import csv

def load_csv(filepath: str):
    """Loads a mock csv file and returns rows."""
    # Simulating data ingestion
    return [
      {"id": "1", "feature": "transformer_layers", "value": "12"},
      {"id": "2", "feature": "attention_heads", "value": "8"},
      {"id": "3", "feature": "embedding_dim", "value": "768"}
    ]
`
      },
      {
        name: "requirements.txt",
        language: "text",
        content: `numpy>=1.24.0
requests>=2.31.0
pandas>=2.0.0
`
      }
    ]
  },

  react: {
    name: "⚛️ React Web App",
    description: "Vite React component setup with CSS stylesheets and props buttons.",
    files: [
      {
        name: "App.jsx",
        language: "javascript",
        content: `import React, { useState } from "react";
import Button from "./components/Button";
import "./index.css";

export default function App() {
  const [clicks, setClicks] = useState(0);

  return (
    <div className="react-workspace-app">
      <header className="app-header">
        <h1>🚀 React Interactive Workspace</h1>
        <p>A simple sandbox component to test React states and components.</p>
      </header>
      <main>
        <div className="card">
          <p>Click Counter: <strong>{clicks}</strong></p>
          <Button onClick={() => setClicks(c => c + 1)}>
            Increment Counter
          </Button>
        </div>
      </main>
    </div>
  );
}
`
      },
      {
        name: "components/Button.jsx",
        language: "javascript",
        content: `import React from "react";

export default function Button({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background 0.2s"
      }}
      onMouseOver={(e) => e.target.style.background = "#1d4ed8"}
      onMouseOut={(e) => e.target.style.background = "#2563eb"}
    >
      {children}
    </button>
  );
}
`
      },
      {
        name: "index.css",
        language: "css",
        content: `.react-workspace-app {
  padding: 40px;
  background: var(--surface-1);
  min-height: 100vh;
  color: var(--text-primary);
  font-family: sans-serif;
}

.app-header h1 {
  color: var(--accent-gold);
}

.card {
  margin-top: 25px;
  background: var(--surface-2);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid var(--border-default);
  display: inline-block;
}
`
      },
      {
        name: "package.json",
        language: "json",
        content: `{
  "name": "react-sandbox",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`
      }
    ]
  },

  ml: {
    name: "🧠 Machine Learning Jupyter Notebook",
    description: "Jupyter Notebook style layout with dataset loaders, PyTorch training loops, and graphs.",
    files: [
      {
        name: "training.ipynb",
        language: "json",
        isNotebook: true,
        content: JSON.stringify([
          {
            id: "cell-1",
            type: "markdown",
            source: "# 🧠 PyTorch Neural Network Training Pipeline\n\nThis notebook demonstrates a simulated training loop for a Feed-Forward Neural Network in PyTorch. Let's load the data first.",
            output: ""
          },
          {
            id: "cell-2",
            type: "code",
            source: `import torch
import torch.nn as nn
import numpy as np
from dataset import load_ml_data

print("✅ PyTorch Loaded version:", torch.__version__)
data_X, data_y = load_ml_data()
print(f"📊 Training records ingested: {len(data_X)} batches")`,
            output: "✅ PyTorch Loaded version: 2.2.1+cu121\n📊 Training records ingested: 100 batches"
          },
          {
            id: "cell-3",
            type: "markdown",
            source: "### Defining the model architecture\nWe define a simple 3-layer model with ReLU activation functions.",
            output: ""
          },
          {
            id: "cell-4",
            type: "code",
            source: `from model import SimpleClassifier

model = SimpleClassifier(input_dim=10, hidden_dim=32, output_dim=2)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
print(model)`,
            output: "SimpleClassifier(\n  (fc1): Linear(in_features=10, out_features=32, bias=True)\n  (relu): ReLU()\n  (fc2): Linear(in_features=32, out_features=2, bias=True)\n)"
          },
          {
            id: "cell-5",
            type: "code",
            source: `print("🚀 Starting training loop...")
for epoch in range(1, 4):
    loss = 0.54 / epoch # Simulated descent
    print(f"Epoch {epoch}/3 - Loss: {loss:.4f} - Accuracy: {85 + epoch * 3.5}%")
print("🎉 Model training completed successfully!")`,
            output: "🚀 Starting training loop...\nEpoch 1/3 - Loss: 0.5400 - Accuracy: 88.5%\nEpoch 2/3 - Loss: 0.2700 - Accuracy: 92.0%\nEpoch 3/3 - Loss: 0.1800 - Accuracy: 95.5%\n🎉 Model training completed successfully!"
          }
        ], null, 2)
      },
      {
        name: "model.py",
        language: "python",
        content: `import torch.nn as nn

class SimpleClassifier(nn.Module):
    def __init__(self, input_dim=10, hidden_dim=32, output_dim=2):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))
`
      },
      {
        name: "dataset.py",
        language: "python",
        content: `def load_ml_data():
    """Generates simulated tensor data batches."""
    # Mock returning tuples representing dataset
    return [0]*100, [1]*100
`
      }
    ]
  }
};

export const codeSnippets = [
  {
    name: "PyTorch Training Loop",
    description: "Standard model training loop with loss backward propagation.",
    code: `for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()
    outputs = model(inputs)
    loss = criterion(outputs, labels)
    loss.backward()
    optimizer.step()
    print(f"Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}")`
  },
  {
    name: "React Fetch Component",
    description: "React functional component with useEffect hook data loading state.",
    code: `import React, { useState, useEffect } from 'react';

export default function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div>Loading records...</div>;
  return <div>Data Loaded: {JSON.stringify(data)}</div>;
}`
  },
  {
    name: "Python Argument Parser",
    description: "Template to parse command line parameters dynamically.",
    code: `import argparse

def parse_args():
    parser = argparse.ArgumentParser(description="CLI tool description")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--cuda", action="store_true")
    return parser.parse_args()`
  }
];

export const mockAiReplies = {
  explain: "Here is an explanation of this code module:\n1. It creates initialization processes and sets up configuration settings.\n2. Ingests file arrays dynamically and performs safety parameters operations.\n3. Optimizes state arrays recursively to return the final execution elements.",
  debug: "🐞 Potential Bugs Identified:\n- Make sure variables bounds checks are set.\n- Ensure import modules files exist inside the active folder directories.\n- Add a fallback try/except context check to catch unexpected API errors.",
  optimize: "⚡ Performance Optimizations:\n- Cache dynamic array returns using useMemo/useCallback pointers.\n- Replace iterative loops with vectorized list comprehensions.\n- Limit heavy I/O operations inside deep recursive functions.",
  writeTests: "🧪 Generated Test Cases:\n```python\n# Unit test verification cases\nimport unittest\nfrom main import main\n\nclass TestWorkspaceMethods(unittest.TestCase):\n    def test_nominal_flow(self):\n        self.assertTrue(True) # Nominals pass\n```"
};
