import React, { useState, useEffect, useRef } from "react";
import { View, Image, StyleSheet, Dimensions, FlatList } from 'react-native';
import { TouchableOpacity } from "@/app/TouchableOpacity"; // Your custom component
import { LinearGradient } from "expo-linear-gradient";
import AppText from "@/components/AppText"; // Your custom component

// Import your assets
import plainburger from "@/assets/categoryImage/plainburger.png";
import paneer from "@/assets/categoryImage/paneer-new.png";
import momos from "@/assets/categoryImage/momos-spicy.png";

const { width } = Dimensions.get('window');

const CARD_WIDTH = Math.round(width * 0.95); // Swiggy-like width
const SPACING = 12;
const SIDE_SPACER = (width - CARD_WIDTH) / 2;

// 2. Data Array (Makes it easier to map and auto-scroll)
const DATA = [
    {
        id: '1',
        title: "Free Delivery on First Order!",
        subtitle: "Hot, fresh & packed with love. Try us today.",
        buttonText: "CLAIM NOW",
        gradientColors: ['#712222ff', '#ef4511ff'],
        buttonColor: "#FFFFFF",
        buttonTextColor: "#FF4B2B",
        imageSource: plainburger
    },
    {
        id: '2',
        title: "Discover Hidden Gems.",
        subtitle: "Top-rated local dishes you won't find anywhere else.",
        buttonText: "EXPLORE MENU",
        gradientColors: ['#22565bff', '#1a686fff', '#106e76ff'],
        buttonColor: "#F0C27B",
        buttonTextColor: "#000000",
        imageSource: paneer
    },
    {
        id: '3',
        title: "Taste the Real City.",
        subtitle: "Authentic recipes from local legends.",
        buttonText: "ORDER AUTHENTIC",
        gradientColors: ['#541c6cff', '#8420aeff', '#a00fdeff'],
        buttonColor: "#CCFF00",
        buttonTextColor: "#000000",
        imageSource: momos
    }
];

const PremiumBanner = ({ item }) => {
    return (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={item.gradientColors}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBackground}
            >
                <View style={styles.contentContainer}>
                    <AppText variant="small" style={styles.title}>{item.title}</AppText>
                    <AppText style={styles.subtitle}>{item.subtitle}</AppText>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: item.buttonColor }]}
                        activeOpacity={0.8}
                    >
                        <AppText variant="small" style={[styles.buttonText, { color: item.buttonTextColor }]}>
                            {item.buttonText}
                        </AppText>
                    </TouchableOpacity>
                    
                </View>

                <View style={styles.imageContainer}>
                    <Image
                        source={item.imageSource}
                        style={styles.foodImage}
                        resizeMode="contain"
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

export default function PremiumCard() {
    const flatListRef = useRef(null);
    const [index, setIndex] = useState(0);

    const getItemLayout = (_, index) => ({
  length: SNAP_INTERVAL,
  offset: SNAP_INTERVAL * index,
  index,
});


    // Auto-Scroll Logic
    useEffect(() => {
    const timer = setInterval(() => {
      const next = index === DATA.length - 1 ? 0 : index + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    }, 4000);

    return () => clearInterval(timer);
  }, [index]);

    // Handle manual scroll (optional: updates index if user swipes manually)
   const onScrollEnd = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / (CARD_WIDTH + SPACING));
    setIndex(newIndex);
  };

    return (
        <View style={styles.screen}>
            <FlatList
        ref={flatListRef}
        data={DATA}
        keyExtractor={(i) => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        snapToAlignment="start"
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({
          length: CARD_WIDTH + SPACING,
          offset: (CARD_WIDTH + SPACING) * i,
          index: i,
        })}
        ListHeaderComponent={<View style={{ width: SIDE_SPACER }} />}
        ListFooterComponent={<View style={{ width: SIDE_SPACER }} />}
        ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
        renderItem={({ item }) => <PremiumBanner item={item} />}
      />
      {/* <View style={styles.dots}>
        {DATA.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              index === i && styles.activeDot,
            ]}
          />
        ))}
      </View> */}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        marginTop: 150,
        height: 120,
       
        // marginLeft: 10 
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: 110,
        borderRadius: 15,
        
        // Removed marginRight from here, handled by ItemSeparatorComponent
    },
    gradientBackground: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 15,
        padding: 15,
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 10,
        zIndex: 2,
    },
    title: {
        fontSize: 21,
        color: 'white',
    },
    subtitle: {
        fontSize: 12,
        fontFamily: "Nunito",
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
        lineHeight: 16,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 50,
        alignSelf: 'flex-start',
    },
    buttonText: {
        fontSize: 12,
        textTransform: 'uppercase',
    },
    imageContainer: {
        position: "absolute",
        justifyContent: 'center',
        alignItems: 'center',
        right: -10, // Adjusted slightly to ensure image fits
        top: 30,
        bottom: 0,
        width: 120,
    },
    foodImage: {
        width: 130,
        height: 130,
        marginTop: 10,
        transform: [{ translateX: 10 }, { rotate: '8deg' }],
        shadowColor: "#000",
        shadowOffset: { width: -5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    dots: {
        marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    backgroundColor: "#000000dd"
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 16,
    backgroundColor: "#000",
  },
});