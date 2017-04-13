import { SModelElement } from "../../base/model/smodel"
import { SModelExtension } from "../../base/model/smodel-extension"

export const fadeFeature = Symbol('fadeFeature')

export interface Fadeable extends SModelExtension {
    opacity: number
}

export function isFadeable(element: SModelElement): element is SModelElement & Fadeable {
    return element.hasFeature(fadeFeature) && (element as any)['opacity'] !== undefined
}