export function showToast(message) {
  const el = document.createElement("div");
  el.className = "sqr-toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
