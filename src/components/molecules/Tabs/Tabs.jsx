import React, { Component } from 'react';
import {Tab} from './Tab';
import styled from 'styled-components';
import { copyPropsExcluding } from '../../../utils';

const TabContainer = styled.div`
  display: block;
  height: ${props => props.buttonBar ? 'calc(100% - 7.7vh)' : '100%'};
`

const List = styled.ol`
    padding-left: 0;
    height: 6.66vh; // 11/12 of 80%;
    padding:0;
    margin:0;
    border-bottom: 1px solid;
`

const Content = styled.div`
    width: 100%;
    height:  calc(100% - 6.66vh);
    min-height:  calc(100% - 6.66vh);
    overflow-y: auto;

    &::-webkit-scrollbar-button {
        display: none;
    }

    &::-webkit-scrollbar {
        width: 2vw;
    }
      
      /* Track */
    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
        border-radius: 10px;
        display: none;
        
    }
    
    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme.list.hover.background};
        border-radius: 10px;
    }


`;

export class Tabs extends Component {

  onClickTabItem = (tab) => {
    if (this.props.onChangeTab) this.props.onChangeTab(tab);
 
  }

  getChildren() {
    const childElements = this.props.children;
    let children;
    if ( Array.isArray(childElements) ) {
      children = childElements.filter(c=>typeof(c)==='object')
    }
    else 
      children = childElements ? [childElements] : undefined;

    return children;

  }

  render() {

    const children = this.getChildren();     
    const active = this.props.activeTab || ((children && children.length>0) ? children[0].props.label : undefined);

    const child = children?.find( child => child?.props?.label===active) || children[0]
    const ChildElement = child?.type
    const buttonBar=this.props.buttonBar && !child?.props?.manageButtons

    const containerProps = copyPropsExcluding(this.props, ['onChangeTab'])

    return (
      <TabContainer className="tabs" {...containerProps} buttonBar={buttonBar}>
        <List className="tab-list">
          {children.map((child) => {
            if (!child) return null;
            const { label } = child.props;
            return (
              <Tab
                activeTab={active}
                key={label}
                label={label}
                onClick={this.onClickTabItem.bind(this)}
              />
            );
          })}
        </List>


        <Content className="tab-content" buttonBar={buttonBar}>
          {/* {children.map((child) => {
            if (!child) return null;
        
            const ChildElement = child.type;
            if (child.props.label !== active) return undefined;
            return <ChildElement key={child.props.label} {...child.props}/>
          })} */}
          {child? <ChildElement key={child.props.label} {...child.props}/> : null}
        </Content>
     
      

      </TabContainer>
    );
  }


}