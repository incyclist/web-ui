import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import theme,{newUITheme} from '../src/theme'
import { initUserSettings, useUserSettings } from 'incyclist-services';

const Container = styled.div`
  width: 100%;
  height: 100%;
  min-width: 800px;
  min-height: 600px;
  padding: 5px;
  background-color: #green;
  display: flex;
  flex-direction: column;
`

class MockBinding {
    constructor() {
      this.data = {}
    }
    async getAll() {
      return this.data
    }
    set(key,value) {
      this.data[key] = value
    }
    save() {}
    
    canOverwrite() {
      return true
    }

}

export const TestContainer = (Story)=> {

  const [initialized,setInitialized] = useState(false)
  useEffect( ()=> {
    if (initialized)
      return

    initUserSettings( new MockBinding())
    useUserSettings().init().then( ()=>{
      theme.add('new', newUITheme)
      theme.select('new')
      setInitialized(true)
    })

  })

  if (!initialized)
    return false

  return (
    
    <Container className='test-container'>
      
      <Story />
    </Container>
    
  )


}

export const decorators = [
  TestContainer    
];


