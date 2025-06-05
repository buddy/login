// https://www.learningtypescript.com/articles/branded-types

declare const _brand: unique symbol
export type IBrand<T, TBrand> = T & { [_brand]: TBrand };
