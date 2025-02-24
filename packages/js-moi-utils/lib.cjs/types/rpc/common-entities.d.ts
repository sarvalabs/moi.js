import type { Identifier } from "js-moi-identifiers";
import type { Hex } from "../../hex";
export interface IncludeModifier<T extends string = string> {
    /**
     * A list of fields keys to include in the response.
     * The given field keys must be unique and one of the fields that are supported by
     * the response object. If a field that is already returned by default is mentioned, it is ignored.
     */
    include: T[];
    extract?: undefined;
}
export interface ExtractModifier<T extends string = string> {
    /**
     * A singular field key to return instead of the entire response object.
     * This must be one of the fields supported by the response object. This can
     * also be a field that is not returned by default.
     */
    extract: T;
    include?: undefined;
}
/**
 * The `ResponseModifier` can be used to modify the API response by including additional
 * fields OR extracting a specific field.
 */
export type ResponseModifier<T extends string = string> = IncludeModifier<T> | ExtractModifier<T>;
export interface AbsoluteTesseractReference {
    /**
     * A hash that is unique to the tesseract
     */
    absolute: Hex;
    relative?: never;
}
export interface RelativeReference {
    id: Hex | Identifier;
    height: number;
}
export interface RelativeTesseractReference {
    absolute?: never;
    /**
     * An indirect reference to the tesseract with its height on an account’s chain.
     * The same tesseract may be attached to multiple accounts at different heights.
     *
     * The 0 & -1 values can be used be used to retrieve the oldest and latest tesseracts
     * for the account respectively
     */
    relative: RelativeReference;
}
/**
 * The TesseractReference is used to reference a tesseract either
 * absolutely with its unique 32-byte hash or relatively through an account
 * identifier and the height on that account.
 *
 * The reference is invalid if both the absolute and relative fields are used in the same object
 */
export type TesseractReference = AbsoluteTesseractReference | RelativeTesseractReference;
/**
 * A utility type to extract create a object of type and value
 */
export type ParamField<TName extends string, TType> = Record<TName, TType>;
export type ResponseModifierParam<T extends string = string> = {
    modifier?: ResponseModifier<T>;
};
export type TesseractReferenceParam = Partial<ParamField<"reference", TesseractReference | undefined>>;
//# sourceMappingURL=common-entities.d.ts.map