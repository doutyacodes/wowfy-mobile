// TodoScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  RefreshControl,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { baseURL } from "../backend/baseData";
import TopBar from "./AppComponents/TopBar";
import TaskHomeCard from "./TaskHomeCard";
import VerificationCard from "./VerificationCard"; // New component for verification cards
import { useQuery, useQueryClient } from "@tanstack/react-query";

const TodoScreen = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();

  const [user, setUser] = useState(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "ongoing", title: "Ongoing" },
    { key: "verification", title: "Verification" },
  ]);

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          navigation.navigate("OtpVerification");
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  // Query function for Ongoing tasks (only tasks that can be continued)
  const fetchOngoingTasks = async () => {
    if (!user) return [];
    const response = await axios.get(
      `${baseURL}/getOngoingTasks.php?user_id=${user.id}`
    );
    return response.data.tasks || [];
  };

  // Query function for Verification tasks
  const fetchVerificationTasks = async () => {
    if (!user) return [];
    const response = await axios.get(
      `${baseURL}/getVerificationTasks.php?user_id=${user.id}`
    );
    return response.data.tasks || [];
  };

  // Use React Query for ongoing tasks
  const {
    data: ongoingData = [],
    isLoading: isOngoingLoading,
    refetch: refetchOngoing,
    isRefetching: isRefetchingOngoing,
  } = useQuery({
    queryKey: ["ongoingTasks", user?.id],
    queryFn: fetchOngoingTasks,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use React Query for verification tasks
  const {
    data: verificationData = [],
    isLoading: isVerificationLoading,
    refetch: refetchVerification,
    isRefetching: isRefetchingVerification,
  } = useQuery({
    queryKey: ["verificationTasks", user?.id],
    queryFn: fetchVerificationTasks,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Refetch data when the screen is focused
  useEffect(() => {
    if (isFocused && user) {
      refetchOngoing();
      refetchVerification();
    }
  }, [isFocused, user, refetchOngoing, refetchVerification]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    if (index === 0) {
      refetchOngoing();
    } else {
      refetchVerification();
    }
  }, [index, refetchOngoing, refetchVerification]);

  const isLoading = isOngoingLoading || isVerificationLoading;
  const isRefreshing = isRefetchingOngoing || isRefetchingVerification;

  const EmptyListComponent = ({ message, icon = "list-outline" }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={60} color="#dadada" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const OngoingRoute = () => (
    <View style={styles.tabContent}>
      {isOngoingLoading ? (
        <ActivityIndicator size="large" color="#6366f1" />
      ) : (
        <FlatList
          data={ongoingData}
          keyExtractor={(item, index) =>
            `ongoing-${item.challenge_id}-${index}`
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingOngoing}
              onRefresh={() => refetchOngoing()}
              colors={["#6366f1"]}
            />
          }
          ListEmptyComponent={
            <EmptyListComponent
              message="No ongoing tasks found"
              icon="play-circle-outline"
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <TaskHomeCard item={item} />}
        />
      )}
    </View>
  );

  // Filter verification tasks by status
  const getVerificationTasksByStatus = () => {
    // console.log("All verification data:", verificationData);

    const underVerification = verificationData.filter(
      (task) =>
        task.verification_status === "under_verification" ||
        task.verification_status === "pending"
    );
    const completed = verificationData.filter(
      (task) =>
        task.verification_status === "completed" ||
        task.verification_status === "approved"
    );
    const rejected = verificationData.filter(
      (task) => task.verification_status === "rejected"
    );

    console.log("Filtered verification tasks:", {
      underVerification: underVerification.length,
      completed: completed.length,
      rejected: rejected.length,
    });

    return { underVerification, completed, rejected };
  };

  const VerificationRoute = () => {
    const { underVerification, completed, rejected } =
      getVerificationTasksByStatus();

    return (
      <View style={styles.tabContent}>
        {isVerificationLoading ? (
          <ActivityIndicator size="large" color="#6366f1" />
        ) : verificationData.length === 0 ? (
          <EmptyListComponent
            message="No verification tasks found"
            icon="checkmark-circle-outline"
          />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetchingVerification}
                onRefresh={() => refetchVerification()}
                colors={["#6366f1"]}
              />
            }
            data={[
              {
                type: "section",
                data: underVerification,
                title: "Under Verification",
                status: "locked",
              },
              {
                type: "section",
                data: completed,
                title: "Completed Verification",
                status: "completed",
              },
              {
                type: "section",
                data: rejected,
                title: "Rejected Verification",
                status: "rejected",
              },
            ]}
            keyExtractor={(item, index) => `verification-section-${index}`}
            renderItem={({ item: section }) => (
              <VerificationSection
                title={section.title}
                data={section.data}
                status={section.status}
                onTaskPress={(task) =>
                  handleVerificationTaskPress(task, section.status)
                }
              />
            )}
          />
        )}
      </View>
    );
  };

  const handleVerificationTaskPress = (task, status) => {
    // console.log("task", task.challenge_id);
    // console.log("page_id", task.page_id);
    if (status === "rejected") {
      // // Show restart option for rejected tasks
      navigation.navigate("ChallengesList", {
        challenge: { challenge_id: task.challenge_id },
        selectedMovie: task.selectedMovie,
      });
    } else if (status === "completed") {
      // // Show completion details
      // navigation.navigate("VerificationDetails", {
      //   challenge: task,
      //   type: "completed"
      // });
    } else {
      // Under verification - show waiting screen
      // navigation.navigate("VerificationDetails", {
      //   challenge: task,
      //   type: "waiting",
      // });
    }
  };

  const renderScene = SceneMap({
    ongoing: OngoingRoute,
    verification: VerificationRoute,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      renderLabel={({ route, focused }) => (
        <View style={styles.tabLabelContainer}>
          <Text
            style={[styles.tabLabel, focused ? styles.tabLabelFocused : {}]}
          >
            {route.title}
          </Text>
          {/* Add badge count for verification tab */}
          {route.key === "verification" && verificationData.length > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>{verificationData.length}</Text>
            </View>
          )}
        </View>
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#f9fafb", "#f3f4f6"]} style={styles.container}>
        <TopBar user={user} />

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
          style={styles.tabView}
        />

        <StatusBar style="dark" />
      </LinearGradient>
    </SafeAreaView>
  );
};

// New component for verification sections
const VerificationSection = ({ title, data, status, onTaskPress }) => {
  if (data.length === 0) return null;

  const getStatusIcon = () => {
    switch (status) {
      case "locked":
        return "time-outline";
      case "completed":
        return "checkmark-circle-outline";
      case "rejected":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "locked":
        return "#f59e0b";
      case "completed":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons
            name={getStatusIcon()}
            size={hp(2)}
            color={getStatusColor()}
          />
          <Text style={styles.sectionTitle}>{title}</Text>
          <View
            style={[styles.sectionBadge, { backgroundColor: getStatusColor() }]}
          >
            <Text style={styles.sectionBadgeText}>{data.length}</Text>
          </View>
        </View>
      </View>

      {data.map((task, index) => (
        <VerificationCard
          key={`${status}-${task.challenge_id}-${index}`}
          item={task}
          status={status}
          onPress={() => onTaskPress(task)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
    borderRadius: 8,
    marginHorizontal: wp(5),
    marginVertical: hp(1),
  },
  tabIndicator: {
    backgroundColor: "#6366f1",
    height: 3,
    borderRadius: 3,
  },
  tabLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  tabLabel: {
    fontSize: hp(1.8),
    fontFamily: "raleway-bold",
    color: "#6b7280",
    textTransform: "none",
  },
  tabLabelFocused: {
    color: "#111827",
  },
  badgeCount: {
    backgroundColor: "#ef4444",
    borderRadius: wp(2.5),
    minWidth: wp(5),
    height: wp(5),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(1),
  },
  badgeText: {
    color: "white",
    fontSize: hp(1.2),
    fontFamily: "raleway-bold",
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  listContainer: {
    paddingVertical: hp(1),
    paddingBottom: hp(10),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(10),
  },
  emptyText: {
    marginTop: hp(2),
    fontSize: hp(1.8),
    color: "#9ca3af",
    fontFamily: "raleway-bold",
  },
  sectionContainer: {
    marginBottom: hp(3),
  },
  sectionHeader: {
    marginBottom: hp(1.5),
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontFamily: "raleway-bold",
    color: "#1f2937",
    flex: 1,
  },
  sectionBadge: {
    borderRadius: wp(3),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    minWidth: wp(6),
    alignItems: "center",
  },
  sectionBadgeText: {
    color: "white",
    fontSize: hp(1.3),
    fontFamily: "raleway-bold",
  },
});

export default TodoScreen;
