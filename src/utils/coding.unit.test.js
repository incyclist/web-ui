import { average,sum,valid,clone,overwrite } from "./coding"


describe ('average' ,()=> {

    describe ('without key' ,()=> {

        test( 'positive case', ()=> {
            const res = average( [ 1,2,3,-6 ] )
            expect(res).toBe(0)
        })

        test( 'undefined', ()=> {
            const res = average( undefined )
            expect(res).toBeUndefined()

        })

        test( 'empty', ()=> {
            const res = average( [] )
            expect(res).toBeUndefined()
            
        })

        test( 'all values are undefined', ()=> {
            const res = average( [undefined,undefined,undefined] )
            expect(res).toBeUndefined()
            
        })

        test( 'some values are undefined', ()=> {
            const res = average( [ 1,2,3,-6,undefined,undefined ] )
            expect(res).toBe(0)
            
        })

        test( 'with non-array argument', ()=> {
            const res = average( 'some string' )
            expect(res).toBeUndefined()
            
        })
    })


    describe ('with key' ,()=> {

        test( 'positive case', ()=> {
            const res = average( [ {x:1},{x:2},{x:3},{x:-6} ],'x' )
            expect(res).toBe(0)
        })

        test( 'positive case, incorrect key', ()=> {
            const res = average( [ {x:1},{x:2},{x:3},{x:-6} ],'y' )
            expect(res).toBeUndefined()
        })

        test( 'undefined', ()=> {
            const res = average( undefined,'x' )
            expect(res).toBeUndefined()

        })

        test( 'empty', ()=> {
            const res = average( [],'x' )
            expect(res).toBeUndefined()
            
        })

        test( 'all values are undefined', ()=> {
            const res = average( [undefined,undefined,undefined],'x' )
            expect(res).toBeUndefined()
            
        })

        test( 'some values are undefined', ()=> {
            const res = average( [ {x:1},{x:2},{x:3},{x:-6},{z:1},{z:2} ],  'x' )
            expect(res).toBe(0)
            
        })

        test( 'with non-array argument', ()=> {
            const res = average( 'some string','x' )
            expect(res).toBeUndefined()
            
        })
    })

})

describe ('sum' ,()=> {

    describe ('without key' ,()=> {

        test( 'positive case', ()=> {
            const res = sum( [ 1,2,3,6 ] )
            expect(res).toBe(12)
        })

        test( 'undefined', ()=> {
            const res = sum( undefined )
            expect(res).toBeUndefined()

        })

        test( 'empty', ()=> {
            const res = sum( [] )
            expect(res).toBeUndefined()
            
        })

        test( 'all values are undefined', ()=> {
            const res = sum( [undefined,undefined,undefined] )
            expect(res).toBeUndefined()
            
        })

        test( 'some values are undefined', ()=> {
            const res = sum( [ 1,2,3,6,undefined,undefined ] )
            expect(res).toBe(12)
            
        })

        test( 'with non-array argument', ()=> {
            const res = sum( 'some string' )
            expect(res).toBeUndefined()
            
        })
    })


    describe ('with key' ,()=> {

        test( 'positive case', ()=> {
            const res = sum( [ {x:1},{x:2},{x:3},{x:-6} ],'x' )
            expect(res).toBe(0)
        })

        test( 'positive case, incorrect key', ()=> {
            const res = sum( [ {x:1},{x:2},{x:3},{x:-6} ],'y' )
            expect(res).toBeUndefined()
        })

        test( 'undefined', ()=> {
            const res = sum( undefined,'x' )
            expect(res).toBeUndefined()

        })

        test( 'empty', ()=> {
            const res = sum( [],'x' )
            expect(res).toBeUndefined()
            
        })

        test( 'all values are undefined', ()=> {
            const res = sum( [undefined,undefined,undefined],'x' )
            expect(res).toBeUndefined()
            
        })

        test( 'some values are undefined', ()=> {
            const res = sum( [ {x:1},{x:2},{x:3},{x:-6},{z:1},{z:2} ],  'x' )
            expect(res).toBe(0)
            
        })

        test( 'with non-array argument', ()=> {
            const res = sum( 'some string','x' )
            expect(res).toBeUndefined()
            
        })
    })

})


describe('Coding Utils', () => {

    describe('valid', () => {

        test('argument is null', () => {
            let res = valid(null);
            expect(res).toBe(false);
        });

        test('argument is undefined', () => {
            let res = valid(undefined);
            expect(res).toBe(false);
        });

        test('argument is 0', () => {
            let res = valid(0);
            expect(res).toBe(true);
        });

        test('argument is FALSE', () => {
            let res = valid(false);
            expect(res).toBe(true);
        });

        test('argument is a valid object', () => {
            let res = valid( {a:1} );
            expect(res).toBe(true);
        });

        test('argument is an empty object', () => {
            let res = valid( {} );
            expect(res).toBe(true);
        });


    });
});

