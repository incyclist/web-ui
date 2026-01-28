import React,{useRef,useState} from 'react';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import { api, hasFeature, isElectron } from '../../../utils/electron/integration';
import { AppThemeProvider } from '../../../theme';
import { getBindings } from 'incyclist-services';
import { isReactNative } from '../../../utils';
import NativeUiService from '../../../bindings/native-ui';

const DEFAULT_TEXT = 'Drag your file here, or click to select' 

const getSize =(s,def)  => {
    if (s===undefined || s===null)
        return  def;
    return isNaN(s) ? s : `${s}px`
}

const getBackgroundColor = (props) => {
    if (props.backgroundColor) 
        return props.backgroundColor
    return props.disabled ? '#fafafa' : '#white'
}

const ErrorContainer = styled.div`
    position: absolute; 
    bottom: 0; 
    left:0;
    margin: 0.1vh;
    width: 100%;    
    font-size: 1.2vh;
    white-space: pre-wrap;
`


const DropzoneContainer = styled.div`
    background-color: ${props => getBackgroundColor(props)} ;
    position: relative;
    width: ${props => getSize(props.width,undefined)}; 
    height: ${props => getSize(props.height,'50px')};
    display: flex;
    justify-content: center;
    align-items: center;
    align-items: center;
    text-align: center;
    vertical-align: middle;
    margin: auto;
    padding-left: 1vw;
    padding-right: 1vw;
    border-width: 2px;
    border-radius: 10px;
    border-color: ${props => props.disabled  ? "#eeeeee" : props.borderColor || '#dcdcdc'} ;
    border-style: dashed;
    color: ${props => props.disabled ? '#bdbdbd' : props.textColor||props.theme?.dialog?.text };
    outline: none;
    transition: border .24s ease-in-out;    
    opacity: ${props => props.disabled ? 0.5 : props.opacity||1 }
`
let dragCounter = 0;

export const deleteProps = ( props, names) => {
    names.forEach( name => delete props[name])
}

export const createContainerProps = (props,scheme) => {
    const containerProps = { ...props};
    deleteProps(containerProps,['electron','onClick','children','onClearError'])
    containerProps.scheme = scheme;    
    return containerProps;
}

export const createChildProps = (childProps,parentProps) => {
    const combinedChildProps = { ...childProps};

    combinedChildProps.disabled = (childProps ? childProps.disabled: undefined) || parentProps.disabled;
    return combinedChildProps;
}

const ErrorElement = (props) => {
    return (
        <ErrorContainer className={'dropzone-error'}>
            <b style={{color:'red'}}>{props.error}</b>
        </ErrorContainer>
    )
}

const getError = ( err) => {
    if (!err)
        return;
    if ( typeof(err)==='string')
        return err;
    if ( typeof(err)==='object') {
        return err.message
    }
    return undefined
}

