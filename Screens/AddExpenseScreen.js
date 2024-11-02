import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Provider,
  Snackbar,
} from "react-native-paper";
import { COLORS, SIZES } from "../styles/theme";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";

const AddExpenseScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    return () => {
      // Clear form state on unmount
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date());
    };
  }, []);

  const handleAddExpense = async () => {
    const selectedDate = new Date(date);
    const currentDate = new Date();

    if (selectedDate > currentDate) {
      alert("The date cannot be in the future.");
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!category) {
      alert("Please select a category.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const auth = getAuth();
      const userId = auth.currentUser ? auth.currentUser.uid : null;

      if (!userId) {
        alert("User not authenticated.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "expenses"), {
        userId, // Add the userId field
        amount: parseFloat(amount.replace(/,/g, "")),
        category,
        date: date.toLocaleDateString(),
        description,
      });

      setSnackbarVisible(true); // Show success message
      // Reset fields after successful submission
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date());
      navigation.goBack();
    } catch (error) {
      console.error("Error adding expense: ", error);
      alert("Error adding expense. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const formatAmount = (value) => {
    // Allow empty input to clear the field
    if (value === "") {
      setAmount("");
      return;
    }

    // Remove any non-digit characters except for the decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");

    // Set the amount directly to allow normal editing
    setAmount(cleaned);
  };

  const categories = [
    { name: "Food", icon: "food" },
    { name: "Transportation", icon: "car" },
    { name: "Entertainment", icon: "movie" },
    { name: "Shopping", icon: "shopping" },
    { name: "Health", icon: "hospital-box" },
    { name: "Bills", icon: "file-document" },
    { name: "Rent", icon: "home" },
    { name: "Other", icon: "dots-horizontal" },
  ];

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.title}>Add New Expense</Text>

        <TextInput
          label="Amount (INR)"
          value={amount}
          onChangeText={formatAmount}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity
          style={[
            styles.categoryButton,
            category ? styles.categorySelected : null,
          ]}
          onPress={() => setShowCategoryModal(true)}
          disabled={loading}
        >
          <Text style={styles.categoryButtonText}>
            {category ? `${category} Selected` : "Select Category"}
          </Text>
        </TouchableOpacity>

        <Modal
          transparent
          visible={showCategoryModal}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.categoryOption,
                    category === item.name && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setCategory(item.name);
                    setShowCategoryModal(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color="black"
                  />
                  <Text style={styles.categoryText}>{item.name}</Text>
                  {category === item.name && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="green"
                    />
                  )}
                </TouchableOpacity>
              ))}
              <Button mode="text" onPress={() => setShowCategoryModal(false)}>
                Close
              </Button>
            </View>
          </View>
        </Modal>

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
          disabled={loading}
        >
          {new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(date)}
        </Button>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
          numberOfLines={3}
          disabled={loading}
        />

        <Button
          mode="contained"
          onPress={handleAddExpense}
          style={styles.button}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            "Save Expense"
          )}
        </Button>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          Expense added successfully!
        </Snackbar>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  categoryButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  categorySelected: {
    backgroundColor: COLORS.secondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  selectedOption: {
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
  },
  categoryText: {
    fontSize: 16,
    marginLeft: 8,
    color: COLORS.text,
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
  },
});

export default AddExpenseScreen;
