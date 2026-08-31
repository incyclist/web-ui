/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Button, ButtonBar, Column, ErrorBoundary, Row, View, Image, UrlLink  } from "../../../atoms"
import { AppThemeProvider } from "../../../../theme"
import styled from "styled-components";
import { FreeMap } from "../../../molecules/Maps";
import { ActivityGraph,ActivityStats,ScreenshotPopup } from "../../../molecules/Activity";
import { MessageBox } from "../../../molecules";

import { Marker } from "react-leaflet";
import L, { icon } from 'leaflet';
import Loader from "react-spinners/ClipLoader";

export const ContentArea = styled.div`
    position:relative;
    width: calc(100% - 2vw);
    height: calc(100% - 1vh);
    text-align: left ;
    margin:auto;
    display: flex;
    flex-direction:column;
    padding-left: 1vw;
    padding-right: 1vw;
    padding-top: 1vh;
    padding-bottom: 0;
    top:0;
    left:0;
    background: ${props => props.theme?.dialogContent?.background || props.background || 'white'};
 
    
`;

export const DataArea = styled.div`
    position:relative;
    height: calc(100% - 9.7vh);
    width: 100%;
`

const CRow = styled(Row)`
    background: ${props => props.theme?.dialogContent?.background || 'white'};
    color: ${props => props.theme?.dialogContent?.text || 'black'};
    position: relative;
`

const Block= styled(View)`
    display: block;
    height: 100%;
`

const DEFAULT_DONATE_TEXT = 'You seem to be enjoying Incyclist. Please consider donating to support this app.'
const DEFAULT_DONATE_URL = 'https://www.paypal.com/paypalme/incyclist'

export const ActivitySummaryView = ( {activity,position,preview, units, xScale,
                                  showMap,showSave,showNew=true,showContinue=true,showExit=true,showDelete:showDeleteProp,
                                  isSaving=false,showDeleteConfirm=false,
                                  showDonate,donateText=DEFAULT_DONATE_TEXT,donateUrl=DEFAULT_DONATE_URL,onDonateClicked,
                                  onTitleChange, onSave, onNew, onContinue, onExit, onDelete, onDeleteConfirm, onDeleteCancel
                                 }) => {

    const [markerSize, setMarkerSize] = useState()

    // delete button shown if specified by props, otherwise fallback to always show when save is shown
    const showDelete = showDeleteProp??showSave

    const screenshots = activity?.screenshots??[]
    const myIcon = useMemo( ()=> {
        let size = Number(markerSize)
        if (Number.isNaN(size))
            size = 24;
        return new L.Icon({
            iconUrl: 'images/camera.svg',
            iconRetinaUrl: 'images/camera.svg',
            popupAnchor:  [-0, -0],
            iconSize: [size,size],     
        })
    },[markerSize]);

    const onViewportChanged = (v)=> {
        if ( !v?.zoom)
            return;
        setMarkerSize (Number(24/20*v.zoom).toFixed(0))   
    }

    const statsHeight = (showDonate && donateText)? 'calc(58% - 3.5vh)' :  '58%'    

    return <ErrorBoundary> 
        <AppThemeProvider>
            <ContentArea>
                <DataArea>
                    <CRow className='activity-stats' height={statsHeight} margin='0 0 1% 0' style={{ textAlign:'left'}}>
                        <Column width='54%' margin='0 4% 0 0' >

                            { showMap ? <FreeMap
                                activity={activity}
                                options={[]}
                                marker={position}
                                onViewportChanged={onViewportChanged }>

                                {(screenshots?.length>0) && screenshots.filter(s => !!s.position).map ( (s) => 
                                    <ErrorBoundary hideOnError>
                                        <Marker
                                            icon = {myIcon}
                                            key = {`${s.position}`}
                                            draggable={false}
                                            position={ [s.position.lat, s.position.lng]}
                                        >
                                            <ScreenshotPopup screenshot={s} />
                                        </Marker>
                                    </ErrorBoundary>
                                    
                                )}                
                            </FreeMap> 
                            : null}

                            { preview ? <Block><Image width='100%' height='100%' src={preview}/></Block> : null }
                        </Column>
                        
                        <Column width='42%' className='activity-stats'>        
                            <ErrorBoundary>
                                <ActivityStats activity={activity} onTitleChange={onTitleChange}/>
                            </ErrorBoundary>               
                        </Column>


                    </CRow>

                    { showDonate && donateText ? 
                        <ErrorBoundary>
                            <CRow height='3.5vh' style={{ minHeight:'3.5vh', fontSize:'1.5vh',textAlign:'center', background:'darkgrey', marginBottom:'1vh'}}>
                                <Column style={ {textAlign:'center', verticalAlign:'middle', minHeight:'3.5vh', fontSize:'3vh'   }}>
                                    <span role='img' area-label='info' >ℹ️</span>
                                </Column>
                                <Column  width='90%'>
                                    <span>{donateText}</span>
                                    <span>Click <UrlLink text='here' url={donateUrl} onOpened={onDonateClicked}/> to donate </span>
                                </Column>
                            </CRow> 
                        </ErrorBoundary>                            
                        : null
                    }
                
                    <CRow className='activity-graph' height='40%'  style={{ textAlign:'left'}}>
                        <ErrorBoundary>
                            <Column width='100%' >
                                <ActivityGraph activity={activity} units={units} xScale={xScale} />
                            </Column>
                        </ErrorBoundary>

                    </CRow>
                </DataArea>

                <ButtonBar justify='center'>
                    {showSave && <Button height={'5vh'} primary={true} text={isSaving ? '' : 'Save'} disabled={isSaving} onClick={onSave}>{isSaving && <Loader size='2.2vh'/>}</Button>}
                    {showNew && <Button height={'5vh'} primary={true} text='New Ride' disabled={isSaving} onClick={onNew} />}
                    {showContinue && <Button height={'5vh'} primary={false} text='Continue' onClick={onContinue} />}
                    {showDelete && <Button height={'5vh'} primary={false} text='Delete' onClick={onDelete} />}
                    {showExit && <Button height={'5vh'} primary={false} text='Exit App' onClick={onExit} />}
                </ButtonBar>
            </ContentArea>

            {showDeleteConfirm && createPortal(
                <MessageBox
                    title='Delete Ride'
                    text='This will permanently delete this ride. Are you sure?'
                    defaultButton='No'
                    center
                    onYes={onDeleteConfirm}
                    onNo={onDeleteCancel}
                />,
                document.body
            )}
        </AppThemeProvider>
    </ErrorBoundary>
}