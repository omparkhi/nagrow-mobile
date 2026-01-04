import React, { useState } from "react";
import { View, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import AppText from "@/components/AppText";
import { Ionicons, Feather } from "@expo/vector-icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "@/app/TouchableOpacity";

export default function CreateAddonScreen() {
    const router = useRouter();
    const { restaurant } = useSelector(state => state.restaurantAuth);
    
    const [title, setTitle] = useState("");
    const [minSel, setMinSel] = useState("0");
    const [maxSel, setMaxSel] = useState("1");
    const [options, setOptions] = useState([{ name: "", price: "", type: "veg" }]);

    const addOptionRow = () => setOptions([...options, { name: "", price: "", type: "veg" }]);
  
    const updateOption = (index, field, value) => {
        const newOpts = [...options];
        newOpts[index][field] = value;
        setOptions(newOpts);
    };

    const handleSave = async () => {
        if (!title) return Alert.alert("Error", "Enter Title");

        const validOptions = options.filter(o => o.name && o.price !== "");
        if(validOptions.length === 0) return Alert.alert("Error", "Add at least one option");

        try {
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/restaurant/addons/create`, {
                restaurantId: restaurant._id,
                title,
                minSelection: Number(minSel),
                maxSelection: Number(maxSel),
                options: validOptions
            });

            Alert.alert("Success", "Addon Group Created!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to create addon");
        }
    }

    return (
    <ScrollView style={styles.container}>
        <AppText style={styles.header}>Create Customization Group</AppText>
        
        <TextInput placeholder="Title (e.g. Choice of Coke)" style={styles.input} value={title} onChangeText={setTitle} />
        
        <View style={styles.row}>
            <View style={{flex:1, marginRight:10}}>
                <AppText>Min Selection (0=Optional)</AppText>
                <TextInput style={styles.input} keyboardType="numeric" value={minSel} onChangeText={setMinSel} />
            </View>
            <View style={{flex:1}}>
                <AppText>Max Selection</AppText>
                <TextInput style={styles.input} keyboardType="numeric" value={maxSel} onChangeText={setMaxSel} />
            </View>
        </View>

        <AppText style={styles.subHeader}>Options</AppText>
        {options.map((opt, i) => (
            <View key={i} style={styles.optRow}>
                <TextInput placeholder="Name" style={[styles.input, {flex:2}]} value={opt.name} onChangeText={t=>updateOption(i,'name',t)} />
                <TextInput placeholder="Price" style={[styles.input, {flex:1}]} keyboardType="numeric" value={opt.price} onChangeText={t=>updateOption(i,'price',t)} />
                <TouchableOpacity onPress={()=>updateOption(i,'type', opt.type==='veg'?'non-veg':'veg')}>
                    <View style={[styles.dot, {backgroundColor: opt.type==='veg'?'green':'red'}]}/>
                </TouchableOpacity>
            </View>
        ))}
        
        <TouchableOpacity onPress={addOptionRow} style={styles.addBtn}><AppText style={{color:'blue'}}>+ Add Option</AppText></TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><AppText style={{color:'white'}}>Save Group</AppText></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex:1, padding:20, backgroundColor:'white' },
    header: { fontSize:20, fontWeight:'bold', marginBottom:20 },
    subHeader: { fontSize:16, fontWeight:'bold', marginTop:15, marginBottom:10 },
    input: { borderWidth:1, borderColor:'#ddd', padding:10, borderRadius:8, marginBottom:10, backgroundColor:'#f9f9f9' },
    row: { flexDirection:'row', justifyContent:'space-between' },
    optRow: { flexDirection:'row', gap:10, alignItems:'center' },
    dot: { width:20, height:20, borderRadius:10, borderWidth:1 },
    addBtn: { padding:10, alignItems:'center' },
    saveBtn: { backgroundColor:'#ff5733', padding:15, borderRadius:10, alignItems:'center', marginTop:20, marginBottom:50 }
});