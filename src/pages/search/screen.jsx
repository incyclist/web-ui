import React from "react"
import MainPage from "../../components/molecules/MainPage"
import { Center, GroupTitle, Loader, PageTitle } from "../../components/atoms"
import styled from "styled-components"
import { Column, Row } from "../../components/atoms/layout/View"
import { NavigationBar } from "../../components/molecules/NavigationBar"
import { RoutesTable } from "../../components/modules/Search/RoutesTable"
import { SearchFilter } from "../../components/modules/Search/Filter"
import { DisplayTypeSelection } from "../../components/molecules/Lists/DisplayTypeSelection"
import { RoutesGrid } from "../../components/modules/Search/RoutesGrid"
import { useAppState } from "incyclist-services"


const View = styled(Row)`
   
    width: 100%;
    height: 100%;
    overflow-y: hidden;
`

const ContentArea = styled(Column)`
   
    width: ${props => props.width ||'100%'};
    user-select:none;    
    height: 100%;
    padding-left:40px;
    padding-right: 40px;
    overflow-y: hidden;  
`

const NoRoutesArea = styled(Row)`    
    height: 100%;
    width:100%;
    
    justify-content: center;
    align-items: center;
    text-align: center;
    vertical-align: middle;
`


export const SearchScreen =  
    ({ routes, cards,countries,filters={},contentTypes,routeTypes,routeSources,units,
       onSelect,onDelete, closePage,loading,
       onChangeFilter,displayType: propDisplayType ,onDisplayTypeSelected
    }) => {


    const appState = useAppState()
    const filterProps = {routes,countries,filters,contentTypes,routeTypes,routeSources,onChangeFilter,units}
    const newUI = appState.hasFeature('NEW_SEARCH_UI')
    const displayType = newUI ? propDisplayType : null

    return (
        
        <MainPage >
            <View >
                <NavigationBar closePage={closePage} selected='search' hotkeysDisabled={true}/>

                <ContentArea width={'100%'} height='100%' >
                    <PageTitle>Search</PageTitle>   
                    
                    <SearchFilter {...filterProps} onChange={onChangeFilter}/>

                    {displayType ? <DisplayTypeSelection selected={displayType} onSelected={onDisplayTypeSelected} /> : null}

                    {!loading && (displayType==='list' || !displayType) && routes?.length>0 ? 
                        <RoutesTable routes={routes} onSelect={onSelect} onDelete={onDelete}/>: null }

                    {!loading && displayType==='tiles' && cards?.length>0 ? 
                        <RoutesGrid cards={cards} onSelect={onSelect} onDelete={onDelete}/>: null }

                    {!loading && routes?.length===0 ? 
                        <NoRoutesArea >
                            <Column>
                                <GroupTitle>No Routes found</GroupTitle>
                            </Column>
                        </NoRoutesArea>
                        :null
                    }
                    {loading? <Center><Loader/></Center>:null}

                </ContentArea>
            </View>
        </MainPage>
        
    )
}



