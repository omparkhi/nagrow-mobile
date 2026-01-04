import React, { useMemo, useRef, useState, useCallback } from "react";
import { View, Image, ScrollView, StyleSheet, Dimensions, Alert, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCartThunk, decrement, clearCart, getSubtotal, updateQty, removeLastVariantOfItem, removeItemsByMenuId, getMenuQty } from "@/redux/slices/cart/cartSlice";
import AppText from "@/components/AppText";
import { TouchableOpacity } from "@/app/TouchableOpacity";
import { LinearGradient } from "expo-linear-gradient";
import { Star, X } from "lucide-react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import AnimatedCounter from "../component/AnimatedCounter";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

const AllFoodItem = React.memo(({ item, handleAddItem, handleRemoveItem }) => {
  const isVeg = item.FoodType === "veg";
  const dotColor = isVeg ? "green" : "red";
  const quantity = useSelector(state => getMenuQty(state, item._id));

  return (
    <View key={item._id} style={styles.gridCard}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
                    
      {/* Grid Info */}
      <View style={{ paddingHorizontal: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ borderWidth: 1, borderColor: dotColor, borderRadius: 3, padding: 2 }}>
                <View style={{ backgroundColor: dotColor, width: 6, height: 6, borderRadius: 4 }} />
            </View>
            <View style={styles.ratingBadge}>
              <Star size={10} color="#044811" fill="#044811" />
              <AppText style={{ fontSize: 12, color: "#044811" }}>3.5 (1k+)</AppText>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: -5 }}>
          <AppText numberOfLines={1} style={{ fontSize: 15, color: "#333",  }}>{item.name}</AppText>
          </View>
                       
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" , marginTop: 4 }}>
            <AppText style={{ fontSize: 14, color: "#555" }}> ₹{item.price}</AppText>
                          
            {/* Add Button Logic */}
            {quantity === 0 ? (
              <TouchableOpacity style={styles.addBtnSmall} onPress={() => handleAddItem(item)}>
                  <AppText style={styles.addTxtSmall}>ADD</AppText>
              </TouchableOpacity>
            ) : (
                <View style={styles.qtyBoxSmall}>
                  <TouchableOpacity haptic="heavy" hitSlop={10} onPress={() => handleRemoveItem(item)}><AppText style={styles.qtyBtnSmall}>−</AppText></TouchableOpacity>
                  <AppText style={styles.qtyValSmall}>{quantity}</AppText>
                  {/* <AnimatedCounter count={quantity} textStyle={styles.qtyValSmall} style={{ height: 20 }} /> */}
                                
                  <TouchableOpacity haptic="selection" hitSlop={10} onPress={() => handleAddItem(item)}><AppText style={styles.qtyBtnSmall}>+</AppText></TouchableOpacity>
                </View>
            )}
            </View>
         </View>
      </View>
    )
});

const ListFoodItem = React.memo(({ item, handleAddItem, handleRemoveItem }) => {
  const isVeg = item.FoodType === "veg";
  const dotColor = isVeg ? "green" : "red";
   const quantity = useSelector(state => getMenuQty(state, item._id));

  return (
            <View key={item._id} style={styles.listCard}>
              <View style={{ alignItems: "center", marginTop: -20 }}>
                <Image source={{ uri: item.image }} style={styles.listImage} />
                <View style={styles.btnWrapper}>
                  {quantity === 0 ? (
                    <TouchableOpacity style={styles.addBtnSmall} onPress={() => handleAddItem(item)}>
                      <AppText style={styles.addTxtSmall}>ADD</AppText>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyBoxSmall}>
                      <TouchableOpacity haptic="heavy" hitSlop={10} onPress={() => handleRemoveItem(item)}><AppText style={styles.qtyBtnSmall}>−</AppText></TouchableOpacity>
                      <AppText style={styles.qtyValSmall}>{quantity}</AppText>
                      {/* <AnimatedCounter count={quantity} textStyle={styles.qtyValSmall} style={{ height: 20 }} /> */}
                      <TouchableOpacity haptic="selection" hitSlop={10} onPress={() => handleAddItem(item)}><AppText style={styles.qtyBtnSmall}>+</AppText></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                  <View style={[styles.vegIconBox, { borderColor: dotColor }]}>
                    <View style={{ backgroundColor: dotColor, width: 6, height: 6, borderRadius: 4 }} />
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    
                    <AppText style={{ fontSize: 22, lineHeight: 22, color: "#333" }}>{item.name}</AppText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ alignSelf: "flex-start",  backgroundColor: "#006810ff", padding: 2, borderRadius: 20, marginTop: 5 }} >
                      <Star size={13} fill="#ffffffff" color="#fff" />
                    </View>
                   <AppText variant="small" style={{ fontSize: 15, color: "#333", marginTop: 4 }}>{item?.rating || "3.0"} ({item?.totalRatings || "15"}+)</AppText>
                   {/* <AppText variant="small" style={{ color: "#333", marginTop: 5 }}>• "30 mins"</AppText> */}
                </View>
                <AppText variant="small" style={{ fontSize: 17, color: "#353535ff" }}>₹{item.price}</AppText>
                 <AppText style={{ fontSize: 13, color: "#5d5d5dff",  fontFamily: "Nunito", lineHeight: 15, marginTop: 2, marginLeft: 1 }}>{item.description}</AppText>
              </View>
            </View>
          );
} );

