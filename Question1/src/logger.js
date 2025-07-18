// Custom Logging Middleware
// Stores logs in localStorage under 'appLogs'

const LOG_KEY = 'appLogs';

function getLogs() {
  const logs = localStorage.getItem(LOG_KEY);
  return logs ? JSON.parse(logs) : [];
}

function saveLog(entry) {
  const logs = getLogs();
  logs.push(entry);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
}

const logger = {
  log: (message, meta = {}) => {
    saveLog({ type: 'log', message, meta, timestamp: new Date().toISOString() });
  },
  warn: (message, meta = {}) => {
    saveLog({ type: 'warn', message, meta, timestamp: new Date().toISOString() });
  },
  error: (message, meta = {}) => {
    saveLog({ type: 'error', message, meta, timestamp: new Date().toISOString() });
  },
  getLogs,
  clear: () => localStorage.removeItem(LOG_KEY),
};

export default logger; 