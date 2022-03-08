let i = 0

// virtual file system
window._browserTailwindJit_VirtualFS = window._browserTailwindJit_VirtualFS || {}

module.exports = {
  // fake mock stat
  statSync: () => ({ mtimeMs: ++i }),
  readFileSync: fileName => window._browserTailwindJit_VirtualFS[fileName],
  writeFileSync: (fileName, contents) => window._browserTailwindJit_VirtualFS[fileName] = contents
}
