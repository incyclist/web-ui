import React from "react"
import styled from "styled-components"
import { Text, Row, UrlLink, Column, Button } from "../../../atoms"

const Page = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    padding: 1vw;
`

const LeftColumn = styled(Column)`
    width: 36%;
    padding-right: 2vw;
    box-sizing: border-box;
`

const RightColumn = styled(Column)`
    width: 64%;
    box-sizing: border-box;
`

const Header = styled.h2`
    font-size: 2vh;
    margin: 0 0 1vh 0;
`

const Card = styled(Column)`
    border: 1px solid grey;
    border-radius: 6px;
    padding: 1.5vh 1vw;
    margin-top: 2vh;
    box-sizing: border-box;
`

const CardTitle = styled.h3`
    font-size: 2vh;
    margin: 0 0 1vh 0;
`

const Muted = styled.div`
    color: grey;
    font-size: 1.6vh;
    margin-top: 1vh;
`

const SubLabel = styled.span`
    font-size: 1.2vh;
    opacity: 0.8;
`

const Confirmation = styled.span`
    color: #8dc100;
    font-size: 1.5vh;
    margin-left: 0.5vw;
`

const LABEL_WIDTH = '8vw'

const UuidRow = ({ uuid, onCopyUuid, uuidCopied }) => (
    <Row>
        <Text label='uuid' labelWidth={LABEL_WIDTH}>{uuid}</Text>
        {!uuidCopied && onCopyUuid
            ? <Button width='6ch' height='2vh' fontSize='1.5vh' secondary={true} padding='0' margin='0 0 0 0.5vw' onClick={onCopyUuid}>Copy</Button>
            : null}
    </Row>
)

const AppInfo = ({ appInfo, onOpenLink, onCopyUuid, uuidCopied }) => {
    const { title, appVersion, uiVersion, uuid, privacyUrl } = appInfo
    return <>
        <Header>{title}</Header>
        <Text label='App Version' labelWidth={LABEL_WIDTH}>{appVersion}</Text>
        <Text label='UI Version' labelWidth={LABEL_WIDTH}>{uiVersion}</Text>
        <UuidRow uuid={uuid} onCopyUuid={onCopyUuid} uuidCopied={uuidCopied} />
        <Text label='Privacy' labelWidth={LABEL_WIDTH}>
            <UrlLink text='Privacy Statement' url={privacyUrl} onClick={() => onOpenLink('privacy', privacyUrl)} />
        </Text>
    </>
}

const HelpRow = ({ link, onOpenLink, onOpenEmail, onCopyDetails, copied }) => {
    const email = link.email
    const onClick = email ? () => onOpenEmail(link) : () => onOpenLink(link.id, link.url)
    return (
        <Row>
            <Text label={link.shortLabel} labelWidth={LABEL_WIDTH}>
                <UrlLink text={link.label} url={link.url} onClick={onClick} />
            </Text>
            {email
                ? <>
                    <Button width='12ch' height='2vh' fontSize='1.5vh' secondary={true} padding='0' margin='0 0 0 0.5vw' onClick={() => onCopyDetails(email)}>{email.copyLabel}</Button>
                    {copied && email.copiedMessage ? <Confirmation role='status'>{email.copiedMessage}</Confirmation> : null}
                </>
                : null}
        </Row>
    )
}

const ChannelButton = ({ channel, onDonate }) => (
    <Button
        primary={channel.primary}
        secondary={!channel.primary}
        margin='0 1vw 0 0'
        height='6vh'
        padding='0 1.5vw'
        fontSize='1.8vh'
        onClick={() => onDonate(channel.id, channel.url)}
    >
        <Column align='center'>
            <span>{channel.label}</span>
            <SubLabel>{channel.subLabel}</SubLabel>
        </Column>
    </Button>
)

const DonationButtons = ({ donation, onDonate }) => {
    const { mode, channels, websiteLink } = donation
    if (mode === 'website' && websiteLink) {
        return (
            <Row>
                <Button
                    primary={true}
                    margin='0 1vw 0 0'
                    height='6vh'
                    padding='0 1.5vw'
                    fontSize='1.8vh'
                    onClick={() => onDonate('website', websiteLink.url)}
                >
                    <Column align='center'>
                        <span>{websiteLink.label} ↗</span>
                        <SubLabel>{websiteLink.host}</SubLabel>
                    </Column>
                </Button>
            </Row>
        )
    }
    return (
        <Row>
            {channels.map(c => <ChannelButton key={c.id} channel={c} onDonate={onDonate} />)}
        </Row>
    )
}

const DonationCard = ({ donation, onDonate, onOpenOtherLink }) => (
    <Card className='donation'>
        <CardTitle>{donation.title}</CardTitle>
        <Text noPadding>{donation.promise}</Text>
        {donation.fundsText ? <Text>{donation.fundsText}</Text> : null}
        <DonationButtons donation={donation} onDonate={onDonate} />
        <Muted>
            {donation.note}
            {' '}
            {donation.otherHelpLinks.map((l, i) => (
                <React.Fragment key={l.url}>
                    {i > 0 ? ' · ' : null}
                    <UrlLink text={l.label} url={l.url} onClick={() => onOpenOtherLink(l)} />
                </React.Fragment>
            ))}
        </Muted>
    </Card>
)

export const SupportAreaView = ({
    appInfo, helpTitle, helpLinks = [], donation,
    copied = false, uuidCopied = false,
    onOpenLink = () => {}, onOpenOtherLink = () => {}, onOpenEmail = () => {}, onCopyDetails = () => {}, onCopyUuid, onDonate = () => {}
}) => {

    if (!appInfo || !donation)
        return null

    return (
        <Page className='support'>
            <LeftColumn>
                <AppInfo appInfo={appInfo} onOpenLink={onOpenLink} onCopyUuid={onCopyUuid} uuidCopied={uuidCopied} />
            </LeftColumn>
            <RightColumn>
                <Header>{helpTitle}</Header>
                {helpLinks.map(l => (
                    <HelpRow key={l.id} link={l} onOpenLink={onOpenLink} onOpenEmail={onOpenEmail} onCopyDetails={onCopyDetails} copied={copied} />
                ))}
                <DonationCard donation={donation} onDonate={onDonate} onOpenOtherLink={onOpenOtherLink} />
            </RightColumn>
        </Page>
    )
}
