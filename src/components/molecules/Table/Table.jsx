import React, { Component } from 'react';
import styled from 'styled-components';
import {TrashIcon,PencilIcon ,ChevronDownIcon,ChevronUpIcon  } from '@primer/octicons-react'
import { AppThemeProvider } from '../../../theme';


const Container = styled.div`
    height: ${props => props.height || (props.rows ? `${(props.rows+1)*3.4}vh` : undefined)};
    display: flex;
    flex-direction: column;
    background: ${props=>props.background};
`

const AccordionButton = styled.div`
    position: absolute;
    right: 1vw;
    top: 0px;
`
const IconButton = styled.button`
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items: center;
    opacity:0.8;
    background: none;    
    height:80%;
    aspect-ratio : 1 / 1;
    
    &:hover {
        background-color: ${props => (props.disabled ? 'lightgrey' : props.theme.list?.button?.background||props.theme.button?.primary?.background)};
        opacity:1;
    }
`

const TableHead = styled.table`
    font-size: 2.2vh;
    line-height: 1;
    width:  ${props => props.scrollable ? 'calc(100% - 1vw)' : '100%'};
    height: ${props => props.hide ? '0px' : '3.4vh'};
    border-spacing: 0.2vh;
    padding:0;
    margin:0;
    table-layout: fixed;
`

const TableView = styled.table`
    font-size: 2.2vh;
    line-height: 1;
    width: 100%;
    border-spacing: 0.2vh;
    table-layout: fixed;
    padding:0;
    margin:0;
    display: table;
    overflow-y: ${props=> props.overflow || 'scroll'};
`

const HeaderRow=styled.tr`
    height: 3.0vh;
`

const HeaderCell=styled.th`
    background: ${props => props.theme.list.header.background}};
    color:${props => props.theme.list.header.text}};
    text-align: ${props => props.align || 'center'};
    height: 3.0vh;
`

const Body=styled.div`
    overflow-y:auto;
    overflow-x:hidden;
    display:block;
    
    height: ${props => props.rows ? `${ (props.rowHeight||3.4)*(props.rows||10)}vh` : undefined};
    width: 100%;

    &::-webkit-scrollbar {         
        width: 1vw; 
        position: absolute;
        z-index: 10;
        display: ${props => props.noScroll? 'none': undefined }

    }
    &::-webkit-scrollbar-thumb {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5); 
        background-clip: content-box !important;
    }
    &:-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
        background-clip: content-box !important;
      }
      &::-webkit-scrollbar-track-piece {
        background: lightgray;
      }
      &::-webkit-scrollbar-button {
        background: lightgray;
        color: black;
      }
      &::-webkit-scrollbar-button:single-button {
        background-color: #bbbbbb;
        display: none;
        border-style: solid;
        height: 1vh;
        width: 1vw;
        pagding: 0.1vh;
      }
      /* Up */
      &::-webkit-scrollbar-button:single-button:vertical:decrement {
        border-width: 0 8px 8px 8px;
        border-color: transparent transparent #555555 transparent;
      }
      
      &::-webkit-scrollbar-button:single-button:vertical:decrement:hover {
        border-color: transparent transparent #777777 transparent;
      }
      /* Down */
      &::-webkit-scrollbar-button:single-button:vertical:increment {
        border-width: 8px 8px 0 8px;
        border-color: #555555 transparent transparent transparent;
      }
      
      &::-webkit-scrollbar-button:vertical:single-button:increment:hover {
        border-color: #777777 transparent transparent transparent;
      }      
`

const BodyRow=styled.tr`
    &:nth-child(even) {
        background: ${props => props.selected ?  props.theme.list?.selected?.background : props.theme.list?.even?.background || "#fff"}; 
        color: ${props => props.selected ?  props.theme.list?.selected?.text : props.theme.list?.even?.text}; 
    }
    &:nth-child(odd) {
        background: ${props => props.selected ?  props.theme.list?.selected?.background : props.theme.list?.odd?.background || "#ccc"}; 
        color: ${props => props.selected ?  props.theme.list?.selected?.text : props.theme.list?.odd?.text}; 
    }
    &:hover {background-color: ${props => props.selected ? props.theme.list.selected.background : props.theme.list.hover.background}};
    
    height: ${props => props.height || '3.0vh'};
`

const Cell=styled.td`
    position:relative;
    text-align: ${props => props.align};
    width: ${props => props.width || "auto"}} ;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-left: ${props => props.indent? '1vw' : undefined};
    vertical-align: middle;
    align-items: ${props => props.align};
`

const CategoryCell=styled.td`
    position:relative;
    text-align: left;
    width: ${props => props.width || "100%"}} ;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: #e7f1ff;
    overflow: hidden;
    height: 3.0vh;
    padding-left: ${props => props.indent? '1vw' : undefined};
 
`

export class Table extends Component {

