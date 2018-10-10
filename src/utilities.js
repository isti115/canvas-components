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
