import styled from 'styled-components'

export const Window = styled.div`
  width: 500px;
  height: 500px;
  background-color: gray;
`

export const StyledPoint = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 10px;
  background-color: red;
  position: absolute;
  top: ${({ y }) => `${Math.floor(y) + 500}px`};
  left: ${({ x }) => `${Math.floor(x)}px`};
`
