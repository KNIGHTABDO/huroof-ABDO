import { disconnect, sendAction } from '../peerManager';

describe('peerManager safety edges', () => {
  test('sendAction does not throw when host connection is missing', () => {
    expect(() => sendAction({ type: 'BUZZ' })).not.toThrow();
  });

  test('disconnect is idempotent and clears reconnect timer safely', () => {
    window.playerReconnectInterval = setInterval(() => {}, 1000);

    expect(() => disconnect()).not.toThrow();
    expect(window.playerReconnectInterval).toBeNull();

    expect(() => disconnect()).not.toThrow();
  });
});
