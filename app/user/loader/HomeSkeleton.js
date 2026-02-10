import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// A reusable "Pulse" View
const SkeletonItem = ({ style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Loop the opacity animation forever
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.skeleton, style, { opacity }]} />;
};

export default function HomeSkeleton() {
  return (
    <View style={{ paddingHorizontal: 15, paddingTop: 20 }}>
      
      {/* 1. Premium Card Placeholder */}
      <SkeletonItem style={{ width: '100%', height: 160, borderRadius: 15, marginBottom: 25 }} />

      {/* 2. Filter Pills Placeholder (Horizontal) */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 25 }}>
        <SkeletonItem style={{ width: 80, height: 35, borderRadius: 20 }} />
        <SkeletonItem style={{ width: 80, height: 35, borderRadius: 20 }} />
        <SkeletonItem style={{ width: 80, height: 35, borderRadius: 20 }} />
        <SkeletonItem style={{ width: 80, height: 35, borderRadius: 20 }} />
      </View>

      {/* 3. Restaurant List Placeholders */}
      {[1, 2, 3].map((item) => (
        <View key={item} style={{ marginBottom: 30, flexDirection: 'row', gap: 15 }}>
          {/* Image Box */}
          <SkeletonItem style={{ width: 100, height: 100, borderRadius: 12 }} />
          
          {/* Text Lines */}
          <View style={{ flex: 1, justifyContent: 'center', gap: 10 }}>
            <SkeletonItem style={{ width: '80%', height: 20, borderRadius: 4 }} />
            <SkeletonItem style={{ width: '50%', height: 15, borderRadius: 4 }} />
            <SkeletonItem style={{ width: '30%', height: 15, borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE', // Classic "Skeleton Gray"
  },
});