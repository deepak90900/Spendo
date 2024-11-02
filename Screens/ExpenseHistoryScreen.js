import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TextInput } from "react-native";
import { Text, Card, Button, Menu, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../styles/theme";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ExpenseHistoryScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Get the current user
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      const fetchExpenses = async () => {
        const expensesRef = collection(db, "expenses");
        // Filter by userId to get only the current user's expenses
        const q = query(expensesRef, where("userId", "==", currentUser.uid));

        onSnapshot(q, (querySnapshot) => {
          let expensesArray = [];
          querySnapshot.forEach((doc) => {
            expensesArray.push({ id: doc.id, ...doc.data() });
          });
          setExpenses(expensesArray);
          setFilteredExpenses(expensesArray);
        });
      };
      fetchExpenses();
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [searchText, filter, sortOption]);

  const applyFilters = () => {
    let filteredData = expenses;

    if (filter !== "All") {
      filteredData = filteredData.filter(
        (expense) => expense.category === filter
      );
    }

    if (searchText) {
      filteredData = filteredData.filter((expense) =>
        expense.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (sortOption === "Date") {
      filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === "Amount") {
      filteredData.sort((a, b) => b.amount - a.amount);
    }

    setFilteredExpenses(filteredData);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Food":
        return "food";
      case "Transportation":
        return "car";
      case "Entertainment":
        return "movie";
      case "Shopping":
        return "shopping";
      case "Health":
        return "hospital-box";
      case "Bills":
        return "file-document";
      case "Rent":
        return "home";
      case "Other":
      default:
        return "dots-horizontal";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense History</Text>

      <TextInput
        placeholder="Search Expenses"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <Button mode="outlined" onPress={() => setShowSortMenu(true)}>
          Sort By: {sortOption}
        </Button>
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={
            <IconButton icon="sort" onPress={() => setShowSortMenu(true)} />
          }
        >
          <Menu.Item
            onPress={() => {
              setSortOption("Date");
              setShowSortMenu(false);
            }}
            title="Date"
          />
          <Menu.Item
            onPress={() => {
              setSortOption("Amount");
              setShowSortMenu(false);
            }}
            title="Amount"
          />
        </Menu>

        <Button mode="outlined" onPress={() => setShowFilterMenu(true)}>
          Filter: {filter}
        </Button>
        <Menu
          visible={showFilterMenu}
          onDismiss={() => setShowFilterMenu(false)}
          anchor={
            <IconButton icon="filter" onPress={() => setShowFilterMenu(true)} />
          }
        >
          <Menu.Item
            onPress={() => {
              setFilter("All");
              setShowFilterMenu(false);
            }}
            title="All"
          />
          <Menu.Item
            onPress={() => {
              setFilter("Food");
              setShowFilterMenu(false);
            }}
            title="Food"
          />
          <Menu.Item
            onPress={() => {
              setFilter("Transportation");
              setShowFilterMenu(false);
            }}
            title="Transportation"
          />
          <Menu.Item
            onPress={() => {
              setFilter("Entertainment");
              setShowFilterMenu(false);
            }}
            title="Entertainment"
          />
          <Menu.Item
            onPress={() => {
              setFilter("Shopping");
              setShowFilterMenu(false);
            }}
            title="Shopping"
          />
          <Menu.Item
            onPress={() => {
              setFilter("Health");
              setShowFilterMenu(false);
            }}
            title="Health"
          />
          <Menu.Item
            onPress={() => {
              setFilter("Bills");
              setShowFilterMenu(false);
            }}
            title="Bills"
          />
          <Menu.Item
            onPress={() => {
              setFilter("Rent");
              setShowFilterMenu(false);
            }}
            title="Rent"
          />
          <Menu.Item
            onPress={() => {
              setFilter("Other");
              setShowFilterMenu(false);
            }}
            title="Other"
          />
        </Menu>
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.expenseRow}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(item.category)}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.expenseText}>
                  {item.category || "Uncategorized"}: ₹{item.amount.toFixed(2)}
                </Text>
                <Text style={styles.expenseDate}>{item.date}</Text>
              </View>
              <Text style={styles.expenseDescription}>{item.description}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  searchBar: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  card: {
    marginVertical: 5,
    padding: 10,
    borderRadius: SIZES.borderRadius,
    backgroundColor: "#fff",
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseText: {
    fontSize: 16,
    color: COLORS.text,
  },
  expenseDate: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  expenseDescription: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 4,
  },
});

export default ExpenseHistoryScreen;
