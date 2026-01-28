const {getResponsiveHorizontal} = require('./utils')

describe ('utils',()=>{
    describe('getResponsiveHorizontal',()=>{
        test('2920x1043', ()=>{
            const res1 = getResponsiveHorizontal(1920,1043)
            const res2 = getResponsiveHorizontal(1920-150,1043)
            expect(res1).not.toEqual(res2)

        })
    })
})