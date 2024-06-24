import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import FooterMenu from "@components/FooterMenu/FooterMenu";

const Settings = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("pt");

    const toggleSwitch = () => setIsDarkMode(previousState => !previousState);

    return (
        <>
        <View style={styles.container}>
            <Text style={styles.title}>Configurações</Text>

            <View style={styles.settingItem}>
                <Text style={styles.text}>Modo Escuro</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isDarkMode}
                />
            </View>

            <View style={styles.settingItem}>
                <Text style={styles.text}>Idioma</Text>
                <Picker
                    selectedValue={selectedLanguage}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                >
                    <Picker.Item style={{fontSize:14}} label="Português" value="pt" />
                    <Picker.Item style={{fontSize:14}} label="Inglês" value="en" />
                    <Picker.Item style={{fontSize:14}} label="Espanhol" value="es" />
                </Picker>
            </View>

            <View style={styles.settingItemNotif}>
                <Text style={styles.text}>Notificações</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isDarkMode}
                />
            </View>

            <Text style={styles.helpText}>
                Se você está com dúvidas, entre em contato com o suporte técnico pelo email:
            </Text>
            <TouchableOpacity>
                <Text style={styles.email}>suporte@exemplo.com</Text>
            </TouchableOpacity>
        </View>
        <FooterMenu />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        marginTop: 50,
        textAlign: "center",
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
    },

    settingItemNotif: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
        marginTop:150
    },
    text: {
        fontSize: 18,
    },
    helpText: {
        marginTop: 100,
        textAlign: "center",
        fontSize: 16,
    },
    email: {
        color: "blue",
        textAlign: "center",
        marginTop: 10,
        fontSize: 16,
    },
    picker: {
        height: 50,
        width: 150,
    },
    pickerItem:{
        fontSize:14
    }
});

export default Settings;
