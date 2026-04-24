import { useActivityStore } from '@/lib/activityStore';
import type { ActivityItem } from '@/types/activity';

/**
 * Utility functions for managing activities in the activity center.
 */
export function useActivity() {
  const { addActivity, updateActivity } = useActivityStore();

  const trackTransaction = (
    title: string,
    description: string,
    action: () => Promise<{ transactionHash?: string; explorerUrl?: string }>,
    options?: {
      onSuccess?: (result: any) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    const activityId = crypto.randomUUID();

    // Add pending activity
    addActivity({
      id: activityId,
      type: 'transaction',
      status: 'pending',
      title,
      description,
      currentStep: 'Preparing transaction...',
    });

    // Execute the action
    action()
      .then((result) => {
        updateActivity(activityId, {
          status: 'succeeded',
          currentStep: 'Transaction completed',
          transactionHash: result.transactionHash,
          explorerUrl: result.explorerUrl,
        });
        options?.onSuccess?.(result);
      })
      .catch((error) => {
        updateActivity(activityId, {
          status: 'failed',
          currentStep: 'Transaction failed',
          errorMessage: error.message,
        });
        options?.onError?.(error);
      });
  };

  const trackJob = (
    title: string,
    description: string,
    action: () => Promise<any>,
    options?: {
      onSuccess?: (result: any) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    const activityId = crypto.randomUUID();

    // Add pending activity
    addActivity({
      id: activityId,
      type: 'job',
      status: 'processing',
      title,
      description,
      currentStep: 'Processing...',
    });

    // Execute the action
    action()
      .then((result) => {
        updateActivity(activityId, {
          status: 'succeeded',
          currentStep: 'Completed successfully',
        });
        options?.onSuccess?.(result);
      })
      .catch((error) => {
        updateActivity(activityId, {
          status: 'failed',
          currentStep: 'Failed',
          errorMessage: error.message,
        });
        options?.onError?.(error);
      });
  };

  return { trackTransaction, trackJob };
}