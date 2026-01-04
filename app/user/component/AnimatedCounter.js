import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { SlideInDown, SlideOutUp, SlideInUp, SlideOutDown, withTiming } from 'react-native-reanimated';

export default function AnimatedCounter({ count, style, textStyle }) {
    const prevCount = useRef(count);
    const [direction, setDirection] = useState("up");

    if (count !== prevCount.current) {
        setDirection(count > prevCount?.current ? "up" : "down");
        prevCount.current = count;
    }

    return (
        <View style={[styles.container, style]}>
            <Animated.Text
                key={count}
                entering={direction === 'up' ? SlideInDown.duration(200) : SlideInUp.duration(200)}
                exiting={direction === 'up' ? SlideOutUp.duration(200) : SlideOutDown.duration(200)}
                style={[styles.text, textStyle]}
            >
                {count}
            </Animated.Text>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // Hides the number sliding out
    alignItems: 'center',
    justifyContent: 'center',
    height: 20, // Fixed height ensures smooth clipping
    minWidth: 20,
  },
  text: {
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    color: '#00ac22', // Your brand green
    textAlign: 'center',
  },
});