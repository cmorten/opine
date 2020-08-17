// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/4a50660/react/v16.13.1/react.d.ts"
import React from "https://dev.jspm.io/react@16.13.1";
import { Title } from "./Title.tsx";
import { List } from "./List.tsx";

export const App = ({ isServer = false }) => {
  if (isServer) {
    return (<>
      <Title />
      <p className="app_loading">Loading Doggos...</p>
    </>);
  }

  return (<>
    <Title />
    <React.Suspense fallback={<p className="app_loading">Loading Doggos...</p>}>
      <List />
    </React.Suspense>
  </>);
};
