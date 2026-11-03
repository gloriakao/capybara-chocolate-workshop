const dialog = document.getElementById("student-id-dialog");
const form = document.getElementById("student-id-form");
const errorMessage = document.getElementById("student-id-error");
const playerOneInput = document.getElementById("player-one-id");
const playerTwoInput = document.getElementById("player-two-id");
let pendingResolve = null;

if (dialog && form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const studentIds = [playerOneInput.value.trim(), playerTwoInput.value.trim()];
    if (studentIds.some((studentId) => !studentId)) {
      errorMessage.textContent = "請輸入兩位玩家的學號。";
      return;
    }

    const resolve = pendingResolve;
    pendingResolve = null;
    dialog.close();
    resolve?.(studentIds);
  });

  form.addEventListener("keydown", (event) => event.stopPropagation(), true);
  document.getElementById("cancel-student-ids")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (!pendingResolve) return;
    const resolve = pendingResolve;
    pendingResolve = null;
    resolve(null);
  });
}

export function requestStudentIds() {
  if (!dialog || !form || !playerOneInput || !playerTwoInput) {
    return Promise.reject(new Error("找不到學號輸入表單。"));
  }

  form.reset();
  errorMessage.textContent = "";
  return new Promise((resolve) => {
    pendingResolve = resolve;
    dialog.showModal();
    playerOneInput.focus();
  });
}
