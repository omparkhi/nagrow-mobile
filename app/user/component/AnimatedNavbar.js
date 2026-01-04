import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/AppText';
import { TouchableOpacity } from "@/app/TouchableOpacity"; // Your custom touchable
import Animated, { 
  interpolate, 
  useAnimatedStyle, 
  Extrapolation,
  interpolateColor 
} from 'react-native-reanimated';
import RootWrapper from '@/app/rootWrapper';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function AnimatedNavbar({ scrollY, title }) {
  const router = useRouter();

  // 1. Background Animation (Transparent -> White)
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP);
    return {
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      borderBottomColor: `rgba(230, 230, 230, ${opacity})`,
      borderBottomWidth: 1,
      elevation: opacity * 5, // Shadow effect on Android
      shadowOpacity: opacity * 0.1, // Shadow effect on iOS
    };
  });

  // 2. Icon Color Animation (White -> Black)
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(scrollY.value, [0, 100], ['#ffffff', '#363636ff']);
    return { color: color };
  });

  // 3. Title Fade In (Hidden -> Visible)
  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [80, 120], [0, 1], Extrapolation.CLAMP);
    return { opacity: opacity };
  });

  return (
    <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
      {/* <SafeAreaView> */}
        
        <View style={styles.headerContent}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <AnimatedIcon name="arrow-back" size={24} style={iconAnimatedStyle} />
          </TouchableOpacity>

          {/* Sticky Title (Fades in) */}
          <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
            <AppText numberOfLines={1} style={styles.headerTitle}>{title}</AppText>
          </Animated.View>
          
          {/* Spacer for Right Side (Keeps title centered) */}
          <View style={{ width: 40 }} /> 
        </View>
        {/* </RootWrapper> */}
      {/* </SafeAreaView> */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100, // Forces it above everything
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  headerContent: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    // alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: '#363636ff',
    textTransform: 'capitalize',
  },
});