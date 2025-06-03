// FollowContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { baseURL } from '../backend/baseData';

const FollowContext = createContext();

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};

export const FollowProvider = ({ children }) => {
  const [followingPages, setFollowingPages] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Initialize following status for multiple pages
  const initializeFollowingStatus = useCallback((pages) => {
    const followingSet = new Set();
    pages.forEach(page => {
      if (page.is_following) {
        followingSet.add(page.page_id);
      }
    });
    setFollowingPages(followingSet);
  }, []);

  // Check if a page is being followed
  const isFollowing = useCallback((pageId) => {
    return followingPages.has(pageId);
  }, [followingPages]);

  // Toggle follow status for a page
  const toggleFollow = useCallback(async (pageId, pageTitle, userId) => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please log in to follow pages',
      });
      return false;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/event-Follow.php?page_id=${pageId}&userId=${userId}`
      );

      if (response.status === 200) {
        const wasFollowing = followingPages.has(pageId);
        
        setFollowingPages(prev => {
          const newSet = new Set(prev);
          if (wasFollowing) {
            newSet.delete(pageId);
          } else {
            newSet.add(pageId);
          }
          return newSet;
        });

        // Show success toast
        Toast.show({
          type: 'success',
          text1: wasFollowing ? 'Unfollowed' : 'Following',
          text2: wasFollowing 
            ? `You unfollowed ${pageTitle}` 
            : `You started following ${pageTitle}`,
          visibilityTime: 3000,
        });

        return !wasFollowing; // Return new following status
      }
    } catch (error) {
      console.error('Error while toggling follow:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update follow status. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [followingPages]);

  // Bulk update following status (useful for refreshing data)
  const updateFollowingStatus = useCallback((pageId, isFollowingStatus) => {
    setFollowingPages(prev => {
      const newSet = new Set(prev);
      if (isFollowingStatus) {
        newSet.add(pageId);
      } else {
        newSet.delete(pageId);
      }
      return newSet;
    });
  }, []);

  const value = {
    followingPages,
    isFollowing,
    toggleFollow,
    updateFollowingStatus,
    initializeFollowingStatus,
    isLoading,
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
};