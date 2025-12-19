const TOAST_DURATION = 3000;
const TOAST_CONTAINER_ID = "toast-container";

const styleEl = document.createElement("style");
styleEl.textContent = `
  #toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }
  .toast {
    padding: 12px 24px;
    border-radius: 4px;
    font-family: 'VT323', monospace;
    font-size: 1.125rem;
    animation: toast-slide-in 0.3s ease-out;
    pointer-events: auto;
    max-width: 400px;
    word-wrap: break-word;
  }
  .toast-success {
    background: hsl(180 100% 15%);
    color: hsl(180 100% 50%);
    border: 1px solid hsl(180 100% 50%);
    box-shadow: 0 0 10px hsl(180 100% 50% / 0.3);
  }
  .toast-error {
    background: hsl(0 100% 15%);
    color: hsl(0 100% 70%);
    border: 1px solid hsl(0 100% 50%);
    box-shadow: 0 0 10px hsl(0 100% 50% / 0.3);
  }
  .toast-info {
    background: hsl(60 100% 15%);
    color: hsl(60 100% 50%);
    border: 1px solid hsl(60 100% 50%);
    box-shadow: 0 0 10px hsl(60 100% 50% / 0.3);
  }
  .toast-exit {
    animation: toast-slide-out 0.3s ease-in forwards;
  }
  @keyframes toast-slide-in {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes toast-slide-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
  }
`;
document.head.appendChild(styleEl);

function getContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    document.body.appendChild(container);
  }
  return container;
}

function show(message, type = "info", duration = TOAST_DURATION) {
  const container = getContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute("role", "alert");
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  }, duration);

  toast.addEventListener("click", () => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 300);
  });

  return toast;
}

export const Toast = {
  success(message, duration = TOAST_DURATION) {
    return show(message, "success", duration);
  },
  error(message, duration = TOAST_DURATION) {
    return show(message, "error", duration);
  },
  info(message, duration = TOAST_DURATION) {
    return show(message, "info", duration);
  },
  clear() {
    const container = document.getElementById(TOAST_CONTAINER_ID);
    if (container) {
      container.innerHTML = "";
    }
  },
};

export default Toast;
