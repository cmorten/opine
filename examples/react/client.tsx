/// <reference lib="dom" />
import React from "https://esm.sh/react@17.0.2?dev";
import ReactDOM from "https://esm.sh/react-dom@17.0.2?dev";
import { App } from "./components/App.tsx";

(ReactDOM as any).hydrate(
  <App />,
  document.getElementById("root"),
);
