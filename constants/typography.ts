import { TextStyle } from 'react-native';
import { FontStyleId } from '../types/theme';

export type FontWeightVariant = 'regular' | 'medium' | 'semiBold' | 'bold';

export const FONT_DEFINITIONS: Record<FontStyleId, Record<FontWeightVariant, string>> = {
  modern: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semiBold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
  },
  playful: {
    regular: 'Quicksand_500Medium',
    medium: 'Quicksand_500Medium',
    semiBold: 'Quicksand_600SemiBold',
    bold: 'Quicksand_700Bold',
  },
  mono: {
    regular: 'SpaceMono',
    medium: 'SpaceMono',
    semiBold: 'SpaceMono',
    bold: 'SpaceMono',
  },
  serif: {
    regular: 'Lora_400Regular',
    medium: 'Lora_500Medium',
    semiBold: 'Lora_600SemiBold',
    bold: 'Lora_700Bold',
  },
};

export function getFontFamily(
  style: FontStyleId = 'modern',
  weight?: TextStyle['fontWeight'] | FontWeightVariant
): string {
  const definitions = FONT_DEFINITIONS[style] ?? FONT_DEFINITIONS.modern;

  switch (weight) {
    case 'bold':
    case '700':
    case '800':
    case '900':
      return definitions.bold;
    case 'semiBold':
    case '600':
      return definitions.semiBold;
    case 'medium':
    case '500':
      return definitions.medium;
    case 'regular':
    case 'normal':
    case '400':
    default:
      return definitions.regular;
  }
}
