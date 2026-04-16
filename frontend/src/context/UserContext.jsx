import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { usersAPI } from '../services/api';

const initialState = {
  users: [],
  selectedUser: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_USERS_SUCCESS':
      return { ...state, users: action.payload.users, pagination: action.payload.pagination, isLoading: false };
    case 'FETCH_USER_SUCCESS':
      return { ...state, selectedUser: action.payload, isLoading: false };
    case 'CREATE_USER_SUCCESS':
      return { ...state, users: [action.payload, ...state.users], isLoading: false };
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        users: state.users.map((u) => (u._id === action.payload._id ? action.payload : u)),
        selectedUser: state.selectedUser?._id === action.payload._id ? action.payload : state.selectedUser,
        isLoading: false,
      };
    case 'DELETE_USER_SUCCESS':
      return {
        ...state,
        users: state.users.filter((u) => u._id !== action.payload),
        isLoading: false,
      };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'CLEAR_SELECTED':
      return { ...state, selectedUser: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const fetchUsers = useCallback(async (params = {}) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const { data } = await usersAPI.getAll(params);
      dispatch({ type: 'FETCH_USERS_SUCCESS', payload: { users: data.data, pagination: data.meta } });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch users';
      dispatch({ type: 'FETCH_FAILURE', payload: message });
      return { success: false, message };
    }
  }, []);

  const fetchUserById = useCallback(async (id) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const { data } = await usersAPI.getById(id);
      dispatch({ type: 'FETCH_USER_SUCCESS', payload: data.data });
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch user';
      dispatch({ type: 'FETCH_FAILURE', payload: message });
      return { success: false, message };
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const { data } = await usersAPI.create(userData);
      dispatch({ type: 'CREATE_USER_SUCCESS', payload: data.data });
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create user';
      dispatch({ type: 'FETCH_FAILURE', payload: message });
      return { success: false, message };
    }
  }, []);

  const updateUser = useCallback(async (id, userData) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const { data } = await usersAPI.update(id, userData);
      dispatch({ type: 'UPDATE_USER_SUCCESS', payload: data.data });
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update user';
      dispatch({ type: 'FETCH_FAILURE', payload: message });
      return { success: false, message };
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    dispatch({ type: 'FETCH_START' });
    try {
      await usersAPI.delete(id);
      dispatch({ type: 'DELETE_USER_SUCCESS', payload: id });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete user';
      dispatch({ type: 'FETCH_FAILURE', payload: message });
      return { success: false, message };
    }
  }, []);

  const clearSelected = useCallback(() => dispatch({ type: 'CLEAR_SELECTED' }), []);
  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <UserContext.Provider value={{ ...state, fetchUsers, fetchUserById, createUser, updateUser, deleteUser, clearSelected, clearError }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUsers must be used within UserProvider');
  return context;
};

export default UserContext;
