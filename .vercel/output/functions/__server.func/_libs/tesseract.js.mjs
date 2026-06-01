import require$$0 from "worker_threads";
import { c as commonjsGlobal, b as getDefaultExportFromCjs } from "./react.mjs";
import { r as requireRuntime } from "./regenerator-runtime.mjs";
import { c as commonjsRequire } from "./@protobufjs/inquire.mjs";
import require$$1 from "path";
import require$$0$1 from "util";
import require$$0$2 from "fs";
import { r as require$$2 } from "./node-fetch.mjs";
import { r as requireIsUrl } from "./is-url.mjs";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: function() {
                return e[k];
              }
            });
          }
        }
      }
    }
  }
  return Object.freeze(n);
}
var getId;
var hasRequiredGetId;
function requireGetId() {
  if (hasRequiredGetId) return getId;
  hasRequiredGetId = 1;
  getId = (prefix, cnt) => `${prefix}-${cnt}-${Math.random().toString(16).slice(3, 8)}`;
  return getId;
}
var createJob;
var hasRequiredCreateJob;
function requireCreateJob() {
  if (hasRequiredCreateJob) return createJob;
  hasRequiredCreateJob = 1;
  const getId2 = requireGetId();
  let jobCounter = 0;
  createJob = ({
    id: _id,
    action,
    payload = {}
  }) => {
    let id = _id;
    if (typeof id === "undefined") {
      id = getId2("Job", jobCounter);
      jobCounter += 1;
    }
    return {
      id,
      action,
      payload
    };
  };
  return createJob;
}
var log = {};
var hasRequiredLog;
function requireLog() {
  if (hasRequiredLog) return log;
  hasRequiredLog = 1;
  let logging = false;
  log.logging = logging;
  log.setLogging = (_logging) => {
    logging = _logging;
  };
  log.log = (...args) => logging ? console.log.apply(this, args) : null;
  return log;
}
var createScheduler;
var hasRequiredCreateScheduler;
function requireCreateScheduler() {
  if (hasRequiredCreateScheduler) return createScheduler;
  hasRequiredCreateScheduler = 1;
  const createJob2 = requireCreateJob();
  const { log: log2 } = requireLog();
  const getId2 = requireGetId();
  let schedulerCounter = 0;
  createScheduler = () => {
    const id = getId2("Scheduler", schedulerCounter);
    const workers = {};
    const runningWorkers = {};
    let jobQueue = [];
    schedulerCounter += 1;
    const getQueueLen = () => jobQueue.length;
    const getNumWorkers = () => Object.keys(workers).length;
    const dequeue = () => {
      if (jobQueue.length !== 0) {
        const wIds = Object.keys(workers);
        for (let i = 0; i < wIds.length; i += 1) {
          if (typeof runningWorkers[wIds[i]] === "undefined") {
            jobQueue[0](workers[wIds[i]]);
            break;
          }
        }
      }
    };
    const queue = (action, payload) => new Promise((resolve, reject) => {
      const job = createJob2({ action, payload });
      jobQueue.push(async (w) => {
        jobQueue.shift();
        runningWorkers[w.id] = job;
        try {
          resolve(await w[action].apply(this, [...payload, job.id]));
        } catch (err) {
          reject(err);
        } finally {
          delete runningWorkers[w.id];
          dequeue();
        }
      });
      log2(`[${id}]: Add ${job.id} to JobQueue`);
      log2(`[${id}]: JobQueue length=${jobQueue.length}`);
      dequeue();
    });
    const addWorker = (w) => {
      workers[w.id] = w;
      log2(`[${id}]: Add ${w.id}`);
      log2(`[${id}]: Number of workers=${getNumWorkers()}`);
      dequeue();
      return w.id;
    };
    const addJob = async (action, ...payload) => {
      if (getNumWorkers() === 0) {
        throw Error(`[${id}]: You need to have at least one worker before adding jobs`);
      }
      return queue(action, payload);
    };
    const terminate = async () => {
      Object.keys(workers).forEach(async (wid) => {
        await workers[wid].terminate();
      });
      jobQueue = [];
    };
    return {
      addWorker,
      addJob,
      terminate,
      getQueueLen,
      getNumWorkers
    };
  };
  return createScheduler;
}
var getEnvironment;
var hasRequiredGetEnvironment;
function requireGetEnvironment() {
  if (hasRequiredGetEnvironment) return getEnvironment;
  hasRequiredGetEnvironment = 1;
  getEnvironment = (key) => {
    const env = {};
    if (typeof WorkerGlobalScope !== "undefined") {
      env.type = "webworker";
    } else if (typeof document === "object") {
      env.type = "browser";
    } else if (typeof process === "object" && typeof commonjsRequire === "function") {
      env.type = "node";
    }
    if (typeof key === "undefined") {
      return env;
    }
    return env[key];
  };
  return getEnvironment;
}
var resolvePaths;
var hasRequiredResolvePaths;
function requireResolvePaths() {
  if (hasRequiredResolvePaths) return resolvePaths;
  hasRequiredResolvePaths = 1;
  const isBrowser = requireGetEnvironment()("type") === "browser";
  const resolveURL = isBrowser ? (s) => new URL(s, window.location.href).href : (s) => s;
  resolvePaths = (options) => {
    const opts = { ...options };
    ["corePath", "workerPath", "langPath"].forEach((key) => {
      if (options[key]) {
        opts[key] = resolveURL(opts[key]);
      }
    });
    return opts;
  };
  return resolvePaths;
}
var OEM;
var hasRequiredOEM;
function requireOEM() {
  if (hasRequiredOEM) return OEM;
  hasRequiredOEM = 1;
  OEM = {
    TESSERACT_ONLY: 0,
    LSTM_ONLY: 1,
    TESSERACT_LSTM_COMBINED: 2,
    DEFAULT: 3
  };
  return OEM;
}
var defaultOptions;
var hasRequiredDefaultOptions$1;
function requireDefaultOptions$1() {
  if (hasRequiredDefaultOptions$1) return defaultOptions;
  hasRequiredDefaultOptions$1 = 1;
  defaultOptions = {
    /*
     * Use BlobURL for worker script by default
     * TODO: remove this option
     *
     */
    workerBlobURL: true,
    logger: () => {
    }
  };
  return defaultOptions;
}
var defaultOptions_1;
var hasRequiredDefaultOptions;
function requireDefaultOptions() {
  if (hasRequiredDefaultOptions) return defaultOptions_1;
  hasRequiredDefaultOptions = 1;
  const path = require$$1;
  const defaultOptions2 = requireDefaultOptions$1();
  defaultOptions_1 = {
    ...defaultOptions2,
    workerPath: path.join(__dirname, "..", "..", "worker-script", "node", "index.js")
  };
  return defaultOptions_1;
}
var spawnWorker;
var hasRequiredSpawnWorker;
function requireSpawnWorker() {
  if (hasRequiredSpawnWorker) return spawnWorker;
  hasRequiredSpawnWorker = 1;
  const { Worker } = require$$0;
  spawnWorker = ({ workerPath }) => new Worker(workerPath);
  return spawnWorker;
}
var terminateWorker;
var hasRequiredTerminateWorker;
function requireTerminateWorker() {
  if (hasRequiredTerminateWorker) return terminateWorker;
  hasRequiredTerminateWorker = 1;
  terminateWorker = (worker) => {
    worker.terminate();
  };
  return terminateWorker;
}
var onMessage;
var hasRequiredOnMessage;
function requireOnMessage() {
  if (hasRequiredOnMessage) return onMessage;
  hasRequiredOnMessage = 1;
  onMessage = (worker, handler) => {
    worker.on("message", handler);
  };
  return onMessage;
}
var send;
var hasRequiredSend;
function requireSend() {
  if (hasRequiredSend) return send;
  hasRequiredSend = 1;
  send = async (worker, packet) => {
    worker.postMessage(packet);
  };
  return send;
}
var loadImage;
var hasRequiredLoadImage;
function requireLoadImage() {
  if (hasRequiredLoadImage) return loadImage;
  hasRequiredLoadImage = 1;
  const util = require$$0$1;
  const fs = require$$0$2;
  const fetch = commonjsGlobal.fetch || require$$2;
  const isURL = requireIsUrl();
  const readFile = util.promisify(fs.readFile);
  loadImage = async (image) => {
    let data = image;
    if (typeof image === "undefined") {
      return image;
    }
    if (typeof image === "string") {
      if (isURL(image) || image.startsWith("moz-extension://") || image.startsWith("chrome-extension://") || image.startsWith("file://")) {
        const resp = await fetch(image);
        data = await resp.arrayBuffer();
      } else if (/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(image)) {
        data = Buffer.from(image.split(",")[1], "base64");
      } else {
        data = await readFile(image);
      }
    } else if (Buffer.isBuffer(image)) {
      data = image;
    }
    return new Uint8Array(data);
  };
  return loadImage;
}
var node;
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node;
  hasRequiredNode = 1;
  const defaultOptions2 = requireDefaultOptions();
  const spawnWorker2 = requireSpawnWorker();
  const terminateWorker2 = requireTerminateWorker();
  const onMessage2 = requireOnMessage();
  const send2 = requireSend();
  const loadImage2 = requireLoadImage();
  node = {
    defaultOptions: defaultOptions2,
    spawnWorker: spawnWorker2,
    terminateWorker: terminateWorker2,
    onMessage: onMessage2,
    send: send2,
    loadImage: loadImage2
  };
  return node;
}
var createWorker;
var hasRequiredCreateWorker;
function requireCreateWorker() {
  if (hasRequiredCreateWorker) return createWorker;
  hasRequiredCreateWorker = 1;
  const resolvePaths2 = requireResolvePaths();
  const createJob2 = requireCreateJob();
  const { log: log2 } = requireLog();
  const getId2 = requireGetId();
  const OEM2 = requireOEM();
  const {
    defaultOptions: defaultOptions2,
    spawnWorker: spawnWorker2,
    terminateWorker: terminateWorker2,
    onMessage: onMessage2,
    loadImage: loadImage2,
    send: send2
  } = requireNode();
  let workerCounter = 0;
  createWorker = async (langs = "eng", oem = OEM2.LSTM_ONLY, _options = {}, config = {}) => {
    const id = getId2("Worker", workerCounter);
    const {
      logger,
      errorHandler,
      ...options
    } = resolvePaths2({
      ...defaultOptions2,
      ..._options
    });
    const promises = {};
    const currentLangs = typeof langs === "string" ? langs.split("+") : langs;
    let currentOem = oem;
    let currentConfig = config;
    const lstmOnlyCore = [OEM2.DEFAULT, OEM2.LSTM_ONLY].includes(oem) && !options.legacyCore;
    let workerResReject;
    let workerResResolve;
    const workerRes = new Promise((resolve, reject) => {
      workerResResolve = resolve;
      workerResReject = reject;
    });
    const workerError = (event) => {
      workerResReject(event.message);
    };
    let worker = spawnWorker2(options);
    worker.onerror = workerError;
    workerCounter += 1;
    const startJob = ({ id: jobId, action, payload }) => new Promise((resolve, reject) => {
      log2(`[${id}]: Start ${jobId}, action=${action}`);
      const promiseId = `${action}-${jobId}`;
      promises[promiseId] = { resolve, reject };
      send2(worker, {
        workerId: id,
        jobId,
        action,
        payload
      });
    });
    const load = () => console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)");
    const loadInternal = (jobId) => startJob(createJob2({
      id: jobId,
      action: "load",
      payload: { options: { lstmOnly: lstmOnlyCore, corePath: options.corePath, logging: options.logging } }
    }));
    const writeText = (path, text, jobId) => startJob(createJob2({
      id: jobId,
      action: "FS",
      payload: { method: "writeFile", args: [path, text] }
    }));
    const readText = (path, jobId) => startJob(createJob2({
      id: jobId,
      action: "FS",
      payload: { method: "readFile", args: [path, { encoding: "utf8" }] }
    }));
    const removeFile = (path, jobId) => startJob(createJob2({
      id: jobId,
      action: "FS",
      payload: { method: "unlink", args: [path] }
    }));
    const FS = (method, args, jobId) => startJob(createJob2({
      id: jobId,
      action: "FS",
      payload: { method, args }
    }));
    const loadLanguageInternal = (_langs, jobId) => startJob(createJob2({
      id: jobId,
      action: "loadLanguage",
      payload: {
        langs: _langs,
        options: {
          langPath: options.langPath,
          dataPath: options.dataPath,
          cachePath: options.cachePath,
          cacheMethod: options.cacheMethod,
          gzip: options.gzip,
          lstmOnly: [OEM2.DEFAULT, OEM2.LSTM_ONLY].includes(currentOem) && !options.legacyLang
        }
      }
    }));
    const initializeInternal = (_langs, _oem, _config, jobId) => startJob(createJob2({
      id: jobId,
      action: "initialize",
      payload: { langs: _langs, oem: _oem, config: _config }
    }));
    const reinitialize = (langs2 = "eng", oem2, config2, jobId) => {
      if (lstmOnlyCore && [OEM2.TESSERACT_ONLY, OEM2.TESSERACT_LSTM_COMBINED].includes(oem2)) throw Error("Legacy model requested but code missing.");
      const _oem = oem2 || currentOem;
      currentOem = _oem;
      const _config = config2 || currentConfig;
      currentConfig = _config;
      const langsArr = typeof langs2 === "string" ? langs2.split("+") : langs2;
      const _langs = langsArr.filter((x) => !currentLangs.includes(x));
      currentLangs.push(..._langs);
      if (_langs.length > 0) {
        return loadLanguageInternal(_langs, jobId).then(() => initializeInternal(langs2, _oem, _config, jobId));
      }
      return initializeInternal(langs2, _oem, _config, jobId);
    };
    const setParameters = (params = {}, jobId) => startJob(createJob2({
      id: jobId,
      action: "setParameters",
      payload: { params }
    }));
    const recognize = async (image, opts = {}, output = {
      text: true
    }, jobId) => startJob(createJob2({
      id: jobId,
      action: "recognize",
      payload: { image: await loadImage2(image), options: opts, output }
    }));
    const detect = async (image, jobId) => {
      if (lstmOnlyCore) throw Error("`worker.detect` requires Legacy model, which was not loaded.");
      return startJob(createJob2({
        id: jobId,
        action: "detect",
        payload: { image: await loadImage2(image) }
      }));
    };
    const terminate = async () => {
      if (worker !== null) {
        terminateWorker2(worker);
        worker = null;
      }
      return Promise.resolve();
    };
    onMessage2(worker, ({
      workerId,
      jobId,
      status,
      action,
      data
    }) => {
      const promiseId = `${action}-${jobId}`;
      if (status === "resolve") {
        log2(`[${workerId}]: Complete ${jobId}`);
        promises[promiseId].resolve({ jobId, data });
        delete promises[promiseId];
      } else if (status === "reject") {
        promises[promiseId].reject(data);
        delete promises[promiseId];
        if (action === "load") workerResReject(data);
        if (errorHandler) {
          errorHandler(data);
        } else {
          throw Error(data);
        }
      } else if (status === "progress") {
        logger({ ...data, userJobId: jobId });
      }
    });
    const resolveObj = {
      id,
      worker,
      load,
      writeText,
      readText,
      removeFile,
      FS,
      reinitialize,
      setParameters,
      recognize,
      detect,
      terminate
    };
    loadInternal().then(() => loadLanguageInternal(langs)).then(() => initializeInternal(langs, oem, config)).then(() => workerResResolve(resolveObj)).catch(() => {
    });
    return workerRes;
  };
  return createWorker;
}
var Tesseract$1;
var hasRequiredTesseract;
function requireTesseract() {
  if (hasRequiredTesseract) return Tesseract$1;
  hasRequiredTesseract = 1;
  const createWorker2 = requireCreateWorker();
  const recognize = async (image, langs, options) => {
    const worker = await createWorker2(langs, 1, options);
    return worker.recognize(image).finally(async () => {
      await worker.terminate();
    });
  };
  const detect = async (image, options) => {
    const worker = await createWorker2("osd", 0, options);
    return worker.detect(image).finally(async () => {
      await worker.terminate();
    });
  };
  Tesseract$1 = {
    recognize,
    detect
  };
  return Tesseract$1;
}
var languages;
var hasRequiredLanguages;
function requireLanguages() {
  if (hasRequiredLanguages) return languages;
  hasRequiredLanguages = 1;
  languages = {
    AFR: "afr",
    AMH: "amh",
    ARA: "ara",
    ASM: "asm",
    AZE: "aze",
    AZE_CYRL: "aze_cyrl",
    BEL: "bel",
    BEN: "ben",
    BOD: "bod",
    BOS: "bos",
    BUL: "bul",
    CAT: "cat",
    CEB: "ceb",
    CES: "ces",
    CHI_SIM: "chi_sim",
    CHI_TRA: "chi_tra",
    CHR: "chr",
    CYM: "cym",
    DAN: "dan",
    DEU: "deu",
    DZO: "dzo",
    ELL: "ell",
    ENG: "eng",
    ENM: "enm",
    EPO: "epo",
    EST: "est",
    EUS: "eus",
    FAS: "fas",
    FIN: "fin",
    FRA: "fra",
    FRK: "frk",
    FRM: "frm",
    GLE: "gle",
    GLG: "glg",
    GRC: "grc",
    GUJ: "guj",
    HAT: "hat",
    HEB: "heb",
    HIN: "hin",
    HRV: "hrv",
    HUN: "hun",
    IKU: "iku",
    IND: "ind",
    ISL: "isl",
    ITA: "ita",
    ITA_OLD: "ita_old",
    JAV: "jav",
    JPN: "jpn",
    KAN: "kan",
    KAT: "kat",
    KAT_OLD: "kat_old",
    KAZ: "kaz",
    KHM: "khm",
    KIR: "kir",
    KOR: "kor",
    KUR: "kur",
    LAO: "lao",
    LAT: "lat",
    LAV: "lav",
    LIT: "lit",
    MAL: "mal",
    MAR: "mar",
    MKD: "mkd",
    MLT: "mlt",
    MSA: "msa",
    MYA: "mya",
    NEP: "nep",
    NLD: "nld",
    NOR: "nor",
    ORI: "ori",
    PAN: "pan",
    POL: "pol",
    POR: "por",
    PUS: "pus",
    RON: "ron",
    RUS: "rus",
    SAN: "san",
    SIN: "sin",
    SLK: "slk",
    SLV: "slv",
    SPA: "spa",
    SPA_OLD: "spa_old",
    SQI: "sqi",
    SRP: "srp",
    SRP_LATN: "srp_latn",
    SWA: "swa",
    SWE: "swe",
    SYR: "syr",
    TAM: "tam",
    TEL: "tel",
    TGK: "tgk",
    TGL: "tgl",
    THA: "tha",
    TIR: "tir",
    TUR: "tur",
    UIG: "uig",
    UKR: "ukr",
    URD: "urd",
    UZB: "uzb",
    UZB_CYRL: "uzb_cyrl",
    VIE: "vie",
    YID: "yid"
  };
  return languages;
}
var PSM;
var hasRequiredPSM;
function requirePSM() {
  if (hasRequiredPSM) return PSM;
  hasRequiredPSM = 1;
  PSM = {
    OSD_ONLY: "0",
    AUTO_OSD: "1",
    AUTO_ONLY: "2",
    AUTO: "3",
    SINGLE_COLUMN: "4",
    SINGLE_BLOCK_VERT_TEXT: "5",
    SINGLE_BLOCK: "6",
    SINGLE_LINE: "7",
    SINGLE_WORD: "8",
    CIRCLE_WORD: "9",
    SINGLE_CHAR: "10",
    SPARSE_TEXT: "11",
    SPARSE_TEXT_OSD: "12",
    RAW_LINE: "13"
  };
  return PSM;
}
var src;
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  requireRuntime();
  const createScheduler2 = requireCreateScheduler();
  const createWorker2 = requireCreateWorker();
  const Tesseract2 = requireTesseract();
  const languages2 = requireLanguages();
  const OEM2 = requireOEM();
  const PSM2 = requirePSM();
  const { setLogging } = requireLog();
  src = {
    languages: languages2,
    OEM: OEM2,
    PSM: PSM2,
    createScheduler: createScheduler2,
    createWorker: createWorker2,
    setLogging,
    ...Tesseract2
  };
  return src;
}
var srcExports = requireSrc();
const Tesseract = /* @__PURE__ */ getDefaultExportFromCjs(srcExports);
const index = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: Tesseract
}, [srcExports]);
export {
  Tesseract as T,
  index as i
};
