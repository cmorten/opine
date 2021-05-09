import React from "https://esm.sh/react@17.0.2?dev";
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