export default function RestaurantMenu({ menu, restaurant }) {
  const dispatch = useDispatch();
  const [isSwitching, setIsSwitching] = useState(false);

  const cartTotal = useSelector(getSubtotal);
  const cartItems = useSelector((state) => state.cart.items);
  const cartQty = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // --- REFS & STATE ---
  const bottomSheetModalRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Customization State
  const [variantQuantities, setVariantQuantities] = useState({}); 
  const [selectedAddons, setSelectedAddons] = useState([]);
  // const [selectedVariant, setSelectedVariant] = useState(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['40%'], []);

  // --- HELPERS ---

  // 1. Get Quantity of a specific Item (Sum of all variants)
  const getQty = (itemId) => {
     return cartItems.filter((i) => i.menuItemId === itemId).reduce((total, i) => total + i.quantity, 0);
  };

  // 2. Get Quantity of a specific Variant
// const getVariantQty = (itemId, variantId) => {
//   console.log("cart", cart)
//     const item = cart.find((cartItem) => {
//         return (
//             cartItem.menuItemId.toString() === itemId.toString() &&
//             cartItem.variantId?.toString() === variantId.toString()
//         );
//     });
//     console.log("item: ", item)
//     return item ? item.quantity : 0;
//   };

  // 3. Get Info for Sticky Footer
  const getModalTotalInfo = () => {
    if (!selectedItem) return { qty: 0, price: 0 };
    const relevantItems = cartItems.filter((i) => i.menuItemId === selectedItem._id);
    return {
        qty: relevantItems.reduce((total, i) => total + i.quantity, 0),
        price: relevantItems.reduce((total, i) => total + (i.price * i.quantity), 0)
    };
  };

  const existingCartItems = useMemo(() => {
    if (!selectedItem) return [];
    return cartItems.filter(i => i.menuItemId === selectedItem._id);
  }, [cartItems, selectedItem]); 

    /* -------------------- MODAL HYDRATION -------------------- */


    /* -------------------- HELPERS -------------------- */

  const getItemQty = (itemId) =>
    cartItems.filter(i => i.menuItemId === itemId).reduce((s, i) => s + i.quantity, 0);

  const getVariantQty = (itemId, variantId) =>
    cartItems.find(i => i.menuItemId === itemId && i.variantId === variantId)?.quantity || 0;

  const openCustomization = (item) => {
    setSelectedItem(item);
    bottomSheetModalRef.current?.present();
  };
  // --- HANDLERS ---

 

const handleAddItem = useCallback((menuItem) => {
    // console.log("menuItem on addon: ", menuItem)
  const hasAddons = menuItem.addonGroups && menuItem.addonGroups.length > 0;
  const hasVariants = menuItem.hasVariants && menuItem.variants && menuItem.variants?.length > 0
  console.log("hasAddons", hasAddons);
    if (hasAddons || hasVariants) {
        // console.log("menu: ", menuItem)
      setSelectedItem(menuItem);

      // 🔥 HYDRATION: Check cart for existing items to pre-fill
      const existingCartItems = cartItems.filter(i => i.menuItemId === menuItem._id);
      const newQtyMap = {};
      let preSelectedAddons = [];

      // A. Hydrate Variants
      if (menuItem.variants) {
        menuItem.variants.forEach(v => {
          const totalVQty = existingCartItems
            .filter(i => i.variantId === v._id)
            .reduce((sum, item) => sum + item.quantity, 0);
          newQtyMap[v._id] = totalVQty;
        });
      }

      // B. Hydrate Addons (Pick from last added item for convenience)
      if (existingCartItems.length > 0) {
          const lastItem = existingCartItems[existingCartItems.length - 1];
          if (lastItem && lastItem.selectedAddons) {
              preSelectedAddons = lastItem.selectedAddons;
          }
      }

      setVariantQuantities(newQtyMap);
      setSelectedAddons(preSelectedAddons)

      // Init variants to 0
      // const initialQty = {};
      // if (menuItem.variants) {
      //     menuItem.variants.forEach(v => initialQty[v._id] = 0);
      // }
      // setVariantQuantities(initialQty);

      bottomSheetModalRef.current?.present();
    } else {
      // Direct Add (Dispatch logic duplicated here to avoid dependency cycle if helper is outside)
      dispatch(addToCartThunk({
        menuItem,
        restaurant: { _id: restaurant._id, name: restaurant.name },
        selectedVariant: null,
        selectedAddons: [],
        quantity: 1,
      })).then((resultAction) => {
         if (resultAction.payload?.conflict) {
            Alert.alert(
              "Different Restaurant",
              `Cart contains items from ${resultAction.payload.currentRestaurant}. Reset?`,
              [{ text: "No", style: "cancel" }, { text: "Yes", onPress: async () => { await dispatch(clearCart()); dispatch(addToCartThunk({ menuItem, restaurant: { _id: restaurant._id, name: restaurant.name }, selectedVariant: null })); } }]
            );
         }
      });
    }
  }, [dispatch, restaurant, cartItems]);

  const handleRemoveItem = useCallback((menuItem) => {
    const hasOptions = (menuItem.variants?.length > 0) || (menuItem.addonGroups?.length > 0);

    if (!hasOptions) {
      // Simple Item: ID is predicatble
      const simpleId = `${menuItem._id}-base-`; 
      dispatch(decrement(simpleId));
    } else {
      // 🔥 COMPLEX ITEM: Remove the last added variant of this item
      dispatch(removeLastVariantOfItem(menuItem._id));
    }
  }, [dispatch]);

  // Logic to Add/Remove INSIDE Modal
  const handleVariantAction = (variant, action) => {
    if (action === 'add') {
        // console.log("variant add: ", variant, action)
        
      dispatch(addToCartThunk({ menuItem: selectedItem, restaurant: { _id: restaurant._id, name: restaurant.name }, selectedVariant: variant,  }));
    } else {
      const cartItem = cartItems.find(i => i.menuItemId === selectedItem._id && i.variantId === variant._id);
      // console.log("cartItem: ", cartItem)
      if (cartItem) dispatch(decrement(cartItem.id)); 
    }

    // console.log("cart:", cart)
  };

  const handleCategoryChange = (cat) => {
    if (cat === selectedCategory) return;
    
    setIsSwitching(true); // Show loader
    
    // Tiny delay to force React to unmount old list and mount new one cleanly
    setTimeout(() => {
        setSelectedCategory(cat);
        setIsSwitching(false); // Hide loader
    }, 200); 
  };

  const updateVariantQty = (variantId, delta) => {
      setVariantQuantities(prev => {
          const current = prev[variantId] || 0;
          return { ...prev, [variantId]: Math.max(0, current + delta) };
      });
  };

  const toggleAddon = (group, option) => {
    setSelectedAddons(prev => {
        const isSelected = prev.some(item => item._id === option._id);
        const isRadio = group.maxSelection === 1;

        // Deselect
        if (isSelected) {
            // Radio buttons usually can't be unchecked directly
            if (!isRadio) return prev.filter(item => item._id !== option._id);
            return prev; 
        }

        const currentGroupSelection = prev.filter(p => group.options.some(gOpt => gOpt._id === p._id));

        // Select
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

  // 🔥 CALCULATE TOTAL (Variants * Qty) + (Addons * TotalQty)
  const calculateModalTotal = () => {
      let total = 0;
      let totalItemCount = 0;

      if (selectedItem?.variants?.length > 0) {
          selectedItem.variants.forEach(v => {
              const qty = variantQuantities[v._id] || 0;
              if (qty > 0) {
                  total += (Number(v.price) * qty);
                  totalItemCount += qty;
              }
          });
      } else {
          // If no variants, assume we are adding 1 base item (or logic for non-variant customizable item)
          total += Number(selectedItem?.price || 0);
          totalItemCount = 1;
      }

      // Addons cost is added for EACH item selected
      if (totalItemCount > 0) {
          selectedAddons.forEach(a => {
              total += (Number(a.price) * totalItemCount);
          });
      }
      return total;
  };

  const confirmAddToCart = () => {
    const totalVariantQty = Object.values(variantQuantities).reduce((a, b) => a + b, 0);
    
    // 1. Check if user set everything to 0 -> Remove Item
    if (selectedItem?.variants?.length > 0 && totalVariantQty === 0) {
      dispatch(removeItemsByMenuId(selectedItem._id));
      bottomSheetModalRef.current?.close();
      return;
    }

    // 2. Validate Addons
    if (selectedItem?.addonGroups) {
      for (const group of selectedItem.addonGroups) {
        const count = selectedAddons.filter(a => group.options.some(o => o._id === a._id)).length;
        if (count < group.minSelection) {
          Alert.alert("Required", `Please select options for ${group.title}`);
          return;
        }
      }
    }

    dispatch(removeItemsByMenuId(selectedItem._id));

      // Object.entries(variantQuantities).forEach(([variantId, ]) => {
       
      //     const variant = selectedItem.variants.find(v => v._id === variantId);
      //     dispatch(addToCartThunk({
      //       menuItem: selectedItem,
      //       restaurant: { _id: restaurant._id, name: restaurant.name },
      //       selectedVariant: variant,
      //       selectedAddons: selectedAddons,
      //       quantity: 1
      //     }));
        
      // });

      // 3. Dispatch (Loop through variants to separate cart items)
      const actions = [];
      if (selectedItem?.variants?.length > 0) {
          selectedItem.variants.forEach(v => {
              const qty = variantQuantities[v._id] || 0;
              if (qty > 0) {
                  actions.push(dispatch(addToCartThunk({
                      menuItem: selectedItem,
                      restaurant,
                      selectedVariant: v,
                      selectedAddons, // Addons apply to all
                      quantity: qty
                  })));
              }
          });
      } else {
           // No variant case
           actions.push(dispatch(addToCartThunk({
              menuItem: selectedItem,
              restaurant,
              selectedVariant: null,
              selectedAddons,
              quantity: 1
          })));
      }

      Promise.all(actions).then((res) => {
          if (res[0]?.payload?.conflict) {
              Alert.alert("Different Restaurant", "Clear cart?", [
                  { text: "Cancel" },
                  { text: "Clear", onPress: async () => {
                      await dispatch(clearCart());
                      actions.forEach(a => dispatch(a)); // Retry
                      bottomSheetModalRef.current?.close();
                  }}
              ]);
          } else {
              bottomSheetModalRef.current?.close();
          }
      });
  };
  // const processAddToCart = async (menuItem, variant) => {
  //   const resultAction = await dispatch(addToCartThunk({
  //     menuItem,
  //     restaurant: { _id: restaurant._id, name: restaurant.name },
  //     selectedVariant: variant
  //   }));

  //   const result = resultAction.payload;

  //   if (result?.conflict) {
  //     Alert.alert(
  //       "Different Restaurant",
  //       `Cart contains items from ${result.currentRestaurant}. Reset?`,
  //       [
  //         { text: "No", style: "cancel" },
  //         { 
  //           text: "Yes, Reset", 
  //           onPress: async () => {
  //             await dispatch(clearCart());
  //             dispatch(addToCartThunk({ menuItem, restaurant: { _id: restaurant._id, name: restaurant.name }, selectedVariant: variant }));
  //           } 
  //         }
  //       ]
  //     );
  //   }
  // };

  // Backdrop
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // --- RENDER LOGIC ---
const itemsToRender = useMemo(() => {
    if (selectedCategory === "ALL") {
      return Object.values(menu || {}).flat();
    }
    return menu?.[selectedCategory] || [];
  }, [menu, selectedCategory]);

  const modalTotal = calculateModalTotal();
  console.log("modal total: ", modalTotal)
  const totalVariantQty = Object.values(variantQuantities).reduce((a, b) => a + b, 0);

//   const { qty: modalQty, price: modalPrice } = getModalTotalInfo();

  if (!menu || Object.keys(menu).length === 0) {
    return <AppText>No menu available</AppText>;
  }

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 100  }}>

      {/* CATEGORY TABS */}
      {menu && Object.keys(menu).length > 0 &&
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {["ALL", ...Object.keys(menu)].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity key={cat} onPress={() => handleCategoryChange(cat)} style={[styles.catItem, isActive && styles.catItemActive]}>
                <AppText style={{ fontSize: 16, color: isActive ? "#1d1d1d" : "#7e7e7e" }}>{cat === "ALL" ? "All" : cat}</AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      }

      {/* MENU ITEMS LIST */}
      <View style={{ marginTop: 15 }}>
        {isSwitching ? (
            <View style={{  justifyContent: 'center', alignItems: 'center', height: height * 0.50, backgroundColor: "#ffffffff" }}>
                <ActivityIndicator size="large" color="#00ac22" />
            </View>
        ) : (
            <>
                {selectedCategory === "ALL" ? (
                <View style={styles.gridContainer}>
                    {itemsToRender.map((item) => (
                    <AllFoodItem 
                        key={`${item._id}`} 
                        item={item}
                        handleAddItem={handleAddItem} 
                        handleRemoveItem={handleRemoveItem}
                    />
                    ))}
                </View>
                ) : (
                <View>
                    {itemsToRender.map((item) => (
                    <ListFoodItem 
                        key={`${item._id}`} 
                        item={item}
                        handleAddItem={handleAddItem}
                        handleRemoveItem={handleRemoveItem}
                    />
                    ))}
                </View>
                )}
            </>
        )}
      </View>


     {/* --- CUSTOMIZATION MODAL --- */}
        <BottomSheetModal ref={bottomSheetModalRef} index={0} snapPoints={['85%']} backdropComponent={(p)=><BottomSheetBackdrop {...p} opacity={0.5} disappearsOnIndex={-1}/>}>
            <View style={{flex: 1}}>
                <View style={styles.modalHeader}>
                    <AppText variant="small" style={{fontSize: 18, fontWeight:'bold', flex:1}}>{selectedItem?.name}</AppText>
                    <TouchableOpacity onPress={()=>bottomSheetModalRef.current?.close()}><X color="black" size={24}/></TouchableOpacity>
                </View>
                
                <BottomSheetScrollView contentContainerStyle={{padding: 16, paddingBottom: 100}}> {/* Added paddingBottom so content doesn't hide behind footer */}
                    
                    {/* 1. VARIANTS LIST */}
                    {selectedItem?.variants?.length > 0 && (
                        <View style={styles.groupSection}>
                            <View style={styles.sectionHeader}>
                                <AppText variant="small" style={styles.groupTitle}>Quantity / Size</AppText>
                                <AppText variant="small" style={styles.reqBadge}>Required</AppText>
                            </View>
                            
                            {selectedItem.variants.map(v => {
                                const qty = variantQuantities[v._id] || 0;
                                return (
                                    <View key={v._id} style={styles.variantRowNew}>
                                        <View>
                                            <AppText variant="small" style={{fontSize:16, color:'#333'}}>{v.name}</AppText>
                                            <AppText variant="small" style={{fontSize:14, color:'#666'}}>₹{v.price}</AppText>
                                        </View>

                                        {qty === 0 ? (
                                            <TouchableOpacity style={styles.addBtnSmall} onPress={() => updateVariantQty(v._id, 1)}>
                                                <AppText variant="small" style={styles.addTxtSmall}>ADD</AppText>
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={styles.qtyBoxSmall}>
                                                <TouchableOpacity onPress={() => updateVariantQty(v._id, -1)} hitSlop={10}><AppText variant="small" style={styles.qtyBtnSmall}>−</AppText></TouchableOpacity>
                                                <AppText variant="small" style={styles.qtyValSmall}>{qty}</AppText>
                                                <TouchableOpacity onPress={() => updateVariantQty(v._id, 1)} hitSlop={10}><AppText variant="small" style={styles.qtyBtnSmall}>+</AppText></TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )
                            })}
                        </View>
                    )}

                    {/* 2. ADDONS */}
                    {selectedItem?.addonGroups?.map(group => (
                        <View key={group._id} style={styles.groupSection}>
                            <View style={styles.sectionHeader}>
                                <AppText variant="small" style={styles.groupTitle}>{group.title}</AppText>
                                {group.minSelection > 0 && <AppText variant="small" style={styles.reqBadge}>Required</AppText>}
                            </View>
                            <AppText variant="small" style={{fontSize:12, color:'#666', marginBottom: 10}}>
                                {group.maxSelection > 1 ? `Select up to ${group.maxSelection}` : "Select 1"}
                            </AppText>
                            
                            {group.options.map(opt => {
                                const isSelected = selectedAddons.some(a => a._id === opt._id);
                                const isRadio = group.maxSelection === 1;
                                const iconName = isRadio 
                                    ? (isSelected ? "radio-button-on" : "radio-button-off") 
                                    : (isSelected ? "checkbox" : "square-outline");

                                return (
                                    <TouchableOpacity key={opt._id} style={styles.optionRow} onPress={()=>toggleAddon(group, opt)}>
                                        <View style={{flexDirection:'row', alignItems:'center'}}>
                                            <Ionicons name={iconName} size={24} color={isSelected ? "#00965a" : "#ccc"} />
                                            <AppText variant="small" style={{marginLeft:12, fontSize:15, color:'#333'}}>{opt.name}</AppText>
                                        </View>
                                        <AppText variant="small" style={{color: '#666', fontSize:14}}>{Number(opt.price) > 0 ? `+ ₹${opt.price}` : 'Free'}</AppText>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    ))}
                </BottomSheetScrollView>

                {/* MODAL FOOTER - Always Render if Total > 0 or if variants exist (allowing removal by 0) */}
                <View style={styles.modalFooter}>
                    <TouchableOpacity 
                        style={[styles.modalAddBtn, (totalVariantQty===0 && selectedItem?.variants?.length>0) ? {backgroundColor:'#d32f2f'} : {}]} 
                        onPress={confirmAddToCart}
                    >
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
                            {/* If variants exist and total selected is 0, show REMOVE */}
                            {(selectedItem?.variants?.length > 0 && totalVariantQty === 0) ? (
                                <AppText variant="small" style={{color:'white', fontWeight:'bold', fontSize:16, textAlign:'center', width:'100%'}}>Remove Item</AppText>
                            ) : (
                                <>
                                    <AppText variant="small" style={{color:'white', fontWeight:'bold', fontSize:16}}>₹{modalTotal}</AppText>
                                    <AppText variant="small" style={{color:'white', fontWeight:'bold', fontSize:16}}>Add Item</AppText>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheetModal>



    </View>
  );
}

const styles = StyleSheet.create({
  // Categories
  catScroll: { paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  catItem: { paddingHorizontal: 10, paddingVertical: 2, marginRight: 10, borderBottomWidth: 2, borderBottomColor: "transparent" },
  catItemActive: { borderBottomColor: "#1d1d1d", borderRadius: 5 },

  // --- GRID STYLES (For "ALL") ---
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: { width: '48%', marginBottom: 16, borderWidth: 1, borderColor: '#dcdcdcff', borderRadius: 12, padding: 8 },
  gridImage: { width: '100%', height: 110, borderRadius: 8, resizeMode: 'cover' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2},
  addBtnSmall: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, width: 65, backgroundColor: 'white', elevation: 1 },
  addTxtSmall: { color: 'green', fontSize: 16, margin: "auto" },
  qtyBoxSmall: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'green', borderRadius: 6, paddingHorizontal: 5, backgroundColor: '#f0fdf4', elevation: 1 },
  qtyBtnSmall: { color: 'green', fontSize: 16, paddingHorizontal: 6 },
  qtyValSmall: { color: 'green', fontSize: 14, },

  // --- LIST STYLES (For Categories) ---
  listCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 15, top: 15, marginBottom: 10, padding: 10, borderRadius: 20, gap: 10, borderBottomWidth: 1, borderBottomColor: "#e1e1e1ff" },
  vegIconBox: { borderWidth: 1, borderRadius: 3, padding: 2 },
  descText: { fontSize: 12, color: "#777", marginTop: 4, fontFamily: 'Nunito' },
  listImage: { width: 110, height: 130, borderRadius: 10 },
  
  // List Buttons
  btnWrapper: { position: "absolute", bottom: -10, backgroundColor:'white', borderRadius: 8, elevation: 1 },
  addBtn: { width: 70, paddingVertical: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, alignItems: 'center', backgroundColor: "white" },
  addTxt: { fontSize: 16, color: "#00ac22" },
  customText: { fontSize: 9, color: '#aaa', position: 'absolute', bottom: -12, width: 80, textAlign:'center' },
  qtyBox: { width: 70, flexDirection: "row", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingVertical: 1, backgroundColor: "white" },
  qtyBtn: { fontSize: 18, color: "#00ac22" },
  qtyVal: { fontSize: 16, color: "#00ac22" },

  // Bottom Sheet
  contentContainer: {
    paddingHorizontal: 0, // Reset padding here
    paddingBottom: 50,    // Add padding at bottom for safety
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20
  },
  modalTitle: { fontSize: 22, color: '#333' },
  modalImg: { width: 40, height: 40, borderRadius: 6 },
  closeBtn: { padding: 6, backgroundColor: '#000', borderRadius: 20 },
  
  divider: { height: 1, backgroundColor: "#eee" },
  
  // Wrapper for the list of variants
  variantsContainer: {
    padding: 20,
    backgroundColor: "#f9f9f9", // Light grey background for variants area
    gap: 10
  },
  
  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  
  variantAddBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 25,
    borderRadius: 8,
    backgroundColor: "white"
  },
  
  variantQtyBox: {
    width: 90,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#f0fdf4"
  },

  // Footer Button Container
  footerContainer: {
    paddingHorizontal: 20,
    // paddingTop: 15,
    backgroundColor: '#eee', // Ensure background is white behind button
    marginBottom: 300
  },
  footerBtn: {
    backgroundColor: '#00965aff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  groupSection: { 
        marginBottom: 24, 
        borderBottomWidth: 1, 
        borderColor: '#f9f9f9', 
        paddingBottom: 16 
    },
    sectionHeader: { 
        flexDirection:'row', 
        alignItems:'center', 
        gap:10, 
        marginBottom:5 
    },
    groupTitle: { 
        fontSize: 17, 
        fontWeight: 'bold', 
        color:'#222' 
    },
    reqBadge: { 
        fontSize: 10, 
        color: '#e65100', 
        backgroundColor:'#ffe0b2', 
        paddingHorizontal:6, 
        paddingVertical:2, 
        borderRadius:4, 
        fontWeight:'bold' 
    },
    optionRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 12 
    },
    modalFooter: { 
        padding: 16, 
        borderTopWidth: 1, 
        borderColor: '#eee', 
        backgroundColor: 'white', 
        elevation: 20,
        // If the footer is hiding behind keyboard or bottom sheet edge:
        paddingBottom: 20 
    },
    modalAddBtn: { 
        backgroundColor: '#00965a', 
        padding: 16, 
        borderRadius: 12 ,
        marginBottom: 3000
    },
});