    constructor(props={}) {
        const colTitle = props.colTitle??0
        const isSorted = props.isSorted??false

        super( {...props,colTitle,isSorted});

  
        this.state = {
            hovered: undefined,
            unfoldedCategories: []
        };
        this.initalSelectionDone = false;

        if (this.props.unfolded) {
            const data = this.props.data || []
            const c = this.props.categories
            this.state.unfoldedCategories = [...new Set(data.map(i=>i[c]))]            
        }
        else if (this.props.unfoldedCategories) {
            if (Array.isArray(this.props.unfoldedCategories))
                this.state.unfoldedCategories = this.props.unfoldedCategories
            else 
                this.state.unfoldedCategories = [this.props.unfoldedCategories]
        }


        this.name = props.name || `table`;
    }

    componentDidMount() {
        if ( this.props.selected) {
            
            //this.scrollTo(this.props.selected)
            /*
            const el = document.getElementById(`${this.name}-${this.props.selected}`);
            if (el)
                el.scrollIntoView();
                */
        }
   
    }  
    
    scrollToSelected( ) {

        if (this.initalSelectionDone && !this.props.redraw)
            return;
        const {data=[]} = this.props
        const i  = data.findIndex( d => d.selected===true)
        const name = this.name

        if( i===-1)
            return;

        
        const row = document.getElementById(`${name}-${i}`);
        try {
            if (row!==undefined && row!==null) row.scrollIntoView();
        }
        catch(err) {
            console.log('~~~ERROR',err,row)
        }
        this.initalSelectionDone = true;
    }
    

    componentDidUpdate( prevProps) {

        // in case unfolded property was set to true within a component update, completely unfold
        // in case unfolded property was set to false within a component update, keep current state
        if (this.props.unfolded && this.props.unfolded!==prevProps.unfolded ) {
            const data = this.props.data || []
            const c = this.props.categories
            const unfoldedCategories = [...new Set(data.map(i=>i[c]))]            
            this.setState({unfoldedCategories})
        }
        // in case unfoldedCategories property was changed within a component update, merge with current state
        else if ( this.props.unfoldedCategories && this.props.unfoldedCategories !== prevProps.unfoldedCategories) {

            this.setState( {unfoldedCategories: this.props.unfoldedCategories||[]});
        }
        
        this.scrollToSelected()        

    }
    
    onMouseEnter(idx) {
        this.setState( {hovered:idx})
    }

    onMouseLeave(idx) {
        if (this.state.hovered===idx)
            this.setState( {hovered:null})
    }

    onDeleteClick( event,record,i) {
        event.stopPropagation();
        if (this.props.onDelete)
            this.props.onDelete(record,i)
    }
    onEditClick( event,record,i) {
        event.stopPropagation();
        if (this.props.onEdit)
            this.props.onEdit(record,i)
    }

    onCategorySelected(category) {
        const idx = this.state.unfoldedCategories.findIndex( c=> c===category)
        const unfolded = [...this.state.unfoldedCategories];


        if (this.props.onCategorySelected ) {
            this.props.onCategorySelected(category, idx===-1)
        }
        else {
            if (idx===-1) {
                unfolded.push(category)
            }
            else {
                unfolded.splice(idx,1)
            }
            this.setState( {unfoldedCategories:unfolded})
    
        }
    }

