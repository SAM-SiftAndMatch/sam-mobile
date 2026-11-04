/** Keeps late requests from publishing after refresh, logout, or unmount. */
export function createRequestGate() {
  let active = true;
  let epoch = 0;
  const versions = new Map<string, number>();
  return {
    activate() {
      active = true;
      epoch += 1;
      versions.clear();
    },
    dispose() {
      active = false;
      epoch += 1;
      versions.clear();
    },
    isActive: () => active,
    begin(lane = 'default') {
      const version = (versions.get(lane) ?? 0) + 1;
      versions.set(lane, version);
      return { lane, version, epoch };
    },
    isCurrent(ticket: { lane: string; version: number; epoch: number }) {
      return active && ticket.epoch === epoch && versions.get(ticket.lane) === ticket.version;
    },
  };
}
