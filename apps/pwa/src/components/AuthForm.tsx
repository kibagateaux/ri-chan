import { useState } from 'react';
import {Button} from './ui/button';
import {Input} from './ui/input';
import { showToast } from '../hooks';

interface AuthFormProps {
  onSubmit: (email: string) => void;
  buttonText: string;
  isLoading: boolean;
}

/**
 * Reusable form for auth flows.
 * @param onSubmit - Callback to handle form submission.
 * @param buttonText - Text for the submit button.
 * @param isLoading - Loading state for submission.
 * @returns Auth form component.
 */
export const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, buttonText, isLoading }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError(null);
    onSubmit(email);
  };
  
  if(error) showToast(error, "error")

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Processing...' : buttonText}
      </Button>
    </form>
  );
};