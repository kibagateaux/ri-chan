import { renderHook, act } from '@testing-library/react-hooks';
import useAuth from './useAuth';

describe('useAuth', () => {
  it('should sign in and update auth state', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn({ access: 'access-token', refresh: 'refresh-token' });
    });

    expect(result.current.authState.isAuthenticated).toBe(true);
    expect(result.current.authState.accessToken).toBe('access-token');
    expect(result.current.authState.refreshToken).toBe('refresh-token');
  });

  it('should sign out and update auth state', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn({ access: 'access-token', refresh: 'refresh-token' });
      result.current.signOut();
    });

    expect(result.current.authState.isAuthenticated).toBe(false);
    expect(result.current.authState.accessToken).toBeNull();
    expect(result.current.authState.refreshToken).toBeNull();
  });

  it('should use passkey and update auth state', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.usePasskey();
    });

    expect(result.current.authState.isAuthenticated).toBe(true);
    expect(result.current.authState.accessToken).toBe('new-access-token');
    expect(result.current.authState.refreshToken).toBe('new-refresh-token');
  });
}); 