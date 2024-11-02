import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar, Button } from "react-native-paper";
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../firebaseConfig"; // Import your Firestore instance
import { COLORS } from "../styles/theme";

const CustomDrawerContent = (props) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();

  console.log("ddds", user);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      // Fetch user data from Firestore
      const fetchUserData = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("No such document in Firestore!");
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Login"); // Navigate back to login screen
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Avatar.Image
          source={
            user && user.photoURL
              ? { uri: user.photoURL }
              : { uri: "https://www.gravatar.com/avatar?d=mp&s=200" }
          }
          size={80}
        />
        <Text style={styles.userName}>
          {userData && userData.displayName
            ? userData.displayName
            : "Guest User"}
        </Text>
        <Text style={styles.userEmail}>{user && user.email}</Text>
      </View>

      <View style={styles.menuSection}></View>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        // color={COLORS.error}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    paddingVertical: 60,
    backgroundColor: COLORS.background,
  },
  profileSection: {
    alignItems: "left",
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 5,
  },
  menuSection: {
    flex: 1,
    marginTop: 20,
  },
  menuItem: {
    fontSize: 18,
    paddingVertical: 10,
    color: COLORS.text,
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default CustomDrawerContent;
