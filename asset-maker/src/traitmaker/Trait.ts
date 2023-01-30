export interface Trait {
  name: string,
  description: string,
  /** Traits that cannot exist if you have this trait */
  antiTraits?: string[],
  /**Complementary traits (traits of the same 'genre') */
  compTraits?: string[],
  /**Each progression can have a list of criteria */
  progression?: Progression[],
  effect: TraitEffect[]
}

interface TraitEffect {
  key: string,
  value: string,
}

interface Progression {
  /**Trait name */
  name: string,

  criteria: {
    key: string,
    /** <, >, =, etc. accepted. */
    value: string
  }[]
}