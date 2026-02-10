import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, InteractionManager, Dimensions } from "react-native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import AppText from "@/components/AppText";  
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons"; 
import Foodies from "@/assets/foodies-new.json";  
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses } from "@/redux/slices/user/addressSlice";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Polygon, Defs, Stop, RadialGradient, Path, Rect, LinearGradient as SvgLinearGradient, G } from "react-native-svg";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay,
  Easing,
  useAnimatedProps
} from 'react-native-reanimated';
import VegBiryani from "@/assets/veg-biryani.png";
import Momos from "@/assets/new-momos.png";

const { width, height } = Dimensions.get('window');

function Banner() {
  const rotation = useSharedValue(0);
  const lottieRef = useRef();
  const router = useRouter();
  const dispatch = useDispatch();
  const selectedAddress = useSelector((state) => state.address.selectedAddress);
  const insets = useSafeAreaInsets();
  // const AnimatedG = Animated.createAnimatedComponent(G);

  // console.log("inset:", insets)

  const biryaniTranslateY = useSharedValue(200);
  const momosTranslateX = useSharedValue(200);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const textScale = useSharedValue(1);

  useEffect(() => {
    // 1. Entry Animation (Fade In + Slide Up)
    textOpacity.value = withTiming(1, { duration: 1000 });
    textTranslateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) });

    // 2. Continuous Breathing/Pulse Animation (after entry)
    textScale.value = withDelay(
      1000, 
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }), // Scale Up slightly
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })    // Scale Down
        ),
        -1, // Infinite loop
        true
      )
    );
  }, []);

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [
        { translateY: textTranslateY.value },
        { scale: textScale.value }
      ],
    };
  });

useEffect(() => {
    const runFoodAnimation = () => {
      // 1. Reset Positions (Instant)
      biryaniTranslateY.value = 200; // Hidden (Down)
      momosTranslateX.value = 200;  // Hidden (Left)

      // 2. Biryani Animation: Slide UP -> Wait -> Slide DOWN
      biryaniTranslateY.value = withSequence(
        // Step A: Slide Up
        withTiming(0, { duration: 800, easing: Easing.out(Easing.back(1.5)) }),
        // Step B: Wait 2 seconds, then Slide Down (Exit)
        withDelay(2000, withTiming(200, { duration: 500, easing: Easing.in(Easing.cubic) }))
      );

      // 3. Momos Animation: Wait -> Slide RIGHT -> Wait -> Slide AWAY
      momosTranslateX.value = withDelay(
        2700, // Wait until Biryani has finished exiting (800ms + 2000ms + small buffer)
        withSequence(
          // Step A: Slide Right (In)
          withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) }),
          // Step B: Wait 2 seconds, then Slide further Right (Exit)
          // withDelay(2000, withTiming(200, { duration: 500 }))
        )
      );
    };

    runFoodAnimation();

    // Loop time must be longer to cover both animations (approx 6-7 seconds)
    const interval = setInterval(runFoodAnimation, 7000);
    return () => clearInterval(interval);
  }, []);

  // Styles for the animations
  const biryaniStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: biryaniTranslateY.value }],
    };
  });

  const momosStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: momosTranslateX.value }],
    };
  });

  useEffect(() => {
    // Play from frame 0 to frame 60, then STOP.
    // The animation will freeze at frame 60.
    lottieRef.current?.play(0, 60);
  }, []);

  // useEffect(() => {
  //   rotation.value = withRepeat(
  //     withSequence(
  //       withTiming(-2, { duration: 1000, easing: Easing.linear }),
  //       withTiming(15, { duration: 150, easing: Easing.linear }),
  //     ),
  //     -1, // -1 means Infinite Loop
  //     true // Reverse: true makes it go back and forth smoothly
  //   );
  // }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }], // Apply the rotation
    };
  });

  const RINGS = [
  { size: 80, color: "#ce451b", width: 3 },
  { size: 68, color: "#842c12", width: 3 },
  { size: 56, color: "#ce451b", width: 3 },
  { size: 44, color: "#842c12", width: 3 },
  { size: 32, color: "#ce451b", width: 3 },
  { size: 20, color: "#842c12", width: 3 },
];

 const rays = 28;              // number of strips
  const centerX = 50;
  const centerY = 100;          // bottom center
  const radius = 120;
  

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchAddresses());
    })
  }, []); 

  const handleNavigate = () => {
    InteractionManager.runAfterInteractions(() => {
      router.push("/user/profile/page")
    });
   };




