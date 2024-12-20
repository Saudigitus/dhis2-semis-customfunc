declare const useUploadEvents: () => {
    uploadValues: (postData: any, importMode: string, importStrategy: string) => Promise<import("@dhis2/app-service-data/build/types/engine").JsonValue>;
};
export default useUploadEvents;
