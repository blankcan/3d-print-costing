export function createJobAutosaveManager({
  delay = 400,
  persist,
  onStateChange,
  onApplyServerState
}) {
  const runtime = globalThis;
  let timerId = null;
  let disposed = false;
  let latestVersion = 0;
  let pendingVersion = 0;
  let pendingJob = null;
  let activePromise = null;

  function emit(nextState) {
    onStateChange?.(nextState);
  }

  function clearTimer() {
    if (timerId) {
      runtime.clearTimeout(timerId);
      timerId = null;
    }
  }

  async function runPersist(version, job) {
    if (!job || disposed) {
      return null;
    }

    emit({ status: "saving", jobId: job.id, error: null });

    const promise = (async () => {
      try {
        const result = await persist(job, version);
        if (disposed || version !== latestVersion) {
          return result;
        }

        emit({ status: "saved", jobId: job.id, error: null });
        onApplyServerState?.(result, version);
        return result;
      } catch (error) {
        if (disposed || version !== latestVersion) {
          return null;
        }

        emit({ status: "failed", jobId: job.id, error });
        throw error;
      } finally {
        if (activePromise === promise) {
          activePromise = null;
        }
      }
    })();

    activePromise = promise;
    return promise;
  }

  return {
    schedule(job) {
      latestVersion += 1;
      pendingVersion = latestVersion;
      pendingJob = job;

      clearTimer();
      emit({ status: "saving", jobId: job.id, error: null });
      timerId = runtime.setTimeout(() => {
        timerId = null;
        void runPersist(pendingVersion, pendingJob);
      }, delay);

      return pendingVersion;
    },
    async flushNow() {
      if (timerId && pendingJob) {
        clearTimer();
        return runPersist(pendingVersion, pendingJob);
      }

      return activePromise;
    },
    async retry() {
      if (!pendingJob) {
        return null;
      }

      clearTimer();
      return runPersist(pendingVersion, pendingJob);
    },
    reset() {
      clearTimer();
      latestVersion = 0;
      pendingVersion = 0;
      pendingJob = null;
      activePromise = null;
      emit({ status: "idle", jobId: null, error: null });
    },
    dispose() {
      disposed = true;
      clearTimer();
      activePromise = null;
    }
  };
}
