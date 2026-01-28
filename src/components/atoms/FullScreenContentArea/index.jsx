import styled from 'styled-components';

const FullScreenContentArea = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'zIndex',
})`
    z-index: ${props => props.zIndex ?? 0};
    display: flex;
    flex-direction: column;   
    justify-content: start;
    overflow: hidden;
    user-select: none;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    height: 100%;
    width:100%;
    


`

export default FullScreenContentArea