export const Dropzone = (props) => {

    const logger = new EventLogger('Incyclist') 

    const ref = useRef(null);
    const inputRef = useRef(null);
    const selecting = useRef(false)

    const [error,setError] = useState( getError(props.error))

    const electronSupported = isElectron() && hasFeature('FileSelection.openFileDialog')
    const getFilePathSupported = (isElectron() && hasFeature('File.path')) || isReactNative()

    const setSelecting = (val)=> {
        selecting.current = val
    }

    const isSelecting = () => {
        return selecting.current
    }

    
    const scheme = props.scheme || 'file';
    const {disabled=false,multiple=false,directory=false,text,filters} = props;

    

    const containerProps = createContainerProps(props,scheme)

    const onDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(disabled)
            return;

        setError(null);
        dragCounter++

    }

    const onDragOver = (e) => {     
        e.preventDefault();
        e.stopPropagation();
        if(disabled)
            return;
        return false;
    } 

    const onDragLeave = (e) => { 
        e.preventDefault();
        e.stopPropagation();
        if(disabled)
            return;
        dragCounter--


        return false;

    }

    const renderChildren = () => {
        const children = props.children;
        if (!children)
            return null;

        if ( Array.isArray(children)) {
            return children.map ( (child,idx) => {
                const ChildElement = child.type;                
                const childProps = createChildProps(child.props,containerProps);
                
                return <ChildElement key={idx} {...childProps}/>;
            })    
        }
        else {
            const ChildElement = children.type;           
            const childProps = createChildProps(children.props,containerProps);
            return <ChildElement {...childProps}/>;
        }        
    }



    const onClick =(e) => {
        e.stopPropagation();
        if (isSelecting())
            return;
        setSelecting(true)
    
        logger.logEvent( {message:'dropzone clicked',eventSource:'user'})
        setError(null);
        if (props.onClearError) props.onClearError();

        if (  !electronSupported) {
            onFallbackClick(e)
            return;
        }
        setSelecting(true);
    
        api.openFileDialog({multiple,directory, filters}).then( (files)=> {

            if (files.length===0)
                logger.logEvent( {message:'button clicked',button:'cancel',source:'user'})
            else 
                logger.logEvent( {message:'dropzone file(s) selected',files:files.map( f=>f.name), source:'user'})


            setSelecting(false)
            try {
                const dropInfo = parseDroppedFiles(files);
                if (dropInfo)
                    onDropCallback(dropInfo)
    
            }
            catch (err) { logger.logEvent( {message:'error',fn:'DropZone.onClick', error:err.messsage, stack:err.stack})}
            
        }) 
        .catch( ()=>setSelecting(false) )
        
    }

    const urlencode = (str)=> {
        try  {
            return str.replace(/#/g, "%23")
        }
        catch {
            return str
        }
        

    }


    const parseDroppedFiles = ( files) => {
        const dropInfo = [];
        if ( files &&  files.length > 0) {
            for (let i = 0; i <  files.length; i++) {
                
                const file =  getFilePathSupported ? NativeUiService.getInstance().getPathForFile(files[i]) : files[i]


                if ( file.path===undefined || file.path===null) {
                    file.path = file.name
                }

                if (!file.ext) {
                    const p = getBindings().path
                    const parsed = p ? p.parse( file.path) : file
                    file.ext = parsed.ext
                }
                
                if ( electronSupported && file.path !== file.name) {

                    file.url  = `${scheme}:///${urlencode(file.path)}`
                    let info = {}
                    if (!file.dir) {
                        info = api.parsePath(file.path);
                        file.dir = info.dir;
                        file.ext = info.ext;
                    }
                    let ext='';
                    if (file.ext && file.ext.length>0)
                        ext= file.ext.substr(1).toLowerCase();
                    dropInfo.push( { type:'url', url:file.url,name:file.name,dir:file.dir, ext, delimiter:info.delimiter})
                }
                else {
                    if ( file.url ==='file:///undefined')
                        delete file.url;
                    dropInfo.push( {type:'file',file})
                }
            }
            return dropInfo;               
        }
    }

    const onDropCallback = (dropInfo ) => {
        if (props.onDrop) {   
            const promise = props.onDrop(dropInfo)
            if (promise)  {
                promise.then( (res) => {    
                    if (res?.cntErrors>0) {
                        setError( getError(res.errors[0]));
                    }
                })
            }
        }
    }

    const onDrop =  (e) => { 

        if (props.onClearError) props.onClearError();

        if(disabled || !e || !e.dataTransfer)
            return;
        e.preventDefault();
        e.stopPropagation();
        

        if ( dragCounter === 0 ) 
            return false;

        const files = e.dataTransfer.files;


        

        const  fileNames = Array.from(files).map( f => {
            const file =  getFilePathSupported ? NativeUiService.getInstance().getPathForFile(f) : f
            return file.path??file.name
        })
        dragCounter = 0;

        
        //const fileNames = Array.from(files).map( f=>f.path)
        logger.logEvent( {message:'dropped',files:fileNames, source:'user'})


        try {
            const dropInfo = parseDroppedFiles(files);
            onDropCallback(dropInfo)

        }
        catch(err) {
            logger.logEvent( {message:'error',fn:'DropZone.onDrop', error:err.messsage, stack:err.stack})
        }
        e.dataTransfer.clearData()
        return false;
    }   

    const onFileChange = (e) => {
        const files = e.target.files;

        const dropInfo = parseDroppedFiles(files);
        if (props.onDrop) {    
            props.onDrop(dropInfo)
        }
        setSelecting(false)
    }

    const onFallbackClick = (e) =>  {
        
        //e.preventDefault();
        e.stopPropagation();
        if (inputRef && inputRef.current) inputRef.current.click()        
    }

    const label = text??DEFAULT_TEXT
    const handlers = {onClick, onDrop, onDragOver, onDragEnter, onDragLeave}
    return (
        <AppThemeProvider>
            <DropzoneContainer  ref={ref} tabIndex="0" className='dropzone' {...containerProps}  {...handlers}>
                 
                {!electronSupported && 
                    <div>
                        <label htmlFor='file'> {label}</label>
                        <input ref={inputRef} style= {{display:'none', margin:'2px'}} id='file' type="file" multiple={multiple}  disabled={disabled} onChange={onFileChange} value=''/>
                        { error && <ErrorElement error={error}/> }
                        { renderChildren()}
                    </div>
                }
                {electronSupported && <div>
                    { label}
                    { error && <ErrorElement error={error}/> }
                    { renderChildren()}
                </div>}
            </DropzoneContainer>
        </AppThemeProvider>)
}
