import React, { useMemo, useRef, useState, useCallback } from "react";
import { View, Image, ScrollView, StyleSheet, Dimensions, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCartThunk, decrement, increment, clearCart, getSubtotal, getMenuQty, removeLastVariantOfItem } from "@/redux/slices/cart/cartSlice";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { Star, X, Minus, Plus } from "lucide-react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FoodType from "../component/FoodType";
import AddOnFoodType from "../component/AddonType";
import AnimatedCounter from "../component/AnimatedCounter";

// --- 1. FOOD LIST ITEM ---
const FoodItemRow = React.memo(({ item, handleAddItem, handleRemoveItem }) => {
  const qty = useSelector(state => getMenuQty(state, item._id)); 
  const isCustomizable = (item.variants?.length > 0) || (item.addonGroups?.length > 0);

  return (
    <View style={styles.listCard}>
       {/* ... (Left Content UI remains exactly same) ... */}
       <View style={{ flex: 1, marginLeft: 5 }}>
          <FoodType item={item} />
          <AppText variant="small" style={styles.itemName}>{item.name}</AppText>
          <View style={{flexDirection:'row', alignItems:'center', marginTop:4, gap:5}}>
             <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#00b069ff", padding: 3, borderRadius: 30 }}>
                <Star size={10} color="white" fill="white" strokeWidth={3}/>
             </View>
             <AppText variant="small" style={{fontSize:12, color:'#00b069ff'}}>{item.rating || "4.2"} ({item.totalRatings || 20})</AppText>
          </View>
          <AppText variant="small" style={styles.itemPrice}>₹{item.price}</AppText>
          <AppText variant="small" numberOfLines={2} style={styles.descText}>{item.description}</AppText>
       </View>

       {/* Right Content - Buttons */}
       <View style={{ alignItems: "center" }}>
          <Image source={{ uri: item.image }} style={styles.listImage} />
          <View style={styles.btnWrapper}>
             {qty === 0 ? (
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => handleAddItem(item)}>
                   <View style={{ flexDirection: "row",  gap: 2 }}>
                    <AppText variant="small" style={styles.addTxtSmall}>ADD</AppText>
                    <Plus size={11} color="#00b069ff" strokeWidth={3}/>
                   </View>
                   {isCustomizable && <AppText variant="small" style={styles.customText}>Customisable</AppText>}
                </TouchableOpacity>
             ) : (
                <View style={styles.qtyBoxSmall}>
                   <TouchableOpacity onPress={() => handleRemoveItem(item)} hitSlop={10} style={{padding:5}}>
                       <Minus size={16} color="#00b069ff" strokeWidth={3}/>
                   </TouchableOpacity>
                   <AppText variant="small" style={styles.qtyValSmall}>{qty}</AppText>
                   {/* <AnimatedCounter count={qty} textStyle={styles.qtyValSmall} style={{ height: 20 }} /> */}
                   <TouchableOpacity onPress={() => handleAddItem(item)} hitSlop={10} style={{padding:5}}>
                       <Plus size={16} color="#00b069ff" strokeWidth={3}/>
                   </TouchableOpacity>
                </View>
             )}
          </View>
       </View>
    </View>
  );
});

