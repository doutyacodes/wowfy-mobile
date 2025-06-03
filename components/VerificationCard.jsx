import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { baseImgURL } from "../backend/baseData";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const VerificationCard = ({ item, status, onPress }) => {
  const navigation = useNavigation();
  const formattedDate = moment(item.submitted_date || item.created_date).fromNow();
  
  // Get status-specific styling and content
  const getStatusConfig = () => {
    switch (status) {
      case 'locked':
        return {
          icon: 'time-outline',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          borderColor: '#f59e0b',
          title: 'Under Review',
          subtitle: 'Your submission is being verified',
          buttonText: 'View Status',
          buttonIcon: 'eye-outline',
        };
      case 'completed':
        return {
          icon: 'checkmark-circle',
          color: '#10b981',
          bgColor: '#d1fae5',
          borderColor: '#10b981',
          title: 'Verified',
          subtitle: 'Task completed successfully',
          buttonText: 'View Details',
          buttonIcon: 'document-text-outline',
        };
      case 'rejected':
        return {
          icon: 'close-circle',
          color: '#ef4444',
          bgColor: '#fee2e2',
          borderColor: '#ef4444',
          title: 'Rejected',
          subtitle: item.rejection_reason || 'Task needs to be redone',
          buttonText: 'Restart Task',
          buttonIcon: 'refresh-outline',
        };
      default:
        return {
          icon: 'help-circle-outline',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          borderColor: '#6b7280',
          title: 'Unknown',
          subtitle: 'Status unknown',
          buttonText: 'View',
          buttonIcon: 'eye-outline',
        };
    }
  };

  const config = getStatusConfig();

  // Determine badge color based on task type/frequency
  const getBadgeColor = () => {
    if (item.frequency === "food") return ["#10b981", "#059669"]; // Green
    if (item.frequency === "experience") return ["#8b5cf6", "#7c3aed"]; // Purple
    if (item.frequency === "bootcamp") return ["#ef4444", "#dc2626"]; // Red
    if (item.frequency === "challenges") return ["#f59e0b", "#d97706"]; // Amber
    return ["#3b82f6", "#2563eb"]; // Default blue
  };

  // Returns appropriate icon based on task type
  const getTypeIcon = () => {
    if (item.frequency === "food") return "restaurant-outline";
    if (item.frequency === "experience") return "glasses-outline";
    if (item.frequency === "bootcamp") return "fitness-outline";
    if (item.frequency === "challenges") return "trophy-outline";
    return "checkmark-circle-outline";
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { borderColor: config.borderColor }
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Card Header with Event Brand */}
      <View style={styles.cardHeader}>
        <View style={styles.brandContainer}>
          <Image
            source={{ uri: `${baseImgURL + item.selectedMovie.image}` }}
            style={styles.brandImage}
          />
          <View>
            <Text style={styles.brandName}>{item.selectedMovie.title}</Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
        </View>
        
        {/* Task Type Badge */}
        <LinearGradient
          colors={getBadgeColor()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badgeContainer}
        >
          <Ionicons name={getTypeIcon()} size={hp(1.5)} color="white" />
          <Text style={styles.badgeText}>
            {item.frequency === "food" ? "Food" : 
             item.frequency === "experience" ? "Experience" :
             item.frequency === "bootcamp" ? "Bootcamp" :
             item.frequency === "challenges" ? "Challenge" : "Task"}
          </Text>
        </LinearGradient>
      </View>

      {/* Task Image with Status Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${baseImgURL + item.image}` }}
          style={styles.taskImage}
          resizeMode="cover"
        />
        
        {/* Black Overlay for better text readability */}
        <View style={styles.blackOverlay} />
        
        {/* Status Overlay */}
        <View style={styles.statusOverlay}>
          <View style={[styles.statusIcon, { backgroundColor: config.color }]}>
            <Ionicons name={config.icon} size={hp(3)} color="white" />
          </View>
          <Text style={[styles.statusTitle, { color: 'white' }]}>{config.title}</Text>
          <Text style={styles.statusSubtitle}>{config.subtitle}</Text>
        </View>

        {/* Verification timestamp */}
        {status === 'locked' && (
          <View style={styles.timestampBadge}>
            <Ionicons name="time-outline" size={hp(1.3)} color="white" />
            <Text style={styles.timestampText}>
              {moment(item.submitted_date).format('MMM DD, HH:mm')}
            </Text>
          </View>
        )}
      </View>

      {/* Task Details */}
      <View style={styles.detailsContainer}>
        <View>
          <Text style={styles.taskName} numberOfLines={1}>
            {item.task_name}
          </Text>
          <Text style={styles.challengeTitle} numberOfLines={1}>
            {item.challenge_title}
          </Text>
        </View>

        {/* Verification Info */}
        <View style={styles.verificationInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="star-outline" size={hp(1.6)} color="#6b7280" />
            <Text style={styles.infoLabel}>Reward Points:</Text>
            <Text style={styles.infoValue}>{item.reward_points} pts</Text>
          </View>
          
          {status === 'rejected' && item.rejection_reason && (
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={hp(1.6)} color="#ef4444" />
              <Text style={[styles.infoLabel, { color: '#ef4444' }]}>Reason:</Text>
              <Text style={[styles.infoValue, { color: '#ef4444', flex: 1 }]} numberOfLines={2}>
                {item.rejection_reason}
              </Text>
            </View>
          )}
          
          {status === 'completed' && item.completion_date && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={hp(1.6)} color="#10b981" />
              <Text style={[styles.infoLabel, { color: '#10b981' }]}>Completed:</Text>
              <Text style={[styles.infoValue, { color: '#10b981' }]}>
                {moment(item.completion_date).format('MMM DD, YYYY')}
              </Text>
            </View>
          )}
          
          {status === 'locked' && (
            <View style={styles.infoRow}>
              <Ionicons name="hourglass-outline" size={hp(1.6)} color="#f59e0b" />
              <Text style={[styles.infoLabel, { color: '#f59e0b' }]}>Expected:</Text>
              <Text style={[styles.infoValue, { color: '#f59e0b' }]}>
                24-48 hours
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Action Button */}
      <LinearGradient
        colors={[config.color, config.color + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.actionButton}
      >
        <Ionicons name={config.buttonIcon} size={hp(2)} color="white" />
        <Text style={styles.actionButtonText}>{config.buttonText}</Text>
        {status === 'rejected' && (
          <Ionicons name="arrow-forward" size={hp(1.8)} color="white" />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: hp(1.5),
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2.5),
  },
  brandImage: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  brandName: {
    fontSize: hp(1.6),
    fontFamily: "raleway-bold",
    color: "#1f2937",
  },
  timestamp: {
    fontSize: hp(1.3),
    fontFamily: "raleway",
    color: "#9ca3af",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: hp(2),
    gap: wp(1),
  },
  badgeText: {
    color: "white",
    fontSize: hp(1.3),
    fontFamily: "raleway-semibold",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: hp(16),
  },
  taskImage: {
    width: "100%",
    height: "100%",
  },
  // NEW: Black overlay for better text readability
  blackOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 50% black overlay
  },
  statusOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: hp(0.5),
  },
  statusIcon: {
    borderRadius: wp(8),
    width: wp(16),
    height: wp(16),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(0.5),
    // Add shadow for better visibility
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusTitle: {
    fontSize: hp(2),
    fontFamily: "raleway-bold",
    textAlign: "center",
    // Add text shadow for better readability
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusSubtitle: {
    fontSize: hp(1.5),
    fontFamily: "raleway",
    color: "white", // Changed to white for better contrast
    textAlign: "center",
    paddingHorizontal: wp(4),
    // Add text shadow for better readability
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timestampBadge: {
    position: "absolute",
    top: hp(1),
    right: wp(3),
    backgroundColor: "rgba(0,0,0,0.8)", // Made darker for better contrast
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: hp(1),
    gap: wp(1),
  },
  timestampText: {
    color: "white",
    fontSize: hp(1.2),
    fontFamily: "raleway-semibold",
  },
  detailsContainer: {
    padding: wp(4),
  },
  taskName: {
    fontSize: hp(2),
    fontFamily: "raleway-bold",
    color: "#111827",
    marginBottom: hp(0.3),
  },
  challengeTitle: {
    fontSize: hp(1.5),
    fontFamily: "raleway-semibold",
    color: "#4b5563",
    marginBottom: hp(1.5),
  },
  verificationInfo: {
    gap: hp(1),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  infoLabel: {
    fontSize: hp(1.4),
    fontFamily: "raleway",
    color: "#6b7280",
  },
  infoValue: {
    fontSize: hp(1.4),
    fontFamily: "raleway-semibold",
    color: "#374151",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.5),
    gap: wp(2),
  },
  actionButtonText: {
    color: "white",
    fontSize: hp(1.6),
    fontFamily: "raleway-bold",
  },
});

export default VerificationCard;