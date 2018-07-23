export interface Maybe <A>{
    value0?:A; 
}


export const maybe = <A>(nothingFn: () => any) => (justFn:(value:A) => any) => (m:Maybe<A>):any => 
    m.value0 === undefined
        ?   nothingFn()
        :   justFn(m.value0);


export const getMaybeValue = maybe (() => undefined) (value => value);