// --- 2. MAIN COMPONENT ---
export default function RestaurantMenu({ menu, restaurant }) {
  const dispatch = useDispatch();
  const bottomSheetModalRef = useRef(null);
  const insets = useSafeAreaInsets();
  
  const cartTotal = useSelector(getSubtotal);
  const cartItems = useSelector(state => state.cart.items);
  const cartQty = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [modalView, setModalView] = useState("CUSTOMIZE"); 
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Customization State
  const [selectedVariant, setSelectedVariant] = useState(null);
  // ❌ REMOVED: itemQuantity (Modal doesn't own quantity)
  const [selectedAddons, setSelectedAddons] = useState([]); 

  const snapPoints = useMemo(() => ["60%"], []);

  const hydrateFromCart = (cartItem) => {
    setSelectedVariant(cartItem.selectedVariant || null);
    setSelectedAddons(cartItem.selectedAddons || []);
  };


  // --- HANDLER: OPEN MODAL ---
  const handleAddItem = useCallback((menuItem) => {
    const hasVariants = menuItem.variants && menuItem.variants.length > 0;
    const hasAddons = menuItem.addonGroups && menuItem.addonGroups.length > 0;

    if (hasVariants || hasAddons) {
      setSelectedItem(menuItem);
      const existingItems = cartItems.filter(i => i.menuItemId === menuItem._id);

    if (existingItems.length > 0) {
        setModalView("REPEAT");
    } else {
        setupFreshModal(menuItem);
    }

      bottomSheetModalRef.current?.present();
    } else {
      // Direct Add (Simple Item)
      dispatch(addToCartThunk({ menuItem, restaurant, quantity: 1 }));
    }
  }, [dispatch, restaurant, cartItems]);

  const setupFreshModal = (menuItem) => {
      setModalView("CUSTOMIZE");
      // Default: First variant, no addons
      if (menuItem.variants?.length > 0) setSelectedVariant(menuItem.variants[0]);
      else setSelectedVariant(null);
      setSelectedAddons([]); 
  };

  const handleRemoveItem = useCallback((menuItem) => {
     const hasOptions = (menuItem.variants?.length > 0) || (menuItem.addonGroups?.length > 0);
     if(!hasOptions) {
         const simpleId = `${menuItem._id}-base-`; 
         dispatch(decrement(simpleId));
     } else {
         // 🔥 FIX: Calls the new LIFO reducer
         dispatch(removeLastVariantOfItem(menuItem._id));
     }
  }, [dispatch]);

  const handleRepeatAction = (cartItem, action) => {
      if (action === 'increment') dispatch(increment(cartItem.id));
      if (action === 'decrement') dispatch(decrement(cartItem.id));
  };

  const toggleAddon = (group, option) => {
    setSelectedAddons(prev => {
        const isSelected = prev.some(item => item._id === option._id);
        const isRadio = group.maxSelection === 1;
        if (isSelected) return isRadio ? prev : prev.filter(item => item._id !== option._id);
        
        const currentGroupSelection = prev.filter(p => group.options.some(gOpt => gOpt._id === p._id));
        if (isRadio) {
            const others = prev.filter(p => !group.options.some(gOpt => gOpt._id === p._id));
            return [...others, option];
        } else {
            if (currentGroupSelection.length >= group.maxSelection) {
                Alert.alert("Limit Reached", `Select up to ${group.maxSelection}.`);
                return prev;
            }
            return [...prev, option];
        }
    });
  };

  const calculateModalTotal = () => {
      let unitPrice = selectedVariant ? Number(selectedVariant.price) : Number(selectedItem?.price || 0);
      let addonPrice = 0;
      selectedAddons.forEach(a => addonPrice += Number(a.price));
      return (unitPrice + addonPrice) * 1; // ✅ ALWAYS 1 unit for configuration
  };

  const confirmAddToCart = () => {
      if (selectedItem?.addonGroups) {
          for (const group of selectedItem.addonGroups) {
              const count = selectedAddons.filter(a => group.options.some(o => o._id === a._id)).length;
              if (count < group.minSelection) {
                  Alert.alert("Required", `Select options for ${group.title}`);
                  return;
              }
          }
      }

      // ✅ FIX: Always add 1 unit. Quantity is managed in Cart/Repeat view.
      dispatch(addToCartThunk({
          menuItem: selectedItem,
          restaurant,
          selectedVariant,
          selectedAddons,
          quantity: 1
      })).then((res) => {
          if (res.payload?.conflict) {
              Alert.alert("Different Restaurant", "Clear cart?", [
                  { text: "Cancel" },
                  { text: "Clear", onPress: async () => {
                      await dispatch(clearCart());
                      dispatch(addToCartThunk({ menuItem: selectedItem, restaurant, selectedVariant, selectedAddons, quantity: 1 }));
                      bottomSheetModalRef.current?.close();
                  }}
              ]);
          } else {
              bottomSheetModalRef.current?.close();
          }
      });
  };

  const itemsToRender = useMemo(() => {
    if (selectedCategory === "ALL") return Object.values(menu || {}).flat();
    return menu?.[selectedCategory] || [];
  }, [menu, selectedCategory]);

  const modalTotal = calculateModalTotal();

  return (
    <View style={{ flex: 1, backgroundColor:'#fff' }}>
        {/* Categories */}
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{padding: 10}}>
                {["ALL", ...Object.keys(menu || {})].map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} 
                        style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}>
                        <AppText variant="small" style={{color: "#000", fontSize:14}}>{cat}</AppText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* List */}
        <ScrollView contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 15}}>
            {itemsToRender.map(item => (
                <FoodItemRow key={item._id} item={item} handleAddItem={handleAddItem} handleRemoveItem={handleRemoveItem} />
            ))}
        </ScrollView>

        {/* --- MODAL --- */}
        <BottomSheetModal 
            ref={bottomSheetModalRef} 
            index={0} 
            snapPoints={snapPoints} 
            enableDynamicSizing={false} 
            handleComponent={null} 
            backdropComponent={(p)=><BottomSheetBackdrop {...p} opacity={0.5} disappearsOnIndex={-1}/>} 
        >
            <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 0)", position: 'relative' }}>
                
                {/* Header */}
                <View style={styles.modalHeader}>
                    <View style={{flexDirection: "row", alignItems: "center", gap: 5, flex: 1}}>
                        {selectedItem?.image && <Image source={{ uri: selectedItem.image }} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#eee', borderWidth: 1, borderColor: "#ebebebff" }} />}
                        <View style={{flex:1}}>
                          <AppText variant="small" style={{fontSize: 18, color:'#212121'}}>{selectedItem?.name}</AppText>
                          <AppText variant="small" style={{fontSize: 11, color:'#616161', marginTop: -4, fontFamily: "Nunito"}}>
                            {modalView === 'REPEAT' ? 'Repeat previous customization?' : 'Customize as per your taste'}
                          </AppText>
                        </View>
                        <TouchableOpacity onPress={()=>bottomSheetModalRef.current?.close()} style={{backgroundColor:'#f0f0f0', padding:5, borderRadius:20}}>
                          <X color="black" size={20}/>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- CONTENT AREA --- */}
                <View style={{ flex: 1, backgroundColor: "#eeeeeeff", }}>
                    {modalView === 'REPEAT' ? (
                        <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 130}}>
                            <AppText variant="small" style={{fontSize:14, color:'#666', marginBottom:15}}>PREVIOUS CUSTOMIZATIONS</AppText>
                            {cartItems.filter(i => i.menuItemId === selectedItem?._id).map((cartItem, idx) => (
                                <View key={idx} style={styles.repeatRow}>
                                    <View style={{flex:1}}>
                                        <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                                            <FoodType item={selectedItem} />
                                            <AppText variant="small" style={{fontSize:15, color:'#333'}}>{cartItem.name}</AppText>
                                        </View>
                                        {cartItem.selectedAddons?.length > 0 && 
                                            <AppText variant="small" style={{fontSize:12, color:'#666', marginTop:2}}>
                                                + {cartItem.selectedAddons.map(a => a.name).join(", ")}
                                            </AppText>
                                        }
                                        <AppText variant="small" style={{fontSize:14, marginTop:4}}>₹{cartItem.price * cartItem.quantity}</AppText>
                                    </View>
                                    <View style={styles.qtyBoxSmall}>
                                        <TouchableOpacity onPress={() => handleRepeatAction(cartItem, 'decrement')} hitSlop={10} style={{padding:5}}><Minus size={14} color="#00b069ff" strokeWidth={3}/></TouchableOpacity>
                                        <AppText variant="small" style={styles.qtyValSmall}>{cartItem.quantity}</AppText>
                                        <TouchableOpacity onPress={() => handleRepeatAction(cartItem, 'increment')} hitSlop={10} style={{padding:5}}><Plus size={14} color="#00b069ff" strokeWidth={3}/></TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addNewBtn} onPress={() => setupFreshModal(selectedItem)}>
                                <AppText variant="small" style={{color:'#00965a', fontSize:16}}>+ I'll choose different customization</AppText>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <BottomSheetScrollView contentContainerStyle={{paddingTop: 16, paddingHorizontal: 10, paddingBottom: 130}}>
                            {/* Variants */}
                            {selectedItem?.variants?.length > 0 && (
                                <View style={styles.groupSection}>
                                    <View style={styles.sectionHeader}>
                                        <AppText variant="small" style={styles.groupTitle}>Choose Variant</AppText>
                                        <AppText variant="small" style={styles.reqBadge}>Required - Select any 1 option</AppText>
                                    </View>
                                    {selectedItem.variants.map(v => {
                                        const isSelected = selectedVariant?._id === v._id;
                                        return (
                                            <TouchableOpacity key={v._id} style={styles.optionRow} onPress={()=>setSelectedVariant(v)}>
                                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                                    <FoodType item={selectedItem} />
                                                    <AppText variant="small" style={{marginLeft:12, fontSize:15, color: isSelected ? '#000' : '#616161'}}>{v.name}</AppText>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                                    <AppText variant="small" style={{fontSize:14, color: isSelected ? '#000' : '#616161'}} weight="bold">₹{v.price}</AppText>
                                                    <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={22} color={isSelected ? "#00965a" : "#ccc"} />
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )}
                            {/* Addons */}
                            {selectedItem?.addonGroups?.map(group => (
                                <View key={group._id} style={styles.groupSection}>
                                    <View style={styles.sectionHeader}>
                                        <AppText variant="small" style={styles.groupTitle}>{group.title}</AppText>
                                        <AppText variant="small" style={{fontSize:12, color:'#666'}}>{group.minSelection > 0 ? "Required" : "Optional"}</AppText>
                                    </View>
                                    {group.options.map(opt => {
                                        const isSelected = selectedAddons.some(a => a._id === opt._id);
                                        const isRadio = group.maxSelection === 1;
                                        const iconName = isRadio ? (isSelected ? "radio-button-on" : "radio-button-off") : (isSelected ? "checkbox" : "square-outline");
                                        return (
                                            <TouchableOpacity key={opt._id} style={styles.optionRow} onPress={()=>toggleAddon(group, opt)}>
                                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                                    {/* ✅ FIX: Passed correct prop name */}
                                                    <AddOnFoodType item={opt} />
                                                    <AppText variant="small" style={{marginLeft:12, fontSize:15, color:'#333'}}>{opt.name}</AppText>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                                    <AppText variant="small" style={{color: '#666', fontSize:14}}>₹{opt.price}</AppText>
                                                    <Ionicons name={iconName} size={24} color={isSelected ? "#00965a" : "#ccc"} />
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            ))}
                        </BottomSheetScrollView>
                    )}
                </View>

                {/* --- FOOTER --- */}
                {/* ❌ REMOVED Stepper Logic. Modal only adds NEW configuration (Qty = 1) */}
                {modalView === 'CUSTOMIZE' && (
                    <View style={[styles.modalFooter, { paddingBottom: Math.max(16, insets.bottom + 10) }]}>
                        {/* Swiggy Style: Just the Add Item Button for configuration */}
                        <AppText variant="small" style={{color:'#212121', fontSize:16}}>₹{modalTotal}</AppText>
                        <TouchableOpacity style={styles.modalAddBtn} onPress={confirmAddToCart}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', margin: "auto"}}>
                                <AppText variant="small" style={{color:'white', fontSize:16}}>Add Item</AppText>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </BottomSheetModal>

        {/* Global Cart Footer */}
        {/* {cartQty > 0 && ( */}
            {/* <View style={[styles.footerContainer, { bottom: Math.max(20, insets.bottom + 10) }]}> */}
                {/* <TouchableOpacity style={styles.footerBtn} onPress={() => Go to cart}> */}
                    {/* <View> */}
                        {/* <AppText variant="small" style={{color:'white'}}>{cartQty} Items</AppText> */}
                        {/* <AppText variant="small" style={{color:'white', fontSize:12}}>₹{cartTotal}  plus taxes</AppText> */}
                    {/* </View> */}
                    {/* <AppText variant="small" style={{color:'white', fontSize:16}}>View Cart</AppText> */}
                {/* </TouchableOpacity> */}
            {/* </View> */}
        {/* )} */}
    </View>
  );
}

const styles = StyleSheet.create({
    // ... (Keep existing styles, ensure footer is absolute)
    listCard: { flexDirection: 'row', paddingTop: 15, paddingBottom: 40, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    listImage: { width: 135, height: 135, borderRadius: 12, backgroundColor: '#eee', marginLeft: 8, borderWidth: 1, borderColor: "#ebebebff" },
    btnWrapper: { position: 'absolute', bottom: -15, marginLeft: 5, backgroundColor: 'white', borderRadius: 8, shadowColor:'#000', elevation: 3 },
    addBtnSmall: { width: 100, paddingVertical: 5, alignItems: 'center', borderWidth: 1, borderColor: '#00b069ff', backgroundColor: '#f5fffbff', borderRadius: 8 },
    addTxtSmall: { color: '#00b069ff', fontSize:20 },
    customText: { fontSize: 11, color: '#979797ff', marginTop: 5, position:'absolute', bottom: -18, fontFamily: "Nunito" },
    qtyBoxSmall: { flexDirection: 'row', width: 90, justifyContent: 'space-between', padding: 8, borderWidth: 1, borderColor: '#00b069ff', backgroundColor: '#f5fffbff', borderRadius: 8, alignItems:'center' },
    qtyBtnSmall: { color: '#00b069ff', fontSize: 18, paddingHorizontal: 5 },
    qtyValSmall: { color: '#00b069ff', fontSize: 18 },
    itemName: { fontSize: 20, color: '#212121', lineHeight: 22, marginTop: 10 },
    itemPrice: { fontSize: 15, color: '#212121', marginTop: 6 },
    descText: { fontSize: 13, color: '#616161', marginTop: 6, lineHeight: 14, fontFamily: "Nunito" },
    vegIconBox: { borderWidth: 1, padding: 3, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6 },
    catPill: { paddingHorizontal: 16, paddingVertical: 5, marginRight: 10, backgroundColor:'#fff' },
    catPillActive: { borderBottomWidth: 2, borderBlockColor: "#616161" },
    
    modalHeader: { padding: 16, borderBottomWidth: 1, borderColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', backgroundColor: '#fff', borderTopRightRadius: 50, borderTopLeftRadius: 50, },
    groupSection: { backgroundColor: "#ffffffff", borderRadius: 20, marginBottom: 24, borderBottomWidth: 1, borderColor: '#f9f9f9', paddingBottom: 16 },
    sectionHeader: { flexDirection:'column', marginBottom:10, borderBottomWidth: 1, borderBlockColor: "#ddddddff", paddingHorizontal: 15, paddingVertical: 10 },
    groupTitle: { fontSize: 17, color:'#212121' },
    reqBadge: { fontSize: 13, color: '#616161', fontFamily: "Nunito" },
    optionRow: { flexDirection: 'row', paddingHorizontal: 15, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    
    repeatRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center',  marginBottom: 10, paddingHorizontal: 10, paddingVertical: 15, borderBottomWidth:1, borderColor:'#f0f0f0', backgroundColor: "#ffffffff", borderRadius: 10 },
    addNewBtn: { padding: 15, alignItems:'center', backgroundColor:'#f0fdf4', borderRadius:10, marginTop:20, borderWidth:1, borderColor:'#bbf7d0', borderStyle:'dashed' },

    modalFooter: { 
        flex: 1,
        position: 'absolute', // ✅ FIXED: Absolute position
        bottom: 0, 
        left: 0,
        right: 0,
        paddingHorizontal: 16, 
        paddingTop: 16, 
        borderTopWidth: 1, 
        borderColor: '#eee', 
        backgroundColor: 'white', 
        elevation: 20, 
        zIndex: 999,
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: "space-between"

    },
    // stepperContainer removed as per Swiggy logic
    modalAddBtn: { backgroundColor: '#00b069ff', paddingVertical: 14, borderRadius: 8, width: '50%', alignItems: 'center', paddingHorizontal: 20},
    
    footerContainer: { position:'absolute', bottom:20, left:16, right:16 },
    footerBtn: { backgroundColor: '#00b069ff', padding: 16, borderRadius: 12, flexDirection:'row', justifyContent:'space-between', alignItems:'center', elevation:5 }
});
