import { useState } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { showToast, useAuth } from '@/hooks';

export const RecoverScreen = () => {
  const [message, setMessage] = useState<string | null>(null);
  const { useRecoverAccount } = useAuth();
  const recover = useRecoverAccount();

  const handleRecover = (email: string) => {
    recover.mutate({ email }, {
      onSuccess: () => setMessage('Recovery email sent!'),
      onError: (error) => setMessage(`Recovery failed: ${error.message}`),
    });
  };
  if(message) {
    showToast(message, message.includes('failed') ? 'error' : 'success');
  }
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recover Account</h1>
      <AuthForm
        onSubmit={handleRecover}
        buttonText="Recover Account"
        isLoading={recover.isPending}
      />
      <a href="/" className="text-blue-500 mt-2 block">Back to Login</a>
    </div>
  );
};