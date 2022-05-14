import { StyledPoint, Window } from './HandShape.Styled'

const HandShape = ({ points, setMiddleFinger }) => {
  if (points.length > 12) {
    const heightOf11 = points[11][1]
    const isMiddleFinger = !points.reduce((acc, el, i) => {
      if (i !== 12 && i !== 11 && !acc) {
        return el[1] < heightOf11
      }
      return acc
    }, false)
    setMiddleFinger(isMiddleFinger)
  }

  return (
    <Window>
      {Array.isArray(points) &&
        points.map((point, i) => (
          <StyledPoint x={point[0]} y={point[1]}>
            {i}
          </StyledPoint>
        ))}
    </Window>
  )
}

export default HandShape
