import React from "react";
import { View, Text, StyleSheet } from "react-native";
import FooterMenu from "@components/FooterMenu/FooterMenu";

const Settings = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.text}>
                Se você está com dúvidas, entre em contato com o suporte técnico pelo
                email:
            </Text>
            <Text style={styles.email}></Text>
            <FooterMenu />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    text: {
        marginTop: 10,
        textAlign: "center",
    },
    email: {
        color: "blue",
    },
});

export default Settings;