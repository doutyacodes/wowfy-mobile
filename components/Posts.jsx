import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useState, useEffect } from "react";
import { 
  Image, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Animated, 
  ActivityIndicator,
  Pressable
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { baseImgURL, baseURL, baseVidUrl } from "../backend/baseData";
import { useVideoPlayer, VideoView } from "expo-video";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import FollowPopup from "./FollowPopup";
import moment from "moment";

const Posts = ({ item, user_id, user, onFollowUpdate }) => {
  const [heartActive, setHeartActive] = useState(item.already_liked);
  const [count, setCount] = useState(parseInt(item.like_count));
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFollowPopup, setShowFollowPopup] = useState(false);
  const [isFollowing, setIsFollowing] = useState(item.is_following || false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const navigation = useNavigation();
  const heartScale = new Animated.Value(1);
  
  const toggleDescription = () => {
    setShowFullDescription((prevDescription) => !prevDescription);
  };

  const formattedDate = moment(
    item.created_at,
    "DD-MM-YYYY HH:mm:ss"
  ).fromNow();

  const handleFollowPress = () => {
    setShowFollowPopup(true);
  };

  const toggleFollow = async () => {
    if (!user?.id) return;
    
    setFollowLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/event-Follow.php?page_id=${item.page_id}&userId=${user.id}`
      );
      
      if (response.status === 200) {
        const newFollowStatus = !isFollowing;
        setIsFollowing(newFollowStatus);
        
        // Update the parent component about the follow status change
        if (onFollowUpdate) {
          onFollowUpdate(item.page_id, newFollowStatus);
        }
        
        Toast.show({
          type: "success",
          text1: newFollowStatus ? "Followed!" : "Unfollowed!",
          text2: newFollowStatus 
            ? `You are now following ${item.page_title}` 
            : `You unfollowed ${item.page_title}`,
        });
      }
    } catch (error) {
      console.error("Error while following:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update follow status. Please try again.",
      });
    } finally {
      setFollowLoading(false);
      setShowFollowPopup(false);
    }
  };

  const handleHeart = async () => {
    // Animate heart button
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      setHeartActive(!heartActive); // Optimistic UI update
      setCount(heartActive ? count - 1 : count + 1);
      
      const response = await axios.get(
        `${baseURL}/toggle-post-likes.php?page_id=${item.page_id}&post_id=${item.post_id}&user_id=${user_id}`
      );

      if (response.status !== 200) {
        // Revert if request fails
        setHeartActive(heartActive);
        setCount(heartActive ? count : count - 1);
        console.error("Failed to toggle likes");
      }
    } catch (error) {
      // Revert if request fails
      setHeartActive(heartActive);
      setCount(heartActive ? count : count - 1);
      console.error("Error while toggling likes:", error.message);
    }
  };

  const player = useVideoPlayer(baseVidUrl + item.video, (player) => {
    // Auto-play disabled for better UX
  });

  const onMediaLoad = () => {
    setIsLoading(false);
  };

  const truncateText = (text, limit) => {
    if (!text) return '';
    if (text?.length <= limit) return text;
    return `${text.slice(0, limit).trim()}...`;
  };

  const pageData = {
    title: item.page_title,
    icon: item.page_icon,
    type: item.page_type || 'Page'
  };

  return (
    <View style={styles.mainCard}>
      {/* Header section with profile and metadata */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Moviehome", { movieId: item.page_id })}
          style={styles.profileContainer}
        >
          <Image
            source={{ uri: baseImgURL + item.page_icon }}
            style={styles.profileImage}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.profileName}>{truncateText(item.page_title, 20)}</Text>
            <View style={styles.metadataRow}>
              <Text style={styles.timeText}>{formattedDate}</Text>
              {/* Status indicators */}
              <View style={styles.statusContainer}>
                {item.is_now && (
                  <View style={styles.nowBadge}>
                    <MaterialIcons name="location-on" size={10} color="white" />
                    <Text style={styles.nowText}>Now</Text>
                  </View>
                )}
                
                {isFollowing ? (
                  <TouchableOpacity 
                    style={styles.followingBadge}
                    onPress={handleFollowPress}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="check-circle" size={10} color="white" />
                    <Text style={styles.followingText}>Following</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.followBadge}
                    onPress={handleFollowPress}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="add-circle-outline" size={10} color="#4ECDC4" />
                    <Text style={styles.followText}>Follow</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Caption - if available */}
      {item.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{item.caption}</Text>
        </View>
      )}

      {/* Text post content */}
      {item.textData && item.textData?.length > 0 && (
        <Pressable
          style={styles.textContentContainer}
          onPress={toggleDescription}
        >
          <Text style={styles.textContent}>
            {showFullDescription
              ? item.textData
              : truncateText(item.textData, 140)}
            {!showFullDescription && item.textData?.length > 140 && (
              <Text style={styles.readMoreText}> Read more</Text>
            )}
          </Text>
        </Pressable>
      )}

      {/* Image content */}
      {item.image && item.image?.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate("ImageViewingScreen", {
              imageLocation: `${baseImgURL + item.image}`,
            })
          }
          style={styles.mediaContainer}
        >
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          )}
          <Image
            source={{ uri: `${baseImgURL + item.image}` }}
            style={styles.mediaImage}
            onLoad={onMediaLoad}
          />
        </TouchableOpacity>
      )}

      {/* Video content */}
      {item.video && item.video?.length > 0 && (
        <View style={styles.videoContainer}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          )}
          <VideoView
            style={styles.videoPlayer}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            onLoad={onMediaLoad}
          />
          
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => player.playing ? player.pause() : player.play()}
          >
            <Ionicons 
              name={player.playing ? "pause-circle" : "play-circle"} 
              size={50} 
              color="rgba(255,255,255,0.8)" 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Engagement section */}
      <View style={styles.engagementContainer}>
        <View style={styles.engagementStats}>
          {count > 0 && (
            <View style={styles.likesIndicator}>
              <Ionicons name="heart" size={12} color="white" style={styles.miniHeartIcon} />
              <Text style={styles.likeCountText}>{count}</Text>
            </View>
          )}
          
          {parseInt(item.comment_count) > 0 && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CommentPost", {
                  user_id: user_id,
                  item: item,
                })
              }
            >
              <Text style={styles.commentCountText}>
                {item.comment_count} {parseInt(item.comment_count) == 1 ? 'comment' : 'comments'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            onPress={handleHeart} 
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons 
                name={heartActive ? "heart" : "heart-outline"} 
                size={24} 
                color={heartActive ? "#e74c3c" : "#333"} 
              />
            </Animated.View>
            <Text style={[styles.actionText, heartActive && styles.activeText]}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("CommentPost", {
                user_id: user_id,
                item: item,
              })
            }
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#333" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Follow Popup */}
      <FollowPopup
        visible={showFollowPopup}
        onClose={() => setShowFollowPopup(false)}
        onConfirm={toggleFollow}
        pageData={pageData}
        isFollowing={isFollowing}
        loading={followLoading}
      />
    </View>
  );
};

export default Posts;

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    height: wp(12),
    width: wp(12),
    borderRadius: wp(6),
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  headerTextContainer: {
    marginLeft: wp(3),
    flex: 1,
  },
  profileName: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.9),
    color: "#111"
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeText: {
    fontFamily: "raleway",
    fontSize: hp(1.4),
    color: "#888",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nowBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5722",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  nowText: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.1),
    color: "white",
  },
  followingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  followingText: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.1),
    color: "white",
  },
  followBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#4ECDC4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  followText: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.1),
    color: "#4ECDC4",
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  captionContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(1),
  },
  captionText: {
    fontFamily: "raleway-semibold",
    fontSize: hp(1.8),
    color: "#333",
    lineHeight: hp(2.4),
  },
  textContentContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(1.5),
  },
  textContent: {
    fontFamily: "raleway",
    fontSize: hp(1.7),
    lineHeight: hp(2.3),
    color: "#333",
  },
  readMoreText: {
    fontFamily: "raleway-bold",
    color: "#555"
  },
  mediaContainer: {
    width: "100%",
    height: hp(27),
    backgroundColor: "#f0f0f0",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoContainer: {
    width: "100%",
    height: hp(27),
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 50,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.1)"
  },
  engagementContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  engagementStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  likesIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniHeartIcon: {
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    padding: 3,
    marginRight: 5,
  },
  likeCountText: {
    fontSize: hp(1.5),
    color: "#666",
  },
  commentCountText: {
    fontSize: hp(1.5),
    color: "#666",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: hp(1),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(0.7),
    flex: 1,
  },
  actionText: {
    fontFamily: "raleway-medium",
    fontSize: hp(1.5),
    marginLeft: 5,
    color: "#555",
  },
  activeText: {
    color: "#e74c3c",
  }
});