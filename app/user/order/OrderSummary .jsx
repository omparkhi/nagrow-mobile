import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

function OrderSummary({ currentOrder, totalItems, restaurant }) {
    const sheetRef = useRef(null);
    const [isBillVisible, setBillVisible] = useState(false);
     const snapPoints = useMemo(() => ["34%"], []);

      useEffect(() => {
        if (isBillVisible) {
          sheetRef.current?.expand(); 
        } else {
          sheetRef.current?.close();
        }
      }, [isBillVisible]);

        const handleSheetChanges = useCallback((index) => {
          if (index === -1) {
            setBillVisible(false);
          }
        }, []);


    return (
            <>
              <View style={styles.mainCard} >
                <View style={[{ flexDirection: "column" }, , styles.card]} >
                    
        
                    <View style={{ flexDirection: "row", alignItems: "center",    }} >
                        {/* <View style={{ backgroundColor: "#fff9f9ff", borderRadius: 10 }}>
                        <LottieView
                            source={DeliveryIcon}
                            autoPlay
                            loop={currentOrder.status !== 'delivered'}
                            style={{ width: 50, height: 50 }}
                        />
                        </View> */}
                        <View style={{ flexDirection: "column", marginLeft: 10, marginBottom: 10 }}>
                            <AppText variant="small" style={{ fontSize: 15, color: "rgb(0, 0, 0)",  }}>{currentOrder.status === 'delivered' ? "ORDER DELIVERED" : "DELIVERING YOUR ORDER"}</AppText>
                            {/* <AppText style={{ fontSize: 11, marginTop: -8, fontFamily: "Nunito", color: "#939393" }}>{UI.arriveByText}</AppText> */}
                        </View>
        
                    
                    </View >
                    <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderTopWidth: 1, borderTopColor: "#e7e7e7" }}>
                                 {/* <MapPin size={32} color="green" fill="green" /> */}
                                 <View style={{ flexDirection: "row", alignItems: "center", color: "#000", paddingRight: 30 }}>
                                    <Ionicons name="location" size={18} color="#535252ff" />
                                    <View>
                                        <AppText variant="small" style={{ fontSize: 13, color: "#535252ff", marginLeft: 7 }}>{restaurant.name.toUpperCase()} - {currentOrder?.restaurantId?.address.street}</AppText>
                                        <AppText variant="light" style={{ fontSize: 10, color: "#64748b", marginLeft: 7, top: -2 }}>Restaurant</AppText>
                                    </View>
                                 </View>
                                 <View style={{ height: 27, borderLeftWidth: 1, borderStyle: "dashed", borderColor: "#0f172a", marginLeft: 9}}></View>
                                 <View style={{ flexDirection: "row", alignItems: "center", color: "#000", paddingRight: 30 }}>
                                 <MaterialIcons name="home" size={18} color="#535252ff"  />
                                    <View>
                                        <AppText variant="small" style={{ fontSize: 13, color: "#535252ff", marginLeft: 7 }} numberOfLines={1}>{currentOrder?.deliveryAddress?.fullAddress}</AppText>
                                        <AppText variant="light" style={{ fontSize: 10, color: "#64748b", marginLeft: 7, top: -2 }}>Delivery Address</AppText>
                                    </View>
                                </View>
                            </View>
                    <View style={{ flexDirection: "row",  alignItems: "center", justifyContent: "space-between", marginLeft: 10, borderTopWidth: 1, borderTopColor: "#d3ceceff", borderStyle: "dotted",   }}>
                    <View style={{ flexDirection: "column" }}>
                        <AppText variant="small" style={{ fontSize: 13, color: "#535252ff", marginTop: 10 }}>ORDER - <AppText variant="small" style={{ color: "#535252ff", fontSize: 13 }}>{currentOrder.orderNo}</AppText></AppText>
                        <AppText variant="small" style={{ fontSize: 13, color: "#fd731dff", top: -2 }}>₹ {currentOrder?.totalAmount} - {totalItems} item{totalItems > 1 ? 's' : ''} - {currentOrder?.paymentType.toUpperCase()}</AppText>
                    </View>
                    <TouchableOpacity style={{ padding: 10, backgroundColor: "#fd731dff", borderRadius: 10 }} onPress={() => setBillVisible(true)} >
                            <AppText variant="small" style={{ color: "#ffffffff" }}>View Bill</AppText>
                        </TouchableOpacity>
                    
                    </View>
        
                    
                    
                </View>
                {/* <View style={styles.card}>
                     <View style={{ flexDirection: "row", alignItems: "center", color: "#000", paddingRight: 30 }}>
                        <Ionicons name="location" size={28} color="#fd731dff" />
                        <View>
                            <AppText variant="small" style={{ fontSize: 15, color: "#535252ff", marginLeft: 7 }}>{restaurant?.name} - {restaurant?.address.street}</AppText>
                            <AppText variant="light" style={{ fontSize: 13, color: "#535252ff", marginLeft: 7, top: -2 }}>Restaurant</AppText>
                        </View>
                     </View>
                     <View style={{ height: 30, borderLeftWidth: 1, borderStyle: "dashed", borderColor: "#fd731dff", marginLeft: 13 }}></View>
                     <View style={{ flexDirection: "row", alignItems: "center", color: "#000", paddingRight: 30 }}>
                     <MaterialIcons name="home" size={28} color="#fd731dff"  />
                        <View>
                            <AppText variant="small" style={{ fontSize: 15, color: "#535252ff", marginLeft: 7 }} numberOfLines={1}>You - {currentOrder?.deliveryAddress?.fullAddress}</AppText>
                            <AppText variant="light" style={{ fontSize: 13, color: "#535252ff", marginLeft: 7, top: -2 }}>Home</AppText>
                        </View>
                    </View>
                </View> */}
        
                {/* <View style={styles.card}>
              {trackingSteps.map((step, index) => {
                
                // Logic: Is this step completed or active?
                // We map our visual steps to the STATUS_ORDER array.
                // Restaurant = 0, Preparing = 2 (approx), Ready = 3, etc.
                // This mapping ensures the colors fill up progressively.
        
        
                
                let stepActive = false;
                
                if (index === 0) stepActive = true; // Restaurant always active
                else if (index === 5) stepActive = activeIndex >= 6; // Home only active at end
                else {
                    // Map middle steps to specific statuses
                    if (step.key === 'preparing' && activeIndex >= 2) stepActive = true;
                    if (step.key === 'ready' && activeIndex >= 3) stepActive = true;
                    if (step.key === 'pick_up_by_rider' && activeIndex >= 4) stepActive = true;
                    if (step.key === 'on the way' && activeIndex >= 5) stepActive = true;
                }
        
                const tint = stepActive ? brandColor : grayColor;
                const isLastItem = index === trackingSteps.length - 1; */}
        
                {/* return (
                  <View key={index} style={{ flexDirection: 'row', overflow: 'hidden' }}>
                    
                    {/* Left Column: Icon + Line */}
                    {/* <View style={{ alignItems: 'center', width: 40, marginRight: 10 }}> */}
                      
                      {/* The Icon */}
                      {/* <View style={{ 
                         zIndex: 10, 
                         backgroundColor: '#fff', // Hides the line behind the icon
                         paddingVertical: 2 
                      }}>
                        <step.iconType name={step.iconName} size={25} color={tint} />
                      </View>  */}
        
                      {/* The Vertical Line (Draws only if NOT the last item) */}
                      {/* {!isLastItem && (
                        <View style={{
                          flex: 1,
                          width: 1,
                          // backgroundColor: stepActive ? brandColor : grayColor,
                          borderLeftWidth: 1,
                          // If active, solid line. If inactive, dashed line.
                          borderStyle: "dashed", 
                          borderColor: stepActive ? brandColor : grayColor,
                          minHeight: 30, // Minimum height for spacing
                          marginTop: -2, // Connects snugly to icon
                          marginBottom: -2 */}
                    {/* //     }} />
                    //   )} */}
                    {/* // </View> */}
        
                    {/* Right Column: Text */}
                    {/* <View style={{ flex: 1, paddingBottom: isLastItem ? 0 : 20, justifyContent: 'center' }} >
                      <AppText variant="small" style={{ fontSize: 15, color: stepActive ? "#0f172a" : "#8a8989ff" }} numberOfLines={1}>
                        {step.title}
                      </AppText>
                      <AppText variant="light" style={{ fontSize: 13, color: stepActive ? "#535252ff" : "#848484ff", marginTop: 2 }}>
                        {step.subtitle}
                      </AppText>
                    </View>
        
                  </View> */}
                {/* ); */}
              {/* })} */}
            {/* </View> */}
                {/* Rider Information (Only show if rider assigned) */}
                        {!currentOrder.riderId && ["pick_up_by_rider", "on the way", "delivered"].includes(currentOrder.status) && (
                             <View style={styles.card}>
                              
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.riderAvatar}>
                                        <Ionicons name="person" size={20} color="#fff" />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <AppText variant="small" style={{color: "#535252ff" }}>{currentOrder.riderId.name || "Rider Assigned"}</AppText>
                                        <AppText variant="small" style={{ fontSize: 12, color: "#919191ff" }}>Call without sharing your number</AppText>
                                    </View>
                          {!currentOrder.status !== 'delivered' && (
                              <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${currentOrder.riderId.phone}`)}>
                                <Ionicons name="call" size={20} color="#fff" />
                              </TouchableOpacity>
                          )}
        
                                </View>
        
                             </View>
                             
                        )}
                              
              </View>

                    <BottomSheet
          ref={sheetRef}
          index={-1} // Start hidden
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={handleSheetChanges}
          backgroundStyle={{  borderRadius: 20 }}
        >
          <BottomSheetScrollView 
            style={styles.modalOverlay}
            contentContainerStyle={styles.modalContentContainer}
          >
            <View style={styles.modalContent}>
              
              {/* Header */}
              <View style={styles.modalHeader}>
                <AppText variant="variant" style={{ fontSize: 18 }}>ORDER SUMMARY</AppText>
                <TouchableOpacity onPress={() => setBillVisible(false)}>
                  <Ionicons name="close-circle" size={28} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Items */}
              {currentOrder.items.map((item, index) => (
                <View key={index} style={styles.billRow}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: item.menuItemId?.image }} style={styles.image} />
                    <View style={{ marginLeft: 10 }}>
                      <AppText style={{ fontSize: 15 }}>{item.menuItemId?.name} x {item.quantity}</AppText>
                      {item.addons?.map(addon => (
                        <AppText key={addon.id} style={{ fontSize: 11, color: "#64748b" }}>+ {addon.name}</AppText>
                      ))}
                    </View>
                  </View>
                  <AppText style={{ fontSize: 15 }}>₹{(item.unitPrice * item.quantity).toFixed(0)}</AppText>
                </View>
              ))}

              <View style={styles.divider} />

              {/* Totals */}
              <View style={styles.billRow}>
                <AppText style={{ color: "#64748b" }}>Delivery Fee</AppText>
                <AppText style={{ color: "#64748b" }}>₹{currentOrder.deliveryFee || 0}</AppText>
              </View>
              
              <View style={[styles.billRow, { marginTop: 10 }]}>
                <AppText variant="h3" style={{ fontSize: 18 }}>Grand Total</AppText>
                <AppText variant="h3" style={{ fontSize: 18, color: "#fd731dff" }}>₹{currentOrder.totalAmount}</AppText>
              </View>

              <View style={styles.paymentBadge}>
                <AppText style={{ fontSize: 12, color: "#64748b" }}>PAID VIA {currentOrder.paymentType?.toUpperCase()}</AppText>
              </View>

            </View>
          </BottomSheetScrollView>
        </BottomSheet>
        </>
    )
};

export default React.memo(OrderSummary)

const styles = StyleSheet.create({
    mainCard: {
    paddingHorizontal: 10,
},
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    elevation: 6,
    shadowOpacity: 0.1,
  },

  modalOverlay: {
    flex: 1,
  },
  
  // ADD THIS NEW STYLE OBJECT
  modalContentContainer: {
   
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    elevation: 20,
    // minHeight: 300,
  },

  // modalOverlay: { flex: 1 },
  // modalContentContainer: { paddingBottom: 40 }, // Space for safe area
  // modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  // modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  image: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  dashedDivider: {
    // height: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    // borderStyle: 'dashed',
    marginVertical: 12,
  },
  paymentBadge: {
    marginTop: 15,
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  
})