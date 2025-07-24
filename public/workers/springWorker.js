self.onmessage = (e) => {
  const { dt, positions, originalPos, velocities, lockedVerts, kStiff, damping } = e.data;
  if (!positions || !originalPos || !velocities || !dt) return;
  const pos = positions;
  const vertCount = pos.length / 3;
  for (let i = 0; i < vertCount; i++) {
    const idx = i * 3;
    if (lockedVerts && lockedVerts[i]) {
      velocities[idx] = velocities[idx + 1] = velocities[idx + 2] = 0;
      continue;
    }
    const dx = pos[idx] - originalPos[idx];
    const dy = pos[idx + 1] - originalPos[idx + 1];
    const dz = pos[idx + 2] - originalPos[idx + 2];
    const fx = -kStiff * dx - damping * velocities[idx];
    const fy = -kStiff * dy - damping * velocities[idx + 1];
    const fz = -kStiff * dz - damping * velocities[idx + 2];
    velocities[idx] += fx * dt;
    velocities[idx + 1] += fy * dt;
    velocities[idx + 2] += fz * dt;
    pos[idx] += velocities[idx] * dt;
    pos[idx + 1] += velocities[idx + 1] * dt;
    pos[idx + 2] += velocities[idx + 2] * dt;
  }
  self.postMessage({ positions: pos, velocities });
};
