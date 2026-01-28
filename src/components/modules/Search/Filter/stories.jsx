import React from 'react';

import {SearchFilter} from './index';


export default {
  component: SearchFilter,
  title: 'Modules/Search/SearchFilter',
  argTypes: { onChange: { action: 'changed' } },
};

const Template = args => <SearchFilter {...args} />;



export const Default = Template.bind({});
Default.args = {
    filters:{}
};


export const Title = Template.bind({});
Title.args = {
    filters:{ title:'Test'}
};

export const MinDistance = Template.bind({});
MinDistance.args = {
    filters:{ distance:{min:12345}}
};

export const MaxDistance = Template.bind({});
MaxDistance.args = {
    filters:{ distance:{max:12345}}
};

export const Imperial = Template.bind({});
Imperial.args = {
    filters:{ distance:{min:{ value:12.2, unit:'mi'}}},
    units:{distance:'mi',elevation:'ft' }
};

export const MinElevation = Template.bind({});
MinElevation.args = {
    filters:{ elevation:{min:123}}
};

export const MaxElevation = Template.bind({});
MaxElevation.args = {
    filters:{ elevation:{max:345}}
};

export const Countries = Template.bind({});
Countries.args = {
    filters:{ country:'Germany'},
    countries: ['Australia','Belgium','Canada','Germany', 'France', ]
};

export const Content = Template.bind({});
Content.args = {
    filters:{ content:'Video'},
    contentTypes: ['GPX','Video' ]
};

export const RouteTypes = Template.bind({});
RouteTypes.args = {
    filters:{ routeType:'Loop'},
    routeTypes: ['Loop','Point to Point' ]
};


export const NoFilter = Template.bind({});
NoFilter.args = {
    
    countries: ['Australia','Belgium','Canada','Germany', 'France' ],
    contentTypes: ['GPX','Video' ],
    routeTypes: ['Loop','Point to Point' ]
};