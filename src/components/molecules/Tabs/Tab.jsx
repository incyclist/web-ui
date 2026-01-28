import React, { Component } from 'react';
import styled from 'styled-components';
import { AppThemeProvider } from '../../../theme';

const Active = styled.li`
    background: ${props => props.theme?.navbar?.selected?.background||props.theme?.list?.selected?.background};
    color: ${props => props.theme?.navbar?.selected?.text||props.theme?.list?.selected.text};
    display: inline-block;
    list-style: none;
    margin-bottom: 0px;
    padding: 0vh 1vw;
    font-size: 2.2vh;
    height: 6.66vh; // 11/12 of 80%
    line-height: 6.66vh; // 11/12 of 80%
    vertical-align:center;
`

const Inactive = styled.li`
    background: ${props => props.theme?.navbar?.normal?.background||props.theme?.list?.normal?.background};
    color: ${props => props.theme?.navbar?.normal?.text||props.theme?.list?.normal?.text};
    display: inline-block;
    list-style: none;
    margin-bottom: 0px;
    padding: 0 1vw;
    font-size: 2.2vh;
    height: 6.66vh; // 11/12 of 80%
    line-height: 6.66vh; // 11/12 of 80%
    vertical-align:center;

    &:hover {
      background: ${props => props.theme?.navbar?.hover?.background||props.theme?.list?.hover?.background};
      color: ${props => props.theme?.navbar?.hover?.text||props.theme?.list?.hover?.text};  
    }
`

export class Tab extends Component {
    onClick = () => {
      const { label, onClick } = this.props;
      if (onClick) {
        onClick(label);
      }
    }
  
    render() {
      const { activeTab, label } = this.props;
  
  
      if (activeTab === label) {
        return (
            <AppThemeProvider>
              <Active
                className='tab-list-item tab-list-active'
                onClick={()=>this.onClick()}
              >
                {label}
              </Active>
            </AppThemeProvider>
          );
      }
      else {
        return (
          <AppThemeProvider>
            <Inactive
                className='tab-list-item'
                onClick={()=>this.onClick()}
              >
                {label}
              </Inactive>
            </AppThemeProvider>
          );
    
      }


  
    }
  }
  