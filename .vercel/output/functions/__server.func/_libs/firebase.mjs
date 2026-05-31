import { U as collection, aD as onSnapshot } from "./firebase__firestore.mjs";
import { A, a, b, d, C, e, g, h, F, k, l, m, G, L, P, Q, n, o, p, q, r, s, t, u, v, S, w, x, V, W, c, B, D, f, E, i, j, T, O, $, _, y, as, aw, a_, z, H, I, J, K, M, N, R, X, Y, Z, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, an, ao, ap, aq, ar, at, au, av, ax, ay, az, aA, aB, aC, aE, aF, aG, aH, aI, aJ, aK, aL, aM, aN, aO, aP, aQ, aR, aS, aT, aU, aV, aW, aX, aY, aZ, a$, b0, b1, b2 } from "./firebase__firestore.mjs";
import { r as registerVersion } from "./firebase__app.mjs";
import "./firebase__storage.mjs";
import "./firebase__component.mjs";
import "./firebase__util.mjs";
import "./firebase__webchannel-wrapper.mjs";
import "./firebase__logger.mjs";
import "util";
import "crypto";
import "./@grpc/grpc-js.mjs";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "http2";
import "dns";
import "stream";
import "./@grpc/proto-loader.mjs";
import "path";
import "./lodash.camelcase.mjs";
import "./react.mjs";
import "./protobufjs.mjs";
import "./protobufjs__aspromise.mjs";
import "./protobufjs__base64.mjs";
import "./protobufjs__eventemitter.mjs";
import "./protobufjs__float.mjs";
import "./@protobufjs/inquire.mjs";
import "./protobufjs__utf8.mjs";
import "./protobufjs__pool.mjs";
import "./long.mjs";
import "./protobufjs__codegen.mjs";
import "./protobufjs__fetch.mjs";
import "./protobufjs__path.mjs";
import "http";
import "url";
import "zlib";
import "./idb.mjs";
var name = "firebase";
var version = "12.14.0";
registerVersion(name, version, "app");
export {
  A as AbstractUserDataWriter,
  a as AggregateField,
  b as AggregateQuerySnapshot,
  d as Bytes,
  C as CACHE_SIZE_UNLIMITED,
  e as CollectionReference,
  g as DocumentReference,
  h as DocumentSnapshot,
  F as FieldPath,
  k as FieldValue,
  l as Firestore,
  m as FirestoreError,
  G as GeoPoint,
  L as LoadBundleTask,
  P as PersistentCacheIndexManager,
  Q as Query,
  n as QueryCompositeFilterConstraint,
  o as QueryConstraint,
  p as QueryDocumentSnapshot,
  q as QueryEndAtConstraint,
  r as QueryFieldFilterConstraint,
  s as QueryLimitConstraint,
  t as QueryOrderByConstraint,
  u as QuerySnapshot,
  v as QueryStartAtConstraint,
  S as SnapshotMetadata,
  w as Timestamp,
  x as Transaction,
  V as VectorValue,
  W as WriteBatch,
  c as _AutoId,
  B as _ByteString,
  D as _DatabaseId,
  f as _DocumentKey,
  E as _EmptyAppCheckTokenProvider,
  i as _EmptyAuthCredentialsProvider,
  j as _FieldPath,
  T as _TestingHooks,
  O as _cast,
  $ as _debugAssert,
  _ as _internalAggregationQueryToProtoRunAggregationQueryRequest,
  y as _internalQueryToProtoQueryTarget,
  as as _isBase64Available,
  aw as _logWarn,
  a_ as _validateIsNotUsedTogether,
  z as addDoc,
  H as aggregateFieldEqual,
  I as aggregateQuerySnapshotEqual,
  J as and,
  K as arrayRemove,
  M as arrayUnion,
  N as average,
  R as clearIndexedDbPersistence,
  collection,
  X as collectionGroup,
  Y as connectFirestoreEmulator,
  Z as count,
  a0 as deleteAllPersistentCacheIndexes,
  a1 as deleteDoc,
  a2 as deleteField,
  a3 as disableNetwork,
  a4 as disablePersistentCacheIndexAutoCreation,
  a5 as doc,
  a6 as documentId,
  a7 as documentSnapshotFromJSON,
  a8 as enableIndexedDbPersistence,
  a9 as enableMultiTabIndexedDbPersistence,
  aa as enableNetwork,
  ab as enablePersistentCacheIndexAutoCreation,
  ac as endAt,
  ad as endBefore,
  ae as ensureFirestoreConfigured,
  af as executeWrite,
  ag as getAggregateFromServer,
  ah as getCountFromServer,
  ai as getDoc,
  aj as getDocFromCache,
  ak as getDocFromServer,
  al as getDocs,
  am as getDocsFromCache,
  an as getDocsFromServer,
  ao as getFirestore,
  ap as getPersistentCacheIndexManager,
  aq as increment,
  ar as initializeFirestore,
  at as limit,
  au as limitToLast,
  av as loadBundle,
  ax as maximum,
  ay as memoryEagerGarbageCollector,
  az as memoryLocalCache,
  aA as memoryLruGarbageCollector,
  aB as minimum,
  aC as namedQuery,
  onSnapshot,
  aE as onSnapshotResume,
  aF as onSnapshotsInSync,
  aG as or,
  aH as orderBy,
  aI as persistentLocalCache,
  aJ as persistentMultipleTabManager,
  aK as persistentSingleTabManager,
  aL as query,
  aM as queryEqual,
  aN as querySnapshotFromJSON,
  aO as refEqual,
  aP as runTransaction,
  aQ as serverTimestamp,
  aR as setDoc,
  aS as setIndexConfiguration,
  aT as setLogLevel,
  aU as snapshotEqual,
  aV as startAfter,
  aW as startAt,
  aX as sum,
  aY as terminate,
  aZ as updateDoc,
  a$ as vector,
  b0 as waitForPendingWrites,
  b1 as where,
  b2 as writeBatch
};
