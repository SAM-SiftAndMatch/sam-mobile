import React from 'react';
import { PanResponder, View } from 'react-native';

// Reserve only the left edge, so horizontal lists and text inputs keep their gestures.
export function EdgeSwipeBack({ children, onBack, canGoBack = () => true }) {
  const responder = PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => canGoBack()
      && gesture.numberActiveTouches === 1 && gesture.x0 <= 28
      && gesture.dx > 18 && gesture.dx > Math.abs(gesture.dy) * 2,
    onPanResponderRelease: (_, gesture) => {
      if (canGoBack() && (gesture.dx > 80 || (gesture.dx > 35 && gesture.vx > 0.5))) onBack();
    },
  });
  return <View style={{ flex: 1 }} {...responder.panHandlers}>{children}</View>;
}
