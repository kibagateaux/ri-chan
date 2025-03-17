import React, { useState, FormEvent } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeConfig } from "@/hooks/use-selected-theme";
import useAuth from "@/hooks/useAuth";
import { showToast } from "@/hooks/useToast";

export const Login = () => {
  const theme = useThemeConfig();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const { accessToken, doLogin, doRegistration, doAccountRecovery } = useAuth();
   
  const loginMutation = useMutation({
    mutationFn: doLogin,
    onSuccess: ({ token }) => {
      console.log("Login successful! token: ", token);
      return showToast('Login successful!');
    },
    onError: (error: Error) => `Login failed: ${error.message}`,
  });

  const registerMutation = useMutation({
    mutationFn: doRegistration,
    onSuccess: () => showToast('Registration successful!'),
    onError: (error: Error) => showToast(`Registration failed: ${error.message}`, 'error'),
  });
  

/**
 * Requests account recovery.
 * @param email - User's email.
 * @returns Success status.
 */
  const useRecoverAccount = useMutation<{ success: boolean }, { email: string }>({
    mutationFn: doAccountRecovery
  });

  //  const handleSubmitWithPasskey = async (e: FormEvent<HTMLFormElement>) => {
  //    e.preventDefault();
   
  //    if (!email) {
  //      // toast.error("Please enter your display name.");
  //      return;
  //    }
   
  //    setLoading(true);
   
  //    const authenticationOptions = await generateAuthenticationOptions({
  //      rpID: window.location.hostname,
  //    });
   
  //    let id;
  //    try {
  //      const { id: authId } = await startAuthentication(authenticationOptions);
  //      id = authId;
  //    } catch (error) {
  //      console.error("Error logging in: ", error);
  //      // toast.error("Authentication failed! Please try again.");
  //      setLoading(false);
  //      return;
  //    }
   
  //    await login(email, id);
  //  };
  
  if (!window?.PublicKeyCredential) {
    return <Alert variant="error">WebAuthn is not supported in this browser.</Alert>;
  }

  return (
    <View>
   
      <Input
          // type="email"
          style={{
            color: theme.colors.text,
          }}
          id="email"
          label="Email"
          placeholder="tanakasan@ri.co.jp"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
      />
      {/* <Button
        onPress={handleSubmitWithPasskey}
      >
      
          <Text           style={{
            color: theme.colors.text,
          }}> 
          {loading ? "Logging in..." : "Login with passkey"}
          </Text>
      </Button> */}
      <TouchableOpacity
        onPress={() =>registerMutation.mutate({ email })}
      >
          
          <Text style={{
            color: theme.colors.text,
          }}>{registerMutation.isPending ? "Creating Account..." : "Create Account"}</Text>
      </TouchableOpacity>
      {/* <Button
        onPress={registerMutation}
      >
          <Text           style={{
            color: theme.colors.text,
          }}> 
          {loading ? "Creating Account..." : "Create Account"}
          </Text>
      </Button> */}
    </View>
  );
}
export default Login;

