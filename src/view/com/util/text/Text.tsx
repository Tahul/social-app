import React from 'react'
import {StyleSheet, Text as RNText, TextProps} from 'react-native'
import {UITextView} from 'react-native-uitextview'

import {lh, s} from '#/lib/styles'
import {TypographyVariant, useTheme} from '#/lib/ThemeContext'
import {logger} from '#/logger'
import {isIOS} from '#/platform/detection'
import {applyFonts, useAlf} from '#/alf'
import {
  childHasEmoji,
  childIsString,
  renderChildrenWithEmoji,
  StringChild,
} from '#/components/Typography'
import {IS_DEV} from '#/env'

export type CustomTextProps = Omit<TextProps, 'children'> & {
  type?: TypographyVariant
  lineHeight?: number
  title?: string
  dataSet?: Record<string, string | number>
  selectable?: boolean
} & (
    | {
        emoji: true
        children: StringChild
      }
    | {
        emoji?: false
        children: TextProps['children']
      }
  )

export function Text({
  type = 'md',
  children,
  emoji,
  lineHeight,
  style,
  title,
  dataSet,
  selectable,
  ...props
}: React.PropsWithChildren<CustomTextProps>) {
  const theme = useTheme()
  const typography = theme.typography[type]
  const lineHeightStyle = lineHeight ? lh(theme, type, lineHeight) : undefined
  const {fonts} = useAlf()

  if (IS_DEV) {
    if (!emoji && childHasEmoji(children)) {
      logger.warn(
        `Text: emoji detected but emoji not enabled: "${children}"\n\nPlease add <Text emoji />'`,
      )
    }

    if (emoji && !childIsString(children)) {
      throw new Error(
        'Text: when <Text emoji />, children can only be strings.',
      )
    }
  }

  if (selectable && isIOS) {
    const flattened = StyleSheet.flatten([
      s.black,
      typography,
      lineHeightStyle,
      style,
    ])

    applyFonts(flattened, fonts.family)

    // should always be defined on `typography`
    // @ts-ignore
    if (flattened.fontSize) {
      // @ts-ignore
      flattened.fontSize = flattened.fontSize * fonts.scaleMultiplier
    }

    return (
      <UITextView
        style={flattened}
        selectable={selectable}
        uiTextView
        {...props}>
        {isIOS && emoji ? renderChildrenWithEmoji(children) : children}
      </UITextView>
    )
  }

  const flattened = StyleSheet.flatten([
    s.black,
    typography,
    lineHeightStyle,
    style,
  ])

  applyFonts(flattened, fonts.family)

  // should always be defined on `typography`
  // @ts-ignore
  if (flattened.fontSize) {
    // @ts-ignore
    flattened.fontSize = flattened.fontSize * fonts.scaleMultiplier
  }

  return (
    <RNText
      style={flattened}
      // @ts-ignore web only -esb
      dataSet={Object.assign({tooltip: title}, dataSet || {})}
      selectable={selectable}
      {...props}>
      {isIOS && emoji ? renderChildrenWithEmoji(children) : children}
    </RNText>
  )
}
