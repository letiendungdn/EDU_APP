enum SyncStatus { synced, pending, conflict }

extension SyncStatusX on SyncStatus {
  String get storageValue => name;

  static SyncStatus fromStorage(String value) {
    return SyncStatus.values.firstWhere(
      (s) => s.name == value,
      orElse: () => SyncStatus.synced,
    );
  }
}
