import React from 'react';
import { SupportAreaView } from './component'

export default {
    component: SupportAreaView,
    title: 'Modules/Settings/Support'
};

const Template = args => <SupportAreaView {...args} />;

const appInfo = {
    title: 'App info',
    appVersion: '1.2.3',
    uiVersion: '26.10.1',
    uuid: '1f3a9c0e-5d1b-4e7a-9a3c-2c8e0f4b77b2',
    privacyUrl: 'https://incyclist.com/privacy',
}

const email = {
    address: 'support@incyclist.com',
    subject: 'Incyclist support request',
    body: 'Hello,',
    copyText: 'To: support@incyclist.com',
    copyLabel: 'Copy details',
    copiedMessage: 'Copied. Paste it into an email to support@incyclist.com.',
}

const helpLinks = [
    { id: 'strava', label: 'Incyclist Strava Club', shortLabel: 'Strava', url: 'https://www.strava.com/clubs/1029407' },
    { id: 'slack', label: 'Incyclist Slack Workspace', shortLabel: 'Slack', url: 'https://join.slack.com/t/incyclist' },
    { id: 'email', label: 'support@incyclist.com', shortLabel: 'Email', url: 'mailto:support@incyclist.com', email },
]

const baseDonation = {
    title: 'Support Incyclist',
    promise: 'Incyclist is free and stays free. There is no subscription and nothing to unlock.',
    note: 'Donating is entirely voluntary and changes nothing in the app. You can also help by answering questions in the',
    otherHelpLinks: [
        { label: 'Strava club', url: 'https://www.strava.com/clubs/1029407' },
        { label: 'GitHub', url: 'https://github.com/incyclist' },
    ],
}

const direct = {
    appInfo,
    helpTitle: 'Need help?',
    helpLinks,
    donation: {
        ...baseDonation,
        mode: 'direct',
        fundsText: "If you'd like to help, donations pay for the server, app-store fees and code signing.",
        channels: [
            { id: 'paypal', label: 'PayPal', subLabel: 'one-time', url: 'https://www.paypal.com/paypalme/incyclist', primary: true },
            { id: 'github-sponsors', label: 'GitHub Sponsors', subLabel: 'one-time or monthly', url: 'https://github.com/sponsors/incyclist', primary: false },
        ],
    },
}

export const Default = Template.bind({});
Default.args = direct

export const WebsiteMode = Template.bind({});
WebsiteMode.args = {
    ...direct,
    donation: {
        ...baseDonation,
        mode: 'website',
        channels: [],
        websiteLink: { label: 'Ways to support Incyclist', url: 'https://incyclist.com/#support', host: 'incyclist.com' },
    },
}

export const Copied = Template.bind({});
Copied.args = { ...direct, copied: true }
