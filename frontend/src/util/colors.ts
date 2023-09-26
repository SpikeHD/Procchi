export function randomRGBAColors() {
  // We always want the alpha to be 0.6
  const r = Math.floor(Math.random() * 255)
  const g = Math.floor(Math.random() * 255)
  const b = Math.floor(Math.random() * 255)

  return {
    color: `rgba(${r}, ${g}, ${b}, 0.6)`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`
  }
}