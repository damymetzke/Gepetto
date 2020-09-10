/**
 * file version used to check for different file versions.
 * 
 * Later file versions should not load
 * while previous file versions should be converted.
 * 
 * Versions ending in 'DEV' are development versions,
 * meaning it can be in any state it was during development.
 * For this reason DEV versions are never converted from
 * (but can be converted to).
 */
export type GepettoFileVersion = "0.1DEV";

/**
 * current file version.
 */
export const GEPETTO_FILE_VERSION: GepettoFileVersion = "0.1DEV";
