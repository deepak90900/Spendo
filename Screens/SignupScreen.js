import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { auth, db, storage } from "../firebaseConfig"; // Ensure Firebase Storage is imported
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { COLORS, SIZES } from "../styles/theme";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !displayName) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Upload profile photo if available
      let photoURL = null;
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `profilePhotos/${user.uid}`);
        await uploadBytes(storageRef, blob);
        photoURL = await getDownloadURL(storageRef);
      }

      photoURL;

      console.log("urlllllll", photoURL);

      // Update the display name and profile photo in Firebase Auth
      await updateProfile(user, { displayName, photoURL: photoURL });

      // Store additional user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName,
        email,
        createdAt: new Date(),
        profilePhotoURL: photoURL, // Save the profile photo URL
        phoneNumber: null,
      });

      console.log("User display name updated and details saved to Firestore.");
      navigation.navigate("MainApp");
    } catch (error) {
      setError(error.message || "Signup failed. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>
        Join Spendo and track your finances effortlessly
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={COLORS.iconColor} />
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          placeholderTextColor={COLORS.placeholder}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
      </View>

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

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>
          {image ? "Change Photo" : "Pick a Profile Photo"}
        </Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkText}>Already have an account? Log In</Text>
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
  imagePicker: {
    alignSelf: "center",
    marginVertical: 10,
  },
  imagePickerText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 12,
  },
  button: {
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
});

export default SignupScreen;
