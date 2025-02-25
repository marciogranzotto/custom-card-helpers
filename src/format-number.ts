import { FrontendTranslationData, NumberFormat } from "./types";

/**
 * Formats a number based on the specified language with thousands separator(s) and decimal character for better legibility.
 * @param num The number to format
 * @param locale The user-selected language and number format, from `hass.locale`
 * @param options Intl.NumberFormatOptions to use
 */
export const formatNumber = (
  num: string | number,
  locale?: FrontendTranslationData,
  options?: Intl.NumberFormatOptions
): string => {

  let format: string | string[] | undefined;

  switch (locale?.number_format) {
    case NumberFormat.comma_decimal:
      format = ["en-US", "en"]; // Use United States with fallback to English formatting 1,234,567.89
      break;
    case NumberFormat.decimal_comma:
      format = ["de", "es", "it"]; // Use German with fallback to Spanish then Italian formatting 1.234.567,89
      break;
    case NumberFormat.space_comma:
      format = ["fr", "sv", "cs"]; // Use French with fallback to Swedish and Czech formatting 1 234 567,89
      break;
    case NumberFormat.system:
      format = undefined;
      break;
    default:
      format = locale?.language;
  }
  // Polyfill for Number.isNaN, which is more reliable than the global isNaN()
  Number.isNaN =
    Number.isNaN ||
    function isNaN(input) {
      return typeof input === "number" && isNaN(input);
    };

    if (
      !Number.isNaN(Number(num)) &&
      Intl &&
      locale?.number_format !== NumberFormat.none
    ) {
      try {
        return new Intl.NumberFormat(
          format,
          getDefaultFormatOptions(num, options)
        ).format(Number(num));
      } catch (error) {
        // Don't fail when using "TEST" language
        // eslint-disable-next-line no-console
        console.error(error);
        return new Intl.NumberFormat(
          undefined,
          getDefaultFormatOptions(num, options)
        ).format(Number(num));
      }
    }
    return num ? num.toString() : "";
};

/**
 * Generates default options for Intl.NumberFormat
 * @param num The number to be formatted
 * @param options The Intl.NumberFormatOptions that should be included in the returned options
 */
const getDefaultFormatOptions = (
  num: string | number,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormatOptions => {
  const defaultOptions: Intl.NumberFormatOptions = options || {};

  if (typeof num !== "string") {
    return defaultOptions;
  }

  // Keep decimal trailing zeros if they are present in a string numeric value
  if (
    !options ||
    (!options.minimumFractionDigits && !options.maximumFractionDigits)
  ) {
    const digits = num.indexOf(".") > -1 ? num.split(".")[1].length : 0;
    defaultOptions.minimumFractionDigits = digits;
    defaultOptions.maximumFractionDigits = digits;
  }

  return defaultOptions;
};
