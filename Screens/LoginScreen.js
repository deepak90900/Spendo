import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import { COLORS, SIZES } from "../styles/theme";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigation.replace("Home"); // This replaces LoginScreen in the stack
      })
      .catch((error) => {
        setError("Invalid email or password. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Spendo</Text>
      <Text style={styles.subtitle}>Log in to your account</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={COLORS.iconColor} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={COLORS.iconColor}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => promptAsync()}
        disabled={!request || loading}
      >
        <Ionicons name="logo-google" size={20} color="#fff" />
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.inputHeight,
    borderColor: COLORS.placeholder,
    borderWidth: 1,
    borderRadius: SIZES.borderRadius * 2,
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text,
  },
  button: {
    flexDirection: "row",
    height: SIZES.buttonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius * 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  link: {
    marginTop: 12,
    alignSelf: "center",
  },
  linkText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  googleButton: {
    backgroundColor: COLORS.secondary,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoginScreen;
