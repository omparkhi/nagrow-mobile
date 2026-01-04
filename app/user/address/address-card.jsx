import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, selectAddress, deleteAddress, updateAddress } from "@/redux/slices/user/addressSlice";
import {MoreVertical, Edit, MapPin, Trash2, LocateFixed, MapPinPlus, Home } from "lucide-react-native";
import { Feather } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";

const AddressCard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const router = useRouter();
  const dispatch = useDispatch();

  const { addresses } = useSelector((state) => state.address);

  const [isEditing, setIsEditing] = useState(false);
  const [fullAddress, setFullAddress] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showMenuIndex, setShowMenuIndex] = useState(null); // for mobile vertical menu

  useEffect(() => {
      dispatch(fetchAddresses());
  }, [dispatch]);

  const handleBack = () => {
    if (route.params?.from === "address-card") {
      navigation.navigate("user/dashboard/dash");
    } else {
      navigation.goBack();
    }
  };

  const handleEditClick = (address) => {
    setSelectedAddressId(address._id);
    setFullAddress(address.fullAddress || "");
    setIsEditing(true);
    setShowMenuIndex(null);
  };

  const handleSave = async () => {
    if (!selectedAddressId) return;
    await dispatch(updateAddress({ addressId: selectedAddressId, payload: { fullAddress } }));
    setIsEditing(false);
  };

  const handleEditOnMap = (address) => {
  router.push({
  pathname: "/user/address/view-map-page",
  params: {
    address: JSON.stringify(address),
    addressId: address._id
  }
});

  setShowMenuIndex(null);
};


  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => dispatch(deleteAddress(addressId)) },
      ]
    );
    setShowMenuIndex(null);
  };

  const handleSelectAddress = async (addressId) => {
    await dispatch(selectAddress(addressId));
  };

  const renderAddressItem = ({ item, index }) => (
    <View style={{ position: "relative" }}>
  <TouchableOpacity
    onPress={() => handleSelectAddress(item._id)}
    style={[styles.addressCard, item.selectedAddress ? styles.selectedAddress : null]}
  >
    <View style={styles.addressIcon}>
      <Home size={24} color="#ff5733" />
    </View>

    <View style={styles.addressContent}>
      <View style={styles.addressHeader}>
        <AppText variant="small" style={styles.addressLabel}>{item.label}</AppText>
        {item.selectedAddress && <AppText variant="small" style={styles.selectedText}>selected</AppText>}
      </View>
      <AppText variant="light" style={styles.addressText}>{item.fullAddress}</AppText>
    </View>

    <TouchableOpacity
      onPress={() => setShowMenuIndex(index === showMenuIndex ? null : index)}
      style={styles.iconButton}
    >
      <MoreVertical size={20} color="#4a4a4a" />
    </TouchableOpacity>
  </TouchableOpacity>

  {showMenuIndex === index && (
    <View style={styles.verticalMenu}>
      <TouchableOpacity style={styles.verticalMenuItem} onPress={() => handleEditClick(item)}>
        <Edit size={18} strokeWidth={1.5} color="#4a4a4a" />
        <AppText variant="small" style={styles.verticalMenuText}>Edit</AppText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.verticalMenuItem} onPress={() => handleEditOnMap(item)}>
        <MapPin size={18} strokeWidth={1.5} color="#4a4a4a" />
        <AppText variant="small" style={styles.verticalMenuText}>Map</AppText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.verticalMenuItem} onPress={() => handleDeleteAddress(item._id)}>
        <Trash2 size={18} strokeWidth={1.5} color="#4a4a4a" />
        <AppText variant="small" style={styles.verticalMenuText}>Delete</AppText>
      </TouchableOpacity>
    </View>
  )}
</View>

  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
           <Feather name="arrow-left" size={18} color="#000000ff" />
        </TouchableOpacity>
        <AppText variant="small" style={styles.headerTitle}>Select Your Location</AppText>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/user/address/current-location", { from: "address" })}
        >
          <LocateFixed size={20} color="#ff5733" />
          <AppText variant="small" style={styles.actionText}>Use Current Location</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/user/address/current-location", { from: "address" })}
        >
          <MapPinPlus size={20} color="#ff5733" />
          <AppText variant="small" style={styles.actionText}>Add New Address</AppText>
        </TouchableOpacity>
      </View>

      {/* Saved Addresses */}
      <View style={styles.addressList}>
        <AppText variant="small" style={styles.savedTitle}>Saved Address</AppText>
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderAddressItem}
        />
      </View>

      {/* Edit Modal */}
      <Modal visible={isEditing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText variant="small" style={styles.modalTitle}>Edit Address</AppText>
            <TextInput
              value={fullAddress}
              onChangeText={setFullAddress}
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.modalCancel}>
                <AppText variant="small">Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.modalSave}>
                <AppText variant="small" style={{ color: "white" }}>Save</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 20, color: "#1c1c1e", marginLeft: 12 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 , marginTop: 8},
  actionButton: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 10, borderRadius: 8, flex: 1, marginHorizontal: 4 },
  actionText: { fontSize: 12, marginLeft: 6 },
  addressList: { flex: 1 },
  savedTitle: {  marginBottom: 8 },
  addressLabel: { fontSize: 18 },
  addressCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 12, borderRadius: 12, marginVertical: 4, overflow: "visible", position: "relative" },
  // selectedAddress: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  addressIcon: { marginRight: 10 },
  addressContent: { flex: 1 },
  addressHeader: { flexDirection: "row", alignItems: "center" },
  selectedText: { fontSize: 13, marginLeft: 10, color: "green" },
  addressText: { fontSize: 13, color: "#413f3fff", marginTop: 2 },
  iconButton: { padding: 6 },
  verticalMenu: { 
    position: "absolute", 
    width: 100,
    right: 0, 
    top: 60, 
    backgroundColor: "white", 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 8,
    zIndex: 9999,
    elevation: 20,
  },
  verticalMenuItem: { flexDirection: "row", alignItems: "center", padding: 8, borderBottomWidth: 1, borderBottomColor: "#ccc", zIndex: 999 },
  verticalMenuText: { marginLeft: 6, fontSize: 14, color: "#000", zIndex: 999 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "80%", backgroundColor: "white", padding: 16, borderRadius: 12 },
  modalTitle: {  marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
  modalCancel: { marginRight: 8, padding: 8, backgroundColor: "#ccc", borderRadius: 8 },
  modalSave: { padding: 8, backgroundColor: "green", borderRadius: 8 },
});

export default AddressCard;
