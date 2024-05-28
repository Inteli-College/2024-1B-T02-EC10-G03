import React from "react";
import { View, Text, StyleSheet } from "react-native";
import FooterMenu from "@components/FooterMenu/FooterMenu";

const Help = () => {
    return (
        <>
        <View style={styles.container}>
            <Text style={styles.title}>Help</Text>
            <Text style={styles.text}>
                Se você está com dúvidas, entre em contato com o suporte técnico pelo
                email:
            </Text>
            <Text style={styles.email}></Text>
        </View>
         <FooterMenu />
         </>
    );
};

const styles = StyleSheet.create({
    container: {
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

export default Help;