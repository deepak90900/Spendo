import React, { useEffect, useState } from "react";
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
import { collection, query, onSnapshot } from "firebase/firestore";
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

  useEffect(() => {
    const fetchExpenses = () => {
      setLoading(true);
      setError(null);

      try {
        const expensesRef = collection(db, "expenses");
        const q = query(expensesRef);

        onSnapshot(q, (querySnapshot) => {
          let expensesArray = [];
          let total = 0;
          let categoryMap = {};
          let monthlyMap = {};

          querySnapshot.forEach((doc) => {
            const expense = doc.data();
            expensesArray.push({ id: doc.id, ...expense });

            if (expense.date) {
              const [month, day, year] = expense.date.split("/").map(Number);
              const expenseDate = new Date(year, month - 1, day);
              const currentDate = new Date();

              if (
                expenseDate.getMonth() === currentDate.getMonth() &&
                expenseDate.getFullYear() === currentDate.getFullYear()
              ) {
                const amount = expense.amount;
                if (amount && amount < 1000000) {
                  total += amount;

                  const category = expense.category || "Uncategorized";
                  categoryMap[category] = (categoryMap[category] || 0) + amount;
                }
              }

              const monthKey = `${
                expenseDate.getMonth() + 1
              }/${expenseDate.getFullYear()}`;
              monthlyMap[monthKey] =
                (monthlyMap[monthKey] || 0) + expense.amount;
            }
          });

          const monthlyComparisonsArray = Object.keys(monthlyMap)
            .map((monthKey) => ({
              month: monthKey,
              total: monthlyMap[monthKey],
            }))
            .sort((a, b) => {
              const [monthA, yearA] = a.month.split("/").map(Number);
              const [monthB, yearB] = b.month.split("/").map(Number);
              return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
            });

          if (monthlyComparisonsArray.length > 1) {
            const lastMonthTotal =
              monthlyComparisonsArray[monthlyComparisonsArray.length - 2].total;
            setPreviousMonthTotal(lastMonthTotal);
            setComparisonArrow(
              total > lastMonthTotal ? "arrow-up-thin" : "arrow-down-thin"
            );
          } else {
            setPreviousMonthTotal(null);
            setComparisonArrow(null);
          }

          setExpenses(expensesArray);
          setMonthlyTotal(total);
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
  }, []);

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

            <Card style={styles.card}>
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
                    bezier // Makes the line smoother
                    style={styles.chart}
                  />
                ) : (
                  <Text style={styles.noDataText}>
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
  },
});

export default HomeScreen;
