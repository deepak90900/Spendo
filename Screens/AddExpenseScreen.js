import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { TextInput, Button, Text, Provider } from "react-native-paper";
import { COLORS, SIZES } from "../styles/theme";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AddExpenseScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
      await addDoc(collection(db, "expenses"), {
        amount: parseFloat(amount.replace(/,/g, "")),
        category,
        date: date.toLocaleDateString(),
        description,
      });
      // console.log("Expense added successfully!");
      alert("Expense added successfully!");
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
    const formatted = value.replace(/\D/g, "");
    setAmount(formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  };

  // Category options with icons
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
        >
          {date.toLocaleDateString()}
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
  loadingIndicator: {
    marginTop: 20,
  },
});

export default AddExpenseScreen;
