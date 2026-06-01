import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as fetchWithRetry } from "./notifications-BuSzwt0M.mjs";
import { n as normalizeTeamUsername } from "./use-toast-CUyDYyz5.mjs";
import { g as getUserStatsForProfile, f as fetchCombinedAuthUsers } from "./combinedProfile-1uPdsXSI.mjs";
import { U as UserProfileModal } from "./UserProfileModal-CJLhJh7U.mjs";
import "../_libs/firebase__firestore.mjs";
import "../_libs/firebase.mjs";
import "../_libs/firebase__storage.mjs";
import { a7 as Users, T as Search, a6 as User, X as Shield, A as Activity, P as Package } from "../_libs/lucide-react.mjs";
import "./index-CHMLBzfP.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "stream";
import "util";
import "crypto";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__component.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/idb.mjs";
import "../_libs/firebase__webchannel-wrapper.mjs";
import "../_libs/@grpc/grpc-js.mjs";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "http2";
import "dns";
import "../_libs/@grpc/proto-loader.mjs";
import "path";
import "../_libs/lodash.camelcase.mjs";
import "../_libs/protobufjs.mjs";
import "../_libs/protobufjs__aspromise.mjs";
import "../_libs/protobufjs__base64.mjs";
import "../_libs/protobufjs__eventemitter.mjs";
import "../_libs/protobufjs__float.mjs";
import "../_libs/@protobufjs/inquire.mjs";
import "../_libs/protobufjs__utf8.mjs";
import "../_libs/protobufjs__pool.mjs";
import "../_libs/long.mjs";
import "../_libs/protobufjs__codegen.mjs";
import "../_libs/protobufjs__fetch.mjs";
import "../_libs/protobufjs__path.mjs";
import "http";
import "url";
import "zlib";
import "../_libs/class-variance-authority.mjs";
function TeamView({ role, allOrders = [], currentUser, profileMode = "kurdistani", onOrderClick }) {
  const [users, setUsers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [profileTarget, setProfileTarget] = reactExports.useState(null);
  const [stats, setStats] = reactExports.useState({});
  const canViewTeamStats = role === "owner" || role === "admin";
  const currentUserKey = normalizeTeamUsername(currentUser);
  reactExports.useEffect(() => {
    let unsubscribe = () => {
    };
    import("../_libs/firebase.mjs").then(({ collection, onSnapshot }) => {
      import("./use-toast-CUyDYyz5.mjs").then((n) => n.g).then(({ db }) => {
        unsubscribe = onSnapshot(collection(db, "user_stats"), (snapshot) => {
          const newStats = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            newStats[doc.id] = data;
            if (data.username && data.profile) newStats[`${data.profile}_${normalizeTeamUsername(data.username)}`] = data;
          });
          setStats(newStats);
        }, (err) => {
          console.error("Failed to fetch user stats", err);
        });
      });
    });
    return () => unsubscribe();
  }, []);
  reactExports.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers(await fetchCombinedAuthUsers(fetchWithRetry, profileMode));
      } catch (e) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [profileMode]);
  const visibleUsers = canViewTeamStats ? users : users.length > 0 ? users : [{ username: currentUser, role }];
  const filtered = visibleUsers.filter((u) => {
    return String(u?.username || "").toLowerCase().includes(search.toLowerCase()) || String(u?.role || "").toLowerCase().includes(search.toLowerCase());
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6 text-primary" }),
          "Team Directory"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "View profiles, access, and send messages." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-64", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "w-full pl-9 pr-4 py-2 bg-card border rounded-lg text-sm",
            placeholder: "Search team..."
          }
        )
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 bg-card animate-pulse rounded-xl border" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filtered.map((u, i) => {
      const profileStats = getUserStatsForProfile(stats, u.username, profileMode);
      const visibleOrders = profileStats.recentOrders.filter((order) => allOrders.some((o) => String(o.id) === String(order.id) && o.sheet_name === order.sheet));
      const todayKey = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" });
      const visibleTodayOrders = visibleOrders.filter((order) => order.createdAt && new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" }) === todayKey).length;
      const canViewThisUserStats = canViewTeamStats || normalizeTeamUsername(u.username) === currentUserKey;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setProfileTarget(u), className: "bg-card hover:bg-accent/50 transition-colors border rounded-xl p-4 cursor-pointer flex flex-col gap-3 group relative shadow-sm", children: [
        canViewTeamStats && profileStats.isOnline && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: "Online Now", className: "absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-6 w-6 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pr-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg truncate", children: u.username }),
              u.username === currentUser && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded", children: "You" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase", children: u.role })
            ] })
          ] })
        ] }),
        canViewThisUserStats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2 pt-3 border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3 w-3" }),
              " Today"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg leading-none", children: visibleTodayOrders })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3" }),
              " Total"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg leading-none", children: visibleOrders.length })
          ] })
        ] })
      ] }, i);
    }) }),
    profileTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      UserProfileModal,
      {
        userTarget: profileTarget,
        allOrders,
        canViewOrders: canViewTeamStats || normalizeTeamUsername(profileTarget.username) === currentUserKey,
        profileMode,
        onOrderClick,
        onClose: () => setProfileTarget(null),
        onMessage: () => {
          const dmTopic = `dm_${[currentUser.toLowerCase(), profileTarget.username.toLowerCase()].sort().join("_")}`;
          window.location.hash = `messages:${dmTopic}`;
        }
      }
    )
  ] });
}
export {
  TeamView as default
};
