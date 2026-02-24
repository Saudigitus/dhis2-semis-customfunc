/**
 * RequestBroker provides utilities to wrap promises with cancellation support
 * and to cancel all ongoing tracked promises.
 * 
 * Note: This cancellation only ignores resolved/rejected results after cancellation,
 * it does NOT abort the underlying network request.
 * 
 * @param {Object} params
 * @param {React.MutableRefObject<Array>} params.requestRef - A React ref holding an array of cancellable promises
 * 
 * @returns {Object} - An object containing:
 *  - makeCancellablePromise: wraps a Promise to add cancellation support
 *  - cancelAllOperations: cancels all tracked promises in the requestRef
 */
export function RequestBroker({ requestRef }: { requestRef: React.RefObject<Array<any>> }): {
    makeCancellablePromise: (promise: Promise<any>) => Promise<any> & {
        cancel: () => void;
    };
    cancelAllOperations: () => void;
} {
    /**
     * Cancel all tracked promises by calling their .cancel() method if available,
     * then clears the requestRef array to remove references to old promises.
     */
    const cancelAllOperations = () => {
        requestRef.current.forEach((promise: any) => {
            if (promise.cancel) {
                promise.cancel();
            }
        });
        requestRef.current = [];
    };

    /**
     * Wraps a Promise to add a cancel() method.
     * When canceled, the wrapper promise will ignore resolution or rejection.
     * 
     * @param {Promise<any>} promise - The original promise to wrap
     * @returns {Promise<any> & { cancel: () => void }} - The wrapped promise with a cancel method
     */
    function makeCancellablePromise(promise: Promise<any>): Promise<any> & { cancel: () => void } {
        let canceled = false;
        let settled = false;
        let rejectWrapped: ((reason?: any) => void) | null = null;
        const canceledError = Object.assign(new Error("Request canceled"), { name: "CanceledError" });

        const wrappedPromise: any = new Promise((resolve, reject) => {
            rejectWrapped = (reason?: any) => {
                if (!settled) {
                    settled = true;
                    reject(reason);
                }
            };

            promise.then((value) => {
                if (!canceled && !settled) {
                    settled = true;
                    resolve(value);
                } else {
                    rejectWrapped?.(canceledError);
                }
            }).catch((error) => {
                if (!canceled && !settled) {
                    settled = true;
                    reject(error);
                } else {
                    rejectWrapped?.(canceledError);
                }
            });
        });

        /**
         * Cancels the wrapped promise by setting a flag.
         * After cancelation, the wrapped promise ignores any resolution or rejection.
         */
        wrappedPromise.cancel = () => {
            canceled = true;
            rejectWrapped?.(canceledError);
        };

        return wrappedPromise;
    }

    return {
        makeCancellablePromise,
        cancelAllOperations
    };
}
