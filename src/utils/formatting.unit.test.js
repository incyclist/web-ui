import { trimTrailingChars,pad, timeFormat,dateFormat } from './formatting';

describe ('trimTrailingChars',()=>{

    test ( 'single', ()=> {
        let res = trimTrailingChars('http://dlws.incyclist.com/api/v1/','/');

        expect(res).toBe('http://dlws.incyclist.com/api/v1')
    })

    test ( 'multiple', ()=> {
        let res = trimTrailingChars('http://dlws.incyclist.com/api/v1////////','/');

        expect(res).toBe('http://dlws.incyclist.com/api/v1')
    })

    test ( 'no char specified', ()=> {
        let res = trimTrailingChars('http://dlws.incyclist.com/api/v1/');

        expect(res).toBe('http://dlws.incyclist.com/api/v1')
    })

})

describe ( 'pad',()=> {

    test( 'normal use, requires padding',()=> {
        const res = pad(1,5);
        expect(res).toBe('00001')
    })

    test( 'normal use, does not require padding',()=> {
        const res = pad(100,3);
        expect(res).toBe('100')
    })

    test( 'negative number, requires padding',()=> {
        const res = pad(-11,5);
        expect(res).toBe('-00011')
    })

    test( 'normal use, float requires padding',()=> {
        const res = pad(1.23,3);
        expect(res).toBe('001.23')
    })

    test( 'negative float number, requires padding',()=> {
        const res = pad(-11.5,5);
        expect(res).toBe('-00011.5')
    })

})

describe( 'timeFormat', ()=> {

    test( 'more than one hour', ()=>{
        const res = timeFormat(3661)
        expect(res).toBe('1:01:01')
    })

    test( 'more than 24 hours => does not display days', ()=>{
        const res = timeFormat(3661+24*3600)
        expect(res).toBe('25:01:01')
    })

    test( 'with milliseconds => cuts milliseconds', ()=>{
        const res = timeFormat(3661.123)
        expect(res).toBe('1:01:01')
    })

    test( 'less than one hour, cutMissing=false', ()=>{
        const res = timeFormat(661,false)
        expect(res).toBe('0:11:01')
    })

    test( 'less than one hour, cutMissing=true', ()=>{
        const res = timeFormat(661,true)
        expect(res).toBe('11:01')
    })

    test( 'less than one minute, cutMissing=false', ()=>{
        const res = timeFormat(51,false)
        expect(res).toBe('0:00:51')
    })

    test( 'less than one minute, cutMissing=true', ()=>{
        const res = timeFormat(51,true)
        expect(res).toBe('00:51')
    })

    test( 'no value specified', ()=>{
        const res = timeFormat()
        expect(res).toBeUndefined();
    })

})



describe( 'dateFormat', ()=> {

    test( 'valid date, all parts,local time', ()=>{
        const d = new Date('August 19, 1975 23:15:30')
        const res = dateFormat(d,'%Y%m%d%H%M%S')

        expect(res).toBe('19750819231530');
    })

    test( 'valid date, all pars wit formatting,local time', ()=>{
        const d = new Date('August 19, 1975 23:15:30')
        const res = dateFormat(d,'%Y-%m-%d %H:%M:%S')

        expect(res).toBe('1975-08-19 23:15:30');
    })

    test( 'valid date, only date,local time', ()=>{
        const d = new Date('August 19, 1975 23:15:30')
        const res = dateFormat(d,'%Y%m%d')

        expect(res).toBe('19750819');
    })

    test( 'valid date, invalid format in formatting string', ()=>{
        const d = new Date('August 19, 1975 23:15:30')
        const res = dateFormat(d,'%X%m%d')

        expect(res).toBe('%X0819');
    })

    test( 'valid date, no format string, local time', ()=>{
        const d = new Date('August 19, 1975 23:15:30')
        const res = dateFormat(d)

        expect(res).toBe('19750819231530');
    })

    test( 'no value specified', ()=>{
        const res = dateFormat()
        expect(res).toBeUndefined();
    })

    test( 'no Date class specified', ()=>{
        const res = dateFormat(1234)
        expect(res).toBeUndefined();
    })

    test( 'utc=true', ()=>{
        const d = new Date()
        d.setUTCFullYear(1975);
        d.setUTCMonth(0); // January=0, December=11
        d.setUTCDate(19);
        d.setUTCHours(11);
        d.setUTCMinutes(15);
        d.setUTCSeconds(30);
        const res = dateFormat(d,'%Y%m%d%H%M%S',true)
        expect(res).toBe('19750119111530');
    })

})