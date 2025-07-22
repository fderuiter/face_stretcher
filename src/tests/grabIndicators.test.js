import { initGrabIndicators } from "../ui/grabIndicators.js";
import * as THREE from "three";

describe("grab indicators", () => {
  test("creates dots and updates positions", () => {
    document.body.innerHTML = '<div id="grab-indicators"></div>';
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 0)];
    const container = document.getElementById("grab-indicators");
    container.getBoundingClientRect = () => ({ width: 100, height: 100 });
    const ind = initGrabIndicators({ points, width: 2, height: 2 });
    ind.update();
    expect(container.children.length).toBe(2);
    const style = container.children[0].style.transform;
    expect(style).toMatch(/translate/);
    ind.destroy();
    expect(container.children.length).toBe(0);
  });

  test("handles missing container gracefully", () => {
    document.body.innerHTML = "";
    const ind = initGrabIndicators({ points: [new THREE.Vector3()] });
    expect(ind).toHaveProperty("update");
    ind.update();
    ind.destroy();
  });
});
