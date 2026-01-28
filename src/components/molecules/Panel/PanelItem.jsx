import React from 'react';
import styled from 'styled-components';

export const Box = styled.div`
    width:  ${props => props.width??'100%'};
    border: rgb(229, 229, 229) 1px solid;
    position:relative;

`;

export const Title = styled.div`
  background: rgb( 0,153,153);
  text-align: center;
  font-family: "Roboto", "Arial", sans-serif, bold;
  font-size: 2vh;
  width: 100%;
  height: 24%;
  padding: 0;  
`;

const getFontSize = (props) =>{
  if (props.primary)
    return (props.len!==undefined && props.len>6 ? '1.8vw' : '2vw')
  return '1.4vw'
}

const getValueSize = (props) => {
  const totalHeight = props.showTitle ? 76:100;
  const rows = props.rows || 2;
  return `${totalHeight/rows}%`;
}

const Value = styled.div`
  position: relative;
  text-align: center;
  font-family: "Roboto", "Arial", sans-serif, bold;
  font-size: ${props => getFontSize(props)} ;
  width: 100%;
  height: ${props => getValueSize(props)};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 0px;
  border-bottom: ${props => props.rows>1 ? 'rgb(229, 229, 229) 1px solid' : 'none'};

`;

const Unit = styled.div`
  position: absolute;
  top: 0;
  right: 2px;
  minHeight: 100%;

  text-align: right;
  font-family: "Roboto", "Arial", sans-serif, bold;
  font-size: 1vh;
  width: 20%;
  height: 100%
  padding: 0px 0px;
`;

const Info = styled.div`
  position: absolute;
  top: 0;
  left: 2px;
  minHeight: 100%;

  text-align: left;
  font-family: "Roboto", "Arial", sans-serif, bold;
  font-size: 1vh;
  width: 20%;
  height: 100%
  padding: 0px 0px;
`;

const Label = styled.div`
  position: absolute;
  top: 0;
  left: 2px;
  minHeight: 100%;

  text-align: left;
  font-family: "Roboto", "Arial", sans-serif, bold;
  font-size: 1vh;
  width: 20%;
  height: 100%
  padding: 0px 0px;
`;


const Led = styled.div`
  position: absolute;
  top:2px;
  right:2px;

  height: 12%;
  aspect-ratio: 1/1;
  background-color: ${props=>props.color||'none'};
  border-radius: 50%;
  border-color: black;
  border:  ${props=>props.color ? '2px solid' : 'none'};
`

export const PanelItem = ({width,showHeader,title,noTitle=false,rows,dataState,data,children}) => {



    const renderValue = (d,idx,showTitle=true) => {
      const numRows = rows || data.length;        
      const hasValue = (d) => {
        return !(d?.value===undefined || d?.value==='' )
      }


      const val = d.value;
      const len = d.value!==undefined ? d.value.length : 0 ;
      const key = 'row_'+idx
      
      if (idx>=numRows)
        return null;


      return (
        <Value rows ={numRows} key={key} primary={idx===0} len={len} showTitle={showTitle}>
          {d.info ? <Info>{d.info}</Info> : null}
          {!hasValue(d) ? <div>&nbsp;</div> :<div>{val}</div>}
          {d.label ? <Label>{d.label}</Label> : null}
          {d.unit ? <Unit>{d.unit}</Unit> : null}
        </Value>
      )
    }

    let d = data;
    if ( !Array.isArray(data) && typeof(data)==='object')
      d = [data]
    
    const showTitle = showHeader!==undefined ? showHeader : title!==undefined && !noTitle;
    
    return (
        <Box width={width}>
            {showTitle ? <Title>{title}</Title>: null}
            {dataState==='red' ? <Led color='red'/> : null}
            {dataState==='amber' ? <Led color='#FFBF00'/> : null}
            {d ? d.map( (d,i) => 
              renderValue(d,i,showTitle)
            ):null}               
            {children}
        </Box>
    )
}