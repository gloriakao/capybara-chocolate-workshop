const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL?.trim();

export function createMatchId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `match-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPlayerRecord({ matchId, studentId, playerNo, result }) {
  return {
    schemaVersion: 1,
    matchId,
    studentId,
    classCode: "",
    playerNo,
    orderId: result.orderId,
    shape: result.shape,
    originalSides: result.originalSides,
    targetSource: result.targetSource,
    targetLength: result.targetLength,
    firstAttempt: result.firstAttemptRaw,
    finalAttempt: result.finalAttemptRaw,
    attempts: result.attempts,
    hintUsed: result.hintUsed,
  };
}

export async function sendLearningRecords(records) {
  if (!APPS_SCRIPT_URL) {
    throw new Error("缺少 VITE_APPS_SCRIPT_URL 設定。請確認 .env.local 並重新啟動 Vite。");
  }

  await Promise.all(records.map((record) => fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(record),
  })));
}
