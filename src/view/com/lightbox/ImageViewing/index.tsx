/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// Original code copied and simplified from the link below as the codebase is currently not maintained:
// https://github.com/jobtoday/react-native-image-viewing

import React, {ComponentType, useCallback, useMemo, useState} from 'react'
import {Platform, StyleSheet, View} from 'react-native'
import {Gesture} from 'react-native-gesture-handler'
import PagerView from 'react-native-pager-view'
import {MeasuredDimensions} from 'react-native-reanimated'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated'
import {Edge, SafeAreaView} from 'react-native-safe-area-context'

import {ImageSource} from './@types'
import ImageDefaultHeader from './components/ImageDefaultHeader'
import ImageItem from './components/ImageItem/ImageItem'

type Props = {
  images: ImageSource[]
  thumbDims: MeasuredDimensions | null
  initialImageIndex: number
  visible: boolean
  onRequestClose: () => void
  backgroundColor?: string
  HeaderComponent?: ComponentType<{imageIndex: number}>
  FooterComponent?: ComponentType<{imageIndex: number}>
}

const DEFAULT_BG_COLOR = '#000'

function ImageViewing({
  images,
  thumbDims: _thumbDims, // TODO: Pass down and use for animation.
  initialImageIndex,
  visible,
  onRequestClose,
  backgroundColor = DEFAULT_BG_COLOR,
  HeaderComponent,
  FooterComponent,
}: Props) {
  const [isScaled, setIsScaled] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imageIndex, setImageIndex] = useState(initialImageIndex)
  const [showControls, setShowControls] = useState(true)

  const dismissSwipeTranslateY = useSharedValue(0)
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    pointerEvents: showControls ? 'auto' : 'none',
    opacity: withClampedSpring(showControls ? 1 : 0),
    transform: [
      {
        translateY: withClampedSpring(showControls ? 0 : -30),
      },
    ],
  }))
  const animatedFooterStyle = useAnimatedStyle(() => ({
    pointerEvents: showControls ? 'auto' : 'none',
    opacity: withClampedSpring(showControls ? 1 : 0),
    transform: [
      {
        translateY: withClampedSpring(showControls ? 0 : 30),
      },
    ],
  }))

  const dismissSwipePan = Gesture.Pan()
    .enabled(!isScaled)
    .activeOffsetY([-10, 10])
    .failOffsetX([-10, 10])
    .maxPointers(1)
    .onUpdate(e => {
      'worklet'
      dismissSwipeTranslateY.value = e.translationY
      console.log(dismissSwipeTranslateY.value)
    })
    .onEnd(e => {
      'worklet'
      if (Math.abs(e.velocityY) > 1000) {
        dismissSwipeTranslateY.value = withDecay({velocity: e.velocityY})
        runOnJS(onRequestClose)()
      } else {
        dismissSwipeTranslateY.value = withSpring(0, {
          stiffness: 700,
          damping: 50,
        })
      }
    })

  const onTap = useCallback(() => {
    setShowControls(show => !show)
  }, [])

  const onZoom = useCallback((nextIsScaled: boolean) => {
    setIsScaled(nextIsScaled)
    if (nextIsScaled) {
      setShowControls(false)
    }
  }, [])

  const edges = useMemo(() => {
    if (Platform.OS === 'android') {
      return ['top', 'bottom', 'left', 'right'] satisfies Edge[]
    }
    return ['left', 'right'] satisfies Edge[] // iOS, so no top/bottom safe area
  }, [])

  if (!visible) {
    return null
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={edges}
      aria-modal
      accessibilityViewIsModal>
      <View style={[styles.container, {backgroundColor}]}>
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          {typeof HeaderComponent !== 'undefined' ? (
            React.createElement(HeaderComponent, {
              imageIndex,
            })
          ) : (
            <ImageDefaultHeader onRequestClose={onRequestClose} />
          )}
        </Animated.View>
        <PagerView
          scrollEnabled={!isScaled}
          initialPage={initialImageIndex}
          onPageSelected={e => {
            setImageIndex(e.nativeEvent.position)
            setIsScaled(false)
          }}
          onPageScrollStateChanged={e => {
            setIsDragging(e.nativeEvent.pageScrollState !== 'idle')
          }}
          overdrag={true}
          style={styles.pager}>
          {images.map((imageSrc, i) => (
            <View key={imageSrc.uri}>
              <ImageItem
                onTap={onTap}
                onZoom={onZoom}
                imageSrc={imageSrc}
                onRequestClose={onRequestClose}
                isScrollViewBeingDragged={isDragging}
                showControls={showControls}
                dismissSwipePan={
                  imageIndex === i && !isDragging ? dismissSwipePan : null
                }
              />
            </View>
          ))}
        </PagerView>
        {typeof FooterComponent !== 'undefined' && (
          <Animated.View style={[styles.footer, animatedFooterStyle]}>
            {React.createElement(FooterComponent, {
              imageIndex,
            })}
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pager: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    top: 0,
    pointerEvents: 'box-none',
  },
  footer: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    bottom: 0,
  },
})

const EnhancedImageViewing = (props: Props) => (
  <ImageViewing key={props.initialImageIndex} {...props} />
)

function withClampedSpring(value: any) {
  'worklet'
  return withSpring(value, {overshootClamping: true, stiffness: 300})
}

export default EnhancedImageViewing
