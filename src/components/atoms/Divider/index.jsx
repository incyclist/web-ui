import styled from "styled-components";

export const Divider = styled.hr `
  display: block;
  width: ${props =>props.width}
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  margin-left: auto;
  margin-right: auto;
  border-style: inset;
  border-width: 1px;
` 