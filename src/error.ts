class RKError extends Error {
  public static UNKNOWN = 0;
  public static TIMEOUT = 1;
  public static NO_SESSION = 2;

  constructor(type: number) {
    super(
      Object.entries(RKError)
        .find(([, code]) => code === type)?.[0]
        .toString() ?? 'UNKNOWN',
    );
    this.name = 'RKError';
  }
}

export default RKError;