describe( 'clone' ,()=> {

    test('clone object',()=> {
        const a = { num:1, str:'string', bool:true, obj:{ num:2, str:'something' }};
        const b = clone(a);
        expect(b).toEqual(a);
    
        a.num=2;
        expect(b.num).toBe(1);    
    })

    test('clone string',()=> {
        const b = clone('any string');
        expect(b).toEqual('any string');    
    })

    test('clone undefined',()=> {
        const b = clone(undefined);
        expect(b).toBeUndefined();    
    })

    test('clone null',()=> {
        const b = clone(undefined);
        expect(b).toBeUndefined();    
    })

})

describe( 'overwrite' ,()=> {

    let a;
    beforeEach( ()=> {
        a = { num:1, str:'string', bool:true, obj:{ num:2, str:'something' },arr:[1,2,3]};
    })
    
    test('number in root',()=> {
        const b = overwrite(a,{num:2});
        expect(b).toEqual( { num:2, str:'string', bool:true, obj:{ num:2, str:'something' },arr:[1,2,3]} );    
    })

    test('string in root',()=> {
        const b = overwrite(a,{str:'test'});
        expect(b).toEqual( { num:1, str:'test', bool:true, obj:{ num:2, str:'something' },arr:[1,2,3]} );    
    })

    test('bool in root',()=> {
        const b = overwrite(a,{bool:false});
        expect(b).toEqual( { num:1, str:'string', bool:false, obj:{ num:2, str:'something' },arr:[1,2,3]} );    
    })

    test('arr in root',()=> {
        const b = overwrite(a,{arr:[1,4,7]});
        expect(b).toEqual( { num:1, str:'string', bool:true, obj:{ num:2, str:'something' },arr:[1,4,7]} );    
    })

    test('obj in root, additional element ->is ignored',()=> {
        const b = overwrite(a,{obj:{bool:true}});
        expect(b).toEqual( { num:1, str:'string', bool:true, obj:{ num:2, str:'something',bool:true },arr:[1,2,3]} );    
    })

    test('obj in root, overwrite element',()=> {
        const b = overwrite(a,{obj:{num:3}});
        expect(b).toEqual( { num:1, str:'string', bool:true, obj:{ num:3, str:'something' },arr:[1,2,3]} );    
    })

    test('obj in root, overwrite element',()=> {
        const b = overwrite(a,{obj:{str:'test'}});
        expect(b).toEqual( { num:1, str:'string', bool:true, obj:{ num:2, str:'test' },arr:[1,2,3]} );    
    })

    test('obj in root, set to null',()=> {
        const b = overwrite(a,{obj:null});
        expect(b).toEqual( { num:1, str:'string', bool:true,arr:[1,2,3]} );    
    })

    test('obj in root, set to undefined',()=> {
        const b = overwrite(a,{obj:undefined});
        expect(b).toEqual( { num:1, str:'string',obj:{ num:2, str:'something' },bool:true,arr:[1,2,3]} );    
    })

    test('overwriteObject  is null',()=> {
        const b = overwrite(a,null);
        expect(b).toBeUndefined();
    })

    test('overwriteObject  is undefined',()=> {
        const b = overwrite(a,undefined);
        expect(b).toEqual(a);
    })

    test('baseObject  is null',()=> {
        const b = overwrite(null,a);
        expect(b).toEqual(a);
    })

    test('baseObject  is undefined',()=> {
        const b = overwrite(undefined,a);
        expect(b).toEqual(a);
    })

    test('createNew = false',()=> {
        const b = overwrite(a,{num:2},false);
        expect(b).toEqual( { num:2, str:'string', bool:true, obj:{ num:2, str:'something' },arr:[1,2,3]} );    

        b.str = 'test';
        expect(a.str).toBe('test')

        b.obj.str = 'test';
        expect(a.obj).toEqual({ num:2, str:'test' })

        b.arr.push(9) ;
        expect(a.arr).toEqual([1,2,3,9])

    })

    test('createNew = true',()=> {
        const b = overwrite(a,{num:2},true);
        expect(b).toEqual( { num:2, str:'string', bool:true, obj:{ num:2, str:'something' },arr:[1,2,3]} );    

        b.str = 'test';
        expect(a.str).toBe('string')

        b.obj.str = 'test';
        expect(a.obj).toEqual({ num:2, str:'something' })

        b.arr.push(9) ;
        expect(a.arr).toEqual([1,2,3])

    })


})


