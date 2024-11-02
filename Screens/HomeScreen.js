import React, {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { COLORS, SIZES } from "../styles/theme";
import { db } from "../firebaseConfig";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

const HomeScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [monthlyComparisons, setMonthlyComparisons] = useState([]);
  const [previousMonthTotal, setPreviousMonthTotal] = useState(null);
  const [comparisonArrow, setComparisonArrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();

  // Logout function

  // Configure the header with a hamburger icon
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <MaterialCommunityIcons
          name="menu"
          size={28}
          color={COLORS.primary}
          style={{ marginLeft: 15 }}
          onPress={() => navigation.openDrawer()}
        />
      ),
    });
  }, [navigation]);

  // useEffect(() => {
  //   const fetchExpenses = () => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const userId = auth.currentUser ? auth.currentUser.uid : null;

  //       if (!userId) {
  //         setError("User not authenticated.");
  //         setLoading(false);
  //         return;
  //       }

  //       const expensesRef = collection(db, "expenses");
  //       const q = query(expensesRef, where("userId", "==", userId));

  //       onSnapshot(q, (querySnapshot) => {
  //         const expensesArray = [];
  //         let total = 0;
  //         const categoryMap = {};
  //         const monthlyMap = {};

  //         querySnapshot.forEach((doc) => {
  //           const expense = doc.data();
  //           expensesArray.push({ id: doc.id, ...expense });

  //           // Parse date and calculate monthly totals
  //           if (expense.date) {
  //             const [month, day, year] = expense.date.split("/").map(Number);
  //             const expenseDate = new Date(year, month - 1, day);
  //             const currentDate = new Date();

  //             // Calculate current month's expenses
  //             if (
  //               expenseDate.getMonth() === currentDate.getMonth() &&
  //               expenseDate.getFullYear() === currentDate.getFullYear()
  //             ) {
  //               const amount = expense.amount || 0;
  //               if (amount < 1000000) {
  //                 total += amount;

  //                 const category = expense.category || "Uncategorized";
  //                 categoryMap[category] = (categoryMap[category] || 0) + amount;
  //               }
  //             }

  //             // Monthly trend data
  //             const monthKey = `${
  //               expenseDate.getMonth() + 1
  //             }/${expenseDate.getFullYear()}`;
  //             monthlyMap[monthKey] =
  //               (monthlyMap[monthKey] || 0) + (expense.amount || 0);
  //           }
  //         });

  //         // Calculate monthly comparisons and set states
  //         const monthlyComparisonsArray = Object.keys(monthlyMap)
  //           .map((monthKey) => ({
  //             month: monthKey,
  //             total: monthlyMap[monthKey],
  //           }))
  //           .sort((a, b) => new Date(a.month) - new Date(b.month));

  //         if (monthlyComparisonsArray.length > 1) {
  //           const lastMonthTotal =
  //             monthlyComparisonsArray[monthlyComparisonsArray.length - 2].total;
  //           setPreviousMonthTotal(lastMonthTotal);
  //           setComparisonArrow(
  //             total > lastMonthTotal ? "arrow-up-thin" : "arrow-down-thin"
  //           );
  //         } else {
  //           setPreviousMonthTotal(null);
  //           setComparisonArrow(null);
  //         }

  //         setExpenses(expensesArray);
  //         setMonthlyTotal(total);
  //         setCategoryTotals(categoryMap);
  //         setMonthlyComparisons(monthlyComparisonsArray);
  //         setLoading(false);
  //       });
  //     } catch (err) {
  //       setError("Failed to load data. Please try again later.");
  //       setLoading(false);
  //     }
  //   };

  //   fetchExpenses();
  // }, [auth.currentUser]);
  useEffect(() => {
    const fetchExpenses = () => {
      setLoading(true);
      setError(null);

      try {
        const userId = auth.currentUser ? auth.currentUser.uid : null;

        if (!userId) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        const expensesRef = collection(db, "expenses");
        const q = query(expensesRef, where("userId", "==", userId));

        onSnapshot(q, (querySnapshot) => {
          const expensesArray = [];
          let totalCurrentMonth = 0;
          let totalPreviousMonth = 0;
          const categoryMap = {};
          const monthlyMap = {};

          // Get current and previous month boundaries
          const currentDate = new Date();
          const currentMonthStart = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const previousMonthStart = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
          );
          const previousMonthEnd = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            0
          );

          querySnapshot.forEach((doc) => {
            const expense = doc.data();
            expensesArray.push({ id: doc.id, ...expense });

            // Parse the expense date
            if (expense.date) {
              const [month, day, year] = expense.date.split("/").map(Number);
              const expenseDate = new Date(year, month - 1, day);

              // Calculate current month's expenses
              if (
                expenseDate >= currentMonthStart &&
                expenseDate <= currentDate
              ) {
                const amount = expense.amount || 0;
                if (amount < 1000000) {
                  totalCurrentMonth += amount;

                  const category = expense.category || "Uncategorized";
                  categoryMap[category] = (categoryMap[category] || 0) + amount;
                }
              }

              // Calculate previous month's expenses
              if (
                expenseDate >= previousMonthStart &&
                expenseDate <= previousMonthEnd
              ) {
                totalPreviousMonth += expense.amount || 0;
              }

              // Monthly trend data
              const monthKey = `${
                expenseDate.getMonth() + 1
              }/${expenseDate.getFullYear()}`;
              monthlyMap[monthKey] =
                (monthlyMap[monthKey] || 0) + (expense.amount || 0);
            }
          });

          // Calculate monthly comparisons and set states
          const monthlyComparisonsArray = Object.keys(monthlyMap)
            .map((monthKey) => ({
              month: monthKey,
              total: monthlyMap[monthKey],
            }))
            .sort((a, b) => new Date(a.month) - new Date(b.month));

          setPreviousMonthTotal(
            totalPreviousMonth > 0 ? totalPreviousMonth : null
          );
          setComparisonArrow(
            totalCurrentMonth > totalPreviousMonth
              ? "arrow-up-thin"
              : "arrow-down-thin"
          );

          setExpenses(expensesArray);
          setMonthlyTotal(totalCurrentMonth);
          setCategoryTotals(categoryMap);
          setMonthlyComparisons(monthlyComparisonsArray);
          setLoading(false);
        });
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [auth.currentUser]);

  const topCategories = Object.keys(categoryTotals)
    .sort((a, b) => categoryTotals[b] - categoryTotals[a])
    .slice(0, 3);

  const chartData = {
    labels: monthlyComparisons.map((item) => item.month),
    datasets: [
      {
        data: monthlyComparisons.map((item) => item.total),
        strokeWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <FlatList
        data={[{}]}
        renderItem={() => (
          <View style={styles.container}>
            <Text style={styles.title}>Spendo Dashboard</Text>

            {/* <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Total Monthly Expenses</Text>
                <View style={styles.totalExpenseRow}>
                  <Text style={styles.cardAmount}>
                    ₹{(monthlyTotal || 0).toFixed(2)}
                  </Text>
                  {comparisonArrow && (
                    <MaterialCommunityIcons
                      name={comparisonArrow}
                      size={20}
                      color={
                        comparisonArrow === "arrow-up-thin" ? "green" : "red"
                      }
                      style={styles.arrowIcon}
                    />
                  )}
                </View>
                {previousMonthTotal !== null && (
                  <Text style={styles.comparisonText}>
                    Last month: ₹{(previousMonthTotal || 0).toFixed(2)}
                  </Text>
                )}
              </Card.Content>
            </Card> */}

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Total Monthly Expenses</Text>
                <View style={styles.totalExpenseRow}>
                  <Text style={styles.cardAmount}>
                    ₹{(monthlyTotal || 0).toFixed(2)}
                  </Text>
                  {comparisonArrow && previousMonthTotal !== null ? (
                    <MaterialCommunityIcons
                      name={comparisonArrow}
                      size={20}
                      color={
                        comparisonArrow === "arrow-up-thin" ? "green" : "red"
                      }
                      style={styles.arrowIcon}
                    />
                  ) : (
                    <Text style={styles.noDataText}>
                      No data for last month
                    </Text>
                  )}
                </View>
                {previousMonthTotal !== null && (
                  <Text style={styles.comparisonText}>
                    Last month: ₹{(previousMonthTotal || 0).toFixed(2)}
                  </Text>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.recentExpensesTitle}>
                  Monthly Spending Trend
                </Text>
                {monthlyComparisons.length > 0 ? (
                  <LineChart
                    data={chartData}
                    width={screenWidth - 90}
                    height={220}
                    chartConfig={{
                      backgroundColor: COLORS.background,
                      backgroundGradientFrom: COLORS.primary,
                      backgroundGradientTo: COLORS.secondary,
                      decimalPlaces: 2,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) =>
                        `rgba(255, 255, 255, ${opacity})`,
                    }}
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <Text style={styles.noDataChartText}>
                    No data available for the chart
                  </Text>
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.recentExpensesTitle}>
                  Top Spending Categories
                </Text>
                {topCategories.map((item) => (
                  <View key={item} style={styles.categoryItem}>
                    <Text style={styles.categoryText}>
                      {item || "Uncategorized"}: ₹
                      {(categoryTotals[item] || 0).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.recentExpensesTitle}>
                  Category Breakdown
                </Text>
                {Object.keys(categoryTotals).map((item) => {
                  const amount = categoryTotals[item] || 0;
                  const percentage = (
                    (amount / (monthlyTotal || 1)) *
                    100
                  ).toFixed(2);
                  return (
                    <View key={item} style={styles.categoryItem}>
                      <Text style={styles.categoryText}>
                        {item || "Uncategorized"}: ₹{amount.toFixed(2)} (
                        {percentage}%)
                      </Text>
                    </View>
                  );
                })}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.recentExpensesTitle}>Recent Expenses</Text>
                {expenses.slice(0, 5).map((item) => (
                  <View key={item.id} style={styles.expenseItem}>
                    <Text style={styles.expenseText}>
                      {item.category || "Uncategorized"}: ₹
                      {(item.amount || 0).toFixed(2)}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {item.date || "Date Not Provided"}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </View>
        )}
        contentContainerStyle={styles.flatListContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flatListContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  container: {
    width: screenWidth - 32,
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.error || "red",
    fontSize: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: COLORS.error || "red",
    alignSelf: "flex-end",
  },
  card: {
    width: "100%",
    marginVertical: 10,
    borderRadius: SIZES.borderRadius * 2,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 5,
  },
  totalExpenseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  comparisonText: {
    fontSize: 14,
    color: COLORS.placeholder,
    marginTop: 5,
  },
  recentExpensesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: 10,
  },
  categoryItem: {
    paddingVertical: 8,
  },
  categoryText: {
    fontSize: 16,
    color: COLORS.text,
  },
  expenseItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
    width: "100%",
  },
  expenseText: {
    fontSize: 16,
    color: COLORS.text,
  },
  expenseDate: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: COLORS.placeholder,
    textAlign: "center",
    marginVertical: 20,
    marginLeft: 15,
  },
  noDataChartText: {
    fontSize: 16,
    color: COLORS.placeholder,
    textAlign: "left",
    marginVertical: 20,
  },
});

export default HomeScreen;