    onItemSelected(i) {
        if (this.props.onSelected)
            this.props.onSelected(i)
    }

    
    render() {
        let {data=[],background,columns,headers,height,selected,rows,overflow,noScroll,categories,colTitle=0, rowHeight,isSorted=false} = this.props;
        let noHeaders = false;
        if ( headers===undefined) {
            headers = Object.keys(data)
            noHeaders= true;

        }

        let format= columns? columns.format:undefined;
        let align = columns? columns.align:undefined;

        const setSelected = (item,i) => {
            if (selected===undefined || selected===null)
                return item.selected;
            if (typeof(selected)==='number')
                return typeof (i)==='number' ? i===selected : item.id===i;            
            else 
                return item.id ===selected
        }

        if (categories) {
            const c = categories
            let sortIdx = 0;
            const categoryValues = [];
            data.forEach( item => {
                if (item && item[c]===undefined) {
                    item.sortIdx = sortIdx++;
                    return;
                }
                const cInfo = categoryValues.find( cv => cv.value===item[c])
                if (!cInfo) {
                    item.sortIdx = sortIdx++;
                    categoryValues.push( {value:item[c], sortIdx:item.sortIdx})                    
                }
                else {
                    item.sortIdx = cInfo.sortIdx
                }

            })

            const sortedData =  isSorted ? data: data.sort( (a,b) => {
                if (!a || !b) return 0;
                if (a.sortIdx>b.sortIdx) return 1;
                if (a.sortIdx<b.sortIdx) return -1;
                return 0;
            })

            data = [];
            let currentCategory = undefined;
            sortedData.forEach( (item,i) => {
                const c = categories

                if ( item[c]===undefined) {
                    data.push(item)
                    return;
                }
                const category = item[c]
                if ( currentCategory===undefined || category!==currentCategory) {
                    currentCategory = category;
                    
                    data.push({isCategory:true, category})
                }
                if ( this.state.unfoldedCategories.find( c => c===category)) {
                    item.indent = true;
                    item.selected = setSelected(item,i)
                    data.push(item)
                    return;

                }

            })           
        }
        else {
            data = data.map( (item,i) => {
                item.selected = setSelected(item,i)
                return item;
            })
        }

        const width = columns && columns.width? columns.width:[];
        const scrollable = true; //height!==undefined || rows ? data.length > rows : false;
        const name = this.name
        const cntColumns = columns && columns.fields ? columns.fields.length : 0 
        const minRows = (rows && data.length===rows)||(overflow==='auto')||(height) ? undefined : rows||10;
        
        const getFormatedValue= (val,i) => {
            
            if (format===undefined || format[i]===undefined || typeof(format[i])!=='function')
                return val;
            return format[i](val);
        }

        const isCategoryUnfolded = (category)  => {
            return this.state.unfoldedCategories.find( c => c===category)!==undefined
        }

        const getValues = ( data) =>{
            const v = [];
            const keys = (columns!==undefined && columns.fields) ? columns.fields : Object.keys(data)

            keys.forEach ( (key,i) => {
                let value=''
                if (typeof(key)==='function')
                    value =  key(data) 
                else if (key==='all')
                    value = data
                else 
                    value = data[key];
                v.push(value);
            })
            return v;
        }

        return (
            <AppThemeProvider>
            <Container background={background} >
                <TableHead hide={noHeaders}scrollable={scrollable}>
                    <colgroup >
                        {width.map( (w,x) => <col key={x} style={{width:`${w}`}}/>)}
                    </colgroup>
                    {!noHeaders ?
                    <thead>
                        <HeaderRow>
                        { headers.map( (row,j) => (
                            <HeaderCell  key={row}>{row}</HeaderCell>
                        ))}
                        </HeaderRow>
                    </thead>
                    :null}
                    
                </TableHead>
                <Body rows={minRows} rowHeight={rowHeight} noScroll={noScroll}>
                    <TableView rows={minRows} overflow={overflow}>
                        <colgroup>
                            {width.map( (w,x) => <col key={x} style={{width:`${w}`}}/>)}
                        </colgroup>
                        <tbody>
                            
                            { data.map( (record,i) => (
                                record.isCategory ?  
                                <BodyRow id={`${name}-${i}`} key={record.id||i} selected={i===selected}  height={rowHeight}
                                    onMouseEnter= { ()=> this.onMouseEnter(i)}
                                    onMouseLeave= { ()=> this.onMouseLeave(i)}
                                    onClick={ event => {this.onCategorySelected(record.category)}}>
                                { 
                                        <CategoryCell colSpan={cntColumns}>
                                            <div>
                                                {record.category}

                                            </div>
                                            <AccordionButton>
                                                { isCategoryUnfolded(record.category) ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                                            </AccordionButton>
                                            
                                        </CategoryCell>                                    
                                }
                                </BodyRow>
                                :
                                
                                <BodyRow id={`${name}-${i}`} key={record.id||i} selected={record.selected} height={rowHeight}
                                    onMouseEnter= { ()=> this.onMouseEnter(i)}
                                    onMouseLeave= { ()=> this.onMouseLeave(i)}
                                    onClick={ event => this.onItemSelected(record.id===undefined ? i : record.id)}>
                                { 
                                    getValues(record).map( (dataPoint,j) => (
                                        <Cell key={j}   
                                            align={ align? align[j]:undefined} 
                                            width={ width? width[j]:undefined}
                                            indent={ colTitle===0 && j===colTitle && record.indent}>

                                            {this.props.onDelete && j===colTitle && i===this.state.hovered ? 
                                                <div style={{height:'100%', zIndex:1000, position: 'absolute', top:'10%', right:'0.1vw'}} >
                                                        <IconButton onClick={ (event)=> { this.onDeleteClick(event, record,i)}}><TrashIcon verticalAlign="middle" /></IconButton>
                                                        
                                                </div> 
                                            : null}
                                            {this.props.onEdit && j===colTitle && i===this.state.hovered ? 
                                                <div style={{height:'100%', zIndex:1000, position: 'absolute', bottom:0, right:'calc(0.3vw + 32px)'}} >
                                                        <IconButton onClick={ (event)=> { this.onEditClick(event, record,i)}}><PencilIcon/></IconButton>
                                                        
                                                </div> 
                                            : null}
                                            
                                            {getFormatedValue(dataPoint,j)}
                                        </Cell>
                                    )
                                )}
                                </BodyRow>
                            ))}
                        </tbody>
                    </TableView>
                </Body>

            </Container>
            </AppThemeProvider>
        )
    }
  
  
}
