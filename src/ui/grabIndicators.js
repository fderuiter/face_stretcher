export function initGrabIndicators({
  points = [],
  width = 2,
  height = 2,
  containerId = "grab-indicators",
} = {}) {
  const container = document.getElementById(containerId);
  if (!container || !points.length) {
    return { update() {}, destroy() {} };
  }
  container.innerHTML = "";
  const dots = points.map(() => {
    const d = document.createElement("div");
    d.className = "grab-indicator";
    container.appendChild(d);
    return d;
  });
  container.classList.remove("hidden");

  function update() {
    const rect = container.getBoundingClientRect();
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = (p.x / width + 0.5) * rect.width;
      const y = (-p.y / height + 0.5) * rect.height;
      dots[i].style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  function destroy() {
    container.innerHTML = "";
    container.classList.add("hidden");
  }

  return { update, destroy };
}
