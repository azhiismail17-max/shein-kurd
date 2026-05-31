import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
const App = reactExports.lazy(() => import("./_ssr/App-CEBFuNP8.mjs"));
function ClientApp() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) });
}
export {
  ClientApp as component
};
