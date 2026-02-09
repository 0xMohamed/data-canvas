import { AppProvider } from "./provider";
import { AppRouter } from "./router/router";

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
