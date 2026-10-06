"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import {
  clearCustomerLogoutState,
  clearCustomerSession,
  CUSTOMER_AUTH_EVENT,
  getCustomerToken,
  getCustomerSessionVersion,
  getStoredCustomer,
  setCustomerSession,
  setStoredCustomer,
} from "../../lib/customerAuth";

function toCustomerProfile(user) {
  if (!user) return null;

  return {
    id: user.id,
    customerId: user.customerId || user.customer_id,
    email: user.email,
    fullName: user.fullName || user.full_name || "",
    userType: user.userType || user.user_type || "customer",
  };
}

export function useCustomerAuth() {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncStoredCustomer = useCallback(() => {
    setCustomer(getStoredCustomer());
    if (!getCustomerToken()) setIsLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    const accessToken = getCustomerToken();
    const sessionVersion = getCustomerSessionVersion();
    if (!accessToken) {
      setCustomer(null);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await api.customerAuth.me();
      const profile = response?.data || null;
      if (getCustomerSessionVersion() !== sessionVersion || getCustomerToken() !== accessToken) return null;
      setStoredCustomer(profile);
      setCustomer(profile);
      return profile;
    } catch {
      if (getCustomerSessionVersion() !== sessionVersion || getCustomerToken() !== accessToken) return null;
      clearCustomerSession();
      setCustomer(null);
      setIsLoading(false);
      return null;
    } finally {
      if (getCustomerSessionVersion() === sessionVersion) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncStoredCustomer();
    refreshProfile();
    window.addEventListener(CUSTOMER_AUTH_EVENT, syncStoredCustomer);
    window.addEventListener("storage", syncStoredCustomer);
    return () => {
      window.removeEventListener(CUSTOMER_AUTH_EVENT, syncStoredCustomer);
      window.removeEventListener("storage", syncStoredCustomer);
    };
  }, [refreshProfile, syncStoredCustomer]);

  const startSession = useCallback((session) => {
    if (!session?.accessToken || session?.user?.user_type !== "customer") {
      throw new Error("Customer authentication could not be completed");
    }

    const customerProfile = toCustomerProfile(session.user);
    setCustomerSession({ ...session, user: customerProfile });
    setCustomer(customerProfile);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.customerAuth.login(credentials);
    startSession(response?.data);
    return response?.data;
  }, [startSession]);

  const register = useCallback(async (payload) => {
    const response = await api.customerAuth.register(payload);
    startSession(response?.data);
    return response?.data;
  }, [startSession]);

  const signInWithGoogle = useCallback(async (idToken) => {
    const response = await api.customerAuth.google(idToken);
    startSession(response?.data);
    return response?.data;
  }, [startSession]);

  const updateProfile = useCallback(async (payload) => {
    const response = await api.customerAuth.updateProfile(payload);
    const profile = response?.data || null;
    setStoredCustomer(profile);
    setCustomer(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.customerAuth.logout();
    } finally {
      clearCustomerLogoutState();
      setCustomer(null);
      setIsLoading(false);
    }
  }, []);

  return {
    customer,
    isAuthenticated: Boolean(customer),
    isLoading,
    login,
    register,
    signInWithGoogle,
    updateProfile,
    refreshProfile,
    establishSession: startSession,
    logout,
  };
}