function SunburstBackground({ 
  style, 
  baseColor = "rgb(39, 23, 18)", // Dark Background
  rayColor = "#c22d00",          // Lighter Ray
  rayCount = 7
}) {
  const rotation = useSharedValue(0);

  // 1. Setup Infinite Slow Rotation
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }), // 20 seconds per full turn
      -1, // Infinite
      false 
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // 2. Calculate Ray Paths
  const cx = width / 2;
  const cy = height / 2; 
  // Make radius larger than screen to ensure coverage during rotation
  const radius = Math.sqrt(width * width + height * height) * 1.5; 

  const rays = [];
  const angleStep = 360 / rayCount;

  for (let i = 0; i < rayCount; i++) {
    const startAngle = (i * angleStep) * (Math.PI / 180);
    const endAngle = ((i * angleStep) + (angleStep / 2)) * (Math.PI / 180); 

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    rays.push(
      <Path
        key={i}
        d={`M${cx},${cy} L${x1},${y1} L${x2},${y2} Z`}
        fill={rayColor}
        opacity={0.5} 
      />
    );
  }

  return (
    <View style={[styles.container, style, { overflow: 'hidden' }]}>
      {/* A. The Solid Base Background (Static) */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: baseColor }} />

      {/* B. The Rotating Rays (Animated) */}
      <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyle]}>
        <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`}>
          {rays}
        </Svg>
      </Animated.View>

      {/* C. The Vignette Overlay (Static) - Creates the "Blurry Edge" */}
      {/* This sits ON TOP of the rays. Center is transparent, Edges are baseColor */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="fadeGrad" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
            {/* Center: Transparent (See the rays) */}
            <Stop offset="0%" stopColor={baseColor} stopOpacity="0" />
            {/* Mid: Start fading out */}
            <Stop offset="60%" stopColor={baseColor} stopOpacity="0.6" />
            {/* Edge: Solid Base Color (Hides the sharp edges of rays) */}
            <Stop offset="100%" stopColor={baseColor} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#fadeGrad)" />
      </Svg>
    </View>
  );
}
 
  return (
    <>
      {/* Header Gradient */}
      {/* <LinearGradient
        colors={["#000000ff", "#151f29ff", "#063b70ff"]}
        start={{ x: 0, y: 0.5 }} // Start from the far left
        end={{ x: 1, y: 0.5 }}   // End at the far right
        style={styles.header}
      > */}
      <ExpoLinearGradient
        // Colors: Electric Violet -> Deep Indigo Blue
        // colors={["#000000ff", "#8E2DE2", "#"]}
        colors={['#f3410b', '#f3410b']}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 0 }}   // Bottom Right (Darker)
        style={{ height: 320,  }}
      >
        {/* Top Bar */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: insets.top + 20, paddingHorizontal: 18, }}>
          <View style={{ width: "80%" }}>
            <TouchableOpacity feedback="medium" style={styles.addressWrap} onPress={() => router.push("/user/address/address-card")}>
            <MaterialIcons name="home" size={22} color="white"  />
            <AppText variant="caption" color="white"  style={{ marginLeft: 2 }}>
              Home
            </AppText>
            <Feather name="chevron-down" size={22} color="#ccc" />
            </TouchableOpacity>

            <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.addressText}>
              {selectedAddress ? selectedAddress.fullAddress : "Fetching location..."}
            </AppText>
          </View>

          <TouchableOpacity style={styles.profileIcon} onPress={() => handleNavigate()}>
            <Ionicons name="person" size={22} color="#333" />
          </TouchableOpacity>
        </View>


            

        {/* Lottie Animation */}
        <View style={[styles.lottieWrap]}>
          <View
  style={{
    width: 200,
    height: 200,
    justifyContent: "center",  // 🔴 THIS is critical
  }}
>
 
<Animated.View style={[{ zIndex: 10, paddingHorizontal: 10 }, textAnimatedStyle]}>
              <AppText
                style={{
                  fontSize: 23, // Made it slightly larger
                  color: "#fff",
                  fontFamily: "Gravitas",
                  lineHeight: 25,
                  textAlign: "center", // Center align looks better here
                  // Add Shadow to make it pop against orange background
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                Craving Something Diff today?
              </AppText>
            </Animated.View>
</View>


      

          {/* <LottieView
          ref={lottieRef}
            source={Foodies}
            autoPlay={false}
            loop={false}
            style={{ width: 160, height: 160, paddingHorizontal: 18, }}
          /> */}

           <View
  style={{
    width: 200,
    height: 200,
    justifyContent: "center",
    overflow: "hidden",   // 🔴 THIS is critical
  }}
>
  {/* <RadialStrip />
   */}
   {/* <SunburstBackground baseColor="rgb(78, 74, 72)" rayColor="#c22d00ff" /> */}
   <SunburstBackground 
         style={StyleSheet.absoluteFill} // This forces it to fill the 200x200 box
         baseColor="#f3410b"           // Match your LinearGradient start color
         rayColor="#992f0f"              // A lighter orange/red for contrast
      />
  


          <View style={{ width: 160, height: 160, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <Animated.Image
              source={ VegBiryani }
              style={[{ width: 100, height: 100, position: 'absolute' }, biryaniStyle]}
              resizeMode="contain"
            />

            <Animated.Image 
              source={ Momos } 
              style={[{ width: 140, height: 140, position: 'absolute' }, momosStyle]}
              resizeMode="contain"
            />
          </View>

          </View>
        </View>
      {/* <View style={{  position: "relative", height: 170,  top: -100,  }}>
          <Svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute" }}
    >
      <G origin={`${centerX}, ${centerY}`}>
        {Array.from({ length: rays }).map((_, i) => {
          const angle = (360 / rays) * i;
          const color = i % 2 === 0 ? "#c22d00ff" : "#c22d00ff";

          return (
            <Polygon
              key={i}
              points={`${centerX},${centerY} ${centerX - 3},0 ${centerX + 3},0`}
              fill={color}
              transform={`rotate(${angle} ${centerX} ${centerY})`}
              opacity={0.9}
            />
          );
        })}
      </G>
    </Svg>
          </View> */}
      </ExpoLinearGradient>
    </>
  );
}

export default React.memo(Banner);

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Ensures it sits behind everything
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, 
    marginLeft: -10
  },


  addressText: {
  fontSize: 13  ,
  fontFamily: "Nunito",
  lineHeight: 13,
  color: "#ffffffff",
},

  header: {
    height: 350, paddingHorizontal: 18, paddingTop: 20,
  },

  topRow: {
    // paddingTop: 50,
    
    justifyContent: "space-between", alignItems: "center",
  },

  addressWrap: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileIcon: {
    backgroundColor: "#fff",
    width: 35,
    height: 35,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  lottieWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,

  },

  searchContainer: {
    marginTop: -170,
    flexDirection: "row",
    paddingHorizontal: 16,
  },

  searchBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    height: 45,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },

  placeholderRow: {
    position: "absolute",
    left: 38,
    
    flexDirection: "row",
  },

  vegBox: {
    backgroundColor: "#fff",
    marginLeft: 8,
    paddingHorizontal: 5,
    // paddingVertical: 1,
    borderRadius: 8,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  toggle: {
    width: 37,
    height: 15,
    backgroundColor: "#ddd",
    borderRadius: 12,
    // marginTop: 1,
    marginTop: -4,
    padding: 2,
    justifyContent: "center",
  },

  toggleActive: {
    backgroundColor: "#1fa71f",
  },

  toggleCircle: {
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
});
