export const joinPaths = paths => {
  const joinedPath = new window.Path2D()

  for (const currentPath of paths) {
    joinedPath.addPath(currentPath)
  }

  return joinedPath
}

// export const joinPaths = paths =>
//   paths.reduce(
//     (joinedPath, currentPath) => {
//       return new window.Path2D(joinedPath).addPath(currentPath)
//     },
//     new window.Path2D()
//   )

export const offsetToTransformationMatrix = offset => (
  new window.DOMMatrix([
    1,
    0,
    0,
    1,
    offset.left,
    offset.top
  ])
)

// export const offsetToTransformationMatrix = offset => ({
//   a: 1,
//   b: 0,
//   c: 0,
//   d: 1,
//   e: offset.left,
//   f: offset.top
// })

export const offsetPath = (offset, oldPath) => {
  const newPath = new window.Path2D()
  newPath.addPath(oldPath, offsetToTransformationMatrix(offset))
  return newPath
}
