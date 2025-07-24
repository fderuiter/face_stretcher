const { execSync } = require('child_process');
const paths = [
  'node_modules/@mediapipe/face_mesh/face_mesh_solution_wasm_bin.wasm',
  'node_modules/@mediapipe/face_mesh/face_mesh_solution_simd_wasm_bin.wasm'
];
for (const p of paths) {
  try {
    execSync(`wasm-strip ${p}`);
    console.log(`Stripped debug info from ${p}`);
  } catch (err) {
    console.error(`Could not strip ${p}: ${err.message}`);
  }
}
