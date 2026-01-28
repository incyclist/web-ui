import React, { useRef, useState, useEffect,useCallback } from "react"
import MainPage from "../../components/molecules/MainPage"
import { Center, GroupTitle, Loader, PageTitle } from "../../components/atoms"
import styled from "styled-components"
import { Column, Row } from "../../components/atoms/layout/View"
import { NavigationBar } from "../../components/molecules/NavigationBar"
import { ActivitiesTable } from "../../components/modules/activities"
import { useActivityList, useDevicePairing } from "incyclist-services"
import { usePageLogger, useUnmountEffect } from "../../hooks"
import { DialogLauncher } from "../../components/molecules"
import { ActivityDetailsDialog } from "../../components/modules/activities/ActivityDetails"
import { RouteDetailsDialog } from "../../components/modules/routeSelection/RouteDetails"
import { useNavigate } from "react-router"


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

const NoActivitiesArea = styled(Row)`    
    height: 100%;
    width:100%;
    
    justify-content: center;
    align-items: center;
    text-align: center;
    vertical-align: middle;
`


export const ActivitiesScreen =  
    ({ observer, activities, countries,filters={},contentTypes,routeTypes,
       onSelect,onDelete, closePage,loading,
       onChangeFilter 
    }) => {

    // TODO: Filtering
    // const filterProps = {activities, countries,filters,contentTypes,routeTypes,onChangeFilter}
    

    const Table = ({activities,loading}) => {
        if (!loading && activities?.length>0)
            return <ActivitiesTable activities={activities} onSelect={onSelect} onDelete={onDelete}/>

        if (!loading && activities?.length===0)
            return (
            <NoActivitiesArea >
                <Column>
                    <GroupTitle>No Activities found</GroupTitle>
                </Column>
            </NoActivitiesArea>
            )
        if (loading)
            return <Center><Loader/></Center>

        return null

    }

    return (
        
        <MainPage >
            <View >
                <NavigationBar closePage={closePage} selected='activities' hotkeysDisabled={true}/>

                <ContentArea width={'100%'} height='100%' >
                    <PageTitle>Activities</PageTitle>   
                    <Table activities={activities} loading={loading}/>
                    

                </ContentArea>
            </View>
        </MainPage>
        
    )
}

const PAGE_ID = 'Activities'

export const ActivitiesPage = () => {

    const [initialized, setInitialized] = useState(false)
    const [pageState,setPageState] = useState(null)

    const [ activities, setActivities ] = useState({})
    // TODO Filtering:  const [ filter, setFilter ] = useState({})
    const [ loading, setLoading  ] = useState(true)
    const service = useActivityList()
    const [logger,closePageLogger] = usePageLogger(PAGE_ID,pageState)
    const observerRef = useRef(null)
    const dialogRef = useRef(null)
    const pairing = useDevicePairing()
    const navigate = useNavigate()

    const nop = (fn) => { 
        return ()=>{
            logger.logEvent( {message:'error',error:'missing event handler',missing:fn})
        }        
    }

    const updateState = useCallback( (displayProps)=>{

        try {
            //const A = (activities)=>(activities??[]).map(a=>a.summary?.id).join(',')

            setActivities( displayProps.activities)
    
            if (loading && displayProps.activities) {            
                setLoading(false)
            }
    
        }
        catch(err) {
            logger.logEvent({message:'error',fn:'updateState', error:err.message, stack:err.stack})
        }

    },[loading, logger])

    const init = useCallback( async ()=>{
        
        // setState( service.openList())
        const displayProps = service.openList()


        setActivities(displayProps?.activities)

        setLoading(false)
        observerRef.current = service.getObserver()        
        observerRef.current.on('updated',updateState)
    },[service, updateState])


    const openDialog = ( Dialog,props)=> {
        dialogRef.current.openDialog(Dialog,props??{})
    }



    const onDeleteHandler = async (id)=>{
        service.delete(id)
    }

    const onSelectHandler = async (id)=>{
        const activity = activities.find( a=> a.summary.id===id).summary
        logger.logEvent({message:'item selected', id, title:activity?.title, eventSource:'user' })


        service.select(id)
        openDialog(ActivityDetailsDialog, {onOpen:onOpenHandler,onStart})
    }


    const onStart =  async (route) => {
        const {id,title,videoUrl} = route??{}
        logger.logEvent( {message:'Attempting to start a ride',id,title,videoUrl,readyToStart:pairing.isReadyToStart(), } )

        const next =  pairing.isReadyToStart() ? '/rideOK'  : '/pairingStart'
        navigate( next, { state: { source:'/activities' } })
            .then( ()=>{closePage()})
    }

    const onAddWorkout =  async (settings) => {        
        navigate('/workouts')
        closePage()
    }


    const onOpenHandler =  ()=>{
        const card = service.openRoute()
        openDialog(RouteDetailsDialog,{onStart,onAddWorkout,card})
    }

    useEffect( ()=> {
        if (initialized)
            return;

        if (service.isStillLoading()) {
            setLoading(true)

            service.preload().wait().then( () => {
                init()
            })
        }
        else {
            setLoading(true)
            init()
        }       
        setPageState('opened')
        setInitialized(true)

    }, [initialized, service, init])

    useUnmountEffect( ()=> {
        //console.log('# activities page unmounted')
    })

    const closePage = useCallback(async ()=> {
        service.closeList()
        closePageLogger()
    },[closePageLogger, service])

    //const {activities} = state??{}

    return <>
        <ActivitiesScreen
            loading={loading}
            activities={activities}
            onSelect={onSelectHandler}
            onDelete={onDeleteHandler}
            onChangeFilter={service.onChangeFilter??nop('onChangeFilter')}
            closePage={closePage}
        />
        <DialogLauncher ref={dialogRef}/>
    </>

}