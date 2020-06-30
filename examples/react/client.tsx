import React from "https://dev.jspm.io/react@16.13.1";
import ReactDOM from "https://dev.jspm.io/react-dom@16.13.1";
import { App } from "./components/App.tsx";

(ReactDOM as any).hydrate(
  <App />,
  // @ts-ignore
  document.getElementById("root"),
);
